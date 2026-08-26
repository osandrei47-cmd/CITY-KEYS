import type { CollectionConfig } from "payload";

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  labels: {
    singular: "Статья блога",
    plural: "Статьи блога",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "isPublished", "publishedAt"],
  },
  access: {
    // Блог виден на публичном сайте без авторизации
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "title",
      label: "Заголовок",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      label: "URL-слаг",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Латиницей, без пробелов — например «sdelka-distantsionno». Статья будет по адресу /blog/slug",
      },
    },
    {
      name: "coverPhoto",
      label: "Обложка",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Необязательно — если не задана, на карточке и в превью для соцсетей используется общая заглушка",
      },
    },
    {
      name: "category",
      label: "Категория",
      type: "select",
      required: true,
      options: [
        { label: "Кейсы сделок", value: "Кейсы сделок" },
        { label: "Юридические вопросы и риски", value: "Юридические вопросы и риски" },
        { label: "Рынок недвижимости", value: "Рынок недвижимости" },
        { label: "Ипотека", value: "Ипотека" },
        { label: "Гид покупателя/продавца", value: "Гид покупателя/продавца" },
      ],
    },
    {
      name: "readTime",
      label: "Время чтения",
      type: "text",
      admin: {
        description: "Например «3 мин» — на глаз, автоматически не считается. Необязательно.",
      },
    },
    {
      name: "excerpt",
      label: "Краткое описание",
      type: "textarea",
      required: true,
      admin: {
        description: "1-2 предложения для карточки в списке /blog и для превью в соцсетях",
      },
    },
    {
      name: "content",
      label: "Текст статьи",
      type: "richText",
      required: true,
    },
    {
      name: "author",
      label: "Автор",
      type: "text",
      defaultValue: "Андрей Осипов",
      admin: {
        description: "Отображается на странице статьи и в разметке для поисковиков",
      },
    },
    {
      name: "tldr",
      label: "Краткое резюме (TL;DR)",
      type: "textarea",
      admin: {
        description:
          "Необязательный абзац сразу после даты/автора — текстом, а не карточками. Например короткое обобщение цифр статьи",
      },
    },
    {
      type: "collapsible",
      label: "Таблица сравнения в теле статьи (необязательно)",
      admin: {
        description:
          "Например «Тип квартиры / Диапазон аренды / Рыночный ориентир» — выводится в начале текста статьи, до основного описания",
      },
      fields: [
        {
          name: "comparisonTable",
          label: "Строки таблицы",
          type: "array",
          labels: { singular: "Строка", plural: "Строки" },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "label",
                  label: "Тип",
                  type: "text",
                  required: true,
                  admin: { width: "33%", description: "Например «1-комнатные»" },
                },
                {
                  name: "range",
                  label: "Диапазон",
                  type: "text",
                  required: true,
                  admin: { width: "33%", description: "Например «35 000–50 000 ₽»" },
                },
                {
                  name: "reference",
                  label: "Ориентир",
                  type: "text",
                  required: true,
                  admin: { width: "34%", description: "Например «40–45 тыс. ₽»" },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Ключевые цифры вверху статьи (необязательно)",
      admin: {
        description:
          "Короткая выжимка сразу после заголовка — например диапазоны цен. Подходит для статей рубрики «Рынок недвижимости»",
      },
      fields: [
        {
          name: "keyStats",
          label: "Пункты",
          type: "array",
          labels: { singular: "Пункт", plural: "Пункты" },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "label",
                  label: "Подпись",
                  type: "text",
                  required: true,
                  admin: { width: "50%", description: "Например «1-комнатные»" },
                },
                {
                  name: "value",
                  label: "Значение",
                  type: "text",
                  required: true,
                  admin: { width: "50%", description: "Например «35 000–50 000 ₽»" },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Вопросы и ответы — FAQ (необязательно)",
      admin: {
        description:
          "Выводится отдельным блоком в конце статьи и попадает в разметку FAQPage для расширенных сниппетов в Google/Яндексе",
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
      type: "collapsible",
      label: "Цитата в конце статьи (необязательно)",
      fields: [
        {
          name: "closingQuoteText",
          label: "Текст отзыва",
          type: "textarea",
        },
        {
          type: "row",
          fields: [
            {
              name: "closingQuoteAuthor",
              label: "Автор",
              type: "text",
              admin: { width: "50%" },
            },
            {
              name: "closingQuoteSource",
              label: "Источник",
              type: "text",
              admin: { width: "50%", description: "Например «Яндекс»" },
            },
          ],
        },
      ],
    },
    {
      name: "ctaLabel",
      label: "Текст кнопки в конце статьи",
      type: "text",
      defaultValue: "Обсудить свою ситуацию",
    },
    {
      name: "publishedAt",
      label: "Дата публикации",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: { pickerAppearance: "dayOnly" },
      },
    },
    {
      name: "isPublished",
      label: "Показывать на сайте",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Выключите, если статья ещё не готова к публикации",
      },
    },
  ],
};
