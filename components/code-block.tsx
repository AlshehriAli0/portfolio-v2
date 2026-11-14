import * as stylex from "@stylexjs/stylex";
import { Children, type ComponentPropsWithoutRef } from "react";
import { colors, fonts } from "@/styles/tokens.stylex";

type CodeBlockProps = ComponentPropsWithoutRef<"pre"> & {
  "data-language"?: string;
  /** Lines shown while folded; set by rehypeCollapse in lib/render-mdx.tsx. */
  "data-collapse"?: string;
  /** The block's full line count, for the summary. */
  "data-lines"?: string;
};

/**
 * MDX `pre` override, rendered to static HTML at build time: a language label over the
 * code. Token colors, line styles and the fold live in prose.module.css.
 *
 * A folded block (rehypeCollapse in lib/render-mdx.tsx) arrives as two code elements: the
 * first lines, always shown, and the rest inside a native <details>. It opens without
 * JavaScript, from the keyboard, and from find-in-page or a text-fragment link, because the
 * browser itself hides the closed part.
 */
export function CodeBlock({
  children,
  className,
  style,
  "data-collapse": collapse,
  "data-lines": lines,
  ...props
}: CodeBlockProps) {
  const language = props["data-language"];
  const sx = stylex.props(styles.pre);
  const preClass = className ? `${className} ${sx.className}` : sx.className;
  const [head, rest] = collapse ? Children.toArray(children) : [children];

  return (
    <div data-code-block="" {...stylex.props(styles.frame)}>
      <div {...stylex.props(styles.bar)}>
        <span {...stylex.props(styles.language)}>{!language || language === "plaintext" ? "text" : language}</span>
      </div>
      <pre {...props} data-fold={collapse ? "head" : undefined} className={preClass} style={style}>
        {head}
      </pre>
      {collapse ? (
        <details data-fold="">
          <summary>
            <span data-fold-label="closed">{`Show all ${lines} lines`}</span>
            <span data-fold-label="open">Show fewer lines</span>
            <span aria-hidden="true" data-fold-chevron="" />
          </summary>
          <pre {...props} data-fold="tail" className={preClass} style={style}>
            {rest}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

const styles = stylex.create({
  frame: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.raised,
    overflow: "hidden",
  },
  bar: {
    display: "flex",
    alignItems: "center",
    height: "2.5rem",
    paddingInline: "1rem",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
  },
  language: {
    fontFamily: fonts.mono,
    fontSize: "0.6875rem",
    lineHeight: 1,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: colors.dim,
  },
  pre: {
    margin: 0,
    // A folded block's two halves meet with no gap, so the code reads as one when open.
    paddingTop: { default: "1rem", ':is([data-fold="tail"])': 0 },
    paddingBottom: { default: "1rem", ':is([data-fold="head"])': 0 },
    overflowX: "auto",
    overscrollBehaviorX: "contain",
    fontFamily: fonts.mono,
    // 13px everywhere: the longest Unistyles lines (78 characters) fit the post
    // column from 1024px up, so code only scrolls on phones.
    fontSize: "0.8125rem",
    lineHeight: 1.7,
    tabSize: 2,
    color: colors.fg,
    outlineOffset: "-2px",
  },
});
