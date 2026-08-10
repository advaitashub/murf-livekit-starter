import asyncio
import importlib

import pytest


@pytest.mark.asyncio
async def test_save_and_lookup_user_fact(tmp_path, monkeypatch):
    # Import the agent module and redirect the MEMORY_DB_PATH to a temp file
    agent = importlib.import_module("agent")
    monkeypatch.setattr(agent, "MEMORY_DB_PATH", tmp_path / "memory_db.json")

    # Create minimal fakes for the RunContext -> session -> room_io -> room
    class DummyRoom:
        def __init__(self, identities):
            # iteration over remote_participants should yield identity strings
            self.remote_participants = identities

    class DummyRoomIO:
        def __init__(self, room):
            self.room = room

    class DummySession:
        def __init__(self, room):
            self.room_io = DummyRoomIO(room)

    class DummyContext:
        def __init__(self, session):
            self.session = session

    # Use a stable test user id identity
    test_id = "12345"
    room = DummyRoom([f"cashcompass_user_{test_id}"])
    session = DummySession(room)
    ctx = DummyContext(session)

    assistant = agent.Assistant()

    # Save a fact
    res = await assistant.save_user_info(ctx, "I like budgeting monthly", True)
    assert "saved" in res.lower()

    # Lookup should return the saved fact
    lookup = await assistant.lookup_user(ctx)
    assert "I like budgeting monthly" in lookup
