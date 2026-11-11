import { getTopics } from "@/lib/content";
import type { SearchItem } from "@/components/common/search-dialog";

export const dynamic = "force-static";

export function GET() {
    const items: SearchItem[] = getTopics().flatMap((t) => {
        const topic = `${t.emoji} ${t.name}`;
        return t.pages.flatMap((p) => {
            const href = `/${t.slug}/${p.slug}`;
            return [
                { topic, title: `${p.label} — ${p.title}`, href },
                ...p.headings
                    .filter((h) => h.depth === 2)
                    .map((h) => ({
                        topic,
                        title: h.text,
                        href: `${href}#${h.id}`,
                        heading: true,
                    })),
            ];
        });
    });
    return Response.json(items);
}
