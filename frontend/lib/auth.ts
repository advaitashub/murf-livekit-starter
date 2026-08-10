import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { createSession, deleteSession, getSessionById } from './session-store';
import { getUserByEmail, getUserById } from './user-db';

export type SafeUser = {
  id: string;
  name: string;
  email: string;
};

const COOKIE_NAME = 'cashcompass_session';
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getAuthSecret() {
  const secret = process.env.AUTH_COOKIE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_COOKIE_SECRET must be defined and at least 32 characters long');
  }
  return secret;
}

function signValue(value: string) {
  return createHmac('sha256', getAuthSecret()).update(value).digest('hex');
}

function serializeSessionCookie(sessionId: string) {
  const signature = signValue(sessionId);
  return `${sessionId}.${signature}`;
}

function parseSessionCookie(cookieValue: string | undefined | null) {
  if (!cookieValue) return null;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;

  const [sessionId, signature] = parts;
  const expected = signValue(sessionId);
  let signatureBuffer: Buffer;
  let expectedBuffer: Buffer;

  try {
    signatureBuffer = Buffer.from(signature, 'hex');
    expectedBuffer = Buffer.from(expected, 'hex');
  } catch {
    return null;
  }

  if (signatureBuffer.length !== expectedBuffer.length) return null;

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  return sessionId;
}

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map((item) => {
      const [key, ...rest] = item.split('=');
      return [key?.trim(), rest.join('=').trim()];
    })
  );
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hashed] = stored.split(':');
  if (!salt || !hashed) {
    return false;
  }
  const derived = scryptSync(password, salt, 64).toString('hex');
  const derivedBuf = Buffer.from(derived, 'utf8');
  const storedBuf = Buffer.from(hashed, 'utf8');
  if (derivedBuf.length !== storedBuf.length) {
    return false;
  }
  return timingSafeEqual(derivedBuf, storedBuf);
}

export function createSessionCookieHeader(sessionId: string) {
  const cookieValue = serializeSessionCookie(sessionId);
  const secure = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; ${secure ? 'Secure; ' : ''}Max-Age=${COOKIE_TTL_SECONDS}`;
}

export function clearSessionCookieHeader() {
  const secure = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=deleted; Path=/; HttpOnly; SameSite=Lax; ${secure ? 'Secure; ' : ''}Max-Age=0`;
}

export function getSessionIdFromCookieHeader(cookieHeader: string | null) {
  const cookies = parseCookieHeader(cookieHeader);
  return parseSessionCookie(cookies[COOKIE_NAME] ?? null);
}

export function getCurrentUserFromHeaders(headers: Headers) {
  const sessionId = getSessionIdFromCookieHeader(headers.get('cookie'));
  if (!sessionId) return null;
  const session = getSessionById(sessionId);
  if (!session) return null;
  const user = getUserById(session.userId);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email } as SafeUser;
}

export function getCurrentUserFromRequest(req: Request) {
  return getCurrentUserFromHeaders(new Headers(req.headers));
}

export function createUserSession(userId: string) {
  return createSession(userId);
}

export function getCurrentSessionIdFromRequest(req: Request) {
  return getSessionIdFromCookieHeader(req.headers.get('cookie'));
}

export function deleteSessionForRequest(req: Request) {
  const sessionId = getCurrentSessionIdFromRequest(req);
  if (sessionId) {
    deleteSession(sessionId);
  }
}
