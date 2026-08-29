import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import type { FC } from "react";
import { Title } from "@/app/components/title";
import { colors } from "@/app/tokens.stylex";

interface Props {
  title: string;
  date: string;
  summary: string;
  href: string;
}

export const ArticleLink: FC<Props> = ({ title, date, summary, href }) => {
  return (
    <Link href={href} {...stylex.props(styles.link)} prefetch={true}>
      <div {...stylex.props(styles.column)}>
        <Title as="h2" variant="secondary">
          {title}
        </Title>
        <span {...stylex.props(styles.date)}>
          Published on{" "}
          <time dateTime={date}>
            {new Intl.DateTimeFormat("en-GB", {
              dateStyle: "medium",
            }).format(new Date(date))}
          </time>
        </span>

        <p {...stylex.props(styles.summary)}>{summary}</p>
      </div>
    </Link>
  );
};

const styles = stylex.create({
  link: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    paddingTop: { default: "2rem", ":first-child": "0px" },
    paddingBottom: "2rem",
    textDecorationLine: "none",
    // ponytail: divide-y has no gap equivalent — the divider rides on the child instead
    borderTopWidth: { default: "1px", ":first-child": "0px" },
    borderTopStyle: "solid",
    borderTopColor: colors.divider,
  },
  column: {
    display: "flex",
    flexDirection: "column",
  },
  date: {
    marginTop: "0.5rem",
    display: "block",
    fontFamily: "var(--font-monospace)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    letterSpacing: "-0.025em",
    color: colors.muted,
  },
  summary: {
    marginTop: "0.5rem",
    fontSize: "1rem",
    lineHeight: "1.5rem",
    color: colors.body,
  },
});
