import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GITHUB_API = 'https://api.github.com';
const AD_CONFIG_PATH = 'data/ad-config.json';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), AD_CONFIG_PATH);
    const raw = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({
      slots: {
        'header': { enabled: true, code: '' },
        'homepage-top': { enabled: true, code: '' },
        'article-top': { enabled: true, code: '' },
        'article-middle': { enabled: true, code: '' },
        'sidebar': { enabled: true, code: '' },
        'footer': { enabled: true, code: '' },
      },
    });
  }
}

export async function POST(req) {
  try {
    const { config, githubToken, githubUser, githubRepo } = await req.json();

    if (!githubToken || !githubUser || !githubRepo) {
      return NextResponse.json(
        { error: 'GitHub credentials missing. Configure in Admin → Site Controls.' },
        { status: 400 }
      );
    }

    const content = Buffer.from(JSON.stringify(config, null, 2)).toString('base64');
    const fileUrl = `${GITHUB_API}/repos/${githubUser}/${githubRepo}/contents/${AD_CONFIG_PATH}`;

    const checkRes = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'StarScoopDaily-Admin',
      },
    });

    let sha;
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }

    const body = { message: 'chore: update ad config via StarScoop Admin', content };
    if (sha) body.sha = sha;

    const putRes = await fetch(fileUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'StarScoopDaily-Admin',
      },
      body: JSON.stringify(body),
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      return NextResponse.json(
        { error: errData.message || 'GitHub API error' },
        { status: putRes.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
