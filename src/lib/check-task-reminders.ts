import { getPayloadClient } from "@/lib/payload-client";
import { sendTaskReminder } from "@/lib/send-task-reminder";
import type { Lead } from "@/payload-types";

// Россия не переходит на летнее/зимнее время — смещение Москвы от UTC постоянно.
const MOSCOW_OFFSET_MS = 3 * 60 * 60 * 1000;
const MORNING_HOUR_MOSCOW = 8;

function getMoscowHour(now: Date): number {
  return new Date(now.getTime() + MOSCOW_OFFSET_MS).getUTCHours();
}

function getMoscowEndOfToday(now: Date): Date {
  const moscowNow = new Date(now.getTime() + MOSCOW_OFFSET_MS);
  const endOfDayMoscow = Date.UTC(
    moscowNow.getUTCFullYear(),
    moscowNow.getUTCMonth(),
    moscowNow.getUTCDate(),
    23,
    59,
    59,
    999,
  );
  return new Date(endOfDayMoscow - MOSCOW_OFFSET_MS);
}

/**
 * Раз в сутки (начиная с утра по МСК) шлём одно письмо-напоминание на задачу —
 * по всем невыполненным задачам со сроком сегодня или раньше, если письмо по
 * ним ещё не отправлялось. Просроченные задачи, пропущенные из-за простоя
 * сервера, тоже попадут в следующую проверку — reminderSentAt гарантирует,
 * что письмо уйдёт ровно один раз.
 */
export async function checkAndSendTaskReminders(
  now: Date = new Date(),
): Promise<{ checked: number; sent: number }> {
  if (getMoscowHour(now) < MORNING_HOUR_MOSCOW) {
    return { checked: 0, sent: 0 };
  }

  const payload = await getPayloadClient();
  const endOfToday = getMoscowEndOfToday(now);

  const { docs: tasks } = await payload.find({
    collection: "tasks",
    depth: 1,
    limit: 200,
    where: {
      and: [
        { done: { equals: false } },
        { dueDate: { less_than_equal: endOfToday.toISOString() } },
        { reminderSentAt: { exists: false } },
      ],
    },
  });

  let sent = 0;
  for (const task of tasks) {
    const lead = typeof task.lead === "object" ? (task.lead as Lead) : null;
    if (!lead) continue;

    try {
      await sendTaskReminder(task, lead);
      await payload.update({
        collection: "tasks",
        id: task.id,
        data: { reminderSentAt: new Date().toISOString() },
      });
      sent += 1;
    } catch (error) {
      console.error(
        "[check-task-reminders] не удалось отправить напоминание по задаче",
        task.id,
        error,
      );
    }
  }

  return { checked: tasks.length, sent };
}
