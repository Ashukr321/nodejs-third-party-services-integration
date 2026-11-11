import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: 80,
                background: "#1c1c1f",
                color: "#f4f4f5",
            }}
        >
            <div
                style={{
                    fontSize: 28,
                    letterSpacing: 6,
                    color: "#a5b4fc",
                    textTransform: "uppercase",
                }}
            >
                Learn integrations, step by step
            </div>
            <div
                style={{
                    display: "flex",
                    fontSize: 96,
                    fontWeight: 700,
                    marginTop: 20,
                }}
            >
                Node<span style={{ color: "#a5b4fc" }}>Integrations</span>
            </div>
            <div
                style={{
                    fontSize: 34,
                    marginTop: 24,
                    color: "#a1a1aa",
                    maxWidth: 950,
                }}
            >
                Payments, email, OTP, OAuth, queues, caching and webhooks in
                Node.js, with flow diagrams and working code.
            </div>
        </div>,
        size,
    );
}
