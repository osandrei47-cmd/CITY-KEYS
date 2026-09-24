// Формат YRL (Яндекс.Недвижимость), namespace 2010-06.
// Базовая структура сверена с реальным подтверждённо-рабочим фидом
// агентства (не с обрывочной документацией) — см. историю задачи. Поля
// аренды коммерческой недвижимости (deal-status, rent-pledge,
// commercial-building-type, parking, ceiling-height, electric-capacity,
// heating-supply, renovation, utilities-included, taxation-form/period в
// <price>, office-class, building-name, built-year, internet,
// ventilation, fire-alarm, air-conditioner, room-furniture,
// commercial-type) сверены
// отдельно и позже — уже с официальной документацией yandex.ru/support/
// realty/ru/feed/requirements-commercial.html (2026-09-24), см.
// комментарии рядом с соответствующим кодом ниже и в mapping.ts. Это
// единственный фид из четырёх (Avito/ЦИАН/Яндекс/Домклик), где новые
// арендные поля подтверждены документацией, а не являются рабочей
// гипотезой. Домклик переиспользует этот же генератор (их партнёрский
// кабинет принимает готовый фид в формате Яндекс), т.к. их нативная XML-
// схема закрыта логином — поэтому и остаётся закрытым вопрос, читает ли
// Домклик именно эти новые арендные теги так же, как Яндекс. При этом
// ручная форма размещения на my-rent.domclick.ru (проверено по
// скриншотам, не по самой схеме) для залога использует число, а не
// булево значение YRL — см. параметр target ниже и disclaimer у
// <rent-pledge>.

import type { Listing } from "@/lib/listing-types";
import { AGENT_NAME, AGENT_PHONE, DEFAULT_DISTRICT, DEFAULT_REGION, SITE_URL } from "./constants";
import { cdata, escapeXml, listingPhotoUrls, listingUrl, richTextToPlainText } from "./helpers";
import {
  hasRentalDeposit,
  parseRentalDepositAmount,
  toBuildingTypeRu,
  toCommercialBuildingTypeYandex,
  toCommercialRenovationYandex,
  toDealStatusYandex,
  toDealTypeRu,
  toIsoWithOffset,
  toRenovationRu,
  toWindowViewRu,
  toYandexCategory,
} from "./mapping";

export type YandexFeedTarget = "yandex" | "domclick";

