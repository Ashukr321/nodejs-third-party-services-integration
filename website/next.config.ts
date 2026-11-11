import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Self-contained server for the Docker image only. On Vercel, standalone + Turbopack fails after
    // Vercel's build adapter runs (missing .next/next-server.js.nft.json), and Vercel doesn't need it.
    output: process.env.VERCEL ? undefined : "standalone",

    // ✏️ Add your image domains here
    images: {
        remotePatterns: [
            // {
            //   protocol: "https",
            //   hostname: "your-cdn.com",
            // },
            // {
            //   protocol: "https",
            //   hostname: "api.example.com",
            //   pathname: "/uploads/**",
            // },
        ],
    },

    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-DNS-Prefetch-Control", value: "on" },
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                    { key: "X-XSS-Protection", value: "1; mode=block" },
                ],
            },
            {
                // the service worker must always be revalidated so new deploys reach users
                source: "/sw.js",
                headers: [
                    {
                        key: "Content-Type",
                        value: "application/javascript; charset=utf-8",
                    },
                    {
                        key: "Cache-Control",
                        value: "no-cache, no-store, must-revalidate",
                    },
                    {
                        key: "Content-Security-Policy",
                        value: "default-src 'self'; script-src 'self'",
                    },
                ],
            },
        ];
    },

    // ✏️ Add redirects as needed
    // async redirects() {
    //   return [
    //     {
    //       source: "/old-page",
    //       destination: "/new-page",
    //       permanent: true,
    //     },
    //   ];
    // },
};

export default nextConfig;
