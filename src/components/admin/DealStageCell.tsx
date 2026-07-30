"use client";

import type { DefaultCellComponentProps } from "payload";
import { DEAL_STAGES } from "@/lib/lead-deal-stages";

export function DealStageCell({ cellData }: DefaultCellComponentProps) {
  const stage = DEAL_STAGES.find((s) => s.value === cellData);

  if (!stage) return <span>{typeof cellData === "string" ? cellData : ""}</span>;

  return (
    <span
      style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        color: stage.color,
        backgroundColor: stage.bg,
      }}
    >
      {stage.label}
    </span>
  );
}
