import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).parent / "call_analytics.db"
STATS_JSON_PATH = Path(__file__).parent / "analytics_stats.json"


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS calls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_name TEXT NOT NULL,
                outcome TEXT NOT NULL CHECK(outcome IN ('success', 'failed')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()


def _write_stats_to_json():
    """Write current stats to JSON file for frontend consumption."""
    stats = get_stats()
    try:
        with open(STATS_JSON_PATH, "w") as f:
            json.dump(stats, f)
    except Exception as e:
        print(f"Warning: Could not write analytics stats to JSON: {e}")


def record_call(room_name: str, outcome: str):
    if outcome not in ("success", "failed"):
        raise ValueError("Outcome must be 'success' or 'failed'")

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO calls (room_name, outcome) VALUES (?, ?)",
            (room_name, outcome),
        )
        conn.commit()
    
    # Update the JSON file for frontend
    _write_stats_to_json()


def get_stats():
    with sqlite3.connect(DB_PATH) as conn:
        total = conn.execute(
            "SELECT COUNT(*) FROM calls"
        ).fetchone()[0]

        successful = conn.execute(
            "SELECT COUNT(*) FROM calls WHERE outcome = 'success'"
        ).fetchone()[0]

        failed = conn.execute(
            "SELECT COUNT(*) FROM calls WHERE outcome = 'failed'"
        ).fetchone()[0]

    return {
        "total": total,
        "successful": successful,
        "failed": failed,
    }


init_db()
# Initialize JSON file on startup
_write_stats_to_json()