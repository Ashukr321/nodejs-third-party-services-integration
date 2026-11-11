# Node Integrations — docs website

Next.js 16 site that turns the guides in this repo (`../_NN_Topic/*.md`) into a docs website: sidebar, search (`/` or `Ctrl+K`), light/dark/auto theme, "On this page" TOC, Mermaid flow diagrams, PWA (installable, offline) and SEO (metadata, sitemap, robots, Open Graph, JSON-LD).

Scaffolded with `nxt-init website`; UI built with shadcn/ui (Base UI) and Tailwind CSS 4.

## How content works

- Every `_NN_Topic` folder at the repo root is a topic; every `.md` inside it is a page. Empty folders are skipped.
- Fenced ` ```mermaid ` blocks render as diagrams (with an expand button for wide charts).
- `flowdiagram.html` files are converted: each `<section>` with a `<pre class="mermaid">` becomes a heading + diagram on a "Flow Diagrams" page.
- Emojis for topics come from the root `README.md` (`### 1. 💳 ...` lines).
- All pages are generated at build time. **Add or edit a markdown file, rebuild, done.**

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run test:unit    # checks every guide's TOC ids match the rendered headings
npm run build
```

## Deploy on Vercel

1. Import the repo in Vercel.
2. Set **Root Directory** to `website` and keep "Include files outside the root directory" **on** (the guides live one level up).
3. Optional: set `NEXT_PUBLIC_APP_URL` to your custom domain. Without it, the Vercel production URL is used for canonical/sitemap links.

## Docker

The build context is the repo root, because the guides sit next to `website/`.

```bash
docker compose up --build          # from website/, serves http://localhost:3000
```

or

```bash
docker build -f website/Dockerfile --build-arg NEXT_PUBLIC_APP_URL=https://your.domain -t node-integrations ..
```

## Structure

```
src/
├── app/
│   ├── page.tsx                  # home: overview, learning path, course map
│   ├── [topic]/page.tsx          # topic index
│   ├── [topic]/[page]/page.tsx   # a guide
│   ├── search-index.json/        # static search index (fetched on first search)
│   ├── sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx, offline/
├── components/common/            # header, sidebar, mobile nav, search, theme, TOC, markdown, mermaid
├── components/ui/                # shadcn components
└── lib/content.ts                # reads and parses the guides
public/sw.js                      # service worker (offline support)
```
