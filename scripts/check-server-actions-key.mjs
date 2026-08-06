// Прогоняется автоматически перед `next build` (см. package.json → prebuild).
//
// NEXT_SERVER_ACTIONS_ENCRYPTION_KEY должен быть виден именно на этапе
// `next build` — Next.js зашивает его в артефакт сборки (server module map),
// и то, что переменная есть в рантайм-окружении контейнера, НЕ гарантирует,
// что она была видна во время самой сборки (сборкой на Timeweb управляет
// buildpack, а не наш Dockerfile — см. cache-handler.mjs — и у buildpack-ов
// build-время и runtime-время нередко имеют разный набор переменных
// окружения). Без стабильного ключа Next.js на каждой пересборке печёт
// новый случайный ключ в манифест — клиент с любой уже открытой вкладкой
// после следующего рестарта получает "Failed to find Server Action ...
// older or newer deployment", даже если исходный код не менялся.
if (!process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY) {
  console.error(
    "\n[prebuild] NEXT_SERVER_ACTIONS_ENCRYPTION_KEY не задан на этапе сборки.\n" +
      "Next.js сгенерирует случайный ключ и зашьёт его в этот билд — после следующего\n" +
      "рестарта/деплоя все уже открытые вкладки админки снова словят\n" +
      '"Failed to find Server Action ... older or newer deployment".\n\n' +
      "Если переменная уже задана в панели Timeweb — проверьте, что она помечена\n" +
      "как доступная именно на этапе сборки (build), а не только для запущенного\n" +
      "контейнера (runtime) — это разные области видимости у большинства buildpack-платформ.\n",
  );
  process.exit(1);
}
