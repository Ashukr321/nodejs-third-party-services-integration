import type { MetadataRoute } from "next";
import { getTopics } from "@/lib/content";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();
    return [
        { url: site.url, lastModified, changeFrequency: "weekly", priority: 1 },
        ...getTopics().flatMap((t) => [
            {
                url: `${site.url}/${t.slug}`,
                lastModified,
                changeFrequency: "monthly" as const,
                priority: 0.8,
            },
            ...t.pages.map((p) => ({
                url: `${site.url}/${t.slug}/${p.slug}`,
                lastModified,
                changeFrequency: "monthly" as const,
                priority: 0.7,
            })),
        ]),
    ];
}
