import { NextResponse } from 'next/server';
import { createPasswordHash, createSessionCookieHeader, createUserSession } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/user-db';

function isValidEmail(email: unknown): email is string {
  return (
    typeof email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

  if (!name) {
    return NextResponse.json({ message: 'Please enter your name.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ message: 'Please enter a valid email.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ message: 'Passwords do not match.' }, { status: 400 });
  }

  if (getUserByEmail(email)) {
    return NextResponse.json({ message: 'This email is already registered.' }, { status: 409 });
  }

  const passwordHash = createPasswordHash(password);
  const user = createUser({ name, email, passwordHash });
  const session = createUserSession(user.id);
  const headers = new Headers({ 'Set-Cookie': createSessionCookieHeader(session.id) });

  return NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
    { status: 201, headers }
  );
}
