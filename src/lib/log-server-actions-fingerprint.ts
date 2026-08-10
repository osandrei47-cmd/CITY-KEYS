import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";

// Печатает в обычные логи приложения отпечаток server-reference-manifest.json
// (id-ы Server Actions + ключ шифрования) при каждом старте процесса. Идея:
// сверять этот отпечаток в логах ДО и ПОСЛЕ очередного SIGTERM-рестарта.
// Если он совпадает — рестарт переиспользует один и тот же артефакт сборки
// (баг тогда не в пересборке). Если отпечаток каждый раз новый — это прямое
// доказательство, что Timeweb на каждом рестарте гоняет `next build` заново
// (см. .next/server/server-reference-manifest.json — путь и формат файла
// подсмотрены в исходниках самого Next.js, node_modules/next/dist/server/mcp/
// tools/get-server-action-by-id.js, который читает этот же файл для похожей
// отладочной задачи). Сырой ключ шифрования в лог не пишем — только его
// sha256-отпечаток, этого достаточно для сравнения "тот же/другой".
//
// Вынесено в отдельный файл (не прямо в instrumentation.ts) и импортируется
// оттуда только динамически: instrumentation.ts участвует в анализе Edge
// Runtime бандла, и статические импорты fs/path/crypto внутри него сами по
// себе (даже за рантайм-проверкой NEXT_RUNTIME === "nodejs") triggerят
// build-warning "Node.js module ... not supported in the Edge Runtime" —
// проверено сборкой. Динамический импорт ЛОКАЛЬНОГО модуля Next не мёржит в
// edge-чанк статически, поэтому здесь эти импорты можно использовать как
// обычно.
export async function logServerActionsManifestFingerprint() {
  const manifestPath = path.join(process.cwd(), ".next", "server", "server-reference-manifest.json");
  const buildIdPath = path.join(process.cwd(), ".next", "BUILD_ID");

  try {
    const [manifestRaw, buildId] = await Promise.all([
      fs.readFile(manifestPath, "utf-8"),
      fs.readFile(buildIdPath, "utf-8").then((s) => s.trim()),
    ]);
    const manifest = JSON.parse(manifestRaw) as {
      node?: Record<string, unknown>;
      encryptionKey?: string;
    };
    const actionIds = Object.keys(manifest.node ?? {}).sort();
    const manifestHash = createHash("sha256").update(manifestRaw).digest("hex").slice(0, 16);
    const keyHash = manifest.encryptionKey
      ? createHash("sha256").update(manifest.encryptionKey).digest("hex").slice(0, 16)
      : "отсутствует";

    console.log(
      `[startup] buildId=${buildId} serverActionsManifestHash=${manifestHash} encryptionKeyHash=${keyHash} actionsCount=${actionIds.length} sampleActionId=${actionIds[0] ?? "нет"}`,
    );
  } catch (error) {
    console.warn("[startup] не удалось прочитать server-reference-manifest.json для отпечатка", error);
  }
}
