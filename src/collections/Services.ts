import type { CollectionConfig } from "payload";

export const Services: CollectionConfig = {
  slug: "services",
  labels: {
    singular: "Услуга",
    plural: "Услуги",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "isPublished", "order"],
  },
  access: {
    // Услуги видны на публичном сайте без авторизации
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "title",
      label: "Название услуги",
      type: "text",
      required: true,
      admin: {
        description: "Например «Продажа и покупка недвижимости»",
      },
    },
    {
      name: "slug",
      label: "URL-слаг",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description:
          "Латиницей, без пробелов — например «arenda». Страница будет по адресу /uslugi/slug — этот же адрес используется для ссылок на услугу из статей блога",
      },
    },
    {
      name: "icon",
      label: "Иконка карточки",
      type: "select",
      required: true,
      defaultValue: "house-arrows",
      options: [
        { label: "Дом со стрелками (продажа/покупка)", value: "house-arrows" },
        { label: "Дом с календарём (аренда)", value: "house-calendar" },
        { label: "Дом с шестерёнкой (управление)", value: "house-gear" },
        { label: "Дом с рукопожатием (сопровождение)", value: "house-handshake" },
      ],
    },
    {
      name: "shortDescription",
      label: "Короткое описание",
      type: "textarea",
      required: true,
      admin: {
        description: "1-2 предложения для карточки на /uslugi и для превью в соцсетях",
      },
    },
    {
      name: "content",
      label: "Текст страницы",
      type: "richText",
      required: true,
    },
    {
      type: "collapsible",
      label: "Вопросы и ответы — FAQ (необязательно)",
      admin: {
        description:
          "Выводится отдельным блоком на странице услуги и попадает в разметку FAQPage для расширенных сниппетов в Google/Яндексе",
      },
      fields: [
        {
          name: "faq",
          label: "Вопросы",
          type: "array",
          labels: { singular: "Вопрос", plural: "Вопросы" },
          fields: [
            {
              name: "question",
              label: "Вопрос",
              type: "text",
              required: true,
            },
            {
              name: "answer",
              label: "Ответ",
              type: "textarea",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "ctaLabel",
      label: "Текст кнопки в конце страницы",
      type: "text",
      defaultValue: "Обсудить свою ситуацию",
    },
    {
      type: "collapsible",
      label: "SEO (необязательно)",
      admin: {
        description: "Если не заполнено, title и description собираются автоматически из названия и короткого описания",
      },
      fields: [
        {
          name: "metaTitle",
          label: "Meta title",
          type: "text",
        },
        {
          name: "metaDescription",
          label: "Meta description",
          type: "textarea",
        },
      ],
    },
    {
      name: "order",
      label: "Порядок на /uslugi",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Меньше — выше в списке карточек",
      },
    },
    {
      name: "isPublished",
      label: "Показывать на сайте",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Выключите, если страница ещё не готова к публикации",
      },
    },
  ],
};
