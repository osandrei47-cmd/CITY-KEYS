import { Container } from "@/components/layout/container";
import type { LegalDoc } from "@/lib/legal-docs";

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <section className="pb-24 pt-28 md:pt-36">
      <Container>
        <div className="mx-auto flex max-w-[720px] flex-col gap-6">
          <h1 className="text-[26px] font-extrabold leading-snug md:text-[30px]">
            {doc.title}
          </h1>
          {doc.blocks.map((block, i) => {
            if (block.type === "h2") {
              return (
                <h2 key={i} className="mt-2 text-[18px] font-bold">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "ul") {
              return (
                <ul key={i} className="flex flex-col gap-2">
                  {block.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[14.5px] leading-relaxed text-ink-secondary"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-secondary" />
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-[14.5px] leading-relaxed text-ink-secondary">
                {block.text.split("\n").map((line, j, arr) => (
                  <span key={j}>
                    {line}
                    {j < arr.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
