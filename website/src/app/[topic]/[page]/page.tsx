import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DocShell } from "@/components/common/doc-shell";
import { Markdown } from "@/components/common/markdown";
import { allPages, getPage } from "@/lib/content";
import { jsonLd, site } from "@/lib/site";

type Props = { params: Promise<{ topic: string; page: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
    return allPages().map(({ topic, page }) => ({
        topic: topic.slug,
        page: page.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { topic: t, page: p } = await params;
    const found = getPage(t, p);
    if (!found) return {};
    const { topic, page } = found;
    const title = `${page.label} · ${topic.name}`;
    const url = `/${topic.slug}/${page.slug}`;
    return {
        title,
        description: page.description || site.description,
        alternates: { canonical: url },
        openGraph: {
            type: "article",
            title,
            description: page.description,
            url,
        },
        twitter: { title, description: page.description },
    };
}

export default async function DocPage({ params }: Props) {
    const { topic: t, page: p } = await params;
    const found = getPage(t, p);
    if (!found) notFound();
    const { topic, page } = found;

    const order = allPages();
    const i = order.findIndex(
        (x) => x.topic.slug === topic.slug && x.page.slug === page.slug,
    );
    const prev = order[i - 1];
    const next = order[i + 1];
    const url = `${site.url}/${topic.slug}/${page.slug}`;

    return (
        <DocShell headings={page.headings}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={jsonLd({
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "TechArticle",
                            headline: page.title,
                            description: page.description,
                            url,
                            inLanguage: "en",
                            isPartOf: {
                                "@type": "WebSite",
                                name: site.name,
                                url: site.url,
                            },
                        },
                        {
                            "@type": "BreadcrumbList",
                            itemListElement: [
                                {
                                    "@type": "ListItem",
                                    position: 1,
                                    name: "Home",
                                    item: site.url,
                                },
                                {
                                    "@type": "ListItem",
                                    position: 2,
                                    name: topic.name,
                                    item: `${site.url}/${topic.slug}`,
                                },
                                {
                                    "@type": "ListItem",
                                    position: 3,
                                    name: page.label,
                                    item: url,
                                },
                            ],
                        },
                    ],
                })}
            />
            <nav
                aria-label="Breadcrumb"
                className="text-muted-foreground mb-4 flex flex-wrap items-center gap-1 text-sm"
            >
                <Link href="/" className="hover:text-foreground">
                    Home
                </Link>
                <ChevronRightIcon className="size-3.5" />
                <Link href={`/${topic.slug}`} className="hover:text-foreground">
                    {topic.emoji} {topic.name}
                </Link>
                <ChevronRightIcon className="size-3.5" />
                <span className="text-foreground">{page.label}</span>
            </nav>

            <div className="prose-docs">
                <Markdown topic={topic.slug}>{page.markdown}</Markdown>
            </div>

            <nav
                aria-label="Pagination"
                className="mt-12 grid gap-3 border-t pt-6 sm:grid-cols-2"
            >
                {prev ? (
                    <Link
                        href={`/${prev.topic.slug}/${prev.page.slug}`}
                        className="group hover:border-primary rounded-xl border p-4 transition-colors"
                    >
                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <ChevronLeftIcon className="size-3.5" /> Previous
                        </span>
                        <span className="group-hover:text-primary mt-1 block font-medium">
                            {prev.page.label} · {prev.topic.name}
                        </span>
                    </Link>
                ) : (
                    <span />
                )}
                {next && (
                    <Link
                        href={`/${next.topic.slug}/${next.page.slug}`}
                        className="group hover:border-primary rounded-xl border p-4 text-right transition-colors"
                    >
                        <span className="text-muted-foreground flex items-center justify-end gap-1 text-xs">
                            Next <ChevronRightIcon className="size-3.5" />
                        </span>
                        <span className="group-hover:text-primary mt-1 block font-medium">
                            {next.page.label} · {next.topic.name}
                        </span>
                    </Link>
                )}
            </nav>
        </DocShell>
    );
}
