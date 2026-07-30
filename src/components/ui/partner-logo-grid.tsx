import Image from "next/image";

export type Partner = { name: string; src: string };

export function PartnerLogoGrid({ partners }: { partners: Partner[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {partners.map((p) => (
        <div
          key={p.name}
          className="h-[80px] rounded-[4px] border border-accent/20 bg-surface p-2 sm:h-[90px]"
        >
          <div className="relative h-full w-full overflow-hidden rounded-[2px] bg-white p-4">
            <Image
              src={p.src}
              alt={p.name}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 160px, (min-width: 640px) 20vw, 33vw"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
