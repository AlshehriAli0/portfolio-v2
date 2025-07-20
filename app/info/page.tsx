import { PageHeader } from "@/app/components/page-header";
import { Title } from "@/app/components/title";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://ali-sh.com/info",
  },
};

const experience: {
  company: string;
  role: string;
  date: string;
  logo: string;
}[] = [
  {
    company: "Netzero",
    role: "Software Engineer",
    date: "October 2024 → Present",
    logo: "/netzero.png",
  },
  {
    company: "Netzero",
    role: "Software Engineering Intern",
    date: "July 2024 → October 2024",
    logo: "/netzero.png",
  },
  {
    company: "Wavez",
    role: "Full-Stack Developer",
    date: "May 2024 → Present",
    logo: "/wavez.png",
  },
];

export const dynamic = "force-static";

export default async function InfoPage() {
  return (
    <main className="px-4 md:px-0">
      <PageHeader title="Information" />
      <section className="pb-8 prose prose-lg">
        <p>
          Hi there, I&apos;m Ali Alshehri. I enjoy building tech products, along
          side working with some amazing companies to help them build theirs.
        </p>
        <p>
          Most recently i started working with Netzero to help make the world a
          greener place using tech. Before that, I built numerous personal
          projects and freelance solutions. .
        </p>
        <p>
          Currently, I&apos;m working as a software engineer with Netzero to
          help build the future of a greener world. Originally joining as a
          intern, I&apos;m also a part of wavez as freelance developer whose
          ready to turn ideas into reality instantly. As well as pursing an
          Artificial Intelligence bachelors degree at Imam Abdulrahman Bin
          Faisal University.
        </p>

        <p>
          I&apos;ve always bounced somewhere between Front-end and Back-end,
          however the common thread has always been my love for building things
          that people love to use.
        </p>

        <p>
          If you&apos;re interested in working together, feel free to reach out
          to me here:{" "}
          <Link href="mailto:ali0alshehri@outlook.com">
            ali0alshehri@outlook.com
          </Link>
          .
        </p>
      </section>

      <section>
        <Title as="h2" variant="secondary" className="mb-4 mt-8 ">
          Experience
        </Title>

        <div className="divide-y divide-slate-200">
          {experience.map((exp) => {
            return (
              <div className="flex gap-4 py-6" key={exp.date}>
                <Image
                  width={56}
                  height={56}
                  src={exp.logo}
                  alt={`${exp.company} logo`}
                  className="w-14 h-14 rounded-xl"
                />
                <div className="flex flex-col col-span-9">
                  <span className="text-slate-800 text-xl font-semibold">
                    {exp.company}
                  </span>
                  <span className="text-slate-700 text-lg">{exp.role}</span>
                  <span className="block mt-4 text-slate-500 col-span-2 text-sm font-medium tracking-tighter font-mono">
                    {exp.date}
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
