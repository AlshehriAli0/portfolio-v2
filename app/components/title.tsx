import * as stylex from "@stylexjs/stylex";
import type { StyleXStylesWithout } from "@stylexjs/stylex";
import { colors } from "@/app/tokens.stylex";

const variants = stylex.create({
  primary: { fontSize: "2.25rem", lineHeight: "2.5rem", fontVariationSettings: '"wght" 600', letterSpacing: "-0.025em" },
  secondary: { fontSize: "1.5rem", lineHeight: "2rem", fontVariationSettings: '"wght" 600', letterSpacing: "-0.025em" },
  tertiary: { fontSize: "1.25rem", lineHeight: "1.75rem", fontVariationSettings: '"wght" 600', letterSpacing: "-0.025em" },
});

const styles = stylex.create({
  base: { color: colors.title },
});

interface Props {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "time" | "p";
  variant?: keyof typeof variants;
  style?: StyleXStylesWithout<{
    color: string;
    fontSize: string;
    lineHeight: string;
    fontVariationSettings: string;
    letterSpacing: string;
  }>;
}

export function Title({ children, as = "span", variant = "primary", style }: Props) {
  const Component = as;
  return <Component {...stylex.props(styles.base, variants[variant], style)}>{children}</Component>;
}
