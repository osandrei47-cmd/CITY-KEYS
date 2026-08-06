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
