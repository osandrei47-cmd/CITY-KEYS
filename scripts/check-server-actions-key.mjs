// Прогоняется автоматически перед `next build` (см. package.json → prebuild).
// Два независимых защитных фильтра — оба про Server Actions в проде, оба
// добавлены после реальных инцидентов, оба ловят вещи, которые молча
// откатываются при рефакторинге package.json/env, если их не проверять.

import { readFileSync } from "node:fs";

// ---------- Фильтр 1: стабильный ключ шифрования ----------
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

// ---------- Фильтр 2: сборка обязана идти через Webpack, не Turbopack ----------
//
// Подтверждено экспериментом (2026-08-19): Turbopack (сборщик по умолчанию
// в Next.js 16) не полностью трассирует "use server"-функцию, которая
// объявлена в src/app/(payload)/layout.tsx и передаётся как проп в
// компонент из @payloadcms/next (RootLayout). В server-reference-manifest.json
// регистрируется только ОДНА из двух ссылок на это действие вместо двух —
// несвязанная ссылка (та, что использует форма загрузки/выбора медиа в
// админке) остаётся незарегистрированной, и запрос к ней получает 404
// "Server action not found" на любом окружении — воспроизводится
// стабильно, никак не связано с кешем, деплоем или доменом (проверено на
// нескольких независимых приложениях Timeweb). Сборка тем же кодом через
// Webpack регистрирует обе ссылки корректно (actionsCount: 1 → 2).
//
// Пока это не починят в Turbopack (или не подтвердят фикс в новой версии
// Next.js/Payload), сборка обязана идти через `next build --webpack` —
// проверяем здесь, что флаг не потерялся при будущем рефакторинге
// package.json (например, если кто-то "уберёт лишний флаг" не зная почему
// он там).
const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8"));
if (!packageJson.scripts?.build?.includes("--webpack")) {
  console.error(
    "\n[prebuild] В package.json → scripts.build отсутствует флаг --webpack.\n" +
      "Сборка по умолчанию (Turbopack) не полностью трассирует один из Server\n" +
      "Actions в админке Payload — форма загрузки/выбора медиа получает 404\n" +
      '"Server action not found" на любом окружении (подтверждено экспериментом,\n' +
      "не гипотеза). Верните \"next build --webpack\" в scripts.build, пока баг\n" +
      "не исправят в Turbopack или в @payloadcms/next.\n",
  );
  process.exit(1);
}
