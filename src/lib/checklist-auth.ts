// Токен из ссылки чек-листа — не единственная проверка доступа: если ссылка
// попадёт не в те руки, страница дополнительно требует ввести телефон
// участника и сверяет его с Lead.phone. Общие хелперы для обоих API-роутов
// (verify и PATCH-обновление пункта) — сравнение должно быть идентичным.
export function normalizePhone(raw: string): string {
  // Оставляем только цифры и сравниваем по последним 10 — участники вводят
  // номер по-разному (+7..., 8..., с пробелами/скобками), код страны не
  // всегда совпадает по написанию, но сам номер должен быть тем же.
  const digits = raw.replace(/\D/g, "");
  return digits.slice(-10);
}

export function phonesMatch(a: string, b: string): boolean {
  const na = normalizePhone(a);
  return na.length === 10 && na === normalizePhone(b);
}
