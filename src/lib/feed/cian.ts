// ЦИАН: cian.ru отдаёт капчу при прямом обращении, полную официальную
// документацию (cian.ru/xml_import/doc) свериться не удалось напрямую.
// Структура ниже собрана по нескольким независимым техническим
// referatam, которые сами ссылаются на официальный документ — базовый
// каркас (feed/feed_version/object, ExternalId, Category, Price/Value/
// Currency, Building/FloorsCount/MaterialType, Photos/Photo/Url) via
// перекрёстные источники подтверждён, но не 100%. Перед реальным
// запуском стоит свериться с полной официальной документацией.

import type { Listing } from "@/lib/listing-types";
import { AGENT_NAME, AGENT_PHONE } from "./constants";
import { cdata, escapeXml, listingPhotoUrls, richTextToPlainText } from "./helpers";

type CianCategory =
  | "flatSale"
  | "flatRent"
  | "houseSale"
  | "houseRent"
  | "landSale"
  | "landRent"
  | "commercialSale"
  | "commercialRent";

function toCianCategory(listing: Listing): CianCategory {
  const isRent = listing.dealType === "rent";
  switch (listing.propertyType) {
    case "kvartiry":
    case "novostroyki":
      return isRent ? "flatRent" : "flatSale";
    case "doma":
    case "dachi":
      return isRent ? "houseRent" : "houseSale";
    case "uchastki":
      return isRent ? "landRent" : "landSale";
    case "commercial":
      return isRent ? "commercialRent" : "commercialSale";
  }
}

function buildObject(listing: Listing): string {
  const category = toCianCategory(listing);
  const isLand = category === "landSale" || category === "landRent";
  const tags: string[] = [];

  tags.push(`<ExternalId>${listing.id}</ExternalId>`);
  tags.push(`<Category>${category}</Category>`);

  const description = richTextToPlainText(listing.description);
  if (description) tags.push(`<Description>${cdata(description)}</Description>`);

  const address = [listing.locality, listing.address].filter(Boolean).join(", ");
  tags.push(`<Address>${escapeXml(address)}</Address>`);

  if (typeof listing.lat === "number" && typeof listing.lng === "number") {
    tags.push(`<Coordinates><Lat>${listing.lat}</Lat><Lng>${listing.lng}</Lng></Coordinates>`);
  }

  tags.push(`<Phones><PhoneSchema><CountryCode>+7</CountryCode><Number>${escapeXml(AGENT_PHONE.replace(/^\+7/, ""))}</Number></PhoneSchema></Phones>`);
  tags.push(`<AgentName>${escapeXml(AGENT_NAME)}</AgentName>`);

  const rentPeriod = listing.dealType === "rent" ? "<PaymentPeriod>month</PaymentPeriod>" : "";
  tags.push(`<Price><Value>${listing.price}</Value><Currency>RUB</Currency>${rentPeriod}</Price>`);

  if (listing.cadastralNumber) {
    tags.push(`<CadastralNumber>${escapeXml(listing.cadastralNumber)}</CadastralNumber>`);
  }

  if (isLand) {
    if (typeof listing.areaLot === "number") {
      tags.push(`<LandArea>${listing.areaLot}</LandArea><LandAreaUnitType>sotka</LandAreaUnitType>`);
    }
  } else {
    if (typeof listing.areaTotal === "number") tags.push(`<TotalArea>${listing.areaTotal}</TotalArea>`);
    if (typeof listing.areaLiving === "number") tags.push(`<LivingArea>${listing.areaLiving}</LivingArea>`);
    if (typeof listing.areaKitchen === "number") tags.push(`<KitchenArea>${listing.areaKitchen}</KitchenArea>`);
    if (category === "houseSale" || category === "houseRent") {
      if (typeof listing.areaLot === "number") {
        tags.push(`<LandArea>${listing.areaLot}</LandArea><LandAreaUnitType>sotka</LandAreaUnitType>`);
      }
    }
    if (typeof listing.floor === "number") tags.push(`<FloorNumber>${listing.floor}</FloorNumber>`);

    if (category === "flatSale" || category === "flatRent") {
      if (listing.rooms === "studio") {
        tags.push("<FlatRoomsCount>0</FlatRoomsCount><RoomType>studio</RoomType>");
      } else if (listing.rooms) {
        const roomsCount = listing.rooms === "5plus" ? 5 : Number(listing.rooms);
        tags.push(`<FlatRoomsCount>${roomsCount}</FlatRoomsCount>`);
      }
    }

    if (typeof listing.totalFloors === "number" || listing.buildingType) {
      const floorsCount =
        typeof listing.totalFloors === "number" ? `<FloorsCount>${listing.totalFloors}</FloorsCount>` : "";
      const materialType = listing.buildingType ? `<MaterialType>${listing.buildingType}</MaterialType>` : "";
      tags.push(`<Building>${floorsCount}${materialType}</Building>`);
    }
  }

  if (listing.mortgageAvailable) tags.push("<MortgageAllowed>true</MortgageAllowed>");

  const photos = listingPhotoUrls(listing);
  if (photos.length) {
    tags.push(
      `<Photos>${photos
        .map((url, index) => `<Photo><Url>${escapeXml(url)}</Url><IsDefault>${index === 0 ? 1 : 0}</IsDefault></Photo>`)
        .join("")}</Photos>`,
    );
  }

  return `<object>${tags.join("")}</object>`;
}

export function buildCianFeedXml(listings: Listing[]): string {
  const objects = listings.map(buildObject).join("");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    "<feed>" +
    "<feed_version>2</feed_version>" +
    objects +
    "</feed>"
  );
}
