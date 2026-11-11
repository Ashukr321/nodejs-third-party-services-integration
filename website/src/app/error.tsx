"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-destructive font-mono text-sm tracking-widest uppercase">
                Error
            </p>
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground">
                Please try again or return to the home page.
            </p>
            <div className="flex gap-2">
                <Button onClick={reset}>Try again</Button>
                <Button variant="outline" render={<Link href="/" />}>
                    Go home
                </Button>
            </div>
        </div>
    );
}
