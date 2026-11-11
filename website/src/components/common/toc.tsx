"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Toc({
    headings,
}: {
    headings: Pick<Heading, "id" | "text" | "depth">[];
}) {
    const [active, setActive] = useState(headings[0]?.id);

    useEffect(() => {
        const els = headings
            .map((h) => document.getElementById(h.id))
            .filter((el): el is HTMLElement => !!el);
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    );
                if (visible[0]) setActive(visible[0].target.id);
            },
            { rootMargin: "-80px 0px -65% 0px" },
        );
        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [headings]);

    if (!headings.length) return null;
    return (
        <nav aria-label="On this page">
            <p className="mb-3 text-lg font-semibold">On this page</p>
            <ul className="space-y-0.5 text-sm">
                {headings.map((h) => (
                    <li key={h.id}>
                        <a
                            href={`#${h.id}`}
                            className={cn(
                                "text-muted-foreground hover:text-foreground block rounded-md py-1 pr-2 transition-colors",
                                h.depth === 3 ? "pl-8 text-[13px]" : "pl-3",
                                active === h.id &&
                                    "bg-primary text-primary-foreground hover:text-primary-foreground",
                            )}
                        >
                            {h.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
