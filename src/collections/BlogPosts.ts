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
    description:
      "Стандарт статьи CITY KEYS — 8 блоков по порядку: живой вход → прямой ответ → локальная глубина (Кингисепп/Ленобласть) → авторский опыт/наблюдение → цифры → авторская позиция → практический вывод (чек-лист) → живой финал с приглашением. Обязательно: TL;DR сразу после даты/автора (поле «Краткое резюме» ниже), FAQ для вопросов, которые логично вынести отдельно (попадает в разметку FAQPage для поисковиков), ссылка на релевантную услугу из /uslugi, если по смыслу подходит, и блок «Методология» прямо в тексте статьи (последним абзацем или заголовком) — с источником данных и датой их актуальности.",
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
        description:
          "Латиницей, без пробелов и без слэшей — например «sdelka-distantsionno». Статья будет по адресу /blog/slug",
      },
      hooks: {
        // Реальный случай: slug статьи «Семейная ипотека...» был сохранён
        // как "/semeinaja-ipoteka-oktiabr2026" (с ведущим слэшем) — из-за
        // этого ссылка карточки на /blog вела на "/blog//..." (двойной
        // слэш), а прямой переход по «чистому» /blog/semeinaja-... не
        // находил статью (slug в базе не совпадал) → 404 при видимой на
        // /blog карточке. Подчищаем самые частые варианты этой опечатки
        // автоматически, не трогая сам текст слага иначе.
        beforeValidate: [
          ({ value }) => (typeof value === "string" ? value.trim().replace(/^\/+|\/+$/g, "").toLowerCase() : value),
        ],
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
      admin: {
        description:
          "В редакторе НЕТ настоящих таблиц — не пишите таблицу текстом со знаками «|», она не отрендерится как таблица на сайте. Для табличных цифр используйте поле «Ключевые цифры вверху статьи» или «Таблица сравнения» ниже. Разметка **жирный**/*курсив* markdown-синтаксисом тоже не сработает — выделяйте текст через панель форматирования редактора (выделите текст → появится тулбар).",
      },
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
          "Например «Тип квартиры / Диапазон цен / Рыночный ориентир» — выводится в начале текста статьи, до основного описания",
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
