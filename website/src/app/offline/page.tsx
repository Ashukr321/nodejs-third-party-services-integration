import type { Metadata } from "next";
import Link from "next/link";
import { WifiOffIcon } from "lucide-react";

export const metadata: Metadata = {
    title: "Offline",
    robots: { index: false },
};

export default function Offline() {
    return (
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-4 text-center">
            <WifiOffIcon className="text-primary size-10" />
            <h1 className="text-2xl font-semibold">You are offline</h1>
            <p className="text-muted-foreground max-w-sm">
                This page has not been saved yet. Pages you opened before still
                work offline.
            </p>
            <Link
                href="/"
                className="text-primary underline underline-offset-4"
            >
                Go to the home page
            </Link>
        </div>
    );
}
