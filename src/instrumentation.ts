export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startTaskReminderScheduler } = await import("@/lib/task-reminder-scheduler");
    startTaskReminderScheduler();
  }
}
