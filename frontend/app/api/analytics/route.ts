import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

type AnalyticsStats = {
  total?: unknown;
  successful?: unknown;
  failed?: unknown;
};

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), '../backend/src/analytics_stats.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);

    if (typeof data !== 'object' || data === null) {
      return NextResponse.json(
        { error: 'Analytics data is malformed.' },
        { status: 500 }
      );
    }

    const stats = {
      total: typeof data.total === 'number' ? data.total : 0,
      successful: typeof data.successful === 'number' ? data.successful : 0,
      failed: typeof data.failed === 'number' ? data.failed : 0,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to load analytics data.' },
      { status: 500 }
    );
  }
}
