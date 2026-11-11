import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { Mermaid } from "./mermaid";

const isMermaid = (className: unknown) =>
    String(className ?? "").includes("language-mermaid");

/** Renders a guide. Relative links to sibling .md/.html files point at their site route. */
export function Markdown({
    children,
    topic,
}: {
    children: string;
    topic: string;
}) {
    const components: Components = {
        pre({ node, children, ...props }) {
            const code = node?.children[0];
            if (
                code?.type === "element" &&
                isMermaid(code.properties.className)
            )
                return <>{children}</>;
            return <pre {...props}>{children}</pre>;
        },
        code({ className, children, ...props }) {
            if (isMermaid(className))
                return <Mermaid chart={String(children).trim()} />;
            return (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
        a({ href = "", title, children }) {
            if (/^https?:\/\//.test(href))
                return (
                    <a
                        href={href}
                        title={title}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                    </a>
                );
            const local = /^(?:\.\/)?([^/#?]+)\.(?:md|html)(#.*)?$/i.exec(href);
            if (local) {
                const slug = local[1]
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
                return (
                    <Link
                        href={`/${topic}/${slug}${local[2] ?? ""}`}
                        title={title}
                    >
                        {children}
                    </Link>
                );
            }
            return (
                <a href={href} title={title}>
                    {children}
                </a>
            );
        },
        table: ({ children }) => (
            <div className="overflow-x-auto">
                <table>{children}</table>
            </div>
        ),
    };

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
                rehypeSlug,
                [rehypeHighlight, { plainText: ["mermaid"], detect: false }],
            ]}
            components={components}
        >
            {children}
        </ReactMarkdown>
    );
}
