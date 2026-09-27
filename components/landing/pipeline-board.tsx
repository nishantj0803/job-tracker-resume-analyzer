"use client";

/*
 * Shape rule for this page (locked): sheets 14px, stamps and chips 6px,
 * buttons pill. One accent (stamp red #D43D2A) across every section.
 */

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Stamp } from "@phosphor-icons/react";

interface Stage {
  id: string;
  name: string;
  count: number;
  record: string;
  sample: string;
}

const STAGES: Stage[] = [
  {
    id: "applied",
    name: "Applied",
    count: 24,
    record: "Company, role, date sent, and where you found it.",
    sample: "Mar 4, referral from a former teammate",
  },
  {
    id: "screening",
    name: "Screening",
    count: 9,
    record: "Recruiter calls booked and materials you sent.",
    sample: "Mar 11, call booked, tailored resume sent",
  },
  {
    id: "interview",
    name: "Interview",
    count: 4,
    record: "Each round with dates and prep notes attached.",
    sample: "Mar 19, system design round, notes attached",
  },
  {
    id: "offer",
    name: "Offer",
    count: 1,
    record: "Terms compared side by side before you sign.",
    sample: "Apr 2, two offers, compared in one place",
  },
];

export function PipelineBoard() {
  const [activeId, setActiveId] = useState("interview");
  const reduce = useReducedMotion();
  const active = STAGES.find((s) => s.id === activeId) ?? STAGES[0];

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E2E2D9] bg-[#FCFCFA] shadow-[0_24px_60px_-32px_rgba(60,55,45,0.35)]">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => {
          const isActive = stage.id === activeId;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveId(stage.id)}
              aria-pressed={isActive}
              className={`relative px-5 py-5 text-left transition-colors duration-200 focus-visible:outline-none ${
                isActive ? "bg-[#191921] text-[#F3F3EF]" : "hover:bg-[#EFEFE8]"
              } ${stage.id !== "offer" ? "max-lg:odd:border-r lg:border-r" : ""} ${
                stage.id === "applied" || stage.id === "screening"
                  ? "max-lg:border-b"
                  : ""
              } border-[#E2E2D9]`}
            >
              <span
                className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  isActive
                    ? "border-[#F3F3EF]/40 text-[#F3F3EF]"
                    : "border-[#191921]/30 text-[#191921]"
                }`}
              >
                {stage.name}
              </span>
              <span className="font-display tnum mt-2 block text-4xl font-semibold">
                {stage.count}
              </span>
              {isActive && !reduce && (
                <motion.span
                  layoutId="stage-ink"
                  className="absolute inset-x-0 bottom-0 h-[3px] bg-[#D43D2A]"
                />
              )}
              {isActive && reduce && (
                <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#D43D2A]" />
              )}
            </button>
          );
        })}
      </div>
      <div className="border-t border-[#E2E2D9] px-5 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <p className="flex items-center gap-2 text-[15px] font-medium text-[#191921]">
              <Stamp className="h-4 w-4 text-[#D43D2A]" weight="bold" />
              {active.record}
            </p>
            <p className="tnum mt-1 pl-6 text-[13px] text-[#5C5C66]">
              Sample entry: {active.sample}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
