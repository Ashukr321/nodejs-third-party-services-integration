"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import type { NavTopic } from "@/lib/content";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav({ nav }: { nav: NavTopic[] }) {
    const [open, setOpen] = useState(false);
    return (
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
    );
}
