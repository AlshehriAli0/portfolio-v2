import * as stylex from "@stylexjs/stylex";
import { getImageProps } from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { getPublicImageSize } from "@/lib/image-size";
import { colors, fonts } from "@/styles/tokens.stylex";

/** Rendered width of the article column (prose max-width), in CSS px. */
export const ARTICLE_COLUMN_PX = 672;

/** `../file.png` and `./file.png` (relative to /posts) are files in /public. */
function toPublicPath(src: string) {
  return `/${src.replace(/^(\.{1,2}\/)+/, "").replace(/^\/+/, "")}`;
}

type PostImageProps = ComponentPropsWithoutRef<"img"> & {
  /** Set by render-mdx on an image at the very top of a post: it's likely the LCP. */
  "data-lead"?: string;
};

/**
 * MDX `img` override. Server-only: intrinsic size is read from the file at build
 * time and the optimized srcset comes from `getImageProps`, so no client JS and no CLS.
 * Renders spans because Markdown images sit inside a <p>.
 */
export function PostImage({ src, alt = "", "data-lead": lead }: PostImageProps) {
  if (typeof src !== "string" || !src) return null;

  const isRemote = /^(https?:)?\/\//.test(src);
  const publicSrc = isRemote ? src : toPublicPath(src);
  const size = isRemote ? null : getPublicImageSize(publicSrc);

  // Images much narrower than the column would be stretched soft, so they sit on a
  // plate at their own size instead.
  const plate = size !== null && size.width < ARTICLE_COLUMN_PX * 0.75;
  const width = size ? Math.min(size.width, ARTICLE_COLUMN_PX) : undefined;
  // Known size: optimized srcset + width/height (no CLS). Unknown (remote/missing): plain lazy <img>.
  // A lead image loads eagerly at high priority; every other one waits until it's near.
  // On 3x phones `sizes` reports two thirds of the width, so they fetch ~2x: the
  // extra density isn't visible at this size and costs about twice the bytes.
  const imgProps = size
    ? getImageProps({
        src: publicSrc,
        alt,
        width: size.width,
        height: size.height,
        sizes: plate
          ? `${width}px`
          : `(min-width: 48rem) ${width}px, (min-resolution: 2.5dppx) calc((100vw - 2rem) * 0.67), calc(100vw - 2rem)`,
        ...(lead === undefined ? { loading: "lazy" as const } : { fetchPriority: "high" as const }),
      }).props
    : { src: publicSrc, loading: "lazy" as const, decoding: "async" as const };

  return (
    <span
      data-post-figure=""
      {...stylex.props(styles.figure)}
      style={width && !plate ? { maxWidth: width } : undefined}
    >
      <span {...stylex.props(styles.frame, plate && styles.plate)}>
        {/* biome-ignore lint/performance/noImgElement: getImageProps output needs no client component */}
        <img
          {...imgProps}
          alt={alt}
          className={stylex.props(styles.img, plate && styles.plateImg).className}
          style={plate ? { maxWidth: width } : undefined}
        />
      </span>
      {alt ? (
        <span aria-hidden="true" {...stylex.props(styles.caption)}>
          {alt}
        </span>
      ) : null}
    </span>
  );
}

const styles = stylex.create({
  frame: {
    display: "block",
  },
  figure: {
    display: "block",
    counterIncrement: "post-figure",
  },
  img: {
    display: "block",
    width: "100%",
    height: "auto",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.raised,
  },
  plate: {
    display: "flex",
    justifyContent: "center",
    paddingBlock: "clamp(1.5rem, 6vw, 3.5rem)",
    paddingInline: "clamp(1rem, 4vw, 2rem)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.raised,
  },
  plateImg: {
    borderColor: colors.lineStrong,
  },
  // A caption is a sentence, so it's set in the text face; only the figure number is data.
  caption: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.75rem",
    marginTop: "0.875rem",
    fontSize: "0.8125rem",
    lineHeight: 1.45,
    letterSpacing: 0,
    color: colors.dim,
    "::before": {
      content: '"Fig. " counter(post-figure, decimal-leading-zero)',
      flexShrink: 0,
      fontFamily: fonts.mono,
      fontSize: "0.6875rem",
      letterSpacing: "0.01em",
      color: colors.dim,
      fontVariantNumeric: "tabular-nums",
    },
  },
});
