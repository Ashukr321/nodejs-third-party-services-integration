"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";
import { Maximize2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function Mermaid({ chart }: { chart: string }) {
    const id = `mmd-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
    const { resolvedTheme } = useTheme();
    const [svg, setSvg] = useState("");
    const [error, setError] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        // mermaid is ~1MB; load it only on pages that actually have a diagram
        import("mermaid").then(async ({ default: mermaid }) => {
            mermaid.initialize({
                startOnLoad: false,
                securityLevel: "strict",
                theme: resolvedTheme === "dark" ? "dark" : "default",
                fontFamily: "inherit",
            });
            try {
                const { svg } = await mermaid.render(
                    `${id}-${resolvedTheme}`,
                    chart,
                );
                if (!cancelled) setSvg(svg);
            } catch {
                if (!cancelled) setError(true);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [chart, id, resolvedTheme]);

    if (error || !svg)
        return (
            <pre
                className="not-prose bg-muted my-6 overflow-x-auto rounded-xl border p-4 text-xs"
                aria-busy={!error}
            >
                <code>{chart}</code>
            </pre>
        );

    return (
        <figure className="not-prose bg-card relative my-6 rounded-xl border p-4">
            <Button
                variant="secondary"
                size="icon-sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => setOpen(true)}
                aria-label="Expand diagram"
            >
                <Maximize2Icon />
            </Button>
            <div
                className="overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
            />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[92dvh] w-[96vw] overflow-auto sm:max-w-[96vw]">
                    <DialogTitle className="sr-only">Diagram</DialogTitle>
                    <div
                        className="min-w-[640px] [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:!max-w-none"
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                </DialogContent>
            </Dialog>
        </figure>
    );
}
