import Link from "next/link";
import type { Topic } from "@/lib/content";
import { site } from "@/lib/site";

// Services drawn around the Node.js hub, by topic number. Odd ones animate inbound (callbacks/webhooks feel).
const SPOKES = [
    { n: 1, label: "Payments" },
    { n: 10, label: "Webhooks" },
    { n: 2, label: "Email" },
    { n: 20, label: "Queues" },
    { n: 3, label: "SMS / OTP" },
    { n: 19, label: "Redis" },
    { n: 4, label: "OAuth" },
    { n: 9, label: "AI APIs" },
];

const W = 480;
const H = 250;
const CX = W / 2;
const CY = H / 2;

export function HeroBanner({ topics }: { topics: Topic[] }) {
    const guides = topics.reduce((n, t) => n + t.pages.length, 0);
    const spokes = SPOKES.flatMap((s, i) => {
        const topic = topics.find((t) => t.number === s.n);
        if (!topic) return [];
        const a = (i / SPOKES.length) * Math.PI * 2 - Math.PI / 2;
        return [
            {
                ...s,
                topic,
                inbound: i % 2 === 1,
                x: CX + Math.cos(a) * 180,
                y: CY + Math.sin(a) * 92,
            },
        ];
    });

    return (
        <section
            id="overview"
            aria-label="Overview"
            className="from-primary/20 via-card to-card relative scroll-mt-24 overflow-hidden rounded-2xl border bg-linear-to-br p-5 sm:p-8"
        >
            {/* faint blueprint grid */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 [background-image:linear-gradient(color-mix(in_oklch,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklch,var(--foreground)_6%,transparent)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] [background-size:24px_24px]"
            />
            <div className="relative">
                <p className="text-primary font-mono text-[10px] tracking-[0.25em] uppercase sm:text-xs">
                    Learn integrations, step by step
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                    Node<span className="text-primary">Integrations</span>
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                    One Node.js API, every service it talks to: from your first
                    API key to resilient, queue-backed production systems.
                </p>

                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="mt-4 w-full"
                    role="img"
                    aria-label="A Node.js API in the middle, connected to payments, webhooks, email, queues, SMS, Redis, OAuth and AI services"
                >
                    {spokes.map((s) => (
                        <line
                            key={`l${s.n}`}
                            x1={CX}
                            y1={CY}
                            x2={s.x}
                            y2={s.y}
                            className={`flow-line stroke-primary/70 ${s.inbound ? "inbound" : ""}`}
                            strokeWidth={1.5}
                        />
                    ))}
                    {spokes.map((s) => (
                        <Link
                            key={s.n}
                            href={`/${s.topic.slug}`}
                            aria-label={s.topic.name}
                            className="group"
                        >
                            <rect
                                x={s.x - 54}
                                y={s.y - 15}
                                width={108}
                                height={30}
                                rx={15}
                                className="fill-card stroke-border group-hover:stroke-primary transition-colors"
                                strokeWidth={1.5}
                            />
                            <text
                                x={s.x}
                                y={s.y + 4.5}
                                textAnchor="middle"
                                className="fill-foreground text-[12px] font-medium"
                            >
                                {s.topic.emoji} {s.label}
                            </text>
                        </Link>
                    ))}
                    <g aria-hidden>
                        <circle
                            cx={CX}
                            cy={CY}
                            r={44}
                            className="fill-primary/15 hub-pulse"
                        />
                        <rect
                            x={CX - 64}
                            y={CY - 24}
                            width={128}
                            height={48}
                            rx={14}
                            className="fill-primary"
                        />
                        {/* generic server glyph */}
                        <g
                            className="stroke-primary-foreground fill-none"
                            strokeWidth={1.8}
                        >
                            <rect
                                x={CX - 52}
                                y={CY - 12}
                                width={22}
                                height={10}
                                rx={2.5}
                            />
                            <rect
                                x={CX - 52}
                                y={CY + 2}
                                width={22}
                                height={10}
                                rx={2.5}
                            />
                        </g>
                        <circle
                            cx={CX - 47}
                            cy={CY - 7}
                            r={1.5}
                            className="fill-primary-foreground"
                        />
                        <circle
                            cx={CX - 47}
                            cy={CY + 7}
                            r={1.5}
                            className="fill-primary-foreground"
                        />
                        <text
                            x={CX - 22}
                            y={CY - 1}
                            className="fill-primary-foreground text-[14px] font-bold"
                        >
                            Your API
                        </text>
                        <text
                            x={CX - 22}
                            y={CY + 13}
                            className="fill-primary-foreground text-[10px] opacity-80"
                        >
                            Node.js backend
                        </text>
                    </g>
                </svg>

                <ul className="mt-4 flex flex-wrap gap-2 text-xs">
                    {[
                        `${topics.length} topics`,
                        `${guides} guides`,
                        "Mermaid flow diagrams",
                        "Express + MongoDB code",
                    ].map((s) => (
                        <li
                            key={s}
                            className="bg-background/70 rounded-full border px-3 py-1 backdrop-blur"
                        >
                            {s}
                        </li>
                    ))}
                </ul>
                <span className="sr-only">{site.description}</span>
            </div>
        </section>
    );
}
