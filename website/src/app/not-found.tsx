import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-primary font-mono text-sm tracking-widest">
                404
            </p>
            <h1 className="text-2xl font-semibold">Page not found</h1>
            <p className="text-muted-foreground">
                Try the search (press /) or pick a topic from the menu.
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
