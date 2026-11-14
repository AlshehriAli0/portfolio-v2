import * as stylex from "@stylexjs/stylex";
import type { GetStaticProps, PageConfig } from "next";
import { Experience } from "@/components/experience";
import { Page } from "@/components/page";
import { Container, KeepTogether, PageTitle, Section } from "@/components/ui";
import { copy, experience, openSource, site, socials } from "@/lib/site";
import { profilePage } from "@/lib/structured-data";

const DESCRIPTION =
  "About Ali Alshehri, a software engineer who builds web and mobile products end to end, and where he’s worked.";
/** The page changes when the experience does: the latest start or end date. */
const MODIFIED =
  experience
    .flatMap(r => [r.start, r.end ?? r.start])
    .sort()
    .at(-1) ?? "";

import { colors } from "@/styles/tokens.stylex";

// Static HTML only: no React runtime is sent to the browser.
export const config: PageConfig = { unstable_runtimeJS: false };

// Regenerated daily (ISR) so the experience durations keep advancing without a rebuild.
export const getStaticProps: GetStaticProps = async () => ({ props: {}, revalidate: 86400 });

const [screens, healthkit] = openSource;
const github = socials.find(s => s.label === "GitHub") ?? socials[0];

export default function InfoPage() {
  return (
    <Page
      path="/info"
      title="Info"
      description={DESCRIPTION}
      jsonLd={[profilePage("/info", `Info — ${site.name}`, DESCRIPTION, MODIFIED)]}
    >
      <main id="main" tabIndex={-1}>
        <Container>
          {/* The bio is short, so it fills the field beside the title, like Contact and Writing;
              a separate About band under it only added a rule and two gaps. */}
          <PageTitle
            title="Info"
            em={1.374}
            lsb={0.077}
            lede={copy.infoLede}
            side={
              <div {...stylex.props(styles.bio)}>
                <p {...stylex.props(styles.p)}>
                  {/* KeepTogether takes one phrase, so each package name gets its own half. */}
                  <KeepTogether
                    text={`Outside of work, I contribute to open-source libraries like ${screens.name} (${screens.downloads}), `}
                    phrase={screens.name}
                  />
                  <KeepTogether
                    text={`${healthkit.name} (${healthkit.downloads}) and many others, and maintain a few packages of my own. `}
                    phrase={healthkit.name}
                  />
                  It’s all on{" "}
                  <a href={github.href} target="_blank" rel="noreferrer" {...stylex.props(styles.inline)}>
                    GitHub
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                  .
                </p>
                <p {...stylex.props(styles.p)}>
                  If you’d like to work together, reach me at{" "}
                  <a href={`mailto:${site.email}`} {...stylex.props(styles.inline)}>
                    {site.email}
                  </a>
                  .
                </p>
              </div>
            }
          />

          <Section id="work" label="Experience" tight>
            <Experience />
          </Section>
        </Container>
      </main>
    </Page>
  );
}

const styles = stylex.create({
  bio: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  p: {
    fontSize: "1.0625rem",
    lineHeight: 1.55,
    textWrap: "pretty",
    color: colors.dim,
  },
  inline: {
    color: colors.fg,
    textDecorationLine: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "0.2em",
    textDecorationColor: { default: colors.lineStrong, ":hover": colors.fg, ":focus-visible": colors.fg },
    transitionProperty: "text-decoration-color",
    transitionDuration: "200ms",
  },
});
