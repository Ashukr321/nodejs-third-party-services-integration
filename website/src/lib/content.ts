import "server-only";
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";

// The guides live one level up, in the repo's _NN_Topic folders. Read at build time only:
// every page is statically generated, so the runtime (Vercel / Docker) never touches the disk.
const CONTENT_DIR = process.env.CONTENT_DIR ?? path.join(process.cwd(), "..");

export type Heading = { depth: 2 | 3; text: string; id: string };
export type Page = {
    slug: string;
    label: string;
    title: string;
    description: string;
    markdown: string;
    headings: Heading[];
};
export type Topic = {
    slug: string;
    number: number;
    name: string;
    emoji: string;
    pages: Page[];
};

const PAGE_ORDER = [
    "how-it-works",
    "use-cases",
    "architecture",
    "integration-guide",
    "npm-packages",
];
const LABELS: Record<string, string> = {
    "npm-packages": "NPM Packages",
    flowdiagram: "Flow Diagrams",
    "mongodb-storage": "MongoDB Storage",
};

export const fileSlug = (file: string) =>
    path
        .parse(file)
        .name.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const labelFor = (slug: string) =>
    LABELS[slug] ??
    slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** Plain text of a markdown heading/paragraph, as react-markdown would render it. */
export const inlineText = (md: string) =>
    md
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/`([^`]*)`/g, "$1")
        .replace(/(\*\*|__)(.+?)\1/g, "$2")
        .replace(/<[^>]+>/g, "")
        .trim();

/** h2/h3 for the TOC. Ids come from the same slugger rehype-slug uses, fed every heading in order so duplicates match. */
export function extractHeadings(markdown: string): Heading[] {
    const slugger = new GithubSlugger();
    const headings: Heading[] = [];
    let inFence = false;
    for (const line of markdown.split(/\r?\n/)) {
        if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
        const m = !inFence && /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
        if (!m) continue;
        const text = inlineText(m[2]);
        const id = slugger.slug(text);
        if (m[1].length === 2 || m[1].length === 3)
            headings.push({ depth: m[1].length as 2 | 3, text, id });
    }
    return headings;
}

function describe(markdown: string) {
    let inFence = false;
    for (const line of markdown.split(/\r?\n/)) {
        if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
        if (inFence || !line.trim() || /^\s*([#>|`<-]|\*\s|\d+\.)/.test(line))
            continue;
        const text = inlineText(line).replace(/\*/g, "");
        return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
    }
    return "";
}

const decode = (s: string) =>
    s
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");

/** flowdiagram.html → markdown: keeps each <section> that holds a Mermaid diagram (heading, intro, chart). */
export function htmlDiagramsToMarkdown(html: string) {
    const strip = (s: string) =>
        decode(
            s.replace(/<code>(.*?)<\/code>/g, "`$1`").replace(/<[^>]+>/g, ""),
        ).trim();
    const title = strip(
        /<h1>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? "Flow Diagrams",
    );
    const parts = [`# ${title}`];
    for (const [, section] of html.matchAll(
        /<section[^>]*>([\s\S]*?)<\/section>/g,
    )) {
        const chart = /<pre class="mermaid">([\s\S]*?)<\/pre>/.exec(
            section,
        )?.[1];
        if (!chart) continue;
        const h2 = /<h2>([\s\S]*?)<\/h2>/.exec(section)?.[1] ?? "";
        const p = /<p>([\s\S]*?)<\/p>/.exec(section)?.[1];
        parts.push(
            `## ${strip(h2)}`,
            ...(p ? [strip(p)] : []),
            "```mermaid\n" + decode(chart).trim() + "\n```",
        );
    }
    return parts.join("\n\n");
}

function readEmojis(): Record<number, string> {
    const readme = path.join(CONTENT_DIR, "README.md");
    if (!fs.existsSync(readme)) return {};
    const map: Record<number, string> = {};
    for (const [, n, emoji] of fs
        .readFileSync(readme, "utf8")
        .matchAll(/^###\s+(\d+)\.\s+(\S+)\s/gm))
        map[+n] = emoji;
    return map;
}

function loadPage(dir: string, file: string): Page {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const markdown = file.endsWith(".html") ? htmlDiagramsToMarkdown(raw) : raw;
    const slug = fileSlug(file);
    const h1 = /^#\s+(.+)$/m.exec(markdown)?.[1];
    return {
        slug,
        label: labelFor(slug),
        title: h1 ? inlineText(h1) : labelFor(slug),
        description: describe(markdown),
        markdown,
        headings: extractHeadings(markdown),
    };
}

const rank = (slug: string) =>
    (PAGE_ORDER.indexOf(slug) + 1 || PAGE_ORDER.length + 1) * 1000;

let cache: Topic[] | undefined;

export function getTopics(): Topic[] {
    if (cache) return cache;
    const emojis = readEmojis();
    cache = fs
        .readdirSync(CONTENT_DIR, { withFileTypes: true })
        .flatMap((d) => {
            const m = d.isDirectory() && /^_(\d+)_(.+)$/.exec(d.name);
            if (!m) return [];
            const dir = path.join(CONTENT_DIR, d.name);
            const pages = fs
                .readdirSync(dir)
                .filter((f) => /\.(md|html)$/i.test(f))
                .map((f) => loadPage(dir, f))
                .sort(
                    (a, b) =>
                        rank(a.slug) - rank(b.slug) ||
                        a.label.localeCompare(b.label),
                );
            if (!pages.length) return []; // empty placeholder folders
            const name = m[2].replace(/[_-]+/g, " ");
            return [
                {
                    slug: fileSlug(name),
                    number: +m[1],
                    name,
                    emoji: emojis[+m[1]] ?? "📘",
                    pages,
                },
            ];
        })
        .sort((a, b) => a.number - b.number);
    return cache;
}

export const getTopic = (slug: string) =>
    getTopics().find((t) => t.slug === slug);

export function getPage(topicSlug: string, pageSlug: string) {
    const topic = getTopic(topicSlug);
    const page = topic?.pages.find((p) => p.slug === pageSlug);
    return topic && page ? { topic, page } : undefined;
}

/** Flat reading order across all topics, for prev/next links. */
export const allPages = () =>
    getTopics().flatMap((topic) =>
        topic.pages.map((page) => ({ topic, page })),
    );

/** Sidebar data without the markdown bodies, small enough to send to the client. */
export const getNav = () =>
    getTopics().map(({ slug, name, emoji, pages }) => ({
        slug,
        name,
        emoji,
        pages: pages.map(({ slug, label }) => ({ slug, label })),
    }));
export type NavTopic = ReturnType<typeof getNav>[number];
