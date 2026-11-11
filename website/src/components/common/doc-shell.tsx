import type { Heading } from "@/lib/content";
import { Toc } from "./toc";

/** Article column + right-hand "On this page" rail (inline, collapsible on smaller screens). */
export function DocShell({
    headings,
    children,
}: {
    headings: Pick<Heading, "id" | "text" | "depth">[];
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-10 px-4 py-8 sm:px-8 lg:py-10">
            <article className="mx-auto w-full max-w-3xl min-w-0">
                {headings.length > 0 && (
                    <details className="bg-card mb-6 rounded-xl border p-4 xl:hidden">
                        <summary className="cursor-pointer font-medium">
                            On this page
                        </summary>
                        <ul className="mt-3 space-y-1 text-sm">
                            {headings.map((h) => (
                                <li
                                    key={h.id}
                                    className={
                                        h.depth === 3 ? "pl-4" : undefined
                                    }
                                >
                                    <a
                                        href={`#${h.id}`}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        {h.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </details>
                )}
                {children}
            </article>
            <aside className="hidden w-64 shrink-0 xl:block">
                <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto">
                    <Toc headings={headings} />
                </div>
            </aside>
        </div>
    );
}
