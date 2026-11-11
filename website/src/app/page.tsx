import Link from "next/link";
import { RocketIcon } from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DocShell } from "@/components/common/doc-shell";
import { HeroBanner } from "@/components/common/hero-banner";
import { LearningPath } from "@/components/common/learning-path";
import { getTopics } from "@/lib/content";
import { jsonLd, site } from "@/lib/site";

export default function Home() {
    const topics = getTopics();
    const guides = topics.reduce((n, t) => n + t.pages.length, 0);
    const quickLinks = topics.slice(0, 4).map((t) => ({
        t,
        p: t.pages.find((p) => p.slug === "integration-guide") ?? t.pages[0],
    }));

    const headings = [
        { id: "overview", text: "Overview", depth: 2 as const },
        { id: "learning-path", text: "Learning Path", depth: 2 as const },
        { id: "course-map", text: "Course Map", depth: 2 as const },
        ...topics.map((t, i) => ({
            id: t.slug,
            text: `${i + 1}. ${t.name}`,
            depth: 3 as const,
        })),
        { id: "quick-links", text: "Quick Links", depth: 2 as const },
    ];

    return (
        <DocShell headings={headings}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={jsonLd({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    name: site.name,
                    url: site.url,
                    description: site.description,
                })}
            />

            <HeroBanner topics={topics} />

            <h1 className="mt-8 border-b pb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                {site.name}
            </h1>
            <p className="text-muted-foreground mt-6">
                <strong className="text-foreground">
                    Integrate third-party services into Node.js, in plain
                    English, with working code.
                </strong>{" "}
                {topics.length} topics and {guides} guides covering payments,
                email, OTP, OAuth, queues, caching, webhooks and more. Every
                topic explains how the service works, real use cases, an
                integration guide with Express and MongoDB, and the npm packages
                to use.
            </p>

            <aside className="border-primary bg-primary/10 mt-6 rounded-xl border-l-4 p-5">
                <p className="text-primary flex items-center gap-2 font-semibold">
                    <RocketIcon className="size-4" /> Tip
                </p>
                <p className="mt-2 font-semibold">How to use this guide</p>
                <p className="text-muted-foreground mt-1 text-sm">
                    Follow the learning path below, or jump to a topic from the
                    sidebar. Inside a topic, read <em>How it works</em> first,
                    then <em>Use cases</em>, then the <em>Integration guide</em>
                    . Press{" "}
                    <kbd className="bg-muted rounded border px-1 font-mono text-xs">
                        /
                    </kbd>{" "}
                    to search anywhere.
                </p>
            </aside>

            <h2
                id="learning-path"
                className="mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight"
            >
                Learning Path
            </h2>
            <p className="text-muted-foreground mt-2">
                Four stages, from securing users to keeping things running when
                a provider goes down. Click any topic to start.
            </p>
            <LearningPath topics={topics} />

            <h2
                id="course-map"
                className="mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight"
            >
                Course Map
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {topics.map((t, i) => (
                    <Card key={t.slug} id={t.slug} className="scroll-mt-24">
                        <CardHeader>
                            <CardTitle>
                                <h3>
                                    <Link
                                        href={`/${t.slug}`}
                                        className="hover:text-primary"
                                    >
                                        <span className="text-primary mr-1 font-mono text-sm">
                                            {i + 1}.
                                        </span>{" "}
                                        <span aria-hidden>{t.emoji}</span>{" "}
                                        {t.name}
                                    </Link>
                                </h3>
                            </CardTitle>
                            <CardDescription>
                                <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                    {t.pages.map((p) => (
                                        <li key={p.slug}>
                                            <Link
                                                href={`/${t.slug}/${p.slug}`}
                                                className="hover:text-foreground underline-offset-4 hover:underline"
                                            >
                                                {p.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <h2
                id="quick-links"
                className="mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight"
            >
                Quick Links
            </h2>
            <ul className="marker:text-primary mt-4 list-disc space-y-2 pl-6">
                {quickLinks.map(({ t, p }) => (
                    <li key={t.slug}>
                        <Link
                            href={`/${t.slug}/${p.slug}`}
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            {t.name}: {p.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </DocShell>
    );
}
