import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { Title } from "@/app/components/title";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://ali-sh.com/info",
  },
  title: "Information",
  description:
    "Information about Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia. Experience, background, and contact details.",
  openGraph: {
    url: "https://ali-sh.com/info",
    title: "Information",
    description: "Information about Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia.",
  },
};

const experience: {
  company: string;
  role: string;
  start: Date;
  end: Date | null;
  logo: string;
}[] = [
  {
    company: "Netzero",
    role: "Software Engineer",
    start: new Date("2024-10-01"),
    end: null,
    logo: "/netzero.png",
  },
  {
    company: "Netzero",
    role: "Software Engineering Intern",
    start: new Date("2024-07-01"),
    end: new Date("2024-10-01"),
    logo: "/netzero.png",
  },
  {
    company: "Wavez",
    role: "Full-Stack Developer",
    start: new Date("2024-05-01"),
    end: null,
    logo: "/wavez.png",
  },
];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function calcDuration(start: Date, end: Date | null) {
  const to = end ?? new Date();
  const months = (to.getFullYear() - start.getFullYear()) * 12 + (to.getMonth() - start.getMonth()) + 1;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} mo`;
  if (remainingMonths === 0) return `${years} yr`;
  return `${years} yr ${remainingMonths} mo`;
}

export const dynamic = "force-static";

export default async function InfoPage() {
  return (
    <main className="px-6 md:px-0">
      <PageHeader title="Information" />
      <section className="pb-8 prose prose-lg dark:prose-invert">
        <p>Hey, I&apos;m Ali, a software engineer.</p>
        <p>
          I&apos;ve worked across a lot of different projects over the years, web, mobile, and backend, building and
          scaling them through real challenges. That experience has shaped a lot of how I think about software.
        </p>
        <p>
          These days I&apos;m mostly in the mobile world. I enjoy building native-feeling experiences on React Native
          and I&apos;ve been spending a good amount of time creating my own packages and contributing to libraries I use
          daily, including some major ones like react-native-screens.
        </p>
        <p>
          I&apos;m genuinely excited about AI and where it&apos;s going. But I care just as much about the craft.
          Leveraging the best tools available is great, but quality and maintainability are things I won&apos;t trade
          away.
        </p>

        <p>
          If you&apos;re interested in working together, feel free to reach out to me here:{" "}
          <Link href="mailto:ali0alshehri@outlook.com">Ali0Alshehri@outlook.com</Link>.
        </p>
      </section>

      <section>
        <Title as="h2" variant="secondary" className="mb-4 mt-8 ">
          Experience
        </Title>

        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {experience.map(exp => {
            return (
              <div className="flex gap-4 py-6" key={`${exp.company}-${exp.role}`}>
                <Image
                  width={56}
                  height={56}
                  src={exp.logo}
                  alt={`${exp.company} logo`}
                  className="w-14 h-14 rounded-xl"
                />
                <div className="flex flex-col col-span-9">
                  <span className="text-slate-800 dark:text-slate-200 text-xl font-semibold">{exp.company}</span>
                  <span className="text-slate-700 dark:text-slate-300 text-lg">{exp.role}</span>
                  <span className="block mt-4 text-slate-500 dark:text-slate-400 col-span-2 text-sm font-medium tracking-tighter font-mono">
                    {formatDate(exp.start)} → {exp.end ? formatDate(exp.end) : "Present"}
                    <span className="ml-2 text-slate-400 dark:text-slate-500">
                      · {calcDuration(exp.start, exp.end)}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
