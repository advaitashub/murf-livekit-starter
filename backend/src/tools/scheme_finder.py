import json
import logging
from pathlib import Path

from livekit.agents import RunContext, function_tool

logger = logging.getLogger("scheme_finder")

DATA_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "schemes.json"
)


def load_schemes():
    with DATA_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def find_matching_schemes(
    age: int,
    state: str,
    annual_income: float,
    gender: str,
    occupation: str,
):
    schemes = load_schemes()
    matches = []

    for scheme in schemes:
        if not (scheme["min_age"] <= age <= scheme["max_age"]):
            continue

        if (
            scheme["state"] != "ALL"
            and scheme["state"].lower() != state.lower()
        ):
            continue

        if (
            scheme["income_limit"] is not None
            and annual_income > scheme["income_limit"]
        ):
            continue

        if (
            scheme["gender"] != "ALL"
            and scheme["gender"].lower() != gender.lower()
        ):
            continue

        matches.append(scheme)

    return matches


class SchemeTools:

    @function_tool
    async def find_financial_schemes(
        self,
        context: RunContext,
        age: int,
        state: str,
        annual_income: float,
        gender: str,
        occupation: str,
    ) -> str:
        """
        Search for Indian government schemes that may provide
        financial assistance to the user.

        Call this tool when the user asks to find government
        schemes, financial assistance, subsidies, welfare
        benefits, pensions, scholarships, or other government
        support they may qualify for.

        Use the user's profile information to find potential
        matching schemes.

        Do not use this tool for general financial advice.

        Do not claim that the user is definitely eligible.
        The result is only a potential eligibility match and
        must be verified against the official scheme requirements.
        """

        logger.info(
            "🔧 find_financial_schemes CALLED | age=%s state=%s income=%s gender=%s occupation=%s",
            age,
            state,
            annual_income,
            gender,
            occupation,
        )

        try:
            matches = find_matching_schemes(
                age=age,
                state=state,
                annual_income=annual_income,
                gender=gender,
                occupation=occupation,
            )

            logger.info(
                "🔧 find_financial_schemes RESULT | %d matches",
                len(matches),
            )

            if not matches:
                return (
                    "I couldn't find any potential matching schemes "
                    "in the available scheme database."
                )

            return json.dumps(
                {
                    "matches": matches,
                    "note": (
                        "These are potential matches based on the "
                        "provided information. Final eligibility must "
                        "be verified using the official scheme requirements."
                    ),
                },
                ensure_ascii=False,
            )

        except Exception:
            logger.exception("Scheme lookup failed")

            return (
                "I couldn't access the scheme information right now. "
                "I don't want to guess and give you incorrect financial information. "
                "Please try again later."
            )