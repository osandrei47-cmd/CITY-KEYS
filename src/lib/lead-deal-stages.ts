// Единый источник правды для этапов сделки — используется и в схеме коллекции
// Leads (options), и в цветовой индикации колонки в списке заявок в админке.
export const DEAL_STAGES = [
  { value: "new-lead", label: "Новая заявка", color: "#4b5563", bg: "#e5e7eb" },
  { value: "first-contact", label: "Первый контакт", color: "#1d4ed8", bg: "#dbeafe" },
  { value: "showing", label: "Показ объекта", color: "#6d28d9", bg: "#ede9fe" },
  { value: "negotiation", label: "Согласование условий", color: "#b45309", bg: "#fef3c7" },
  { value: "deposit", label: "Аванс/задаток", color: "#c2410c", bg: "#ffedd5" },
  { value: "in-progress", label: "Сделка в работе", color: "#a16207", bg: "#fef9c3" },
  { value: "won", label: "Закрыта успешно", color: "#15803d", bg: "#dcfce7" },
  { value: "lost", label: "Отказ", color: "#991b1b", bg: "#f3e8e8" },
] as const;

export type DealStage = (typeof DEAL_STAGES)[number]["value"];
