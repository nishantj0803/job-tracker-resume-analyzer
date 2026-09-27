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
    <figure className="overflow-hidden rounded-[10px] border-2 border-[#141414] bg-white shadow-[6px_6px_0_#141414]">
      <div className="px-6 pb-6 pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[15px] font-semibold text-[#141414]">
            Senior frontend engineer
          </p>
          <p className="font-display tnum shrink-0 text-5xl font-bold text-[#141414]">
            78
          </p>
        </div>
        <p className="tnum mt-1 text-sm text-[#6B6259]">
          4 of 6 core requirements covered
        </p>

        <div className="mt-5 space-y-4">
          {ROWS.map((row, i) => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-[#3A3A44]">{row.label}</span>
                <span className="tnum font-bold text-[#141414]">{row.value}</span>
              </div>
              <div className="mt-1.5 h-[4px]">
                <motion.div
                  className="h-full rounded-full bg-[#141414]"
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

        <div className="mt-6 border-t-2 border-dashed border-[#D8D2C2] pt-5">
          <div className="flex flex-wrap gap-2">
            {MATCHED.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#141414] bg-[#141414] px-2 py-1 text-[13px] font-semibold text-[#FFFDF7]"
              >
                <CheckCircle className="h-3.5 w-3.5" weight="bold" />
                {skill}
              </span>
            ))}
            {MISSING.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#141414] bg-[#FFB800] px-2 py-1 text-[13px] font-semibold text-[#141414]"
              >
                <XCircle className="h-3.5 w-3.5" weight="bold" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="border-t-2 border-[#141414] bg-[#F1EBDD] px-6 py-3 text-[13px] text-[#6B6259]">
        Sample report. Yours reads your actual resume.
      </figcaption>
    </figure>
  );
}
