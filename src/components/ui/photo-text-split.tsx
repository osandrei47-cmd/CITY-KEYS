import Image from "next/image";
import { Container } from "@/components/layout/container";

export function PhotoTextSplit({
  src,
  alt,
  aspect = "4/5",
  photoSide = "left",
  objectPosition = "50% 50%",
  children,
}: {
  src: string;
  alt: string;
  aspect?: string;
  photoSide?: "left" | "right";
  objectPosition?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div
            className={`relative overflow-hidden rounded-[4px] ${
              photoSide === "left" ? "md:order-1" : "md:order-2"
            }`}
            style={{ aspectRatio: aspect }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              style={{ objectPosition }}
            />
          </div>
          <div className={photoSide === "left" ? "md:order-2" : "md:order-1"}>{children}</div>
        </div>
      </Container>
    </section>
  );
}
