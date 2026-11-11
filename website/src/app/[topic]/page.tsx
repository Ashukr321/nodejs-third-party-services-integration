import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DocShell } from "@/components/common/doc-shell";
import { getTopic, getTopics } from "@/lib/content";

type Props = { params: Promise<{ topic: string }> };

export const dynamicParams = false;

export const generateStaticParams = () =>
    getTopics().map((t) => ({ topic: t.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const topic = getTopic((await params).topic);
    if (!topic) return {};
    const description = `${topic.name} in Node.js: ${topic.pages.map((p) => p.label.toLowerCase()).join(", ")}.`;
    return {
        title: topic.name,
        description,
        alternates: { canonical: `/${topic.slug}` },
        openGraph: { title: topic.name, description, url: `/${topic.slug}` },
    };
}

export default async function TopicPage({ params }: Props) {
    const topic = getTopic((await params).topic);
    if (!topic) notFound();

    return (
        <DocShell
            headings={topic.pages.map((p) => ({
                id: p.slug,
                text: p.label,
                depth: 2 as const,
            }))}
        >
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
                Topic {topic.number}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                <span aria-hidden>{topic.emoji}</span> {topic.name}
            </h1>
            <p className="text-muted-foreground mt-4">
                {topic.pages.length} guides. Start with{" "}
                <em>{topic.pages[0].label}</em> and work down the list.
            </p>
            <div className="mt-8 grid gap-4">
                {topic.pages.map((p, i) => (
                    <Link
                        key={p.slug}
                        id={p.slug}
                        href={`/${topic.slug}/${p.slug}`}
                        className="focus-visible:ring-ring/50 scroll-mt-24 rounded-xl focus-visible:ring-3 focus-visible:outline-none"
                    >
                        <Card className="hover:ring-primary transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-baseline gap-3">
                                    <span className="text-primary font-mono text-sm">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    {p.label}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {p.description || p.title}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </DocShell>
    );
}
