import type { CollectionConfig } from "payload";

export const ResidentialComplexes: CollectionConfig = {
  slug: "residential-complexes",
  labels: {
    singular: "Жилой комплекс",
    plural: "Жилые комплексы (Новостройки)",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "isPublished"],
  },
  access: {
    // На сайте видны только объекты со статусом "Показывать на сайте"
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "name",
      label: "Название ЖК",
      type: "text",
      required: true,
      admin: {
        description: "Как будет показано на сайте целиком — например «ЖК «Солнечная сторона»»",
      },
    },
    {
      name: "slug",
      label: "URL-слаг",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Латиницей, без пробелов — например «sunny-side». Страница ЖК будет по адресу /zhk/slug",
      },
    },
    {
      name: "coverPhoto",
      label: "Фото на плашке",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "shortDescription",
      label: "Краткое описание",
      type: "textarea",
      admin: {
        description: "Пока не обязательно — используется только на странице ЖК, наполнение планировками/галереей и остальным контентом придёт отдельной задачей",
      },
    },
    {
      name: "isPublished",
      label: "Показывать на сайте",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Выключите, если карточка ЖК ещё не готова к публикации",
      },
    },
  ],
};
