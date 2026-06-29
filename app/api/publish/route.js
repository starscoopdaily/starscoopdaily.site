import { NextResponse } from 'next/server';

const GITHUB_API = 'https://api.github.com';

export async function POST(req) {
  try {
    const { article, githubToken, githubOwner, githubRepo } = await req.json();

    if (!githubToken || !githubOwner || !githubRepo) {
      return NextResponse.json(
        { error: 'GitHub credentials missing. Configure in Admin → Site Controls.' },
        { status: 400 }
      );
    }

    if (!article?.slug) {
      return NextResponse.json({ error: 'Article slug is required' }, { status: 400 });
    }

    const filePath = `data/articles/${article.slug}.json`;
    const content = Buffer.from(JSON.stringify(article, null, 2)).toString('base64');
    const commitMessage = `feat: ${article.slug} — published via StarScoop Admin`;

    // Check if file already exists (needed for update)
    const checkUrl = `${GITHUB_API}/repos/${githubOwner}/${githubRepo}/contents/${filePath}`;
    const checkRes = await fetch(checkUrl, {
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

    // Create or update file
    const body = { message: commitMessage, content };
    if (sha) body.sha = sha;

    const putRes = await fetch(checkUrl, {
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

    const result = await putRes.json();
    return NextResponse.json({
      success: true,
      sha: result.content?.sha,
      url: result.content?.html_url,
      commit: result.commit?.html_url,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { slug, githubToken, githubOwner, githubRepo } = await req.json();

    if (!githubToken || !githubOwner || !githubRepo) {
      return NextResponse.json({ error: 'GitHub credentials missing' }, { status: 400 });
    }

    const filePath = `data/articles/${slug}.json`;
    const fileUrl = `${GITHUB_API}/repos/${githubOwner}/${githubRepo}/contents/${filePath}`;

    const checkRes = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'StarScoopDaily-Admin',
      },
    });

    if (!checkRes.ok) {
      return NextResponse.json({ error: 'File not found on GitHub' }, { status: 404 });
    }

    const { sha } = await checkRes.json();

    const delRes = await fetch(fileUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'StarScoopDaily-Admin',
      },
      body: JSON.stringify({
        message: `chore: delete article ${slug}`,
        sha,
      }),
    });

    if (!delRes.ok) {
      const errData = await delRes.json();
      return NextResponse.json({ error: errData.message }, { status: delRes.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
