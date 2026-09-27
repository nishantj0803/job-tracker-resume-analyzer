"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  animate,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  FileSearch,
  FileText,
  GitBranch,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";

/* ---------------------------------- bits --------------------------------- */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.65, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix]);
  return (
    <span ref={ref} className="tabular-nums">
      0{suffix}
    </span>
  );
}

function Float({
  children,
  className,
  duration = 5,
  offset = 10,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  offset?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -offset, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------- mock data -------------------------------- */

const FUNNEL = [
  { stage: "Applied", count: 24, width: 100, conv: null as string | null },
  { stage: "Screening", count: 9, width: 38, conv: "38% from Applied" },
  { stage: "Interview", count: 4, width: 17, conv: "44% from Screening" },
  { stage: "Offer", count: 1, width: 8, conv: "25% from Interview" },
];

const MATCHED = ["Python", "REST", "SQL", "React"];
const MISSING = ["Kubernetes", "AWS Lambda"];
const BREAKDOWN = [
  { label: "Skills match", value: 80 },
  { label: "Experience overlap", value: 67 },
  { label: "Seniority fit", value: 75 },
];

/* --------------------------------- sections ------------------------------- */

function LandingNav() {
  const { user } = useAuth();
  return (
    <header className="relative z-20 mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-zinc-950">
          <Briefcase className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-white">
          JobTrackr
        </span>
      </Link>
      <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
        <a href="#pipeline" className="transition-colors hover:text-white">
          Pipeline
        </a>
        <a href="#match" className="transition-colors hover:text-white">
          Match score
        </a>
        <a href="#analytics" className="transition-colors hover:text-white">
          Analytics
        </a>
        <a href="#how" className="transition-colors hover:text-white">
          How it works
        </a>
      </nav>
      <div className="flex items-center gap-2">
        {user ? (
          <Button
            asChild
            size="sm"
            className="bg-emerald-400 font-medium text-zinc-950 hover:bg-emerald-300"
          >
            <Link href="/dashboard">
              Open dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : (
          <>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-emerald-400 font-medium text-zinc-950 hover:bg-emerald-300"
            >
              <Link href="/register">Start free</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

function ProductMock() {
  return (
    <div className="relative">
      {/* glow */}
      <div
        aria-hidden
        className="absolute -inset-x-8 -top-10 bottom-0 rounded-[32px] bg-emerald-400/10 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop-blur"
      >
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="ml-3 hidden rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-zinc-500 sm:block">
            jobtrackr.app/dashboard
          </span>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            4 interviews active
          </span>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-5">
          {/* pipeline panel */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:col-span-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Pipeline
              </p>
              <p className="font-mono text-[11px] text-zinc-500">
                last 90 days
              </p>
            </div>
            <div className="mt-4 space-y-3.5">
              {FUNNEL.map((f, i) => (
                <div key={f.stage}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="font-medium text-zinc-200">
                      {f.stage}
                      <span className="ml-2 font-mono text-zinc-500">
                        {f.count}
                      </span>
                    </span>
                    {f.conv && (
                      <span className="font-mono text-[11px] text-emerald-300/80">
                        {f.conv}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className={`h-full rounded-full ${
                        f.stage === "Offer"
                          ? "bg-emerald-400"
                          : "bg-zinc-400"
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      style={{ width: `${f.width}%`, transformOrigin: "left" }}
                      transition={{
                        duration: 1,
                        delay: 0.7 + i * 0.15,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-[12px] text-zinc-500">
              <GitBranch className="h-3.5 w-3.5" />
              Rejected tracked separately — 11, with reasons logged
            </div>
          </div>

          {/* match panel */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Match report
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                78%
              </span>
              <span className="text-[12px] text-zinc-500">match</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-zinc-500">
              4/6 core requirements
            </p>
            <div className="mt-3 space-y-2">
              {BREAKDOWN.map((b, i) => (
                <div key={b.label}>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">{b.label}</span>
                    <span className="font-mono text-zinc-300">{b.value}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full bg-emerald-400/80"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      style={{
                        width: `${b.value}%`,
                        transformOrigin: "left",
                      }}
                      transition={{
                        duration: 0.9,
                        delay: 1 + i * 0.12,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {MATCHED.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[11px] text-emerald-300"
                >
                  <CheckCircle2 className="h-3 w-3" /> {m}
                </span>
              ))}
              {MISSING.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-zinc-400"
                >
                  <XCircle className="h-3 w-3" /> {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* floating chips */}
      <Float
        className="absolute -left-3 top-16 hidden rounded-xl border border-white/10 bg-zinc-900/95 px-3.5 py-2.5 shadow-xl backdrop-blur md:block lg:-left-10"
        duration={5.5}
        offset={9}
      >
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Response rate
        </p>
        <p className="text-xl font-semibold text-white">
          <CountUp to={50} suffix="%" />
        </p>
      </Float>
      <Float
        className="absolute -right-3 top-40 hidden rounded-xl border border-white/10 bg-zinc-900/95 px-3.5 py-2.5 shadow-xl backdrop-blur md:block lg:-right-10"
        duration={6.5}
        offset={11}
        delay={0.8}
      >
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Missing skill found
        </p>
        <p className="text-sm font-medium text-amber-300">+ Kubernetes</p>
      </Float>
    </div>
  );
}

/* ---------------------------------- page ---------------------------------- */

const MARQUEE = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Keyword gaps",
  "ATS feedback",
  "Response rate",
  "Tailored resume",
];

const FEATURES = [
  {
    icon: GitBranch,
    title: "A pipeline, not a spreadsheet",
    body: "Every application sits in a stage — applied, screening, interview, offer, rejected. You always know what needs a nudge and what went quiet.",
  },
  {
    icon: FileSearch,
    title: "Match scores you can argue with",
    body: "Paste a job description and get matched skills, missing skills, and experience overlap — with the evidence, not just a number.",
  },
  {
    icon: FileText,
    title: "Resume grading that stings a little",
    body: "Content quality, ATS compatibility, section-by-section feedback. Specific enough to act on in one sitting.",
  },
  {
    icon: BarChart3,
    title: "Analytics that answer one question",
    body: "Where do I drop off? Conversion between every stage, response rate, and per-company history — so you fix the bottleneck.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Log applications as you send them",
    body: "Company, role, stage, deadline. Thirty seconds each — the data your future self needs for follow-ups and patterns.",
  },
  {
    n: "02",
    title: "Grade the resume once",
    body: "Upload it, get section feedback and ATS notes. Fix the big issues before you tailor per role.",
  },
  {
    n: "03",
    title: "Tailor per job with the match report",
    body: "Compare against each description, close the keyword gaps honestly, and send the version that fits.",
  },
];

export default function HomePage() {
  return (
    <div className="-m-4 bg-zinc-950 text-zinc-100 antialiased md:-m-8">
      {/* backdrop texture */}
      <div className="relative overflow-hidden">
        <div aria-hidden className="bg-grid-dark absolute inset-0" />
        <div
          aria-hidden
          className="absolute left-1/2 top-[-320px] h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-400/[0.07] blur-[120px]"
        />
        <div className="relative">
          <LandingNav />

          {/* hero */}
          <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 text-center md:pt-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <Link
                href="/resume"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-2 pr-3.5 text-[13px] text-zinc-300 backdrop-blur transition-colors hover:border-emerald-400/30 hover:text-white"
              >
                <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[11px] font-semibold text-zinc-950">
                  New
                </span>
                Explainable match scores — why it&apos;s 78%
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="mx-auto mt-7 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.03em] text-white md:text-7xl"
            >
              Turn more applications into{" "}
              <span className="text-emerald-300">interviews.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-zinc-400 md:text-lg"
            >
              JobTrackr tracks every application from applied to offer, grades
              your resume against each job description, and shows exactly
              which keywords you&apos;re missing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Button
                asChild
                size="lg"
                className="h-12 bg-emerald-400 px-7 font-medium text-zinc-950 hover:bg-emerald-300"
              >
                <Link href="/register">
                  Start tracking — it&apos;s free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/15 bg-transparent px-7 text-zinc-200 hover:bg-white/5 hover:text-white"
              >
                <Link href="/resume">See a match report</Link>
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.34 }}
              className="mt-5 font-mono text-[12px] text-zinc-600"
            >
              Free to start · No credit card · Your data stays yours
            </motion.p>

            <div className="mx-auto mt-12 max-w-4xl md:mt-16">
              <ProductMock />
            </div>
          </section>
        </div>
      </div>

      {/* marquee */}
      <div className="border-y border-white/10 bg-zinc-950 py-4">
        <div className="marquee-mask overflow-hidden">
          <div className="animate-marquee flex w-max items-center gap-8 pr-8">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span
                key={i}
                className="flex items-center gap-8 whitespace-nowrap font-mono text-[13px] uppercase tracking-[0.18em] text-zinc-600"
              >
                {m}
                <span className="text-emerald-400/60">→</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* features */}
      <section id="pipeline" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-emerald-300/80">
            What it does
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Everything between &ldquo;applied&rdquo; and &ldquo;offer&rdquo;,
            handled.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-300 hover:border-emerald-400/25 hover:bg-white/[0.04]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-emerald-300 transition-colors group-hover:border-emerald-400/30">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-medium tracking-tight text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section
        id="how"
        className="scroll-mt-20 border-y border-white/10 bg-zinc-900/40"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <Reveal>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-emerald-300/80">
              How it works
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Three habits. Ten minutes a week.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="relative">
                  <p className="font-mono text-sm text-emerald-300/70">{s.n}</p>
                  <h3 className="mt-2 text-lg font-medium tracking-tight text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
                    {s.body}
                  </p>
                  {i < STEPS.length - 1 && (
                    <div
                      aria-hidden
                      className="absolute left-full top-8 hidden h-px w-8 bg-gradient-to-r from-white/20 to-transparent md:block"
                    />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* match deep-dive */}
      <section id="match" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:py-28">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-emerald-300/80">
              Match score, explained
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Never stare at &ldquo;78%&rdquo; wondering why.
            </h2>
            <p className="mt-4 leading-relaxed text-zinc-400">
              Every score ships with its working: which requirements you hit,
              which you missed, and how much of the job&apos;s core experience
              your resume actually covers. Close the gaps that matter instead
              of keyword-stuffing blindly.
            </p>
            <ul className="mt-6 space-y-3 text-[15px] text-zinc-300">
              {[
                "Matched vs. missing skills, side by side",
                "Experience overlap like “4/6 core requirements”",
                "Skills / experience / seniority breakdown",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  {t}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-7 bg-emerald-400 font-medium text-zinc-950 hover:bg-emerald-300"
            >
              <Link href="/resume">
                Try the keyword matcher <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-zinc-400">Senior Frontend · Acme</p>
                <Badge
                  variant="outline"
                  className="border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                >
                  78% match
                </Badge>
              </div>
              <div className="mt-5 space-y-4">
                {BREAKDOWN.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-300">{b.label}</span>
                      <span className="font-mono text-zinc-400">{b.value}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full bg-emerald-400/80"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        style={{
                          width: `${b.value}%`,
                          transformOrigin: "left",
                        }}
                        transition={{
                          duration: 0.9,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-relaxed text-zinc-500">
                &ldquo;Strong alignment on frontend fundamentals — closing the
                Kubernetes and AWS Lambda gap would lift this past 85%.&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* analytics strip */}
      <section
        id="analytics"
        className="scroll-mt-20 border-y border-white/10 bg-zinc-900/40"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          <Reveal className="text-center">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-emerald-300/80">
              Analytics
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Know exactly where your search stalls.
            </h2>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 text-center">
            {[
              { to: 50, suffix: "%", label: "response rate" },
              { to: 33, suffix: "%", label: "to interview" },
              { to: 17, suffix: "%", label: "to offer" },
            ].map((s) => (
              <Reveal key={s.label}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-2 py-6">
                  <p className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                    <CountUp to={s.to} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-[13px] text-zinc-500">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 text-center">
            <Button
              asChild
              variant="outline"
              className="border-white/15 bg-transparent text-zinc-200 hover:bg-white/5 hover:text-white"
            >
              <Link href="/analytics">
                Open the analytics view <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* final CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent px-6 py-14 text-center md:py-20">
            <div
              aria-hidden
              className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
            />
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Your next interview is already in your pipeline.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-zinc-400">
              Log this week&apos;s applications tonight. See your first match
              report in minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 bg-emerald-400 px-7 font-medium text-zinc-950 hover:bg-emerald-300"
              >
                <Link href="/register">
                  Get started free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-12 text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 py-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-400 text-zinc-950">
              <Briefcase className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-medium text-zinc-300">JobTrackr</span>
            <span className="font-mono text-[11px] text-zinc-600">
              © 2026
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
            <Link href="/jobs" className="transition-colors hover:text-zinc-200">
              Jobs
            </Link>
            <Link
              href="/resume"
              className="transition-colors hover:text-zinc-200"
            >
              Resume
            </Link>
            <Link
              href="/analytics"
              className="transition-colors hover:text-zinc-200"
            >
              Analytics
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-zinc-200"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
