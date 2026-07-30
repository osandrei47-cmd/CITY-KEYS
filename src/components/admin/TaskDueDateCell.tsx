import type { DefaultCellComponentProps } from "payload";

export function TaskDueDateCell({ cellData, rowData }: DefaultCellComponentProps) {
  if (!cellData || typeof cellData !== "string") return null;

  const due = new Date(cellData);
  const isOverdue = !rowData?.done && due.getTime() < Date.now();

  const formatted = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(due);

  if (!isOverdue) return <span>{formatted}</span>;

  return (
    <span
      style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        color: "#991b1b",
        backgroundColor: "#fee2e2",
      }}
    >
      {formatted} · просрочено
    </span>
  );
}
