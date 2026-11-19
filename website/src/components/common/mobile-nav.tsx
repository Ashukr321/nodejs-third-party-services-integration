"use client";

import { useEffect, useState } from "react";
import { MenuIcon, PanelLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import type { NavTopic } from "@/lib/content";
import { SidebarNav } from "./sidebar-nav";

// desktop collapse state lives on <html data-sidebar> (set pre-paint by the inline script in layout.tsx)
function toggleDesktopSidebar() {
    const root = document.documentElement;
    const collapsed = root.dataset.sidebar !== "collapsed";
    if (collapsed) root.dataset.sidebar = "collapsed";
    else delete root.dataset.sidebar;
    try {
        localStorage.setItem("sidebar", collapsed ? "collapsed" : "open");
    } catch {}
}

export function MobileNav({ nav }: { nav: NavTopic[] }) {
    const [open, setOpen] = useState(false);

    // Shift + / toggles the sidebar: collapse/expand on desktop, drawer on mobile
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const typing =
                e.target instanceof HTMLElement &&
                e.target.closest("input, textarea, [contenteditable=true]");
            if (e.code !== "Slash" || !e.shiftKey || typing) return;
            e.preventDefault();
            if (matchMedia("(min-width: 64rem)").matches)
                toggleDesktopSidebar();
            else setOpen((o) => !o);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <>
            <Button
                variant="ghost"
                size="icon-lg"
                className="-ml-2 hidden lg:inline-flex"
                aria-label="Toggle sidebar (Shift + /)"
                title="Toggle sidebar (Shift + /)"
                onClick={toggleDesktopSidebar}
            >
                <PanelLeftIcon className="size-5" />
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="-ml-2 lg:hidden"
                            aria-label="Open menu"
                        />
                    }
                >
                    <MenuIcon className="size-5" />
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="w-[85vw] max-w-80 overflow-y-auto p-3 pt-12"
                >
                    <SheetTitle className="sr-only">Topics</SheetTitle>
                    <SidebarNav nav={nav} onNavigate={() => setOpen(false)} />
                </SheetContent>
            </Sheet>
        </>
    );
}
