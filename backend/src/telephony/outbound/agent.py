"""CashCompass outbound telephony agent.

Places outbound calls for the Financial Services track.

The agent calls a user who was previously found eligible for a
government scheme and reminds them that the application deadline
is approaching.

Run the worker with:

    uv run python src/telephony/outbound/agent.py dev

Then, from another terminal:

    uv run python src/telephony/outbound/dial.py --to +15551234567
"""

import asyncio
import json
import logging
import os

from dotenv import load_dotenv
from livekit import api, rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    RunContext,
    cli,
    function_tool,
    room_io,
    tokenize,
)
from livekit.plugins import (
    deepgram,
    google,
    murf,
    noise_cancellation,
    silero,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel


logger = logging.getLogger("cashcompass-outbound-agent")

load_dotenv(".env.local")


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Created using:
# lk sip outbound create ...
OUTBOUND_TRUNK_ID = os.getenv("LIVEKIT_SIP_OUTBOUND_TRUNK_ID")

# Optional human handoff number.
TRANSFER_TO_NUMBER = os.getenv("TRANSFER_TO_NUMBER")


# ---------------------------------------------------------------------------
# CashCompass prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """
You are CashCompass, a financial assistance voice agent.

You are making an outbound call because the person was previously found
eligible for a government scheme and its application deadline is approaching.

Introduce yourself and explain why you are calling immediately.

The person did not request this call, so be brief, respectful, and
conversational.

Your job is to:
- Explain that an eligible government scheme has an approaching deadline.
- Remind the person to complete their application before the deadline.
- Answer simple questions about the scheme if you have the required
  information.
- Tell the person what documents they may need if that information is
  available.
- Never invent eligibility, deadlines, benefits, or government information.
- If you do not know something, say so clearly.

If the person says they do not want reminder calls, respect their request
and end the call politely.

If the person asks for a human, use the transfer_to_human tool.

If you reach voicemail or an answering machine, use the
detected_answering_machine tool.

When the conversation is finished, use the end_call tool.

This is a phone call. Keep responses short and natural.
Do not use formatting, emojis, bullet points, or symbols in spoken responses.
"""


# ---------------------------------------------------------------------------
# Opening greeting
# ---------------------------------------------------------------------------

GREETING = (
    "Hi, this is CashCompass, a financial assistance voice agent. "
    "I'm calling because a government scheme you were previously found "
    "eligible for has an approaching application deadline. "
    "If you don't want these reminders, just let me know. "
    "Do you have a moment?"
)


# Identity assigned to the person receiving the call.
CALLEE_IDENTITY = "phone-user"


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------

class OutboundAgent(Agent):
    def __init__(self, ctx: JobContext) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)
        self.ctx = ctx

    @function_tool
    async def transfer_to_human(self, context: RunContext) -> str:
        """Transfer the caller to a human colleague."""

        if not TRANSFER_TO_NUMBER:
            return (
                "Transfers are not available on this line. "
                "Offer to have someone call back instead."
            )

        # Tell the person before transferring because the SIP transfer
        # cuts off the agent audio.
        await context.session.generate_reply(
            instructions="Tell them you're connecting them to a colleague now."
        )

        logger.info(
            "Transferring call to %s",
            TRANSFER_TO_NUMBER,
        )

        try:
            await self.ctx.api.sip.transfer_sip_participant(
                api.TransferSIPParticipantRequest(
                    room_name=self.ctx.room.name,
                    participant_identity=CALLEE_IDENTITY,
                    transfer_to=f"tel:{TRANSFER_TO_NUMBER}",
                    play_dialtone=True,
                )
            )

        except Exception:
            logger.exception("Transfer failed")

            return (
                "The transfer did not go through. "
                "Apologize and offer a call back."
            )

        return "Transferred."

    @function_tool
    async def detected_answering_machine(
        self,
        context: RunContext,
    ) -> str:
        """End the call when voicemail or an answering machine is detected."""

        logger.info(
            "Answering machine detected — hanging up"
        )

        await self._hangup()

        return "Call ended."

    @function_tool
    async def end_call(
        self,
        context: RunContext,
    ) -> str:
        """Politely end the phone call."""

        await context.session.generate_reply(
            instructions=(
                "Thank them for their time and say a short goodbye."
            )
        )

        logger.info("Ending call")

        await self._hangup()

        return "Call ended."

    async def _hangup(self) -> None:
        """Delete the room, which drops the SIP leg and ends the call."""

        await self.ctx.api.room.delete_room(
            api.DeleteRoomRequest(
                room=self.ctx.room.name
            )
        )


# ---------------------------------------------------------------------------
# LiveKit server
# ---------------------------------------------------------------------------

server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


# ---------------------------------------------------------------------------
# Read phone number from dial.py metadata
# ---------------------------------------------------------------------------

def phone_number_from_metadata(
    ctx: JobContext,
) -> str | None:
    """Read the destination phone number from dispatch metadata."""

    metadata = ctx.job.metadata

    if not metadata:
        return None

    try:
        return json.loads(metadata).get("phone_number")

    except json.JSONDecodeError:
        # Also allow a bare phone number for quick dispatch testing.
        return metadata.strip() or None


# ---------------------------------------------------------------------------
# Outbound agent entry point
# ---------------------------------------------------------------------------

@server.rtc_session(agent_name="outbound-agent")
async def outbound_agent(ctx: JobContext):

    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Get destination number.
    phone_number = phone_number_from_metadata(ctx)

    if not phone_number:
        logger.error(
            "No phone number in job metadata. "
            'Dispatch with {"phone_number": "+15551234567"}'
        )

        ctx.shutdown()
        return

    # Check outbound trunk.
    if not OUTBOUND_TRUNK_ID:
        logger.error(
            "LIVEKIT_SIP_OUTBOUND_TRUNK_ID is not set. "
            "Cannot place outbound calls."
        )

        ctx.shutdown()
        return

    await ctx.connect()

    # -----------------------------------------------------------------------
    # Voice pipeline
    # -----------------------------------------------------------------------

    session = AgentSession(
        # Speech-to-text
        stt=deepgram.STT(
            model="nova-3",
        ),

        # LLM
        llm=google.LLM(
            model="gemini-2.5-flash",
        ),

        # Text-to-speech
        # Keep this as your currently working Murf voice.
        tts=murf.TTS(
            voice="en-US-matthew",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(
                min_sentence_len=2
            ),
            text_pacing=True,
        ),

        # Turn detection
        turn_detection=MultilingualModel(),

        # Voice activity detection
        vad=ctx.proc.userdata["vad"],

        preemptive_generation=True,
    )

    # Start the agent while the phone is still ringing.
    session_started = asyncio.create_task(
        session.start(
            agent=OutboundAgent(ctx),
            room=ctx.room,
            room_options=room_io.RoomOptions(
                audio_input=room_io.AudioInputOptions(
                    noise_cancellation=lambda params: (
                        noise_cancellation.BVCTelephony()
                        if (
                            params.participant.kind
                            == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                        )
                        else noise_cancellation.BVC()
                    ),
                ),
            ),
        )
    )

    logger.info(
        "Dialing %s",
        phone_number,
    )

    # -----------------------------------------------------------------------
    # Make SIP call
    # -----------------------------------------------------------------------

    try:
        await ctx.api.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                room_name=ctx.room.name,
                sip_trunk_id=OUTBOUND_TRUNK_ID,
                sip_call_to=phone_number,
                participant_identity=CALLEE_IDENTITY,
                participant_name="Phone user",
                wait_until_answered=True,
            )
        )

    except api.TwirpError as e:
        logger.error(
            "Call to %s was not answered: %s (%s)",
            phone_number,
            e.message,
            e.metadata.get("sip_status"),
        )

        session_started.cancel()

        ctx.shutdown()
        return

    # Wait until the agent session is fully ready.
    await session_started

    # -----------------------------------------------------------------------
    # Speak immediately after the person answers.
    # -----------------------------------------------------------------------

    await session.say(
        GREETING,
        allow_interruptions=True,
    )


# ---------------------------------------------------------------------------
# Run application
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    cli.run_app(server)