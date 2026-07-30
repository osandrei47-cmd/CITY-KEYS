import { type ReactNode } from "react";
import { Container } from "./container";

export function Section({
  children,
  className = "",
  border = true,
  as: Tag = "section",
  id,
}: {
  children: ReactNode;
  className?: string;
  border?: boolean;
  as?: "section" | "div";
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={`py-16 md:py-24 ${border ? "border-t border-line" : ""} ${className}`}
    >
      <Container>{children}</Container>
    </Tag>
  );
}
