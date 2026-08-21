import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { RequiredDataFromCollectionSlug } from "payload";
import { getPayloadClient } from "@/lib/payload-client";
import {
  getZhkPresentationS3Client,
  ZHK_PRESENTATION_S3_BUCKET,
  zhkPresentationS3Key,
} from "@/lib/zhk-presentation-s3";

export const dynamic = "force-dynamic";

const PHONE_PATTERN = /^\+7\d{10}$/;

// Принимает телефон в любом написании (с +7/8/без кода, с пробелами и
// скобками маски) и приводит к единому формату +7XXXXXXXXXX. Возвращает
// null, если после нормализации это всё равно не похоже на российский номер.
function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;

  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  } else if (digits.length === 10) {
    digits = `7${digits}`;
  }

  const withPlus = `+${digits}`;
  return PHONE_PATTERN.test(withPlus) ? withPlus : null;
}

type RequestBody = {
  name?: unknown;
  phone?: unknown;
  honeypot?: unknown;
  consentGiven?: unknown;
};

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Некорректный запрос" }, { status: 400 });
  }

  // Скрытое поле, которое видят только боты — заполненное значение молча
  // отклоняем, не создавая лид и не отдавая PDF, но не показываем боту,
  // что заявка отклонена.
  if (typeof body.honeypot === "string" && body.honeypot.trim() !== "") {
    return Response.json({ success: true });
  }

  const phone = normalizePhone(body.phone);
  if (!phone) {
    return Response.json(
      { success: false, error: "Укажите телефон в формате +7 (___) ___-__-__" },
      { status: 400 },
    );
  }

  if (body.consentGiven !== true) {
    return Response.json(
      { success: false, error: "Нужно согласие на обработку персональных данных" },
      { status: 400 },
    );
  }

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "residential-complexes",
    where: { slug: { equals: slug }, isPublished: { equals: true } },
    depth: 0,
    limit: 1,
  });
  const complex = docs[0];
  if (!complex) {
    return Response.json({ success: false, error: "ЖК не найден" }, { status: 404 });
  }

  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : `Не указано (ЖК «${complex.title}»)`;

  const leadData: RequiredDataFromCollectionSlug<"leads"> = {
    name,
    phone,
    source: "zhk-presentation",
    consentGiven: true,
    dealStage: "new-lead",
    message: `Заявка со страницы ЖК «${complex.title}» — запрошена презентация PDF`,
  };
  try {
    await payload.create({ collection: "leads", data: leadData });
  } catch (error) {
    console.error("[zhk-presentation] не удалось создать лид", error);
    return Response.json(
      { success: false, error: "Не получилось отправить заявку, попробуйте ещё раз" },
      { status: 500 },
    );
  }

  // Лид уже сохранён к этому моменту — сбой скачивания PDF из S3 не должен
  // выглядеть как полный отказ, иначе пользователь решит, что заявка не ушла.
  try {
    const client = getZhkPresentationS3Client();
    const result = await client.send(
      new GetObjectCommand({ Bucket: ZHK_PRESENTATION_S3_BUCKET, Key: zhkPresentationS3Key(slug) }),
    );
    if (!result.Body) {
      throw new Error("empty S3 object body");
    }
    const bytes = await result.Body.transformToByteArray();

    return new Response(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug}-presentation.pdf"`,
      },
    });
  } catch (error) {
    console.error("[zhk-presentation] лид создан, но не удалось отдать PDF", error);
    return Response.json({ success: true, downloadFailed: true });
  }
}
