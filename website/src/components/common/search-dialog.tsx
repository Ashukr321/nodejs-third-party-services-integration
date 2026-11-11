"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileTextIcon, HashIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CommandDialog,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

export type SearchItem = {
    topic: string;
    title: string;
    href: string;
    heading?: boolean;
};

export function SearchDialog() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<SearchItem[] | null>(null);
    const router = useRouter();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const typing =
                e.target instanceof HTMLElement &&
                e.target.closest("input, textarea, [contenteditable=true]");
            if (
                (e.key === "/" && !typing) ||
                (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))
            ) {
                e.preventDefault();
                setOpen(true);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // index is a static JSON file, fetched once on first open so it stays out of every page's payload
    useEffect(() => {
        if (!open || items) return;
        fetch("/search-index.json")
            .then((r) => r.json())
            .then(setItems)
            .catch(() => setItems([]));
    }, [open, items]);

    const groups = Object.entries(
        (items ?? []).reduce<Record<string, SearchItem[]>>(
            (acc, item) => ((acc[item.topic] ??= []).push(item), acc),
            {},
        ),
    );

    return (
        <>
            <Button
                variant="outline"
                size="lg"
                onClick={() => setOpen(true)}
                className="text-muted-foreground h-10 w-10 justify-start gap-2 px-0 max-sm:justify-center sm:w-56 sm:px-3 md:w-72"
                aria-label="Search topics"
            >
                <SearchIcon className="size-4" />
                <span className="hidden sm:inline">Search topics…</span>
                <kbd className="bg-muted ml-auto hidden rounded border px-1.5 font-mono text-xs sm:inline">
                    /
                </kbd>
            </Button>
            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                title="Search docs"
                description="Search topics, pages and sections"
                className="sm:max-w-xl"
            >
                <Command>
                    <CommandInput placeholder="Search topics, pages, sections…" />
                    <CommandList className="max-h-[60vh]">
                        <CommandEmpty>
                            {items ? "No results found." : "Loading…"}
                        </CommandEmpty>
                        {groups.map(([topic, list]) => (
                            <CommandGroup key={topic} heading={topic}>
                                {list.map((item) => (
                                    <CommandItem
                                        key={item.href}
                                        value={`${item.title} ${topic} ${item.href}`}
                                        onSelect={() => {
                                            setOpen(false);
                                            router.push(item.href);
                                        }}
                                        className={
                                            item.heading ? "pl-7" : undefined
                                        }
                                    >
                                        {item.heading ? (
                                            <HashIcon className="text-muted-foreground" />
                                        ) : (
                                            <FileTextIcon />
                                        )}
                                        <span className="truncate">
                                            {item.title}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    );
}
