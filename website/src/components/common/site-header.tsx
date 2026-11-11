import Link from "next/link";
import type { NavTopic } from "@/lib/content";
import { MobileNav } from "./mobile-nav";
import { SearchDialog } from "./search-dialog";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader({ nav }: { nav: NavTopic[] }) {
    return (
        <header className="bg-background/85 supports-backdrop-filter:bg-background/70 sticky top-0 z-40 h-16 border-b backdrop-blur">
            <div className="mx-auto flex h-full max-w-[1600px] items-center gap-2 px-4 sm:px-6">
                <MobileNav nav={nav} />
                <Link
                    href="/"
                    className="mr-auto text-lg font-bold tracking-tight sm:text-xl"
                    aria-label="Node Integrations home"
                >
                    Node<span className="text-primary">Integrations</span>
                </Link>
                <SearchDialog />
                <ThemeSwitcher />
            </div>
        </header>
    );
}
