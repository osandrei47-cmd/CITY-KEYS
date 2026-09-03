// Видео-обзор посёлка «Луга Парк» — та же схема, что у /zhk/[slug]
// (src/lib/zhk-video.ts) и /proekty/ust-luga-izhs: прямая публичная ссылка
// на S3, без регистрации в коллекции Media и без поля в схеме. Блок с
// видео на странице появляется сам, как только файл окажется в бакете по
// этому пути — правок кода или базы не нужно.
export function lugaParkVideoUrl(): string {
  return "https://s3.twcstorage.ru/city-keys-media/videos/proekty/luga-park/presentation.mp4";
}

export async function lugaParkVideoExists(): Promise<boolean> {
  try {
    const res = await fetch(lugaParkVideoUrl(), { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}
