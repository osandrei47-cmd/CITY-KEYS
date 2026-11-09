/**
 * Диагностика статуса VK ID OAuth — без вывода самих токенов в консоль
 * (только факт наличия + scope/expiresAt/deviceId). Для аудита текущего
 * состояния перед тестовой публикацией в ВК.
 *
 * Запуск: npx tsx scripts/check-vk-oauth-status.ts
 */
process.loadEnvFile(".env.prod.local");

async function main() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  const state = await payload.findGlobal({ slug: "vk-oauth" });

  console.log("hasAccessToken:", Boolean(state.accessToken));
  console.log("hasRefreshToken:", Boolean(state.refreshToken));
  console.log("hasDeviceId:", Boolean(state.deviceId));
  console.log("scope:", state.scope ?? "(не задан)");
  console.log("expiresAt:", state.expiresAt ?? "(не задан)");
  if (state.expiresAt) {
    const msLeft = new Date(state.expiresAt).getTime() - Date.now();
    console.log("истекает через (мин):", Math.round(msLeft / 60000));
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export {};
