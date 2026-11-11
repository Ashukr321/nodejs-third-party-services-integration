import { vi, describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("server-only", () => ({}));
// next-themes / mermaid are client-only; the fallback <pre> is enough here
vi.mock("@/components/common/mermaid", () => ({
    Mermaid: ({ chart }: { chart: string }) => <pre data-mermaid>{chart}</pre>,
}));

const { getTopics, extractHeadings, fileSlug, htmlDiagramsToMarkdown } =
    await import("@/lib/content");
const { Markdown } = await import("@/components/common/markdown");

describe("content", () => {
    const topics = getTopics();

    it("loads the guide folders in order, skipping empty ones", () => {
        expect(topics.length).toBeGreaterThan(20);
        expect(topics.map((t) => t.number)).toEqual(
            [...topics.map((t) => t.number)].sort((a, b) => a - b),
        );
        expect(topics.every((t) => t.pages.length > 0)).toBe(true);
        expect(topics[0].pages[0].slug).toBe("how-it-works");
    });

    it("slugs files and dedupes repeated headings like rehype-slug", () => {
        expect(fileSlug("Payment verification.md")).toBe(
            "payment-verification",
        );
        expect(
            extractHeadings(
                "# T\n## A\n```\n## not a heading\n```\n## A\n### `code` **b**",
            ).map((h) => h.id),
        ).toEqual(["a", "a-1", "code-b"]);
    });

    it("turns the HTML flow-diagram file into mermaid markdown", () => {
        const md = htmlDiagramsToMarkdown(
            '<h1>Flows</h1><section><h2>1. Arch</h2><p>See <code>x</code>.</p><pre class="mermaid">flowchart LR\n A --&gt; B</pre></section><section><h2>No chart</h2></section>',
        );
        expect(md).toBe(
            "# Flows\n\n## 1. Arch\n\nSee `x`.\n\n```mermaid\nflowchart LR\n A --> B\n```",
        );
    });

    it("every TOC link points at a heading id that the rendered page actually has", () => {
        for (const t of topics)
            for (const p of t.pages) {
                const html = renderToStaticMarkup(
                    <Markdown topic={t.slug}>{p.markdown}</Markdown>,
                );
                for (const h of p.headings)
                    expect(html, `${t.slug}/${p.slug}#${h.id}`).toContain(
                        `id="${h.id}"`,
                    );
            }
    });

    it("renders mermaid fences as diagrams, not code blocks", () => {
        const html = renderToStaticMarkup(
            <Markdown topic="x">
                {"```mermaid\nflowchart LR\n A-->B\n```"}
            </Markdown>,
        );
        expect(html).toContain("data-mermaid");
        expect(html).not.toContain("language-mermaid");
    });
});
