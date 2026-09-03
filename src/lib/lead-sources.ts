// Единый источник правды для источников заявки — переиспользуется в схеме
// коллекции Leads (options), в email-уведомлении и на канбан-доске.
export const LEAD_SOURCES = [
  { value: "kontakty-form", label: "Форма на «Контактах»" },
  { value: "ipoteka-calculator", label: "Ипотечный калькулятор" },
  { value: "ipoteka-quiz", label: "Квиз «Какую ставку одобрят»" },
  { value: "katalog-obyekt", label: "Страница объекта в каталоге" },
  { value: "proekt-ust-luga-izhs", label: "Лендинг «Усть-Луга ИЖС»" },
  { value: "proekt-luga-park", label: "Лендинг «Луга Парк»" },
  { value: "zhk-presentation", label: "Презентация ЖК (со страницы комплекса)" },
  { value: "other", label: "Другое" },
] as const;

export const LEAD_SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  LEAD_SOURCES.map(({ value, label }) => [value, label]),
);
