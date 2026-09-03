import nodemailer from "nodemailer";
import type { Lead } from "@/payload-types";
import { formatPrice } from "@/lib/listing-types";
import { LEAD_SOURCE_LABELS } from "@/lib/lead-sources";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export async function sendLeadNotification(lead: Lead): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.LEAD_NOTIFICATION_EMAIL || "lid@city-keys.ru";

  if (!host || !port || !user || !pass) {
    console.warn("[send-lead-email] SMTP не настроен — уведомление не отправлено (заявка сохранена в базе)");
    return;
  }

  const transport = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  const lines = [
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
    `Источник: ${LEAD_SOURCE_LABELS[lead.source] ?? lead.source}`,
    lead.listing && typeof lead.listing === "object"
      ? `Объект: ${lead.listing.title} — ${formatPrice(lead.listing.price)}`
      : null,
    lead.interestType
      ? `Тип интереса: ${lead.interestType === "investment" ? "Инвестиционная покупка" : "Хочу для себя"}`
      : null,
    lead.message ? `Сообщение: ${lead.message}` : null,
    `Дата и время: ${formatDate(new Date(lead.createdAt))}`,
  ].filter(Boolean);

  await transport.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    subject: `Новая заявка с сайта — ${lead.name}`,
    text: lines.join("\n"),
  });
}
