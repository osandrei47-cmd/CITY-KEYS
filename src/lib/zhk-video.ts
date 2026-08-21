// Видео ЖК — та же схема, что у /proekty/ust-luga-izhs: прямая публичная
// ссылка на S3, без регистрации в коллекции Media (видео большое, ему не
// нужна обработка через sharp). Без поля в схеме residential-complexes —
// просто проверяем HEAD-запросом, есть ли файл по условному пути, и рендерим
// блок видео на странице ЖК только если он там есть. Когда видео для
// конкретного ЖК готово, его достаточно положить в бакет по этому пути —
// на сайте блок появится сам, без правок кода или базы.
export function zhkVideoUrl(slug: string): string {
  return `https://s3.twcstorage.ru/city-keys-media/videos/zhk/${slug}/presentation.mp4`;
}

export async function zhkVideoExists(slug: string): Promise<boolean> {
  try {
    const res = await fetch(zhkVideoUrl(slug), { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}
