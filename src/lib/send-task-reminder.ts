import nodemailer from "nodemailer";
import type { Lead, Task } from "@/payload-types";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export async function sendTaskReminder(task: Task, lead: Lead): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.LEAD_NOTIFICATION_EMAIL || "lid@city-keys.ru";

  if (!host || !port || !user || !pass) {
    console.warn("[send-task-reminder] SMTP не настроен — напоминание не отправлено");
    return;
  }

  const transport = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
    // Задача шлётся из периодического планировщика — не даём зависшему SMTP
    // заблокировать следующий тик проверки.
    connectionTimeout: 15_000,
    socketTimeout: 15_000,
  });

  const lines = [
    `Задача: ${task.description}`,
    `Срок: ${formatDate(new Date(task.dueDate))}`,
    `Заявка: ${lead.name} · ${lead.phone}`,
  ];

  await transport.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    subject: `Напоминание по задаче — ${lead.name}`,
    text: lines.join("\n"),
  });
}
