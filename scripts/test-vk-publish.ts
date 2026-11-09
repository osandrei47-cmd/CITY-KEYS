/**
 * Тестовая публикация ОДНОГО реального объекта в ВК — по задаче «проверь
 * публикацию с фото и опиши результат честно». Вызывает ровно ту же
 * функцию publishListingToVk, что и кнопка в админке, на первом попавшемся
 * объекте с фото. Если VK вернёт ошибку — печатает её как есть, без попыток
 * обойти.
 *
 * Запуск: npx tsx scripts/test-vk-publish.ts
 */
process.loadEnvFile(".env.prod.local");

async function main() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const { publishListingToVk } = await import("@/lib/vk");
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: "listings",
    where: { status: { equals: "for-sale" } },
    limit: 5,
    depth: 1,
  });

  const listing = docs.find((l) => (l.photos ?? []).length > 0) ?? docs[0];
  if (!listing) {
    console.error("Нет ни одного объекта в базе — нечем тестировать.");
    process.exit(1);
  }

  console.log(`Тестирую публикацию объекта id=${listing.id} (фото: ${(listing.photos ?? []).length})...`);

  try {
    const result = await publishListingToVk(listing as never, payload);
    console.log("УСПЕХ:", result);
  } catch (error) {
    console.error("ОШИБКА VK:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export {};
