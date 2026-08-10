import { NextResponse } from 'next/server';
import { clearSessionCookieHeader, deleteSessionForRequest } from '@/lib/auth';

export async function POST(req: Request) {
  deleteSessionForRequest(req);
  return new NextResponse(null, {
    status: 204,
    headers: { 'Set-Cookie': clearSessionCookieHeader() },
  });
}
