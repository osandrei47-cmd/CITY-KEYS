// ВНИМАНИЕ: самый низкий уровень уверенности из четырёх фидов.
// avito.ru недоступен для прямой сверки (домен заблокирован для фетча),
// оф. шаблон отдаётся только из личного кабинета агентства и требует
// согласования с менеджером Авито. Структура ниже — по устоявшемуся
// отраслевому формату (Ads formatVersion=3 / target=Avito.ru), которым
// пользуются все CRM на рынке, но перед реальным запуском её нужно
// свериться с шаблоном из личного кабинета Авито.

import { buildingTypeLabels, renovationLabels, type Listing } from "@/lib/listing-types";
import { AGENT_NAME, AGENT_PHONE } from "./constants";
import { cdata, escapeXml, listingPhotoUrls, richTextToPlainText } from "./helpers";

type AvitoCategory =
  | "Квартиры"
  | "Дома, дачи, коттеджи"
  | "Земельные участки"
  | "Коммерческая недвижимость";

function toAvitoCategory(propertyType: Listing["propertyType"]): AvitoCategory {
  switch (propertyType) {
    case "kvartiry":
    case "novostroyki":
      return "Квартиры";
    case "doma":
    case "dachi":
      return "Дома, дачи, коттеджи";
    case "uchastki":
      return "Земельные участки";
    case "commercial":
      return "Коммерческая недвижимость";
  }
}

function toOperationType(dealType: Listing["dealType"]): "Продам" | "Сдам" {
  return dealType === "rent" ? "Сдам" : "Продам";
}

function toRoomsCount(rooms: Listing["rooms"]): string | null {
  if (!rooms) return null;
  if (rooms === "studio") return "Студия";
  if (rooms === "5plus") return "5";
  return rooms;
}

function buildAd(listing: Listing): string {
  const category = toAvitoCategory(listing.propertyType);
  const isLand = category === "Земельные участки";
  const tags: string[] = [];

  tags.push(`<Id>${listing.id}</Id>`);
  tags.push(`<DateBegin>${new Date(listing.createdAt).toISOString()}</DateBegin>`);
  tags.push(`<Category>${escapeXml(category)}</Category>`);
  tags.push(`<OperationType>${toOperationType(listing.dealType)}</OperationType>`);

  const address = [listing.locality, listing.address].filter(Boolean).join(", ");
  tags.push(`<Address>${escapeXml(address)}</Address>`);

  if (typeof listing.lat === "number") tags.push(`<Latitude>${listing.lat}</Latitude>`);
  if (typeof listing.lng === "number") tags.push(`<Longitude>${listing.lng}</Longitude>`);

  const description = richTextToPlainText(listing.description);
  if (description) tags.push(`<Description>${cdata(description)}</Description>`);

  tags.push(`<Price>${listing.price}</Price>`);
  tags.push(`<ContactPhone>${escapeXml(AGENT_PHONE)}</ContactPhone>`);
  tags.push(`<ManagerName>${escapeXml(AGENT_NAME)}</ManagerName>`);

  if (listing.cadastralNumber) {
    tags.push(`<CadastralNumber>${escapeXml(listing.cadastralNumber)}</CadastralNumber>`);
  }

  if (isLand) {
    if (typeof listing.areaLot === "number") tags.push(`<LandArea>${listing.areaLot}</LandArea>`);
    tags.push("<LandAreaUnit>сотка</LandAreaUnit>");
  } else {
    if (typeof listing.areaTotal === "number") tags.push(`<Square>${listing.areaTotal}</Square>`);
    if (typeof listing.areaLiving === "number") tags.push(`<LivingSpace>${listing.areaLiving}</LivingSpace>`);
    if (typeof listing.areaKitchen === "number") tags.push(`<KitchenSpace>${listing.areaKitchen}</KitchenSpace>`);
    if (category === "Дома, дачи, коттеджи" && typeof listing.areaLot === "number") {
      tags.push(`<LandArea>${listing.areaLot}</LandArea><LandAreaUnit>сотка</LandAreaUnit>`);
    }
    if (typeof listing.floor === "number") tags.push(`<Floor>${listing.floor}</Floor>`);
    if (typeof listing.totalFloors === "number") tags.push(`<Floors>${listing.totalFloors}</Floors>`);

    const roomsCount = toRoomsCount(listing.rooms);
    if (roomsCount) tags.push(`<RoomsCount>${escapeXml(roomsCount)}</RoomsCount>`);

    if (listing.buildingType) {
      tags.push(`<HouseType>${escapeXml(buildingTypeLabels[listing.buildingType])}</HouseType>`);
    }
    if (listing.renovation) {
      tags.push(`<Renovation>${escapeXml(renovationLabels[listing.renovation])}</Renovation>`);
    }
    if (listing.balcony === "none") {
      tags.push("<Balcony>Нет</Balcony>");
    } else if (listing.balcony) {
      tags.push("<Balcony>Балкон</Balcony>");
    }
    if (category === "Квартиры") {
      tags.push(
        `<MarketType>${listing.propertyType === "novostroyki" ? "Новостройка" : "Вторичный рынок"}</MarketType>`,
      );
    }
  }

  const photos = listingPhotoUrls(listing);
  if (photos.length) {
    tags.push(`<Images>${photos.map((url) => `<Image url="${escapeXml(url)}"/>`).join("")}</Images>`);
  }

  return `<Ad>${tags.join("")}</Ad>`;
}

export function buildAvitoFeedXml(listings: Listing[]): string {
  const ads = listings.map(buildAd).join("");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Ads formatVersion="3" target="Avito.ru">' +
    ads +
    "</Ads>"
  );
}
