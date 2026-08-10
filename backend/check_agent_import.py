import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'src'))
try:
    import agent
    print('AGENT_IMPORTED', agent.__file__)
    print('ASSISTANT_OK', hasattr(agent.Assistant, '__init__'))
except Exception as exc:
    import traceback
    traceback.print_exc()
    raise
