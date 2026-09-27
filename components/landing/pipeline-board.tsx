"use client";

/*
 * Pipeline tag wall. Reskin of the stage selector in the reference's
 * "culture wall" module: outline tags on black, active tag in accent.
 */

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

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
    <div>
      <div className="flex flex-wrap gap-3" role="group" aria-label="Pipeline stages">
        {STAGES.map((stage) => {
          const isActive = stage.id === activeId;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveId(stage.id)}
              aria-pressed={isActive}
              className={`rounded-[10px] border-2 px-5 py-3 text-[15px] font-semibold transition-all duration-150 focus-visible:outline-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                isActive
                  ? "border-[#FFB800] bg-[#FFB800] text-[#141414] shadow-[4px_4px_0_rgba(243,243,239,0.9)]"
                  : "border-[#F3F3EF]/40 bg-transparent text-[#F3F3EF] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:border-[#F3F3EF] hover:shadow-[3px_3px_0_rgba(243,243,239,0.35)]"
              }`}
            >
              {stage.name}{" "}
              <span className="tnum font-display">{stage.count}</span>
            </button>
          );
        })}
        <span className="inline-flex items-center rounded-[10px] border-2 border-dashed border-[#F3F3EF]/25 px-5 py-3 text-[15px] text-[#B9B9C2]">
          Rejected, filed separately
        </span>
      </div>
      <div className="mt-6 min-h-[76px] border-t-2 border-[#F3F3EF]/15 pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <p className="text-[17px] font-medium text-[#F3F3EF]">
              {active.record}
            </p>
            <p className="tnum mt-1 text-[15px] text-[#B9B9C2]">
              Sample entry: {active.sample}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
