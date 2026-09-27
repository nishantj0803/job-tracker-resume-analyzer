"use client";

/*
 * Landing visual system (locked for this page):
 * paper #FFFDF7, ink #141414, one accent #FFB800, mint wash #CDEBD9.
 * Ink borders 2px, hard offset shadows, radii 10px (stamps and chips 6px).
 * Display: Bricolage Grotesque. Body: Inter. Figures: tabular-nums.
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, animate, useInView, useReducedMotion } from "motion/react";
import {
  Briefcase,
  PlayCircle,
  FolderOpen,
  ClipboardText,
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
    <header className="sticky top-0 z-40 border-b-2 border-[#141414] bg-[#FFFDF7]">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#141414] text-[#FFFDF7]">
            <Briefcase className="h-4 w-4" weight="bold" />
          </span>
          <span className="font-display text-[19px] font-bold text-[#141414]">
            JobTrackr
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-[15px] font-medium text-[#141414] md:flex">
          <a href="#pipeline" className="transition-colors hover:text-[#6B6259]">
            Pipeline
          </a>
          <a href="#match" className="transition-colors hover:text-[#6B6259]">
            Match report
          </a>
          <a href="#analytics" className="transition-colors hover:text-[#6B6259]">
            Analytics
          </a>
          <a href="#how" className="transition-colors hover:text-[#6B6259]">
            How it works
          </a>
        </div>
        <div className="flex items-center gap-5">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-[10px] bg-[#141414] px-5 py-2.5 text-sm font-semibold text-[#FFFDF7] shadow-[4px_4px_0_#FFB800] transition-all duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_#FFB800] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-[15px] font-medium text-[#141414] underline-offset-4 hover:underline sm:block"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-[10px] bg-[#141414] px-5 py-2.5 text-sm font-semibold text-[#FFFDF7] shadow-[4px_4px_0_#FFB800] transition-all duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_#FFB800] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
  stampFilled = false,
  rows,
  foot,
  className = "",
}: {
  role: string;
  stamp: string;
  stampFilled?: boolean;
  rows: [string, string][];
  foot?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[10px] border-2 border-[#141414] bg-white p-5 shadow-[6px_6px_0_#141414] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-lg font-bold leading-snug text-[#141414]">
          {role}
        </p>
        <span
          className={`inline-block shrink-0 -rotate-3 rounded-md border-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] ${
            stampFilled
              ? "border-[#141414] bg-[#141414] text-[#FFFDF7]"
              : "border-[#141414] bg-white text-[#141414]"
          }`}
        >
          {stamp}
        </span>
      </div>
      <dl className="mt-4 divide-y divide-[#E5E0D2] border-t-2 border-[#141414] text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 py-2">
            <dt className="text-[#6B6259]">{k}</dt>
            <dd className="tnum text-right font-semibold text-[#141414]">{v}</dd>
          </div>
        ))}
      </dl>
      {foot && (
        <p className="mt-3 border-t-2 border-dashed border-[#D8D2C2] pt-3 text-sm text-[#6B6259]">
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
    <div className="-m-4 bg-[#FFFDF7] text-[#141414] antialiased md:-m-8">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-[10px] focus:bg-[#141414] focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[#FFFDF7]"
      >
        Skip to content
      </a>
      <div aria-hidden className="grain-overlay" />
      <SiteNav />

      <main id="main">
        {/* Hero: split. Copy left, file stack right. */}
        <section className="border-b-2 border-[#141414] bg-[#CDEBD9]">
          <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:pb-24 md:pt-20">
            <motion.div
              variants={container}
              initial={reduce ? false : "hidden"}
              animate="show"
              className="grid items-center gap-12 lg:grid-cols-12"
            >
              <div className="lg:col-span-6">
                <motion.h1
                  variants={rise}
                  className="font-display max-w-[12ch] text-balance text-5xl font-bold leading-[1.0] md:text-6xl lg:text-7xl"
                >
                  Every application, in writing.
                </motion.h1>
                <motion.p
                  variants={rise}
                  className="mt-5 max-w-[42ch] text-pretty text-lg leading-relaxed text-[#3A3A44]"
                >
                  JobTrackr files each application from applied to offer,
                  grades your resume, and names the missing keywords.
                </motion.p>
                <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-6">
                  <Link
                    href="/register"
                    className="rounded-[10px] bg-[#141414] px-7 py-3.5 text-[15px] font-semibold text-[#FFFDF7] shadow-[4px_4px_0_#FFB800] transition-all duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_#FFB800] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    Start tracking
                  </Link>
                  <Link
                    href="#how"
                    className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#141414]"
                  >
                    <PlayCircle className="h-7 w-7" weight="fill" />
                    How it works
                  </Link>
                </motion.div>
              </div>

              <motion.div
                variants={rise}
                className="relative lg:col-span-6"
                aria-label="Sample application file with two tracked roles"
              >
                <div className="relative mx-auto max-w-md lg:ml-auto">
                  <div
                    aria-hidden
                    className="absolute -right-4 -top-8 z-10 rotate-6 rounded-[10px] border-2 border-[#141414] bg-[#FFB800] px-4 py-2 text-center shadow-[4px_4px_0_#141414]"
                  >
                    <p className="font-display tnum text-3xl font-bold leading-none">
                      78
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
                      match
                    </p>
                  </div>
                  <Ticket
                    role="Backend engineer"
                    stamp="Applied"
                    rows={[
                      ["Sent", "Mar 2"],
                      ["Source", "Referral"],
                    ]}
                    className="absolute inset-x-8 top-12 rotate-[5deg]"
                  />
                  <Ticket
                    role="Senior frontend engineer"
                    stamp="Interview"
                    stampFilled
                    rows={[
                      ["Applied", "Mar 4"],
                      ["Screening", "Mar 11"],
                      ["Interview", "Mar 19"],
                    ]}
                    foot="Next: system design round, prep notes attached."
                    className="relative -rotate-[2deg]"
                  />
                </div>
                <p className="tnum mt-6 text-center text-sm text-[#3A3A44] lg:text-right">
                  Sample file. Yours fills in as you apply.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pipeline wall: black band, selectable stage tags. */}
        <section id="pipeline" className="scroll-mt-24 bg-[#141414]">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <h2 className="font-display max-w-[20ch] text-balance text-3xl font-bold leading-tight text-[#FFFDF7] md:text-5xl">
              Four stages. Zero guesswork.
            </h2>
            <p className="mt-3 max-w-[52ch] text-[17px] leading-relaxed text-[#B9B9C2]">
              Every application lives in exactly one stage. Select a stage to
              see what gets recorded there.
            </p>
            <div className="mt-8">
              <PipelineBoard />
            </div>
          </div>
        </section>

        {/* Match report: copy plus a real slip preview. */}
        <section
          id="match"
          className="scroll-mt-24 border-b-2 border-[#141414] bg-white"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:py-24 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-balance text-3xl font-bold leading-tight md:text-5xl">
                A score that shows its working.
              </h2>
              <p className="mt-4 max-w-[48ch] text-[17px] leading-relaxed text-[#3A3A44]">
                No black box. Each match lists what counted,{" "}
                <mark className="bg-[#FFB800] px-1 font-medium text-[#141414]">
                  what is missing
                </mark>
                , and how much of the role your experience covers.
              </p>
              <Link
                href="/resume"
                className="mt-7 inline-block rounded-[10px] border-2 border-[#141414] bg-white px-6 py-3 text-[15px] font-semibold text-[#141414] shadow-[4px_4px_0_#141414] transition-all duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                See a match report
              </Link>
            </div>
            <div>
              <MatchSlip />
            </div>
          </div>
        </section>

        {/* Analytics: yellow band of figures. */}
        <section
          id="analytics"
          className="scroll-mt-24 border-b-2 border-[#141414] bg-[#FFB800]"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <h2 className="font-display max-w-[20ch] text-balance text-3xl font-bold leading-tight text-[#141414] md:text-[2.75rem] md:leading-[1.1]">
              See where the search stalls.
            </h2>
            <div className="mt-10 grid grid-cols-1 divide-y-2 divide-[#141414]/15 border-y-2 border-[#141414] sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
              {[
                { to: 38, label: "of applications reach screening" },
                { to: 17, label: "of applications reach interview" },
                { to: 4, label: "of applications reach offer" },
              ].map((stat) => (
                <div key={stat.label} className="px-2 py-8 sm:px-8">
                  <p className="font-display text-5xl font-bold md:text-6xl">
                    <CountUp to={stat.to} suffix="%" />
                  </p>
                  <p className="mt-2 text-[15px] font-medium text-[#141414]/70">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="tnum mt-4 text-sm font-medium text-[#141414]/60">
              Sample pipeline of 24 applications. Yours updates as you log.
            </p>
          </div>
        </section>

        {/* How it works: sticky head, verb-led rows. */}
        <section id="how" className="scroll-mt-24 bg-[#FFFDF7]">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:py-24 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <h2 className="font-display text-balance text-3xl font-bold leading-tight md:text-[2.75rem] md:leading-[1.1]">
                  Ten minutes a week.
                </h2>
                <p className="mt-3 max-w-[40ch] text-[17px] leading-relaxed text-[#3A3A44]">
                  Three habits keep the whole search legible, from first
                  application to signed offer.
                </p>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="divide-y-2 divide-[#141414]/10 border-y-2 border-[#141414]/10">
                {[
                  {
                    n: "1",
                    verb: "Log",
                    icon: FolderOpen,
                    body: "File each application in seconds. Company, role, stage, deadline. The record your future self thanks you for.",
                    link: "/jobs",
                    linkLabel: "Open jobs",
                  },
                  {
                    n: "2",
                    verb: "Grade",
                    icon: ClipboardText,
                    body: "Upload the resume once. Get section notes and an ATS read before you tailor a single line.",
                    link: "/resume",
                    linkLabel: "Grade a resume",
                  },
                  {
                    n: "3",
                    verb: "Tailor",
                    icon: ChartBar,
                    body: "Paste the description. See matched and missing skills with the evidence, then send the version that fits.",
                    link: "/resume",
                    linkLabel: "Match a job",
                  },
                ].map((step) => (
                  <div key={step.verb} className="grid gap-3 py-8 sm:grid-cols-12 sm:gap-6">
                    <div className="sm:col-span-4">
                      <span
                        aria-hidden
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#141414] bg-[#FFB800] font-display text-lg font-bold"
                      >
                        {step.n}
                      </span>{" "}
                      <span className="font-display text-3xl font-bold">
                        {step.verb}
                      </span>
                    </div>
                    <div className="sm:col-span-8">
                      <p className="flex items-start gap-2.5 text-[16px] leading-relaxed text-[#3A3A44]">
                        <step.icon
                          className="mt-1 h-5 w-5 shrink-0 text-[#141414]"
                          weight="bold"
                        />
                        {step.body}
                      </p>
                      <Link
                        href={step.link}
                        className="mt-3 inline-block text-[15px] font-semibold text-[#141414] underline decoration-[#FFB800] decoration-[3px] underline-offset-4"
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

        {/* Closing panel: black sheet, one stamp, one action. */}
        <section className="border-t-2 border-[#141414] bg-[#FFFDF7]">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <div className="relative overflow-hidden rounded-[10px] border-2 border-[#141414] bg-[#141414] px-6 py-14 text-center shadow-[8px_8px_0_#FFB800] md:py-20">
              <span
                aria-hidden
                className="pointer-events-none absolute right-6 top-6 rotate-6 rounded-md border-[3px] border-[#FFB800] px-3 py-1 text-sm font-bold uppercase tracking-[0.2em] text-[#FFB800] md:right-12 md:top-10 md:text-base"
              >
                Offer
              </span>
              <h2 className="font-display mx-auto max-w-[22ch] text-balance text-3xl font-bold leading-tight text-[#FFFDF7] md:text-5xl">
                Stop losing track of the hunt.
              </h2>
              <p className="mx-auto mt-4 max-w-[44ch] text-[17px] leading-relaxed text-[#B9B9C2]">
                Log tonight&apos;s applications. Wake up knowing exactly where
                each one stands.
              </p>
              <div className="mt-8 flex items-center justify-center gap-6">
                <Link
                  href="/register"
                  className="rounded-[10px] bg-[#FFB800] px-7 py-3.5 text-[15px] font-semibold text-[#141414] shadow-[4px_4px_0_#FFFDF7] transition-all duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_#FFFDF7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Start tracking
                </Link>
                <Link
                  href="/login"
                  className="text-[15px] font-medium text-[#B9B9C2] underline-offset-4 transition-colors hover:text-[#FFFDF7] hover:underline"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-[#141414]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#141414] text-[#FFFDF7]">
              <Briefcase className="h-3.5 w-3.5" weight="bold" />
            </span>
            <span className="font-display text-[17px] font-bold">
              JobTrackr
            </span>
            <span className="tnum text-xs text-[#6B6259]">© 2026</span>
          </div>
          <nav aria-label="Footer" className="flex items-center gap-6 text-[15px] font-medium text-[#3A3A44]">
            <Link href="/jobs" className="transition-colors hover:text-[#141414]">
              Jobs
            </Link>
            <Link href="/resume" className="transition-colors hover:text-[#141414]">
              Resume
            </Link>
            <Link href="/analytics" className="transition-colors hover:text-[#141414]">
              Analytics
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-[#141414]">
              Dashboard
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
