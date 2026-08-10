import importlib, asyncio, sys
from pathlib import Path

print('PYTHON', sys.executable)

# Ensure the project's `src` directory is on sys.path so we can import `agent`
src_dir = Path(__file__).resolve().parent / "src"
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

try:
    agent = importlib.import_module('agent')
except Exception as e:
    print('IMPORT_ERROR', repr(e))
    raise

class DummyRoom:
    def __init__(self, identities):
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

async def run_test():
    test_id = '12345'
    room = DummyRoom([f'cashcompass_user_{test_id}'])
    session = DummySession(room)
    ctx = DummyContext(session)

    assistant = agent.Assistant()

    res = await assistant.save_user_info(ctx, 'I like budgeting monthly', True)
    print('SAVE_RES:', res)

    lookup = await assistant.lookup_user(ctx)
    print('LOOKUP_RES:', lookup)

if __name__ == '__main__':
    asyncio.run(run_test())
