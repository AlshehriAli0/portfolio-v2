"use client";

import * as stylex from "@stylexjs/stylex";
import type { DetailedHTMLProps, HTMLAttributes } from "react";
import { useRef, useState } from "react";

interface CodeBlockProps extends DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement> {
  children?: React.ReactNode;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const codeElement = preRef.current?.querySelector("code");
    if (codeElement) {
      const textContent = codeElement.textContent || "";

      try {
        setIsAnimating(true);
        await navigator.clipboard.writeText(textContent);

        // Small delay for the animation effect
        setTimeout(() => {
          setCopied(true);
          setIsAnimating(false);
          // Reset after 2 seconds
          setTimeout(() => setCopied(false), 2000);
        }, 150);
      } catch (err) {
        console.error("Failed to copy text: ", err);
        setIsAnimating(false);
      }
    }
  };

  return (
    <div {...stylex.props(stylex.defaultMarker(), styles.wrapper)}>
      <pre ref={preRef} className={className} {...props}>
        {children}
      </pre>
      <button
        onClick={handleCopy}
        {...stylex.props(styles.copyButton)}
        aria-label="Copy code to clipboard"
        type="button"
      >
        <div {...stylex.props(styles.iconBox)}>
          {/* Copy Icon */}
          <svg
            aria-hidden="true"
            {...stylex.props(styles.icon, styles.iconCopy, copied || isAnimating ? styles.iconOut : styles.iconIn)}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>

          {/* Success Icon */}
          <svg
            aria-hidden="true"
            {...stylex.props(styles.icon, styles.iconSuccess, copied ? styles.iconIn : styles.iconOut)}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </button>
    </div>
  );
}


const styles = stylex.create({
  wrapper: {
    position: "relative",
  },
  copyButton: {
    position: "absolute",
    right: "0.5rem",
    top: "0.5rem",
    zIndex: 10,
    borderRadius: "0.375rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgb(71 85 105 / 0.3)",
    backgroundColor: { default: "rgb(30 41 59 / 0.8)", ":hover": "rgb(51 65 85 / 0.8)" },
    padding: "0.5rem",
    color: { default: "rgb(203 213 225 / 1)", ":hover": "rgb(255 255 255 / 1)" },
    opacity: { default: 0, [stylex.when.ancestor(":hover")]: 1 },
    transitionProperty: "all",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "200ms",
  },
  iconBox: {
    position: "relative",
    height: "1rem",
    width: "1rem",
  },
  icon: {
    position: "absolute",
    inset: "0px",
    height: "1rem",
    width: "1rem",
    transitionProperty: "all",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
  },
  iconCopy: { color: "rgb(203 213 225 / 1)" },
  iconSuccess: { color: "rgb(74 222 128 / 1)" },
  iconIn: {
    transform: "translate(0, 0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1)",
    opacity: 1,
    filter: "blur(0)",
  },
  iconOut: {
    transform: "translate(0, 0) rotate(0) skewX(0) skewY(0) scaleX(.5) scaleY(.5)",
    opacity: 0,
    filter: "blur(4px)",
  },
});
