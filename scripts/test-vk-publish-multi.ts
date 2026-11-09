/**
 * Тест публикации с несколькими фото — по задаче «проверь на объекте с
 * больше 4 фото (id=22, 12 фото) и на объекте с одним фото». Вызывает ту
 * же publishListingToVk, что и кнопка в админке. Печатает точный ответ VK
 * при ошибке, без выдумывания обходных путей.
 *
 * Запуск: npx tsx scripts/test-vk-publish-multi.ts <id>
 */
process.loadEnvFile(".env.prod.local");

async function main() {
  const id = Number(process.argv[2]);
  if (!id) {
    console.error("Укажите id объекта: npx tsx scripts/test-vk-publish-multi.ts <id>");
    process.exit(1);
  }

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const { publishListingToVk } = await import("@/lib/vk");
  const payload = await getPayload({ config });

  const listing = await payload.findByID({ collection: "listings", id, depth: 1 });
  console.log(`Объект id=${id}, фото в галерее: ${(listing.photos ?? []).length}`);

  try {
    const result = await publishListingToVk(listing as never, payload);
    console.log("УСПЕХ:", JSON.stringify(result, null, 2));
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
