import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'data', 'site-config.json');

export async function GET() {
  try {
    if (!fs.existsSync(configPath)) {
      return NextResponse.json({ breakingTicker: [], trendingArticles: [] });
    }
    const raw = fs.readFileSync(configPath, 'utf8');
    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    fs.writeFileSync(configPath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
