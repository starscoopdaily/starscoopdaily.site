import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const articlesDir = path.join(process.cwd(), 'data', 'articles');

function ensureDir() {
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }
}

export async function GET() {
  try {
    ensureDir();
    const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.json'));
    const articles = files
      .map((file) => {
        try {
          const raw = fs.readFileSync(path.join(articlesDir, file), 'utf8');
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json(articles);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const article = await req.json();
    if (!article.slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }
    ensureDir();
    const filePath = path.join(articlesDir, `${article.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(article, null, 2), 'utf8');
    return NextResponse.json({ success: true, slug: article.slug });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    const filePath = path.join(articlesDir, `${slug}.json`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
