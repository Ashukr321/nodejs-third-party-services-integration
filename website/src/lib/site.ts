export const site = {
    name: "Node Integrations",
    shortName: "Integrations",
    description:
        "Learn to integrate third-party services into Node.js, step by step: payments, email, SMS, OAuth, queues, caching, webhooks and more, with flow diagrams and production-ready code.",
    url:
        process.env.NEXT_PUBLIC_APP_URL ??
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : "http://localhost:3000"),
};

/** Safe JSON-LD for a <script> tag (no closing-tag injection). */
export const jsonLd = (data: object) => ({
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
});
