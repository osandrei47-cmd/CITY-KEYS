import type { CollectionConfig } from "payload";

export const Listings: CollectionConfig = {
  slug: "listings",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "propertyType", "price", "status"],
  },
  access: {
    // Объекты видны на публичном сайте без авторизации (каталог)
    read: () => true,
    // Добавлять/менять/снимать с публикации может только администратор
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    // ---------- Основное ----------
    {
      name: "title",
      label: "Заголовок / название объекта",
      type: "text",
      required: true,
    },
    {
      name: "propertyType",
      label: "Тип недвижимости",
      type: "select",
      required: true,
      options: [
        { label: "Квартира", value: "kvartiry" },
        { label: "Дом / коттедж", value: "doma" },
        { label: "Дача", value: "dachi" },
        { label: "Коммерческая недвижимость", value: "commercial" },
        { label: "Новостройка", value: "novostroyki" },
        { label: "Земельный участок", value: "uchastki" },
      ],
    },
    {
      name: "cadastralNumber",
      label: "Кадастровый номер",
      type: "text",
    },
    {
      name: "price",
      label: "Цена, ₽",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "address",
      label: "Адрес / район",
      type: "text",
      required: true,
    },
    {
      name: "locality",
      label: "Населённый пункт",
      type: "text",
      admin: {
        description:
          "Город/посёлок/деревня отдельно от улицы — нужно для фидов Авито/Яндекс/ЦИАН/Домклик (например «Кингисепп», «посёлок Усть-Луга», «деревня Кошкино»)",
      },
    },

    // ---------- Параметры ----------
    {
      type: "collapsible",
      label: "Параметры",
      fields: [
        {
          name: "rooms",
          label: "Количество комнат",
          type: "select",
          options: [
            { label: "Студия", value: "studio" },
            { label: "1", value: "1" },
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
            { label: "5+", value: "5plus" },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "areaTotal",
              label: "Площадь общая, м²",
              type: "number",
              min: 0,
              admin: {
                width: "33%",
                condition: (data) => data?.propertyType !== "uchastki",
                description: "Площадь здания — для участка без построек не заполняется, см. «Площадь участка» ниже",
              },
            },
            {
              name: "areaLiving",
              label: "Площадь жилая, м²",
              type: "number",
              min: 0,
              admin: { width: "33%" },
            },
            {
              name: "areaKitchen",
              label: "Площадь кухни, м²",
              type: "number",
              min: 0,
              admin: { width: "33%" },
            },
          ],
        },
        {
          name: "areaLot",
          label: "Площадь участка, соток",
          type: "number",
          min: 0,
          admin: {
            condition: (data) => ["doma", "dachi", "uchastki"].includes(data?.propertyType),
            description: "Площадь земельного участка в сотках (1 сотка = 100 м²) — отдельно от площади дома",
          },
        },
        {
          type: "row",
          fields: [
            {
              name: "floor",
              label: "Этаж",
              type: "number",
              admin: { width: "50%" },
            },
            {
              name: "totalFloors",
              label: "Этажность дома",
              type: "number",
              admin: { width: "50%" },
            },
          ],
        },
        {
          name: "bathroom",
          label: "Санузел",
          type: "select",
          options: [
            { label: "Совмещённый", value: "combined" },
            { label: "Раздельный", value: "separate" },
            { label: "Более одного", value: "multiple" },
          ],
        },
        {
          name: "balcony",
          label: "Балкон / лоджия",
          type: "select",
          options: [
            { label: "Нет", value: "none" },
            { label: "1", value: "1" },
            { label: "2", value: "2" },
            { label: "3 и более", value: "3plus" },
          ],
        },
        {
          name: "renovation",
          label: "Ремонт",
          type: "select",
          options: [
            { label: "Без ремонта", value: "none" },
            { label: "Косметический", value: "cosmetic" },
            { label: "Евроремонт", value: "euro" },
            { label: "Дизайнерский", value: "designer" },
          ],
        },
        {
          name: "hasReplanning",
          label: "Есть перепланировка",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "view",
          label: "Вид из окна",
          type: "select",
          hasMany: true,
          options: [
            { label: "Двор", value: "yard" },
            { label: "Водоём", value: "water" },
            { label: "Улица", value: "street" },
            { label: "Парк", value: "park" },
            { label: "Лес", value: "forest" },
          ],
        },
      ],
    },

    // ---------- Контент ----------
    // ВНИМАНИЕ: photos + droneVideo + leads (join ниже) — три relationship-
    // образных поля на одном коллекшене. Payload заполняет их параллельно
    // через Promise.all в afterRead (node_modules/payload/dist/fields/hooks/
    // afterRead/index.js), но все они используют один и тот же transaction-
    // scoped клиент Postgres (@payloadcms/drizzle/transactions/beginTransaction.js)
    // — один pg-клиент не может выполнять два запроса одновременно. Иногда
    // это роняет транзакцию запроса ("current transaction is aborted..."),
    // из-за чего drawer "Выбрать из существующих" у Фотографий может не
    // открыться с первой попытки — обычно помогает просто открыть его ещё
    // раз. Это подтверждённый открытый баг в самом Payload (не в нашем
    // конфиге) — https://github.com/payloadcms/payload/issues/16333, наш
    // конкретный триггер (join + upload на одном коллекшене) там ещё не
    // описан. Фикса на нашей стороне нет — ждём апстрим.
    {
      name: "description",
      label: "Описание",
      type: "richText",
    },
    {
      name: "photos",
      label: "Фотографии",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    {
      name: "droneVideo",
      label: "Видео с дрона",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Если загружено — на сайте показывается видео-превью вместо фото и бейдж «Видео с дрона» в каталоге",
      },
    },

    // ---------- Статус ----------
    {
      name: "status",
      label: "Статус",
      type: "select",
      required: true,
      defaultValue: "for-sale",
      options: [
        { label: "В продаже", value: "for-sale" },
        { label: "Забронирован", value: "reserved" },
        { label: "Продан / сдан", value: "sold" },
      ],
    },

    {
      name: "leads",
      label: "Заявки по объекту",
      type: "join",
      collection: "leads",
      on: "listing",
      defaultSort: "-createdAt",
      admin: {
        allowCreate: true,
        defaultColumns: ["name", "phone", "dealStage", "createdAt"],
      },
    },

    // ---------- Служебное: фильтры каталога и будущие фиды ----------
    {
      type: "collapsible",
      label: "Служебное — для каталога и фидов (Авито / Яндекс.Недвижимость / ЦИАН)",
      admin: {
        description:
          "Этих полей не было в исходном списке, но без них не заведутся фильтры «Купить/Снять», «Можно в ипотеку» и будущая выгрузка фидов — добавлены заранее, чтобы не переделывать схему позже.",
      },
      fields: [
        {
          name: "dealType",
          label: "Тип сделки",
          type: "select",
          required: true,
          defaultValue: "sale",
          options: [
            { label: "Продажа", value: "sale" },
            { label: "Аренда", value: "rent" },
          ],
        },
        {
          name: "buildingType",
          label: "Тип дома",
          type: "select",
          options: [
            { label: "Кирпичный", value: "brick" },
            { label: "Панельный", value: "panel" },
            { label: "Монолитный", value: "monolith" },
            { label: "Блочный", value: "block" },
            { label: "Деревянный", value: "wood" },
          ],
        },
        {
          name: "mortgageAvailable",
          label: "Можно в ипотеку",
          type: "checkbox",
          defaultValue: false,
        },
        {
          type: "row",
          fields: [
            {
              name: "lat",
              label: "Широта",
              type: "number",
              admin: { width: "50%", description: "Для карты каталога и координат в фидах" },
            },
            {
              name: "lng",
              label: "Долгота",
              type: "number",
              admin: { width: "50%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "publishAvito",
              label: "Публиковать на Авито",
              type: "checkbox",
              defaultValue: true,
              admin: { width: "25%" },
            },
            {
              name: "publishCian",
              label: "Публиковать на ЦИАН",
              type: "checkbox",
              defaultValue: true,
              admin: { width: "25%" },
            },
            {
              name: "publishDomclick",
              label: "Публиковать на Домклик",
              type: "checkbox",
              defaultValue: true,
              admin: { width: "25%" },
            },
            {
              name: "publishYandex",
              label: "Публиковать на Яндекс.Недвижимость",
              type: "checkbox",
              defaultValue: true,
              admin: { width: "25%" },
            },
          ],
        },
      ],
    },

    // ---------- Коммуникации: только для домов / дач / участков ----------
    {
      type: "collapsible",
      label: "Коммуникации (для домов, дач, участков)",
      admin: {
        description:
          "Заполняется только для загородной недвижимости — фид Яндекс.Недвижимости запрашивает эти признаки для домов и участков. Для квартир не заполняется.",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "gasSupply",
              label: "Газ",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "20%" },
            },
            {
              name: "waterSupply",
              label: "Вода",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "20%" },
            },
            {
              name: "sewerageSupply",
              label: "Канализация",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "20%" },
            },
            {
              name: "electricitySupply",
              label: "Электричество",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "20%" },
            },
            {
              name: "heatingSupply",
              label: "Отопление",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "20%" },
            },
          ],
        },
      ],
    },
  ],
};
