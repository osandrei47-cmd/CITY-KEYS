import Image from "next/image";

export function FullBleedPhoto({
  src,
  alt,
  caption,
  objectPosition = "50% 50%",
}: {
  src: string;
  alt: string;
  caption?: string;
  objectPosition?: string;
}) {
  return (
    <section className="relative flex min-h-[60vh] items-end overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition }}
      />
      {caption ? (
        <>
          <div
            className="absolute inset-x-0 bottom-0 h-2/3"
            style={{
              background:
                "linear-gradient(to top, var(--bg) 15%, rgba(13,15,18,0.75) 55%, transparent 100%)",
            }}
          />
          <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pb-14 pt-24 md:px-10">
            <p className="text-balance max-w-[720px] text-[22px] font-extrabold leading-snug md:text-[30px]">
              {caption}
            </p>
          </div>
        </>
      ) : null}
    </section>
  );
}
