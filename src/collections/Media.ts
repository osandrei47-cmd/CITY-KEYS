import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Файлы (фото/видео объектов) видны на публичном сайте без авторизации
    read: () => true,
    // Загружать, менять и удалять файлы может только администратор
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Текстовое описание файла — для доступности и на случай, если файл не загрузится",
      },
    },
  ],
  upload: true,
};
