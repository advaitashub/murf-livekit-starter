import { NextResponse } from 'next/server';
import { createSessionCookieHeader, verifyPassword, createUserSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/user-db';

function isValidEmail(email: unknown): email is string {
  return (
    typeof email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: 'Please enter a valid email.' }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ message: 'Please enter your password.' }, { status: 400 });
  }

  const user = getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ message: 'Incorrect email or password.' }, { status: 401 });
  }

  const session = createUserSession(user.id);
  const headers = new Headers({ 'Set-Cookie': createSessionCookieHeader(session.id) });

  return NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email } },
    { status: 200, headers }
  );
}
