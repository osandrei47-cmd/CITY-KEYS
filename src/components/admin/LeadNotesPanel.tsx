import type { UIFieldServerComponent } from "payload";
import { AddNoteForm } from "./AddNoteForm";

type Note = { text: string; createdAt?: string | null; authorEmail?: string | null };

function formatNoteDate(iso?: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date(iso));
}

export const LeadNotesPanel: UIFieldServerComponent = ({ data }) => {
  const notes: Note[] = Array.isArray(data?.notes) ? data.notes : [];
  // Новые записи — сверху.
  const sorted = [...notes].sort((a, b) => {
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
      <AddNoteForm leadId={data?.id as number | string | undefined} existingNotes={notes} />
      {sorted.length === 0 ? (
        <p style={{ fontSize: 13, opacity: 0.6 }}>Записей пока нет.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((note, i) => (
            <div
              key={i}
              style={{
                border: "1px solid var(--theme-elevation-150)",
                borderRadius: 4,
                padding: "8px 12px",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
                {formatNoteDate(note.createdAt)}
                {note.authorEmail ? ` · ${note.authorEmail}` : ""}
              </div>
              <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{note.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
