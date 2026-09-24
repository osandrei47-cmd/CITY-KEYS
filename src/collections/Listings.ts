import type { CollectionConfig } from "payload";
import { publishListingToVk } from "@/lib/vk";
import type { Listing } from "@/payload-types";

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
  endpoints: [
    {
      // Кнопка «Опубликовать в ВК» в карточке объекта — см.
      // src/components/admin/VkPublishPanel.tsx и VkPublishButton.tsx.
      path: "/:id/vk-publish",
      method: "post",
      handler: async (req) => {
        if (req.user?.role !== "admin") {
          return Response.json({ error: "Недостаточно прав" }, { status: 403 });
        }

        const id = req.routeParams?.id as string;
        const listing = await req.payload
          .findByID({ collection: "listings", id, depth: 1 })
          .catch(() => null);
        if (!listing) {
          return Response.json({ error: "Объект не найден" }, { status: 404 });
        }

        try {
          const { postId } = await publishListingToVk(listing, req.payload);
          const vkPublishedAt = new Date().toISOString();
          await req.payload.update({
            collection: "listings",
            id,
            data: { vkPublishedAt, vkPostId: String(postId) },
          });
          return Response.json({ ok: true, postId, vkPublishedAt });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Неизвестная ошибка VK API";
          return Response.json({ error: message }, { status: 502 });
        }
      },
    },
  ],
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
      label: "Видео",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Если загружено — на странице объекта появляется блок с видео (после фото) и бейдж «Видео» в каталоге. Подходит для любого видео объекта, не только с дрона",
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

    // ---------- Публикация в ВК ----------
    // vkPublishedAt/vkPostId заполняются автоматически сервером после
    // успешной публикации (см. endpoints выше) — руками их не редактируют,
    // отсюда readOnly + hidden и отдельная панель с кнопкой (vkPublishPanel).
    {
      name: "vkPublishedAt",
      label: "Опубликовано в ВК",
      type: "date",
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "vkPostId",
      label: "ID поста ВК",
      type: "text",
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "vkPublishPanel",
      label: "Публикация в ВК",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/VkPublishPanel#VkPublishPanel",
        },
      },
    },
    {
      // Маркетинговый бейдж на карточке лота (сейчас используется только на
      // странице коттеджного посёлка /proekty/luga-park). «Без бейджа» —
      // просто не выбирать значение.
      name: "badge",
      label: "Бейдж на карточке лота",
      type: "select",
      options: [
        { label: "Старт продаж", value: "start" },
        { label: "Последние участки", value: "last" },
      ],
      admin: {
        description:
          "Показывается на карточке лота на странице посёлка «Луга Парк». Для обычных объектов каталога оставить пустым.",
      },
    },
    {
      // Привязка лота к странице проекта (/proekty/slug). Сейчас используется
      // страницей коттеджного посёлка «Луга Парк», чтобы собрать свои 6 лотов.
      // Для обычных объектов каталога оставить пустым.
      name: "project",
      label: "Проект (коттеджный посёлок)",
      type: "relationship",
      relationTo: "projects",
      admin: {
        description:
          "Заполняется только для лотов, которые должны показываться на странице проекта в разделе «Проекты». На попадание объекта в общий каталог и фиды не влияет.",
      },
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
          name: "residentialComplex",
          label: "Жилой комплекс",
          type: "relationship",
          relationTo: "residential-complexes",
          admin: {
            description:
              "Заполняется только для планировок в новостройках — привязывает объект к странице ЖК (/zhk/slug). Для обычных объектов каталога оставить пустым.",
          },
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

    // ---------- Аренда: общие условия (для любого типа сделки «Аренда») ----------
    {
      type: "collapsible",
      label: "Аренда — условия",
      admin: {
        condition: (data) => data?.dealType === "rent",
        description:
          "Показывается только для объектов с типом сделки «Аренда» (см. «Тип сделки» в блоке «Служебное» выше) — попадает в фиды Авито/ЦИАН/Яндекс/Домклик рядом с ценой.",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "rentalPeriod",
              label: "Период арендной платы",
              type: "select",
              defaultValue: "month",
              options: [
                { label: "В месяц", value: "month" },
                { label: "В год", value: "year" },
              ],
              admin: {
                width: "34%",
                description: "Уточняет уже существующее поле «Цена, ₽» выше — само значение цены не меняет",
              },
            },
            {
              name: "minRentalTerm",
              label: "Минимальный срок аренды, мес.",
              type: "number",
              min: 0,
              admin: { width: "33%" },
            },
            {
              name: "utilitiesIncluded",
              label: "Коммунальные услуги включены в цену",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "33%" },
            },
          ],
        },
        {
          name: "rentalDeposit",
          label: "Залог",
          type: "text",
          admin: {
            description:
              "Сумма залога (например «60 000 ₽») или «Без залога» — свободный текст, т.к. у объектов разный формат условий",
          },
        },
      ],
    },

    // ---------- Аренда: только для коммерческой недвижимости ----------
    {
      type: "collapsible",
      label: "Коммерческая недвижимость — параметры аренды и помещения",
      admin: {
        condition: (data) => data?.propertyType === "commercial",
        description:
          "Показывается только для объектов с типом «Коммерческая недвижимость». Поля нужны в основном для аренды, но часть площадок запрашивает их и для объявлений о продаже — поэтому условие только по типу объекта, без учёта типа сделки.",
      },
      fields: [
        {
          // Обязательный элемент <commercial-type> в фиде Яндекса/Домклик
          // (см. yandex.ts) — значения ровно из документации
          // yandex.ru/support/realty/ru/feed/requirements-commercial.html.
          // Там элемент может повторяться (несколько назначений объекта),
          // у нас пока select (одно значение) — этого достаточно для
          // текущей базы; если понадобится несколько назначений сразу,
          // можно будет переключить на hasMany без потери данных (значения
          // те же строки).
          //
          // required не ставим статичным true, т.к. поле нужно только для
          // коммерции — вместо этого validate ниже требует значение именно
          // когда propertyType === "commercial" (и только тогда потребует
          // непустое значение в форме админки, где data всегда содержит
          // весь документ). Это защищает от повторения ситуации, когда
          // коммерческий объект был сохранён вообще без категории.
          name: "commercialCategory",
          label: "Категория объекта",
          type: "select",
          options: [
            { label: "Автосервис", value: "auto repair" },
            { label: "Готовый бизнес", value: "business" },
            { label: "Помещение свободного назначения", value: "free purpose" },
            { label: "Гостиница", value: "hotel" },
            { label: "Земли коммерческого назначения", value: "land" },
            { label: "Производственное помещение", value: "manufacturing" },
            { label: "Офисное помещение", value: "office" },
            { label: "Общепит", value: "public catering" },
            { label: "Торговое помещение", value: "retail" },
            { label: "Склад", value: "warehouse" },
          ],
          validate: (value: string | null | undefined, { data }: { data: Partial<Listing> }) => {
            if (data?.propertyType === "commercial" && !value) {
              return "Обязательно для коммерческой недвижимости — без категории объект не попадёт в фид Яндекса/Домклик корректно";
            }
            return true;
          },
          admin: {
            description:
              "Обязательно для коммерческой недвижимости. ВАЖНО: проверка обязательности смотрит на «Тип недвижимости» из текущей формы — при точечном обновлении через API/скрипты, где в запросе нет поля propertyType, проверка не сработает (это ограничение Payload, не наше решение); через админку сохраняется всегда весь документ, там защита работает.",
          },
        },
        {
          type: "row",
          fields: [
            {
              name: "rentalType",
              label: "Тип аренды",
              type: "select",
              options: [
                { label: "Прямая", value: "direct" },
                { label: "Субаренда", value: "sublease" },
              ],
              admin: { width: "50%" },
            },
            {
              name: "commercialBuildingType",
              label: "Тип здания",
              type: "select",
              options: [
                { label: "Бизнес-центр", value: "business-center" },
                { label: "Торговый центр", value: "shopping-center" },
                { label: "Отдельно стоящее здание", value: "detached-building" },
                { label: "Встроенное помещение в жилом доме", value: "residential-building" },
                { label: "Складской комплекс", value: "warehouse" },
              ],
              admin: {
                width: "50%",
                description:
                  "Не путать с полем «Тип дома» в блоке «Служебное» выше (материал стен для жилых объектов) — здесь тип здания для коммерции. Варианты — ровно список из официальной документации Яндекс.Недвижимости (commercial-building-type), подобраны так, чтобы однозначно мапиться в фид без потери смысла; отдельно стоящее административное или производственное здание — тоже «Отдельно стоящее здание»",
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "distanceFromRoad",
              label: "Удалённость от дороги",
              type: "select",
              options: [
                { label: "Первая линия", value: "first-line" },
                { label: "Вторая линия и дальше", value: "second-line" },
              ],
              admin: { width: "50%" },
            },
            {
              name: "parking",
              label: "Парковка",
              type: "select",
              options: [
                { label: "Нет", value: "none" },
                { label: "На улице", value: "street" },
                { label: "В здании", value: "indoor" },
              ],
              admin: { width: "50%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "ceilingHeight",
              label: "Высота потолков, м",
              type: "number",
              min: 0,
              admin: { width: "50%" },
            },
            {
              name: "electricalPower",
              label: "Мощность электросети, кВт",
              type: "number",
              min: 0,
              admin: { width: "50%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "finishType",
              label: "Отделка",
              type: "select",
              options: [
                { label: "Без отделки", value: "none" },
                { label: "Чистовая", value: "finished" },
                { label: "Офисная", value: "office" },
              ],
              admin: { width: "50%" },
            },
            {
              name: "heating",
              label: "Отопление",
              type: "select",
              options: [
                { label: "Нет", value: "none" },
                { label: "Центральное", value: "central" },
                { label: "Автономное", value: "autonomous" },
              ],
              admin: {
                width: "50%",
                description:
                  "Не путать с чекбоксом «Отопление» в блоке «Коммуникации» ниже (тот — бинарный признак для домов/дач/участков)",
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "rentalHolidays",
              label: "Арендные каникулы",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "25%" },
            },
            {
              name: "operatingExpensesIncluded",
              label: "Эксплуатационные расходы включены",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "25%" },
            },
            {
              name: "multiFloor",
              label: "Несколько этажей",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "25%" },
            },
            {
              name: "partialRentAllowed",
              label: "Можно арендовать часть",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "25%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "commissionSharing",
              label: "Поделить комиссию с другим брокером",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "50%" },
            },
            {
              name: "vatIncluded",
              label: "НДС включён",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "50%" },
            },
          ],
        },

        // Поля ниже добавлены по реальной форме ручного размещения
        // объекта в аренду на my-rent.domclick.ru (скриншоты формы) —
        // они совпадают с отдельными полями в документации Яндекса
        // (office-class/building-name/built-year/internet/ventilation/
        // fire-alarm/air-conditioner/room-furniture), см. mapping.ts и
        // yandex.ts.
        {
          type: "row",
          fields: [
            {
              name: "businessCenterClass",
              label: "Класс БЦ/ТЦ",
              type: "select",
              options: [
                { label: "A", value: "A" },
                { label: "A+", value: "A+" },
                { label: "B", value: "B" },
                { label: "B+", value: "B+" },
                { label: "C", value: "C" },
                { label: "C+", value: "C+" },
              ],
              admin: { width: "25%" },
            },
            {
              name: "buildingName",
              label: "Название центра",
              type: "text",
              admin: { width: "40%", description: "Например «Невский 38» — название бизнес- или торгового центра" },
            },
            {
              name: "buildYear",
              label: "Год постройки",
              type: "number",
              min: 1700,
              admin: { width: "35%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "hasInternet",
              label: "Интернет",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "33%" },
            },
            {
              name: "hasVentilation",
              label: "Вентиляция",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "33%" },
            },
            {
              name: "hasFireAlarm",
              label: "Пожарная сигнализация",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "33%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "hasAirConditioner",
              label: "Кондиционер",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "33%" },
            },
            {
              name: "hasFurniture",
              label: "Мебель",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "33%" },
            },
            {
              name: "legalAddressProvided",
              label: "Предоставляется юридический адрес",
              type: "checkbox",
              defaultValue: false,
              admin: {
                width: "33%",
                description:
                  "У Яндекса нет отдельного тега для этого признака — при включении добавляет значение «legal address» к перечню назначений объекта (тег commercial-type), см. комментарий в yandex.ts",
              },
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
