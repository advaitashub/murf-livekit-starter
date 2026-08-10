import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export interface SessionRecord {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SESSION_STORE_PATH = path.join(DATA_DIR, 'sessions.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SESSION_STORE_PATH)) {
    fs.writeFileSync(SESSION_STORE_PATH, '[]', 'utf8');
  }
}

function readSessions(): SessionRecord[] {
  ensureStore();
  const content = fs.readFileSync(SESSION_STORE_PATH, 'utf8');
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: SessionRecord[]) {
  ensureStore();
  fs.writeFileSync(SESSION_STORE_PATH, JSON.stringify(sessions, null, 2), 'utf8');
}

export function createSession(userId: string) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const session: SessionRecord = {
    id: randomUUID(),
    userId,
    createdAt: now.toISOString(),
    expiresAt,
  };
  const sessions = readSessions();
  sessions.push(session);
  writeSessions(sessions);
  return session;
}

export function getSessionById(sessionId: string) {
  const sessions = readSessions();
  const session = sessions.find((entry) => entry.id === sessionId);
  if (!session) {
    return null;
  }
  if (new Date(session.expiresAt) <= new Date()) {
    deleteSession(sessionId);
    return null;
  }
  return session;
}

export function deleteSession(sessionId: string) {
  const sessions = readSessions();
  const filtered = sessions.filter((entry) => entry.id !== sessionId);
  if (filtered.length !== sessions.length) {
    writeSessions(filtered);
  }
}
