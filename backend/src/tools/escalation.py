import json
import os
from datetime import datetime
from livekit.agents import function_tool


ESCALATION_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "escalations.json"
)


def load_escalations():
    if not os.path.exists(ESCALATION_FILE):
        return []

    try:
        with open(ESCALATION_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def save_escalations(escalations):
    with open(ESCALATION_FILE, "w", encoding="utf-8") as f:
        json.dump(escalations, f, indent=2, ensure_ascii=False)


@function_tool
async def create_escalation(
    reason: str,
    summary: str,
    urgency: str,
    language: str,
    follow_up_method: str,
) -> str:
    """
    Create a human-support escalation request.

    Use only after the user has explicitly given permission
    to share the summarized information with a human.
    """

    escalations = load_escalations()

    today = datetime.now().strftime("%Y%m%d")
    sequence = len(escalations) + 1

    reference_id = f"CC-{today}-{sequence:03d}"

    escalation = {
        "id": reference_id,
        "reason": reason,
        "summary": summary,
        "urgency": urgency,
        "language": language,
        "follow_up_method": follow_up_method,
        "status": "open",
        "created_at": datetime.now().isoformat(),
    }

    escalations.append(escalation)
    save_escalations(escalations)

    return (
        f"Human support request created successfully. "
        f"Reference ID: {reference_id}. "
        f"Status: open."
    )