function buildOffer(listing: Listing, target: YandexFeedTarget): string {
  const category = toYandexCategory(listing.propertyType);
  const isLandLike = category === "участок" || category === "дом с участком";
  const tags: string[] = [];

  const description = richTextToPlainText(listing.description);
  if (description) tags.push(`<description>${cdata(description)}</description>`);

  if (listing.cadastralNumber) {
    const tag = isLandLike ? "lot-cadastral-number" : "cadastral-number";
    tags.push(`<${tag}>${escapeXml(listing.cadastralNumber)}</${tag}>`);
  }

  tags.push(`<creation-date>${toIsoWithOffset(listing.createdAt)}</creation-date>`);
  tags.push(`<last-update-date>${toIsoWithOffset(listing.updatedAt)}</last-update-date>`);
  tags.push(`<url>${escapeXml(listingUrl(listing))}</url>`);

  tags.push(
    `<sales-agent><category>agency</category><url>${escapeXml(SITE_URL)}</url><name>${escapeXml(AGENT_NAME)}</name><phone>${escapeXml(AGENT_PHONE)}</phone></sales-agent>`,
  );

  // <period> у Яндекса принимает только день/day или месяц/month (сверено
  // с yandex.ru/support/realty/ru/feed/requirements-commercial.html) — у
  // нашего поля rentalPeriod есть ещё «в год» (нужно Avito/ЦИАН, там год
  // разрешён). Год в этот тег не пишем: подставить туда "month" исказило
  // бы цену (выглядело бы так, будто годовая сумма — это плата за месяц),
  // а собственного значения "year" в схеме Яндекса нет. Тег в этом случае
  // просто не выводится — площадка не узнает период для такого объекта,
  // но это лучше, чем соврать про месячную ставку.
  const pricePeriod = listing.dealType === "rent" && listing.rentalPeriod === "month" ? "<period>month</period>" : "";
  // <taxation-form> — тоже внутри <price>, только «НДС» (см. ниже про
  // vatIncluded) — «УСН» не пишем, для этого у нас нет отдельного признака.
  const taxationForm = listing.vatIncluded ? "<taxation-form>НДС</taxation-form>" : "";
  tags.push(`<price><value>${listing.price}</value><currency>RUR</currency>${pricePeriod}${taxationForm}</price>`);

  // <rent-pledge> — булево "внесён ли залог", НЕ сумма (сумма из
  // rentalDeposit в фид Яндекса не идёт — только в Avito/ЦИАН, где она
  // поддерживается как текст/число). Именно поэтому — сиблинг <price>,
  // а не значение внутри него: в документации отдельно оговорено "не
  // передавайте внутри <price>".
  //
  // ВАЖНО (Домклик): по скриншотам формы ручного размещения на
  // my-rent.domclick.ru поле «Залог» там — сумма в рублях, а не да/нет.
  // Их собственную XML-схему проверить нельзя (закрыта логином, см.
  // шапку файла), поэтому неизвестно, обрабатывает ли их импорт фида
  // <rent-pledge> так же, как их же ручная форма, или у них для XML-
  // приёмника вообще нет способа передать сумму. Раз булево значение —
  // единственное задокументированное (и оно же используется Яндексом,
  // которому Домклик, предположительно, зеркалит логику), отправляем
  // ОБА варианта для target="domclick": документированный <rent-pledge>
  // и вдобавок <rent-pledge-amount> с суммой, разобранной из текста —
  // непарсящийся XML-тег большинство приёмников просто игнорирует, так
  // что это не должно сломать сам <rent-pledge>. Тег <rent-pledge-amount>
  // — наше собственное название, ничем не подтверждено; при возможности
  // стоит уточнить у поддержки Домклика, какой тег/формат реально
  // ожидает их импортёр.
  if (listing.dealType === "rent" && listing.rentalDeposit) {
    const hasDeposit = hasRentalDeposit(listing.rentalDeposit);
    tags.push(`<rent-pledge>${hasDeposit}</rent-pledge>`);
    if (target === "domclick" && hasDeposit) {
      const depositAmount = parseRentalDepositAmount(listing.rentalDeposit);
      if (depositAmount !== null) tags.push(`<rent-pledge-amount>${depositAmount}</rent-pledge-amount>`);
    }
  }

  const locationParts: string[] = [];
  locationParts.push("<country>Россия</country>");
  locationParts.push(`<region>${escapeXml(DEFAULT_REGION)}</region>`);
  locationParts.push(`<district>${escapeXml(DEFAULT_DISTRICT)}</district>`);
  if (listing.locality) {
    locationParts.push(`<locality-name>${escapeXml(listing.locality)}</locality-name>`);
  }
  locationParts.push(`<address>${escapeXml(listing.address ?? "")}</address>`);
  if (typeof listing.lat === "number") locationParts.push(`<latitude>${listing.lat}</latitude>`);
  if (typeof listing.lng === "number") locationParts.push(`<longitude>${listing.lng}</longitude>`);
  tags.push(`<location>${locationParts.join("")}</location>`);

  if (category === "участок") {
    if (typeof listing.areaLot === "number") {
      tags.push(`<lot-area><unit>сотка</unit><value>${listing.areaLot}</value></lot-area>`);
    }
  } else {
    if (typeof listing.areaTotal === "number") {
      tags.push(`<area><unit>кв. м</unit><value>${listing.areaTotal}</value></area>`);
    }
    if (category === "дом с участком" && typeof listing.areaLot === "number") {
      tags.push(`<lot-area><unit>сотка</unit><value>${listing.areaLot}</value></lot-area>`);
    }
    if (category === "квартира") {
      if (typeof listing.areaLiving === "number") {
        tags.push(`<living-space><unit>кв. м</unit><value>${listing.areaLiving}</value></living-space>`);
      }
      if (typeof listing.areaKitchen === "number") {
        tags.push(`<kitchen-space><unit>кв. м</unit><value>${listing.areaKitchen}</value></kitchen-space>`);
      }
    }
  }

  if (category === "квартира") {
    if (listing.balcony === "none") {
      tags.push("<balcony/>");
    } else if (listing.balcony) {
      tags.push("<balcony>балкон</balcony>");
    }
  }

  if (listing.mortgageAvailable) tags.push("<mortgage>1</mortgage>");

  tags.push(`<type>${toDealTypeRu(listing.dealType)}</type>`);
  if (category !== "коммерческая") tags.push("<property-type>жилая</property-type>");
  tags.push(`<category>${category}</category>`);

  if (typeof listing.totalFloors === "number") tags.push(`<floors-total>${listing.totalFloors}</floors-total>`);
  if (typeof listing.floor === "number" && category !== "участок") {
    tags.push(`<floor>${listing.floor}</floor>`);
  }

  // <deal-status> — обязателен только для аренды, "для продажи элемент
  // передавать не нужно" (документация, см. комментарий у мапперов в
  // mapping.ts). Раньше здесь безусловно писалось "прямая продажа" для
  // ЛЮБОГО объекта (в т.ч. на продажу) — это не соответствовало ни одному
  // разрешённому значению схемы и было ошибкой. Данные для этого тега
  // есть только у коммерческой аренды (поле rentalType) — для жилой
  // аренды не гадаем и тег не выводим.
  if (category === "коммерческая") {
    const dealStatus = toDealStatusYandex(listing.rentalType);
    if (dealStatus) tags.push(`<deal-status>${dealStatus}</deal-status>`);
  }

  // <renovation> у коммерции — отдельный закрытый список значений (см.
  // toCommercialRenovationYandex), не совпадающий с обычным «Ремонтом»
  // жилых объектов — поэтому для коммерции берём finishType, а не
  // общее поле renovation (даже если оно тоже почему-то заполнено).
  if (category === "коммерческая") {
    const commercialRenovation = toCommercialRenovationYandex(listing.finishType);
    if (commercialRenovation) tags.push(`<renovation>${escapeXml(commercialRenovation)}</renovation>`);
  } else {
    const renovation = toRenovationRu(listing.renovation);
    if (renovation) tags.push(`<renovation>${escapeXml(renovation)}</renovation>`);
  }

  if (category !== "участок" && listing.rooms) {
    if (listing.rooms === "studio") {
      tags.push("<studio>1</studio>");
    } else {
      const roomsCount = listing.rooms === "5plus" ? 5 : Number(listing.rooms);
      tags.push(`<rooms>${roomsCount}</rooms>`);
    }
  }

  if (category === "квартира") {
    const windowView = toWindowViewRu(listing.view);
    if (windowView) tags.push(`<window-view>${escapeXml(windowView)}</window-view>`);
  }

  const buildingType = toBuildingTypeRu(listing.buildingType);
  if (buildingType) tags.push(`<building-type>${escapeXml(buildingType)}</building-type>`);

  if (listing.gasSupply) tags.push("<gas-supply>1</gas-supply>");
  if (listing.waterSupply) tags.push("<water-supply>1</water-supply>");
  if (listing.sewerageSupply) tags.push("<sewerage-supply>1</sewerage-supply>");
  if (listing.electricitySupply) tags.push("<electricity-supply>1</electricity-supply>");
  // Для коммерции <heating-supply> заполняется ниже из поля heating
  // (Нет/Центральное/Автономное) — чекбокс heatingSupply из блока
  // «Коммуникации» предназначен для домов/дач/участков, у коммерческого
  // объекта его в норме не должно быть заполнено, но на всякий случай не
  // даём двум источникам конкурировать за один и тот же тег.
  if (category !== "коммерческая" && listing.heatingSupply) tags.push("<heating-supply>1</heating-supply>");

  // ---------- Аренда: универсальные поля ----------
  // utilities-included — единственное поле общего блока «Аренда —
  // условия», у которого есть прямой аналог в документации Яндекса
  // (см. mapping.ts). rentalDeposit ушёл выше в <rent-pledge>, а
  // rentalPeriod — в <period> внутри <price>. У minRentalTerm аналога в
  // схеме нет — сверено с yandex.ru/support/realty/ru/feed/
  // requirements-commercial.html, там такого элемента нет; поле остаётся
  // только для внутренней логики сайта и для Avito/ЦИАН.
  if (listing.dealType === "rent" && listing.utilitiesIncluded) {
    tags.push("<utilities-included>1</utilities-included>");
  }

  // ---------- Аренда: только коммерческая недвижимость ----------
  // Сверено с yandex.ru/support/realty/ru/feed/requirements-commercial.html
  // (2026-09-24) — единственный блок этого файла с подтверждённым
  // источником для новых полей. rentalHolidays, operatingExpensesIncluded,
  // distanceFromRoad, multiFloor, partialRentAllowed, commissionSharing —
  // без аналога в этой документации, в фид Яндекса/Домклика не идут
  // (остаются во внутренней логике сайта и, где применимо, в Avito/ЦИАН).
  if (category === "коммерческая") {
    const commercialBuildingType = toCommercialBuildingTypeYandex(listing.commercialBuildingType);
    if (commercialBuildingType) {
      tags.push(`<commercial-building-type>${escapeXml(commercialBuildingType)}</commercial-building-type>`);
    }
    // <parking> у Яндекса — булево "охраняемая парковка есть", а не три
    // варианта нашего поля. Прямого соответствия нет: «В здании» считаем
    // охраняемой (true), «Нет»/«На улице» — нет (false).
    if (listing.parking) {
      tags.push(`<parking>${listing.parking === "indoor"}</parking>`);
    }
    if (typeof listing.ceilingHeight === "number") {
      tags.push(`<ceiling-height>${listing.ceilingHeight}</ceiling-height>`);
    }
    if (typeof listing.electricalPower === "number") {
      tags.push(`<electric-capacity>${listing.electricalPower}</electric-capacity>`);
    }
    if (listing.heating) tags.push(`<heating-supply>${listing.heating !== "none"}</heating-supply>`);

    // Поля ниже — по реальной форме ручного размещения объекта в аренду
    // на my-rent.domclick.ru (скриншоты формы), которые оказались ещё и
    // задокументированы у Яндекса напрямую — двойное подтверждение.
    if (listing.businessCenterClass) {
      tags.push(`<office-class>${escapeXml(listing.businessCenterClass)}</office-class>`);
    }
    if (listing.buildingName) tags.push(`<building-name>${escapeXml(listing.buildingName)}</building-name>`);
    if (typeof listing.buildYear === "number") tags.push(`<built-year>${listing.buildYear}</built-year>`);
    if (listing.hasInternet) tags.push("<internet>true</internet>");
    if (listing.hasVentilation) tags.push("<ventilation>true</ventilation>");
    if (listing.hasFireAlarm) tags.push("<fire-alarm>true</fire-alarm>");
    if (listing.hasAirConditioner) tags.push("<air-conditioner>true</air-conditioner>");
    if (listing.hasFurniture) tags.push("<room-furniture>true</room-furniture>");
    // <commercial-type> в документации — ОБЯЗАТЕЛЬНЫЙ элемент: категория
    // объекта (office/retail/warehouse/…), может повторяться, если у
    // объекта несколько назначений. Раньше поля для базовой категории не
    // было вообще — теперь это commercialCategory (обязательно в Payload
    // для propertyType === "commercial", см. validate в Listings.ts).
    // legalAddressProvided добавляет второй тег со значением "legal
    // address" (документированный доп. вариант именно для аренды) —
    // ПОВЕРХ базовой категории, а не вместо неё.
    if (listing.commercialCategory) {
      tags.push(`<commercial-type>${escapeXml(listing.commercialCategory)}</commercial-type>`);
    }
    if (listing.legalAddressProvided) tags.push("<commercial-type>legal address</commercial-type>");
  }

  for (const photoUrl of listingPhotoUrls(listing)) {
    tags.push(`<image>${escapeXml(photoUrl)}</image>`);
  }

  return `<offer internal-id="${listing.id}">${tags.join("")}</offer>`;
}

export function buildYandexFeedXml(listings: Listing[], target: YandexFeedTarget = "yandex"): string {
  const generationDate = toIsoWithOffset(new Date());
  const offers = listings.map((listing) => buildOffer(listing, target)).join("");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<realty-feed xmlns="http://webmaster.yandex.ru/schemas/feed/realty/2010-06">' +
    `<generation-date>${generationDate}</generation-date>` +
    offers +
    "</realty-feed>"
  );
}
