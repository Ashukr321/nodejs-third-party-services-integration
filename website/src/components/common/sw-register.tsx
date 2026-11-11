"use client";

import { useEffect } from "react";

export function SwRegister() {
    useEffect(() => {
        // dev server assets change on every edit; a cache there only causes stale pages
        if (
            process.env.NODE_ENV !== "production" ||
            !("serviceWorker" in navigator)
        )
            return;
        navigator.serviceWorker
            .register("/sw.js", { scope: "/", updateViaCache: "none" })
            .catch(() => {});
    }, []);
    return null;
}
