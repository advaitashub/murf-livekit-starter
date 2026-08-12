import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

type EscalationRecord = {
  id?: unknown;
  reason?: unknown;
  summary?: unknown;
  urgency?: unknown;
  language?: unknown;
  follow_up_method?: unknown;
  status?: unknown;
  created_at?: unknown;
};

const allowedFields = [
  'id',
  'reason',
  'summary',
  'urgency',
  'language',
  'follow_up_method',
  'status',
  'created_at',
] as const;

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), '../backend/escalations.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Escalation data is malformed.' }, { status: 500 });
    }

    const requests = data.map((item: EscalationRecord) => {
      const safeRequest: Record<string, string> = {};
      for (const key of allowedFields) {
        const value = item[key];
        safeRequest[key] = typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value);
      }
      return safeRequest;
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to load escalation requests.' },
      { status: 500 }
    );
  }
}
