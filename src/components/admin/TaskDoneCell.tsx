"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DefaultCellComponentProps } from "payload";

export function TaskDoneCell({ cellData, rowData }: DefaultCellComponentProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(Boolean(cellData));
  const [pending, setPending] = useState(false);

  async function toggle(next: boolean) {
    setChecked(next);
    setPending(true);
    try {
      const res = await fetch(`/api/tasks/${rowData?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ done: next }),
      });
      if (!res.ok) throw new Error("Не удалось обновить задачу");
      router.refresh();
    } catch {
      setChecked(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => toggle(e.target.checked)}
      style={{ width: 16, height: 16, cursor: pending ? "default" : "pointer" }}
    />
  );
}
