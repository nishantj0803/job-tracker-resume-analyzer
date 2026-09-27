"use client";

/*
 * Landing visual system (locked for this page):
 * paper #F3F3EF, sheet #FCFCFA, ink #191921, one accent #D43D2A.
 * Radii: sheets 14px, stamps and chips 6px, buttons pill.
 * Display: Bricolage Grotesque. Body: Inter. Figures: tabular-nums.
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, animate, useInView, useReducedMotion } from "motion/react";
import {
  Briefcase,
  ClipboardText,
  FolderOpen,
  ChartBar,
} from "@phosphor-icons/react";
import { useAuth } from "@/components/auth-provider";
import { PipelineBoard } from "@/components/landing/pipeline-board";
import { MatchSlip } from "@/components/landing/match-slip";

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reduce) {
      ref.current.textContent = `${to}${suffix}`;
      return;
    }
    const controls = animate(0, to, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix, reduce]);
  return (
    <span ref={ref} className="tnum">
      0{suffix}
    </span>
  );
}

function SiteNav() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E2D9] bg-[#F3F3EF]/90 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#191921] text-[#F3F3EF]">
            <Briefcase className="h-4 w-4" weight="bold" />
          </span>
          <span className="font-display text-[17px] font-semibold text-[#191921]">
            JobTrackr
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-[15px] text-[#5C5C66] md:flex">
          <a href="#pipeline" className="transition-colors hover:text-[#191921]">
            Pipeline
          </a>
          <a href="#match" className="transition-colors hover:text-[#191921]">
            Match report
          </a>
          <a href="#analytics" className="transition-colors hover:text-[#191921]">
            Analytics
          </a>
          <a href="#how" className="transition-colors hover:text-[#191921]">
            How it works
          </a>
        </div>
        <div className="flex items-center gap-5">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-[#191921] px-5 py-2.5 text-sm font-medium text-[#F3F3EF] transition-transform duration-200 hover:-translate-y-[1px] active:translate-y-0"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-[15px] text-[#5C5C66] underline-offset-4 transition-colors hover:text-[#191921] hover:underline sm:block"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#191921] px-5 py-2.5 text-sm font-medium text-[#F3F3EF] transition-transform duration-200 hover:-translate-y-[1px] active:translate-y-0"
              >
                Start tracking
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function Ticket({
  role,
  stamp,
  stampInk = false,
  rows,
  foot,
  className = "",
}: {
  role: string;
  stamp: string;
  stampInk?: boolean;
  rows: [string, string][];
  foot?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[14px] border border-[#E2E2D9] bg-[#FCFCFA] p-5 shadow-[0_24px_60px_-32px_rgba(60,55,45,0.35)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-lg font-semibold leading-snug text-[#191921]">
          {role}
        </p>
        <span
          className={`inline-block shrink-0 -rotate-3 rounded-md border-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] ${
            stampInk
              ? "border-[#191921] text-[#191921]"
              : "border-[#D43D2A] text-[#D43D2A]"
          }`}
        >
          {stamp}
        </span>
      </div>
      <dl className="mt-4 divide-y divide-[#EDEDE4] border-t border-[#E2E2D9] text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 py-2">
            <dt className="text-[#5C5C66]">{k}</dt>
            <dd className="tnum text-right font-medium text-[#191921]">{v}</dd>
          </div>
        ))}
      </dl>
      {foot && (
        <p className="mt-3 border-t border-dashed border-[#D8D8CE] pt-3 text-sm text-[#5C5C66]">
          {foot}
        </p>
      )}
    </div>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HomePage() {
  const reduce = useReducedMotion();

  return (
    <div className="-m-4 bg-[#F3F3EF] text-[#191921] antialiased md:-m-8">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-[#191921] focus:px-5 focus:py-2.5 focus:text-sm focus:text-[#F3F3EF]"
      >
        Skip to content
      </a>
      <div aria-hidden className="grain-overlay" />
      <SiteNav />

      <main id="main">
        {/* Hero: asymmetric split. Copy left, dossier right. */}
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-14 md:pb-28 md:pt-20">
          <motion.div
            variants={container}
            initial={reduce ? false : "hidden"}
            animate="show"
            className="grid items-center gap-12 lg:grid-cols-12"
          >
            <div className="lg:col-span-6">
              <motion.h1
                variants={rise}
                className="font-display max-w-[12ch] text-balance text-5xl font-semibold leading-[1.02] md:text-6xl"
              >
                Every application in writing.
              </motion.h1>
              <motion.p
                variants={rise}
                className="mt-5 max-w-[42ch] text-pretty text-lg leading-relaxed text-[#5C5C66]"
              >
                JobTrackr files each application from applied to offer, grades
                your resume, and names the missing keywords.
              </motion.p>
              <motion.div variants={rise} className="mt-8 flex items-center gap-6">
                <Link
                  href="/register"
                  className="rounded-full bg-[#191921] px-7 py-3.5 text-[15px] font-medium text-[#F3F3EF] transition-transform duration-200 hover:-translate-y-[1px] active:translate-y-0"
                >
                  Start tracking
                </Link>
                <Link
                  href="/login"
                  className="text-[15px] text-[#5C5C66] underline-offset-4 transition-colors hover:text-[#191921] hover:underline"
                >
                  Log in
                </Link>
              </motion.div>
            </div>

            <motion.div
              variants={rise}
              className="relative lg:col-span-6"
              aria-label="Sample application file with two tracked roles"
            >
              <div className="relative mx-auto max-w-md lg:ml-auto">
                <Ticket
                  role="Backend engineer"
                  stamp="Applied"
                  rows={[
                    ["Sent", "Mar 2"],
                    ["Source", "Referral"],
                  ]}
                  className="absolute inset-x-8 top-10 rotate-[5deg] opacity-90"
                />
                <Ticket
                  role="Senior frontend engineer"
                  stamp="Interview"
                  stampInk
                  rows={[
                    ["Applied", "Mar 4"],
                    ["Screening", "Mar 11"],
                    ["Interview", "Mar 19"],
                  ]}
                  foot="Next: system design round, prep notes attached."
                  className="relative -rotate-[2deg]"
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Pipeline: ledger strip with selectable stages. */}
        <section id="pipeline" className="scroll-mt-24 border-t border-[#E2E2D9]">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <h2 className="font-display max-w-[20ch] text-balance text-3xl font-semibold leading-tight md:text-[2.75rem] md:leading-[1.1]">
              Four stages. Zero guesswork.
            </h2>
            <p className="mt-3 max-w-[52ch] text-[17px] leading-relaxed text-[#5C5C66]">
              Every application lives in exactly one stage. Select a stage to
              see what gets recorded there.
            </p>
            <div className="mt-8">
              <PipelineBoard />
            </div>
          </div>
        </section>

        {/* Match report: photo plus a real slip preview. */}
        <section
          id="match"
          className="scroll-mt-24 border-t border-[#E2E2D9] bg-[#EFEFE8]"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:py-24 lg:grid-cols-2">
            <div>
              <Image
                src="https://picsum.photos/seed/jobtrackr-paper/1200/900"
                alt="Hands writing in a notebook beside coffee and a tablet"
                width={1200}
                height={900}
                loading="lazy"
                className="w-full rounded-[14px] border border-[#E2E2D9] object-cover grayscale"
              />
              <p className="mt-3 text-sm text-[#5C5C66]">
                An afternoon of tailoring resumes.
              </p>
            </div>
            <div>
              <h2 className="font-display text-balance text-3xl font-semibold leading-tight md:text-[2.75rem] md:leading-[1.1]">
                A score that shows its working.
              </h2>
              <p className="mt-3 max-w-[48ch] text-[17px] leading-relaxed text-[#5C5C66]">
                No black box. Each match lists what counted, what is missing,
                and how much of the role your experience covers.
              </p>
              <div className="mt-7">
                <MatchSlip />
              </div>
              <Link
                href="/resume"
                className="mt-6 inline-block rounded-full border border-[#191921] px-6 py-3 text-[15px] font-medium transition-transform duration-200 hover:-translate-y-[1px] active:translate-y-0"
              >
                See a match report
              </Link>
            </div>
          </div>
        </section>

        {/* Analytics: hairline-divided figures, no cards. */}
        <section
          id="analytics"
          className="scroll-mt-24 border-t border-[#E2E2D9]"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <h2 className="font-display max-w-[20ch] text-balance text-3xl font-semibold leading-tight md:text-[2.75rem] md:leading-[1.1]">
              See where the search stalls.
            </h2>
            <div className="mt-10 grid grid-cols-1 divide-y divide-[#E2E2D9] border-y border-[#E2E2D9] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                { to: 38, label: "of applications reach screening" },
                { to: 17, label: "of applications reach interview" },
                { to: 4, label: "of applications reach offer" },
              ].map((stat) => (
                <div key={stat.label} className="px-2 py-8 sm:px-8">
                  <p className="font-display text-5xl font-semibold md:text-6xl">
                    <CountUp to={stat.to} suffix="%" />
                  </p>
                  <p className="mt-2 text-[15px] text-[#5C5C66]">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="tnum mt-4 text-sm text-[#5C5C66]">
              Sample pipeline of 24 applications. Yours updates as you log.
            </p>
          </div>
        </section>

        {/* How it works: sticky head, verb-led rows. */}
        <section id="how" className="scroll-mt-24 border-t border-[#E2E2D9] bg-[#EFEFE8]">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:py-24 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <h2 className="font-display text-balance text-3xl font-semibold leading-tight md:text-[2.75rem] md:leading-[1.1]">
                  Ten minutes a week.
                </h2>
                <p className="mt-3 max-w-[40ch] text-[17px] leading-relaxed text-[#5C5C66]">
                  Three habits keep the whole search legible, from first
                  application to signed offer.
                </p>
                <Image
                  src="https://picsum.photos/seed/carbide/800/600"
                  alt="Desk covered with notebooks, letterpress blocks and a camera"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="mt-8 hidden w-full rounded-[14px] border border-[#E2E2D9] object-cover grayscale lg:block"
                />
                <p className="mt-3 hidden text-sm text-[#5C5C66] lg:block">
                  The tools of the search.
                </p>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="divide-y divide-[#D8D8CE] border-y border-[#D8D8CE]">
                {[
                  {
                    verb: "Log",
                    icon: FolderOpen,
                    body: "File each application in seconds. Company, role, stage, deadline. The record your future self thanks you for.",
                    link: "/jobs",
                    linkLabel: "Open jobs",
                  },
                  {
                    verb: "Grade",
                    icon: ClipboardText,
                    body: "Upload the resume once. Get section notes and an ATS read before you tailor a single line.",
                    link: "/resume",
                    linkLabel: "Grade a resume",
                  },
                  {
                    verb: "Tailor",
                    icon: ChartBar,
                    body: "Paste the description. See matched and missing skills with the evidence, then send the version that fits.",
                    link: "/resume",
                    linkLabel: "Match a job",
                  },
                ].map((step) => (
                  <div key={step.verb} className="grid gap-2 py-8 sm:grid-cols-12 sm:gap-6">
                    <p className="font-display text-3xl font-semibold sm:col-span-4">
                      {step.verb}
                    </p>
                    <div className="sm:col-span-8">
                      <p className="flex items-start gap-2.5 text-[16px] leading-relaxed text-[#3A3A44]">
                        <step.icon
                          className="mt-1 h-5 w-5 shrink-0 text-[#D43D2A]"
                          weight="bold"
                        />
                        {step.body}
                      </p>
                      <Link
                        href={step.link}
                        className="mt-3 inline-block text-[15px] font-medium text-[#191921] underline decoration-[#D43D2A] decoration-2 underline-offset-4"
                      >
                        {step.linkLabel}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Closing panel: ink sheet, one stamp, one action. */}
        <section className="border-t border-[#E2E2D9]">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <div className="relative overflow-hidden rounded-[14px] bg-[#191921] px-6 py-14 text-center md:py-20">
              <span
                aria-hidden
                className="pointer-events-none absolute right-6 top-6 rotate-6 rounded-md border-[3px] border-[#D43D2A] px-3 py-1 text-sm font-bold uppercase tracking-[0.2em] text-[#D43D2A] md:right-12 md:top-10 md:text-base"
              >
                Offer
              </span>
              <h2 className="font-display mx-auto max-w-[22ch] text-balance text-3xl font-semibold leading-tight text-[#F3F3EF] md:text-5xl">
                Stop losing track of the hunt.
              </h2>
              <p className="mx-auto mt-4 max-w-[44ch] text-[17px] leading-relaxed text-[#B9B9C2]">
                Log tonight&apos;s applications. Wake up knowing exactly where
                each one stands.
              </p>
              <div className="mt-8 flex items-center justify-center gap-6">
                <Link
                  href="/register"
                  className="rounded-full bg-[#F3F3EF] px-7 py-3.5 text-[15px] font-medium text-[#191921] transition-transform duration-200 hover:-translate-y-[1px] active:translate-y-0"
                >
                  Start tracking
                </Link>
                <Link
                  href="/login"
                  className="text-[15px] text-[#B9B9C2] underline-offset-4 transition-colors hover:text-[#F3F3EF] hover:underline"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E2E2D9]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#191921] text-[#F3F3EF]">
              <Briefcase className="h-3.5 w-3.5" weight="bold" />
            </span>
            <span className="font-display text-[15px] font-semibold">
              JobTrackr
            </span>
            <span className="tnum text-xs text-[#5C5C66]">© 2026</span>
          </div>
          <nav aria-label="Footer" className="flex items-center gap-6 text-[15px] text-[#5C5C66]">
            <Link href="/jobs" className="transition-colors hover:text-[#191921]">
              Jobs
            </Link>
            <Link href="/resume" className="transition-colors hover:text-[#191921]">
              Resume
            </Link>
            <Link href="/analytics" className="transition-colors hover:text-[#191921]">
              Analytics
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-[#191921]">
              Dashboard
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
