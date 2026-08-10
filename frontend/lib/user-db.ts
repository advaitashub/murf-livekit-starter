import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'users.json');

function ensureDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '[]', 'utf8');
  }
}

function readDatabase(): UserRecord[] {
  ensureDatabase();
  const content = fs.readFileSync(DB_PATH, 'utf8');
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDatabase(users: UserRecord[]) {
  ensureDatabase();
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf8');
}

export function getUserByEmail(email: string): UserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return readDatabase().find((user) => user.email === normalized);
}

export function getUserById(id: string): UserRecord | undefined {
  return readDatabase().find((user) => user.id === id);
}

export function createUser({ name, email, passwordHash }: { name: string; email: string; passwordHash: string }) {
  const now = new Date().toISOString();
  const normalizedEmail = email.trim().toLowerCase();
  const user: UserRecord = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };
  const users = readDatabase();
  users.push(user);
  writeDatabase(users);
  return user;
}
