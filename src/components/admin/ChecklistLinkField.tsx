import type { TextFieldServerComponent } from "payload";
import { SITE_URL } from "@/lib/feed/constants";
import { CopyLinkButton } from "./CopyLinkButton";

export const ChecklistLinkField: TextFieldServerComponent = ({ value }) => {
  const token = typeof value === "string" ? value : "";

  if (!token) {
    return (
      <p style={{ fontSize: 13, opacity: 0.7 }}>Ссылка появится после сохранения</p>
    );
  }

  const url = `${SITE_URL}/checklist/${token}`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 13, wordBreak: "break-all" }}>
        {url}
      </a>
      <CopyLinkButton url={url} />
    </div>
  );
};
