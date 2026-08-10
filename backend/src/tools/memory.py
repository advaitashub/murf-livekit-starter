import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from livekit import rtc
from livekit.agents import AgentSession, RunContext, function_tool

logger = logging.getLogger("memory")

MEMORY_DB_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "memory_db.json"
)

MEMORY_DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def load_memory_db() -> dict[str, Any]:
    if not MEMORY_DB_PATH.exists():
        return {"users": {}}

    try:
        with MEMORY_DB_PATH.open("r", encoding="utf-8") as handle:
            data = json.load(handle)

    except json.JSONDecodeError:
        logger.warning(
            "Memory DB corrupted, resetting."
        )
        return {"users": {}}

    if not isinstance(data, dict) or "users" not in data:
        logger.warning(
            "Memory DB has unexpected structure, resetting."
        )
        return {"users": {}}

    return data


def save_memory_db(data: dict[str, Any]) -> None:
    with MEMORY_DB_PATH.open("w", encoding="utf-8") as handle:
        json.dump(
            data,
            handle,
            indent=2,
            ensure_ascii=False,
        )


def find_authenticated_user_id(
    room: rtc.Room,
) -> str | None:

    prefix = "cashcompass_user_"

    for identity in room.remote_participants:

        if identity.startswith(prefix):
            return identity[len(prefix):]

    return None


def get_current_user_id(
    session: AgentSession,
) -> str:

    if session.room_io is None:
        raise ValueError(
            "Agent session is not connected to a room"
        )

    user_id = find_authenticated_user_id(
        session.room_io.room
    )

    if not user_id:
        raise ValueError(
            "Unable to determine authenticated user."
        )

    return user_id


class MemoryTools:

    @function_tool
    async def lookup_user(
        self,
        context: RunContext,
    ) -> str:

        """Look up the authenticated user's previously
        approved memory facts.

        Use this when you need to retrieve information
        the user previously gave permission to remember.
        """

        try:
            user_id = get_current_user_id(
                context.session
            )

        except Exception:
            return (
                "No user memory is available right now."
            )

        logger.info(
            "lookup_user called for user %s",
            user_id,
        )

        memory = load_memory_db()

        user_record = memory["users"].get(user_id)

        if not user_record:
            return (
                "No previous memory was found for this user."
            )

        facts = user_record.get(
            "approved_facts",
            [],
        )

        if not facts:
            return (
                "No previous memory was found for this user."
            )

        return (
            "Here is what I've safely remembered for you: "
            + "; ".join(facts)
        )

    @function_tool
    async def save_user_info(
        self,
        context: RunContext,
        fact: str,
        consent: bool,
    ) -> str:

        """Save a non-sensitive user fact only when
        the user has explicitly given consent.

        Never save passwords, PINs, card numbers,
        account numbers, OTPs, or other sensitive data.
        """

        if not consent:
            return (
                "I will not save anything without your "
                "explicit consent."
            )

        fact_text = (
            fact.strip()
            if isinstance(fact, str)
            else ""
        )

        if not fact_text:
            return (
                "Please provide a short fact to save."
            )

        if len(fact_text) > 256:
            return (
                "Please keep saved facts under 256 characters."
            )

        forbidden_terms = [
            "ssn",
            "password",
            "card number",
            "account number",
            "pin",
            "secret",
            "otp",
            "cvv",
            "aadhaar",
            "pan",
        ]

        if any(
            term in fact_text.lower()
            for term in forbidden_terms
        ):
            return (
                "I cannot save sensitive personal "
                "information."
            )

        try:
            user_id = get_current_user_id(
                context.session
            )

        except Exception:
            return (
                "I cannot determine your authenticated "
                "user identity right now."
            )

        logger.info(
            "save_user_info called for user %s",
            user_id,
        )

        memory = load_memory_db()

        user_record = memory["users"].setdefault(
            user_id,
            {
                "approved_facts": [],
                "last_seen_at": None,
                "recognized": True,
            },
        )

        user_record["approved_facts"].append(
            fact_text
        )

        user_record["last_seen_at"] = (
            datetime.utcnow().isoformat() + "Z"
        )

        user_record["recognized"] = True

        save_memory_db(memory)

        return (
            "Your fact has been securely saved "
            "with your consent."
        )