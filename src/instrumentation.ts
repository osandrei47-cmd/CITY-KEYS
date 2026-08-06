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
async function logServerActionsManifestFingerprint() {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const { createHash } = await import("crypto");

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

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Без этой переменной Next.js на каждой пересборке генерирует новый
    // случайный ключ шифрования Server Actions (см. .env.example) — любая
    // уже открытая вкладка админки после следующего рестарта падает с
    // "Failed to find Server Action ... older or newer deployment". Ключ
    // не подставляется автоматически ничем, поэтому если его забыли задать
    // в переменных окружения на Timeweb — лучше сразу увидеть это в логах,
    // а не разгадывать заново.
    if (!process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY) {
      console.warn(
        "[startup] NEXT_SERVER_ACTIONS_ENCRYPTION_KEY не задан — ключ шифрования Server Actions будет случайным на каждой пересборке, что ломает уже открытые вкладки админки после рестарта. См. .env.example.",
      );
    }
    await logServerActionsManifestFingerprint();

    // node-postgres (использует @payloadcms/db-postgres) кидает фоновую
    // ошибку на idle-клиенте пула при обрыве/таймауте соединения с БД —
    // штатная ситуация при нестабильной БД. Если на пуле нет обработчика
    // 'error' (в @payloadcms/db-postgres его нет — проверено в исходниках,
    // см. node_modules/@payloadcms/db-postgres/dist/connect.js), Node
    // выбрасывает необработанное исключение и роняет весь процесс —
    // воспроизведено локально: без обработчика процесс падает (exit 1),
    // с ним — просто логирует и живёт дальше (exit 0). Это одна из
    // вероятных причин цикличных SIGTERM-рестартов на проде при нестабильной
    // БД. К самому пулу мы доступа не имеем (он создаётся внутри адаптера),
    // поэтому подстраховываемся на уровне процесса.
    process.on("uncaughtException", (error) => {
      console.error("[process] uncaughtException — процесс не остановлен", error);
    });
    process.on("unhandledRejection", (reason) => {
      console.error("[process] unhandledRejection — процесс не остановлен", reason);
    });

    const { startTaskReminderScheduler } = await import("@/lib/task-reminder-scheduler");
    startTaskReminderScheduler();
  }
}
