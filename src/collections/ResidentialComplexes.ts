import type { CollectionConfig } from "payload";

export const ResidentialComplexes: CollectionConfig = {
  slug: "residential-complexes",
  labels: {
    singular: "Жилой комплекс",
    plural: "Жилые комплексы (Новостройки)",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "isPublished"],
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
      name: "title",
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
      name: "gallery",
      label: "Галерея",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      admin: {
        description: "Необязательно — дополнительные фото ЖК для страницы /zhk/slug",
      },
    },
    {
      name: "shortDescription",
      label: "Краткое описание",
      type: "textarea",
      admin: {
        description: "1-2 предложения для карточки в каталоге /novostroyki",
      },
    },
    {
      name: "description",
      label: "Полное описание",
      type: "richText",
      admin: {
        description: "Инфраструктура, сроки сдачи, застройщик и т.д. — для страницы /zhk/slug",
      },
    },
    {
      name: "address",
      label: "Адрес / локация",
      type: "text",
    },
    {
      name: "developer",
      label: "Застройщик",
      type: "text",
    },
    {
      name: "status",
      label: "Статус",
      type: "select",
      required: true,
      defaultValue: "under-construction",
      options: [
        { label: "На этапе проекта", value: "planned" },
        { label: "Строится", value: "under-construction" },
        { label: "Сдан", value: "completed" },
        { label: "Заморожен", value: "frozen" },
      ],
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
