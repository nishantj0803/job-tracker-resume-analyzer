import { cn } from "@/lib/utils";
import {
  normalizeApplicationStatus,
  type ApplicationStatus,
} from "@/lib/application-status";

/*
 * Canonical stage stamp. Uppercase bordered chips are the signature device;
 * fills are fixed per stage so status reads instantly everywhere.
 */
const STYLES: Record<ApplicationStatus, string> = {
  applied: "border-[#141414] bg-white text-[#141414]",
  screening: "border-[#141414] bg-[#CFE6F5] text-[#141414]",
  interview: "border-[#141414] bg-[#FFB800] text-[#141414]",
  offer: "border-[#141414] bg-[#CDEBD9] text-[#141414]",
  rejected: "border-[#141414]/40 bg-[#EFEFE8] text-[#6B6259]",
};

export function StatusStamp({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const normalized = normalizeApplicationStatus(status);
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-md border-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em]",
        STYLES[normalized],
        className
      )}
    >
      {normalized}
    </span>
  );
}
