"use client";

import { motion, useReducedMotion } from "motion/react";
import { CheckCircle, XCircle } from "@phosphor-icons/react";

const ROWS = [
  { label: "Skills", value: 80 },
  { label: "Experience", value: 67 },
  { label: "Seniority", value: 75 },
];

const MATCHED = ["Python", "REST", "SQL", "React"];
const MISSING = ["Kubernetes", "AWS Lambda"];

/*
 * A real preview of the match slip (same data shape as the app renders),
 * filled with sample data. Trackless micro-lines: fill only, no track.
 */
export function MatchSlip() {
  const reduce = useReducedMotion();

  return (
    <figure className="overflow-hidden rounded-[14px] border border-[#E2E2D9] bg-[#FCFCFA] shadow-[0_24px_60px_-32px_rgba(60,55,45,0.35)]">
      <div className="px-6 pb-6 pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[15px] font-medium text-[#191921]">
            Senior frontend engineer
          </p>
          <p className="font-display tnum shrink-0 text-5xl font-semibold text-[#191921]">
            78
          </p>
        </div>
        <p className="tnum mt-1 text-sm text-[#5C5C66]">
          4 of 6 core requirements covered
        </p>

        <div className="mt-5 space-y-4">
          {ROWS.map((row, i) => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-[#3A3A44]">{row.label}</span>
                <span className="tnum font-semibold text-[#191921]">
                  {row.value}
                </span>
              </div>
              <div className="mt-1.5 h-[3px]">
                <motion.div
                  className="h-full rounded-full bg-[#D43D2A]"
                  style={{ width: `${row.value}%`, transformOrigin: "left" }}
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-dashed border-[#D8D8CE] pt-5">
          <div className="flex flex-wrap gap-1.5">
            {MATCHED.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#191921] px-2 py-1 text-[13px] font-medium text-[#F3F3EF]"
              >
                <CheckCircle className="h-3.5 w-3.5" weight="bold" />
                {skill}
              </span>
            ))}
            {MISSING.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[#D43D2A]/60 bg-transparent px-2 py-1 text-[13px] font-medium text-[#D43D2A]"
              >
                <XCircle className="h-3.5 w-3.5" weight="bold" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="border-t border-[#E2E2D9] bg-[#EFEFE8] px-6 py-3 text-[13px] text-[#5C5C66]">
        Sample report. Yours reads your actual resume.
      </figcaption>
    </figure>
  );
}
