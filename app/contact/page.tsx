import { PageHeader } from "@/app/components/page-header";
import { Title } from "@/app/components/title";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://ali-sh.com/contact",
  },
  title: "Contact | Ali Alshehri",
  description:
    "Contact Ali Alshehri — Software Engineer. Email and social profiles (GitHub, LinkedIn, X).",
  openGraph: {
    url: "https://ali-sh.com/contact",
    title: "Contact | Ali Alshehri",
    description:
      "Contact Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia.",
  },
};

const contact: {
  method: string;
  link: string;
  label: string;
}[] = [
  {
    method: "Email",
    link: "mailto:ali0alshehri@outlook.com",
    label: "ali0alshehri@outlook.com",
  },
  {
    method: "X",
    link: "https://x.com/alicantcode",
    label: "@alicantcode",
  },
  {
    method: "GitHub",
    link: "https://github.com/AlshehriAli0",
    label: "git/AlshehriAli0",
  },
  {
    method: "LinkedIn",
    link: "https://www.linkedin.com/in/ali-alshehri-340b26284",
    label: "in/ali-alshehri",
  },
];

export const dynamic = "force-static";

export default async function InfoPage() {
  return (
    <main className="px-4 md:px-0">
      <PageHeader title="Contact" />
      <section className="pb-8">
        <p className="text-lg mb-6">
          If you&apos;d like to get in touch, you can reach me using the
          following methods.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contact.map((contactMethod) => {
            return (
              <div className="flex flex-col" key={contactMethod.method}>
                <Title as="h2" variant="tertiary">
                  {contactMethod.method}
                </Title>
                <Link href={contactMethod.link} className="text-slate-700">
                  {contactMethod.label}
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
