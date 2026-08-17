// Отображение и форматирование для коллекции Projects.
// Сами типы (Project) — автогенерируемые Payload'ом в src/payload-types.ts,
// обновляются командой `npm run generate:types` при изменении схемы коллекции.

import type { Project } from "@/payload-types";

export type { Project };

export const projectStatusLabels: Record<Project["status"], string> = {
  sale: "Идёт продажа",
  development: "В разработке",
  completed: "Завершён",
};
