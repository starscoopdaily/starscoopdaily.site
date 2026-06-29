# StarScoop Daily

Celebrity news website built with Next.js 14, Tailwind CSS, and Groq AI.

## Live Site
[starscoopdaily.site](https://starscoopdaily.site)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create `.env.local` in the project root:
```env
PEXELS_API_KEY=PVAMj2LIMVlTlUwJSw4L9BzDbqNM4g1jhzGbMnxAZwrYEvTYS
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin Panel
Visit `/admin` — Password: `StarScoop@2026`

Configure in Admin → Site Controls:
- **GitHub Token**: Personal access token with `repo` scope
- **GitHub Username**: Your GitHub username
- **GitHub Repo**: Repository name (e.g., `starscoop-daily`)
- **Groq API Key**: From [console.groq.com](https://console.groq.com)

## Article Publishing Workflow
1. Go to `/admin` → Article Generator
2. Enter topic, select category
3. Click "Generate with AI" (Groq) or write manually
4. Search and select hero image from Pexels
5. Preview → Publish
6. Article JSON saved to GitHub `/data/articles/`
7. Vercel auto-deploys in ~30 seconds

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI Writer**: Groq (llama-3.3-70b-versatile)
- **Images**: Pexels API
- **Hosting**: Vercel
- **Storage**: GitHub (JSON files)

## Analytics & Monetization
- Google Analytics 4: G-152JNSZSJY
- Ads: Adsterra

## Launch Date
June 23, 2026
