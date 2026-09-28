import type { ReactNode } from "react";
import { CloudDoodle } from "@/components/doodles";

interface EmptyStateProps {
  doodle?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ doodle, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[10px] border-2 border-dashed border-[#141414]/30 bg-white/60 px-6 py-12 text-center">
      {doodle ?? <CloudDoodle className="h-16 w-20" />}
      <h3 className="font-display mt-4 text-xl font-bold text-[#141414]">
        {title}
      </h3>
      {body && <p className="mt-2 max-w-[42ch] text-[15px] text-[#6B6259]">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
