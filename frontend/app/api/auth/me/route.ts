import { NextResponse } from 'next/server';
import { getCurrentUserFromHeaders } from '@/lib/auth';

export async function GET(req: Request) {
  const user = getCurrentUserFromHeaders(new Headers(req.headers));
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user });
}
