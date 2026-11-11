import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/providers/Providers";
import { SiteHeader } from "@/components/common/site-header";
import { SidebarNav } from "@/components/common/sidebar-nav";
import { SwRegister } from "@/components/common/sw-register";
import { getNav } from "@/lib/content";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL(site.url),
    title: {
        default: `${site.name} — Third-party services in Node.js`,
        template: `%s | ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    keywords: [
        "Node.js",
        "third-party integration",
        "Stripe",
        "Razorpay",
        "OAuth",
        "webhooks",
        "Redis",
        "message queues",
        "Express",
        "MongoDB",
    ],
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        siteName: site.name,
        url: "/",
        title: site.name,
        description: site.description,
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: site.name,
        description: site.description,
    },
    robots: { index: true, follow: true },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: site.shortName,
    },
    formatDetection: { telephone: false },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#1c1c1f" },
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const nav = getNav();
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            <body className="min-h-dvh">
                <Providers>
                    <a
                        href="#main"
                        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
                    >
                        Skip to content
                    </a>
                    <SiteHeader nav={nav} />
                    <div className="mx-auto flex w-full max-w-[1600px]">
                        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-72 shrink-0 overflow-y-auto border-r px-3 py-6 lg:block">
                            <SidebarNav nav={nav} />
                        </aside>
                        <main id="main" className="min-w-0 flex-1">
                            {children}
                        </main>
                    </div>
                </Providers>
                <SwRegister />
            </body>
        </html>
    );
}
