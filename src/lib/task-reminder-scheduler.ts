import { checkAndSendTaskReminders } from "@/lib/check-task-reminders";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // раз в час

declare global {
  // eslint-disable-next-line no-var
  var __taskReminderSchedulerStarted: boolean | undefined;
}

/**
 * Простой планировщик внутри процесса — держит сервер (next start) в
 * постоянно запущенном виде на VPS, поэтому setInterval живёт вместе с ним.
 * Не переносить на serverless-хостинг без замены на внешний cron/Payload Jobs.
 */
export function startTaskReminderScheduler() {
  if (globalThis.__taskReminderSchedulerStarted) return;
  globalThis.__taskReminderSchedulerStarted = true;

  const tick = async () => {
    try {
      const result = await checkAndSendTaskReminders();
      if (result.sent > 0) {
        console.log(`[task-reminder-scheduler] отправлено напоминаний: ${result.sent}`);
      }
    } catch (error) {
      console.error("[task-reminder-scheduler] ошибка проверки задач", error);
    }
  };

  void tick();
  setInterval(tick, CHECK_INTERVAL_MS);
}
