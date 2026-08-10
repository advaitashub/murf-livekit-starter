import asyncio
import logging

logging.basicConfig(level=logging.DEBUG)

from prompt import SYSTEM_PROMPT
from dotenv import load_dotenv
from livekit import rtc
from tools.scheme_finder import SchemeTools
from tools.memory import MemoryTools

from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    tokenize,
    room_io,
)

from livekit.plugins import (
    murf,
    silero,
    google,
    deepgram,
    noise_cancellation,
)

from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")


# Change this prompt to change what your voice agent does.
#
# See README.md for example prompts (customer support, language tutor, receptionist).


class Assistant(Agent):

    def __init__(self) -> None:
        self.memory_tools = MemoryTools()
        self.scheme_tools = SchemeTools()

        super().__init__(
            instructions=SYSTEM_PROMPT,
            tools=[
                self.memory_tools.lookup_user,
                self.memory_tools.save_user_info,
                self.scheme_tools.find_financial_schemes,
            ],
        )

server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):

    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using Murf Falcon, Gemini,
    # Deepgram, and the LiveKit turn detector
    #
    # CashCompass is the financial voice assistant.
    session = AgentSession(

        # Speech-to-text (STT) is your agent's ears,
        # turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(
            model="nova-3",
            language="multi",
        ),

        # A Large Language Model (LLM) is your agent's brain,
        # processing user input and generating a response
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=google.LLM(
            model="gemini-3.5-flash-lite",
        ),

        # Text-to-speech (TTS) is your agent's voice,
        # turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf.TTS(
            voice="Anisha",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(
                min_sentence_len=2
            ),
            text_pacing=True,
        ),

        # VAD and turn detection are used to determine when
        # the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],

        # allow the LLM to generate a response while waiting
        # for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,

        # Consider the user away after 10 seconds of inactivity
        user_away_timeout=10.0,
    )


    # Memory candidate detection state for this session
    pending_candidate: dict | None = None
    seen_candidates: set[str] = set()
    startup_memory_lookup_done = False


    def _is_yes_reply(text: str) -> bool:
        t = text.lower()
        return any(w in t for w in ("yes", "yeah", "yep", "sure", "ok", "okay", "haan", "haanji", "ji"))


    def _is_no_reply(text: str) -> bool:
        t = text.lower()
        return any(w in t for w in ("no", "nah", "not now", "don't", "dont", "nahi"))


    def _build_consent_question(key: str, value: str) -> str:
        if key == "name":
            return f"That's useful to remember. Would you like me to remember your name ({value}) for future conversations?"
        if key == "financial_goal":
            return f"That's useful to remember. Would you like me to remember your financial goal ({value}) for future conversations?"
        if key == "language_preference":
            return f"I can remember that you prefer {value}. Would you like me to save that?"
        if key == "schemes_checked":
            return f"I can remember that you've checked {value}. Should I save that for future reference?"
        return f"I can remember: {key} = {value}. Would you like me to save it for future conversations?"


    def _analyze_for_candidate(text: str) -> tuple[str, str] | None:
        t = text.strip()
        low = t.lower()

        # Avoid sensitive information
        for term in ("aadhaar", "pan", "account", "card", "otp", "pin", "password", "cvv"):
            if term in low:
                return None

        # Name detection: "my name is X" or "name is X" only
        import re

        m = re.search(r"\b(?:my name is|name is)\s+([A-Za-z\u0900-\u097F][\w\s'-]{1,40})", t, re.I)
        if m:
            name = m.group(1).strip().strip(".!")
            return ("name", name)

        # Financial goal: contains 'save' and a number/currency
        if "save" in low and re.search(r"\d", t):
            # capture a short phrase around 'save'
            m2 = re.search(r"(save[\s\w\d,₹₹\.\-]+(?:per|monthly|a month|every month)?)", t, re.I)
            if m2:
                goal = m2.group(1).strip().strip(".!")
            else:
                goal = t
            return ("financial_goal", goal)

        # Language preference
        m = re.search(r"\b(prefer|speak to me in|please speak in)\s+([A-Za-z]+)\b", low, re.I)
        if m:
            lang = m.group(2).capitalize()
            return ("language_preference", lang)

        # Schemes checked: "I checked PM-KISAN" or "I've already checked PM-KISAN"
        m = re.search(r"(?:checked|already checked|i have checked)\s+([A-Za-z0-9\-\s]+)", t, re.I)
        if m:
            scheme = m.group(1).strip().strip(".!")
            return ("schemes_checked", scheme)

        return None


    @session.on("user_input_transcribed")
    def on_transcript(ev):
        nonlocal pending_candidate, startup_memory_lookup_done
        print("USER:", ev.transcript)

        if not ev.is_final:
            return

        text = (ev.transcript or "").strip()
        if not text:
            return

        print("USER:", text)

        if not startup_memory_lookup_done:
            startup_memory_lookup_done = True
            logger.debug("First final user transcript received; running startup lookup_user flow.")
            asyncio.create_task(
                session.generate_reply(
                    user_input=text,
                    instructions=(
                        "First call the lookup_user function to retrieve any stored memory for this authenticated user. "
                        "If memory is found, greet the user personally using the remembered facts. "
                        "If no memory is found, introduce yourself as CashCompass. "
                        "Then answer the user's request naturally."
                    ),
                )
            )
            return

        # If we have a pending candidate, interpret this transcript as a consent reply
        if pending_candidate is not None:
            key = pending_candidate["key"]
            value = pending_candidate["value"]
            if _is_yes_reply(text):
                # call save_user_info()
                tool_ctx = type("ToolContext", (), {"session": session})()
                asyncio.create_task(
                    _confirm_and_save(tool_ctx, key, value)
                )
            elif _is_no_reply(text):
                asyncio.create_task(session.generate_reply(instructions="Okay, I won't save that."))
            # clear pending regardless
            seen_candidates.add(f"{key}={value}")
            pending_candidate = None
            return

        # Otherwise, analyze the transcript for a potential memory candidate
        candidate = _analyze_for_candidate(text)
        if candidate is None:
            return

        k, v = candidate
        fact_key_val = f"{k}={v}"
        if fact_key_val in seen_candidates:
            return

        # Ask for consent (do not save yet)
        question = _build_consent_question(k, v)
        pending_candidate = {"key": k, "value": v}
        asyncio.create_task(session.generate_reply(instructions=question))

    async def _confirm_and_save(tool_ctx, key: str, value: str):
        memory_tools = MemoryTools()
        fact_text = f"{key}={value}"

        try:
            res = await memory_tools.save_user_info(
                tool_ctx,
                fact_text,
                True
            )
            await session.generate_reply(
                instructions=("Saved. " + res)
            )
        except Exception as e:
            logger.exception("Failed to save memory")
            await session.generate_reply(
                instructions="I couldn't save that right now."
            )


    # ---------------------------------------------------------
    # SILENT USER HANDLING
    # ---------------------------------------------------------

    silence_task = None


    async def silence_handler():

        # First re-prompt after silence
        await session.generate_reply(
            instructions=(
                "The user has been silent. "
                "Say: Are you still there? I'm listening."
            )
        )

        # Wait another 10 seconds
        await asyncio.sleep(10)


        # Second re-prompt
        await session.generate_reply(
            instructions=(
                "The user is still silent. "
                "Say: Would you like to continue, "
                "or should I end the call?"
            )
        )

        # Wait another 10 seconds
        await asyncio.sleep(10)


        # Graceful close
        await session.generate_reply(
            instructions=(
                "The user has not responded after two check-ins. "
                "Say: No problem. We'll end the call here. Goodbye."
            )
        )

        # Give the TTS time to finish speaking
        await asyncio.sleep(3)

        await ctx.room.disconnect()

    @session.on("user_state_changed")
    def on_user_state_changed(ev):

        nonlocal silence_task

        print(
            "USER STATE:",
            ev.old_state,
            "->",
            ev.new_state,
        )


        # User has been silent long enough
        if ev.new_state == "away":

            # Start only one silence task
            if silence_task is None:
                silence_task = asyncio.create_task(
                    silence_handler()
                )


        # User started speaking again
        elif ev.new_state == "speaking":

            # Cancel the silence flow
            if silence_task is not None:
                silence_task.cancel()
                silence_task = None


    # To use a realtime model instead of a voice pipeline,
    # use the following session setup instead.
    #
    # (Note: This is for the OpenAI Realtime API.
    # For other providers, see https://docs.livekit.io/agents/models/realtime/)
    #
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    #
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )


    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)


    # Start the session, which initializes the voice pipeline
    # and warms up the models

    # Join the room and connect to the user
    await ctx.connect()


    assistant = Assistant()

    await session.start(
        agent=assistant,
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )


    # At session start, check for existing memory and greet returning users
    tool_ctx = type("ToolContext", (), {"session": session})()
    logger.debug("Startup complete; waiting for the first final user turn before generating the initial greeting.")


if __name__ == "__main__":
    cli.run_app(server)