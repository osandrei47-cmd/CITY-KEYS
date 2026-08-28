// Единый источник правды для этапов сделки (коллекция Deals) — используется
// и в схеме коллекции (options), и в цветовой индикации канбана/списка.
// Отдельно от DEAL_STAGES в lead-deal-stages.ts — тот про воронку заявок,
// этот про этапы уже оформляемой сделки, схемы разные и не должны путаться.
export const DEAL_PIPELINE_STAGES = [
  { value: "docs-review", label: "Согласование документов", color: "#1d4ed8", bg: "#dbeafe" },
  { value: "collecting-package", label: "Сбор пакета", color: "#6d28d9", bg: "#ede9fe" },
  { value: "bank-submission", label: "Подача в банк", color: "#b45309", bg: "#fef3c7" },
  { value: "rosreestr", label: "Сделка в Росреестре", color: "#c2410c", bg: "#ffedd5" },
  { value: "completed", label: "Завершена", color: "#15803d", bg: "#dcfce7" },
] as const;

export type DealPipelineStage = (typeof DEAL_PIPELINE_STAGES)[number]["value"];
