import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: site.name,
        short_name: site.shortName,
        description: site.description,
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#1c1c1f",
        theme_color: "#4f46e5",
        categories: ["education", "developer", "books"],
        icons: [
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icons/icon-maskable-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
