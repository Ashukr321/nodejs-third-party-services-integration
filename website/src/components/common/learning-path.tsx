import Link from "next/link";
import type { Topic } from "@/lib/content";
import { Mermaid } from "./mermaid";

// Suggested order; any topic not listed here lands in the last stage.
const STAGES = [
    {
        emoji: "🔐",
        name: "Secure the basics",
        goal: "Log users in safely and keep API keys out of your code.",
        numbers: [4, 18, 12, 22],
    },
    {
        emoji: "🌍",
        name: "Talk to the world",
        goal: "Take payments, send email, SMS and push, store files, show maps.",
        numbers: [1, 2, 3, 6, 5, 7],
    },
    {
        emoji: "✨",
        name: "Add smart features",
        goal: "Track usage, call AI APIs, add search, generate PDFs, ship behind flags.",
        numbers: [8, 9, 16, 25, 23],
    },
    {
        emoji: "🛡️",
        name: "Make it reliable",
        goal: "Survive provider outages: webhooks, retries, queues, caching, rate limits, monitoring and tests.",
        numbers: [10, 13, 14, 20, 19, 11, 21, 24, 15, 17],
    },
];

export function stagesOf(topics: Topic[]) {
    const placed = new Set(STAGES.flatMap((s) => s.numbers));
    return STAGES.map((s, i) => ({
        ...s,
        topics: [
            ...s.numbers
                .map((n) => topics.find((t) => t.number === n))
                .filter((t): t is Topic => !!t),
            ...(i === STAGES.length - 1
                ? topics.filter((t) => !placed.has(t.number))
                : []),
        ],
    })).filter((s) => s.topics.length);
}

type Stage = ReturnType<typeof stagesOf>[number];

/** Compact overview: one node per stage, so it stays readable on a phone. */
const chart = (stages: Stage[]) =>
    [
        "flowchart LR",
        `  start(["🚀 Start:<br/>new Node.js app"])`,
        ...stages.map(
            (s, i) =>
                `  S${i}["${s.emoji} <b>Stage ${i + 1}</b><br/>${s.name}<br/><small>${s.topics.length} topics</small>"]:::stage`,
        ),
        `  done(["🏁 Production-ready<br/>integrations"]):::done`,
        `  start --> S0`,
        ...stages.slice(1).map((_, i) => `  S${i} --> S${i + 1}`),
        `  S${stages.length - 1} --> done`,
        "  classDef stage fill:#4f46e5,stroke:#a5b4fc,stroke-width:2px,color:#ffffff",
        "  classDef done fill:#16a34a,stroke:#86efac,stroke-width:2px,color:#ffffff",
    ].join("\n");

export function LearningPath({ topics }: { topics: Topic[] }) {
    const stages = stagesOf(topics);
    return (
        <>
            <Mermaid chart={chart(stages)} />
            <ol className="relative mt-2 space-y-6">
                {stages.map((s, i) => (
                    <li key={s.name} className="relative flex gap-4">
                        {/* connector between stage markers */}
                        {i < stages.length - 1 && (
                            <span
                                aria-hidden
                                className="bg-border absolute top-10 bottom-[-1.5rem] left-5 w-px"
                            />
                        )}
                        <span className="bg-primary text-primary-foreground relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full font-mono font-bold">
                            {i + 1}
                        </span>
                        <div className="min-w-0 flex-1 pb-1">
                            <h3 className="font-semibold">
                                <span aria-hidden>{s.emoji}</span> {s.name}
                            </h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {s.goal}
                            </p>
                            <ul className="mt-3 flex flex-wrap gap-2">
                                {s.topics.map((t) => (
                                    <li key={t.slug}>
                                        <Link
                                            href={`/${t.slug}`}
                                            className="bg-card hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors"
                                        >
                                            <span aria-hidden>{t.emoji}</span>
                                            {t.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ol>
        </>
    );
}
