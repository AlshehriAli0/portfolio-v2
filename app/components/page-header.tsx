import * as stylex from "@stylexjs/stylex";
import { colors } from "@/app/tokens.stylex";

interface Props {
  title: string;
}

export function PageHeader({ title }: Props) {
  return (
    <header>
      <h1 {...stylex.props(styles.heading)}>{title}</h1>
    </header>
  );
}

const styles = stylex.create({
  heading: {
    marginBottom: "1.5rem",
    paddingBottom: "1.5rem",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    fontSize: "2.25rem",
    lineHeight: "2.5rem",
    fontVariationSettings: '"wght" 600',
    letterSpacing: "-0.025em",
    color: colors.title,
  },
});
