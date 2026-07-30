import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role"],
  },
  auth: {
    // Защита от подбора пароля: 5 неверных попыток — блокировка на 15 минут
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    // Список пользователей видят все, кто вошёл в админку — это не секретные данные
    read: ({ req }) => Boolean(req.user),
    // Новых пользователей заводит только администратор
    create: ({ req }) => req.user?.role === "admin",
    // Менять можно свои данные; чужие — только администратору
    update: ({ req, id }) => req.user?.role === "admin" || req.user?.id === id,
    // Удалять пользователей может только администратор
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "role",
      label: "Роль",
      type: "select",
      required: true,
      defaultValue: "admin",
      saveToJWT: true,
      access: {
        // Роль себе или другим может менять только администратор —
        // иначе viewer мог бы сам себя повысить
        update: ({ req }) => req.user?.role === "admin",
      },
      options: [
        { label: "Администратор — полный доступ", value: "admin" },
        { label: "Наблюдатель — только просмотр заявок", value: "viewer" },
      ],
      admin: {
        description:
          "Сейчас в системе один пользователь-администратор. Роль «Наблюдатель» уже поддерживается схемой — на будущее, когда понадобится добавить второго человека с ограниченным доступом (например, только к заявкам).",
      },
    },
  ],
};
