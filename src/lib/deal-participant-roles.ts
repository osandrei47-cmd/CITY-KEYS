// Роли участников сделки (коллекция Deals, поле participants). Отдельный
// файл — тот же приём, что и с этапами: список можно расширить, не трогая
// схему коллекции.
export const DEAL_PARTICIPANT_ROLES = [
  { value: "buyer", label: "Покупатель" },
  { value: "seller", label: "Продавец" },
  { value: "owner", label: "Собственник" },
  { value: "guarantor", label: "Поручитель" },
] as const;

export type DealParticipantRole = (typeof DEAL_PARTICIPANT_ROLES)[number]["value"];
