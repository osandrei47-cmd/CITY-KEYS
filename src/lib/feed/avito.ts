// ВНИМАНИЕ: самый низкий уровень уверенности из четырёх фидов.
// avito.ru недоступен для прямой сверки (домен заблокирован для фетча),
// оф. шаблон отдаётся только из личного кабинета агентства и требует
// согласования с менеджером Авито. Структура ниже — по устоявшемуся
// отраслевому формату (Ads formatVersion=3 / target=Avito.ru), которым
// пользуются все CRM на рынке, но перед реальным запуском её нужно
// свериться с шаблоном из личного кабинета Авито. Это касается и
// арендных полей (RentByPeriod/Deposit/RentType/CeilingHeight и т.п.
// ниже) — в отличие от src/lib/feed/yandex.ts, где те же поля для
// коммерческой аренды уже сверены с официальной документацией Яндекса,
// здесь это всё ещё рабочая гипотеза.

import {
  buildingTypeLabels,
  commercialBuildingTypeLabels,
  distanceFromRoadLabels,
  finishTypeLabels,
  heatingLabels,
  parkingLabels,
  renovationLabels,
  rentalPeriodLabels,
  rentalTypeLabels,
  type Listing,
} from "@/lib/listing-types";
import { buildLocalityAndStreet } from "./address";
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

  // buildLocalityAndStreet, а не [locality, address].join(", ") — поле
  // «Адрес / район» на деле часто содержит уже полный адрес целиком
  // (включая населённый пункт), из-за чего locality задваивался с
  // address (та же причина, по которой Домклик отклонял объекты в
  // фиде Яндекса, см. src/lib/feed/address.ts).
  const address = buildLocalityAndStreet(listing);
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

  // ---------- Аренда: универсальные поля ----------
  // Как и остальной файл (см. шапку) — конкретные названия тегов ниже не
  // с чем свериться (домен заблокирован для фетча), собраны по
  // устоявшейся отраслевой практике. Перед реальным запуском арендных
  // объявлений стоит свериться с шаблоном из личного кабинета Авито.
  if (listing.dealType === "rent") {
    if (listing.rentalPeriod) {
      tags.push(`<RentByPeriod>${escapeXml(rentalPeriodLabels[listing.rentalPeriod])}</RentByPeriod>`);
    }
    if (listing.rentalDeposit) tags.push(`<Deposit>${escapeXml(listing.rentalDeposit)}</Deposit>`);
    if (typeof listing.minRentalTerm === "number") {
      tags.push(`<MinRentTerm>${listing.minRentalTerm}</MinRentTerm>`);
    }
    if (listing.utilitiesIncluded) tags.push("<UtilitiesIncluded>1</UtilitiesIncluded>");
  }

  // ---------- Аренда: только коммерческая недвижимость ----------
  if (category === "Коммерческая недвижимость") {
    if (listing.rentalType) {
      tags.push(`<RentType>${escapeXml(rentalTypeLabels[listing.rentalType])}</RentType>`);
    }
    if (listing.rentalHolidays) tags.push("<RentHolidays>1</RentHolidays>");
    if (listing.operatingExpensesIncluded) {
      tags.push("<OperatingExpensesIncluded>1</OperatingExpensesIncluded>");
    }
    if (listing.commercialBuildingType) {
      tags.push(
        `<BuildingType>${escapeXml(commercialBuildingTypeLabels[listing.commercialBuildingType])}</BuildingType>`,
      );
    }
    if (listing.distanceFromRoad) {
      tags.push(
        `<DistanceFromRoad>${escapeXml(distanceFromRoadLabels[listing.distanceFromRoad])}</DistanceFromRoad>`,
      );
    }
    if (listing.parking) tags.push(`<Parking>${escapeXml(parkingLabels[listing.parking])}</Parking>`);
    if (listing.multiFloor) tags.push("<MultiFloor>1</MultiFloor>");
    if (listing.partialRentAllowed) tags.push("<PartialRentAllowed>1</PartialRentAllowed>");
    if (typeof listing.ceilingHeight === "number") {
      tags.push(`<CeilingHeight>${listing.ceilingHeight}</CeilingHeight>`);
    }
    if (listing.finishType) {
      tags.push(`<FinishType>${escapeXml(finishTypeLabels[listing.finishType])}</FinishType>`);
    }
    if (typeof listing.electricalPower === "number") {
      tags.push(`<ElectricalPower>${listing.electricalPower}</ElectricalPower>`);
    }
    if (listing.heating) tags.push(`<Heating>${escapeXml(heatingLabels[listing.heating])}</Heating>`);
    if (listing.commissionSharing) tags.push("<CommissionSharing>1</CommissionSharing>");
    if (listing.vatIncluded) tags.push("<VatIncluded>1</VatIncluded>");
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
