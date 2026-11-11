export default function Loading() {
    return (
        <div
            className="mx-auto w-full max-w-3xl animate-pulse space-y-4 px-4 py-10 sm:px-8"
            aria-busy
            aria-label="Loading"
        >
            <div className="bg-muted h-4 w-40 rounded" />
            <div className="bg-muted h-10 w-3/4 rounded" />
            <div className="bg-muted h-4 w-full rounded" />
            <div className="bg-muted h-4 w-5/6 rounded" />
            <div className="bg-muted h-48 w-full rounded-xl" />
        </div>
    );
}
