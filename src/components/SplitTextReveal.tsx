import { ReactNode } from "react";

/**
 * Splits a sentence into word spans with staggered fade-up reveal.
 * Use sparingly (hero titles).
 */
export function SplitTextReveal({
  text,
  className = "",
  as: Tag = "span",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2";
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            animation: `reveal-up 800ms cubic-bezier(0.16,1,0.3,1) both`,
            animationDelay: `${delay + i * 80}ms`,
          }}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}

export function SplitTextRevealJSX({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode[];
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className}>
      {children.map((child, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            animation: `reveal-up 800ms cubic-bezier(0.16,1,0.3,1) both`,
            animationDelay: `${delay + i * 80}ms`,
          }}
        >
          {child}
        </span>
      ))}
    </span>
  );
}
