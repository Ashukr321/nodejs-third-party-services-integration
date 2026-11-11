"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { NavTopic } from "@/lib/content";
import { cn } from "@/lib/utils";

export function SidebarNav({
    nav,
    onNavigate,
}: {
    nav: NavTopic[];
    onNavigate?: () => void;
}) {
    const pathname = usePathname();
    // accordion: only one topic open at a time; it follows navigation, and clicking another topic closes the previous one
    const activeSlug = pathname.split("/")[1] || null;
    const [open, setOpen] = useState(activeSlug);
    const [synced, setSynced] = useState(activeSlug);
    if (synced !== activeSlug) {
        setSynced(activeSlug);
        setOpen(activeSlug);
    }
    const item =
        "flex w-full items-center rounded-md px-3 py-2 text-left transition-colors hover:bg-muted";

    return (
        <nav aria-label="Topics" className="flex flex-col gap-0.5 text-[15px]">
            <Link
                href="/"
                onClick={onNavigate}
                className={cn(
                    item,
                    "font-medium",
                    pathname === "/" && "bg-muted text-primary",
                )}
            >
                🏠 Home
            </Link>
            {nav.map((topic) => {
                const base = `/${topic.slug}`;
                const active =
                    pathname === base || pathname.startsWith(`${base}/`);
                return (
                    <Collapsible
                        key={topic.slug}
                        open={open === topic.slug}
                        onOpenChange={(o) => setOpen(o ? topic.slug : null)}
                    >
                        <CollapsibleTrigger
                            className={cn(
                                item,
                                "group gap-2 font-medium",
                                active && "text-primary",
                            )}
                        >
                            <span aria-hidden>{topic.emoji}</span>
                            <span className="flex-1">{topic.name}</span>
                            <ChevronRightIcon className="text-muted-foreground size-4 transition-transform duration-300 ease-out group-data-panel-open:rotate-90 motion-reduce:transition-none" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height,opacity] duration-300 ease-out data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0 motion-reduce:transition-none">
                            <ul className="my-1 ml-5 border-l pl-2">
                                {topic.pages.map((page) => {
                                    const href = `${base}/${page.slug}`;
                                    const current = pathname === href;
                                    return (
                                        <li key={page.slug}>
                                            <Link
                                                href={href}
                                                onClick={onNavigate}
                                                aria-current={
                                                    current ? "page" : undefined
                                                }
                                                className={cn(
                                                    "text-muted-foreground hover:bg-muted hover:text-foreground block rounded-md px-3 py-1.5 text-sm transition-colors",
                                                    current &&
                                                        "bg-primary/10 text-primary hover:text-primary font-medium",
                                                )}
                                            >
                                                {page.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </nav>
    );
}
