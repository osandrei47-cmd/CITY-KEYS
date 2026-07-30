// Формат YRL (Яндекс.Недвижимость), namespace 2010-06.
// Структура сверена с реальным подтверждённо-рабочим фидом агентства
// (не с обрывочной документацией) — см. историю задачи. Домклик пока
// переиспользует этот же генератор (их партнёрский кабинет принимает
// готовый фид в формате Яндекс), т.к. их нативная схема закрыта логином.

import type { Listing } from "@/lib/listing-types";
import { AGENT_NAME, AGENT_PHONE, DEFAULT_DISTRICT, DEFAULT_REGION, SITE_URL } from "./constants";
import { cdata, escapeXml, listingPhotoUrls, listingUrl, richTextToPlainText } from "./helpers";
import {
  toBuildingTypeRu,
  toDealTypeRu,
  toIsoWithOffset,
  toRenovationRu,
  toWindowViewRu,
  toYandexCategory,
} from "./mapping";

function buildOffer(listing: Listing): string {
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

  const pricePeriod = listing.dealType === "rent" ? "<period>месяц</period>" : "";
  tags.push(`<price><value>${listing.price}</value><currency>RUR</currency>${pricePeriod}</price>`);

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

  tags.push("<deal-status>прямая продажа</deal-status>");

  const renovation = toRenovationRu(listing.renovation);
  if (renovation) tags.push(`<renovation>${escapeXml(renovation)}</renovation>`);

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
  if (listing.heatingSupply) tags.push("<heating-supply>1</heating-supply>");

  for (const photoUrl of listingPhotoUrls(listing)) {
    tags.push(`<image>${escapeXml(photoUrl)}</image>`);
  }

  return `<offer internal-id="${listing.id}">${tags.join("")}</offer>`;
}

export function buildYandexFeedXml(listings: Listing[]): string {
  const generationDate = toIsoWithOffset(new Date());
  const offers = listings.map(buildOffer).join("");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<realty-feed xmlns="http://webmaster.yandex.ru/schemas/feed/realty/2010-06">' +
    `<generation-date>${generationDate}</generation-date>` +
    offers +
    "</realty-feed>"
  );
}
