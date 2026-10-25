import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";
import { Note, milestonesFor, kmTravelled, whenReached, duration, bigKm, dateLabel } from "@/lib/notes";

const TEXT = "#E8ECF1";
const BODY = "#C9D2DC";
const MUTED = "#8E9AA8";
const WARM = "#F3DDB0";
const RULE = "#1C2533";

// The note's light, seen from inside the 3D universe. It is placed by the real clock, so
// "Show it with today's sky" sets the planets to now as well, and they line up.
export default function NoteUniversePanel({
  note, open, onClose, live, onShowNow,
}: {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  /** True when the view is already running at real speed from now. */
  live: boolean;
  onShowNow: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [open]);
  const milestones = useMemo(() => (note ? milestonesFor(note.sentAt) : []), [note]);
  if (!open || !note) return null;

  const km = kmTravelled(note.sentAt, now);
  const passed = milestones.filter((m) => m.km <= km);
  const next = milestones.find((m) => m.km > km);
  const last = passed[passed.length - 1];

  const rows: [string, string][] = [
    ["From Earth", bigKm(km)],
    ...(last ? [["Last passed", last.name] as [string, string]] : []),
    ...(next ? [["Next", `${next.name}, in ${duration(whenReached(next, note.sentAt) - now)}`] as [string, string]] : []),
  ];

  return (
    <div
      className="absolute right-4 w-[22rem] max-w-[calc(100vw-2rem)] z-40 rounded-xl overflow-hidden"
      style={{ top: "220px", background: "#0A0F17", border: `1px solid ${RULE}` }}
    >
      <div className="px-5 pt-4 pb-4 flex items-start justify-between gap-3" style={{ borderBottom: `1px solid ${RULE}` }}>
        <div className="min-w-0">
          <h2 className="m-0 text-[26px] leading-tight" style={{ color: TEXT, fontWeight: 400 }}>Your note</h2>
          <p className="m-0 mt-0.5 text-[13px]" style={{ color: MUTED }}>Sent {dateLabel(note.sentAt)}</p>
        </div>
        <button onClick={onClose} className="p-2 -mr-2 rounded-md hover:bg-white/5 transition-colors shrink-0" aria-label="Close">
          <X className="w-4 h-4" style={{ color: MUTED }} />
        </button>
      </div>
      <div className="px-5 pt-4 pb-5">
        <p className="m-0 font-serif italic text-[17px] leading-snug line-clamp-4" style={{ color: BODY }}>{note.text}</p>
        <p className="m-0 mt-4 text-[14px] leading-relaxed" style={{ color: MUTED }}>
          The ring is the light that left Earth when you sent it, spreading out in every direction.
        </p>
        <dl className="m-0 mt-4" style={{ borderTop: `1px solid ${RULE}` }}>
          {rows.map(([k, v]) => (
            <div key={k} className="py-2 grid grid-cols-[6.5rem_1fr] gap-3 text-[14px]" style={{ borderBottom: `1px solid ${RULE}` }}>
              <dt style={{ color: MUTED }}>{k}</dt>
              <dd className="m-0 tabular-nums" style={{ color: k === "Next" ? WARM : TEXT }}>{v}</dd>
            </div>
          ))}
        </dl>
        {!live && (
          <button
            onClick={onShowNow}
            className="mt-4 w-full rounded-md py-2 text-[14px] font-medium transition-opacity hover:opacity-90"
            style={{ background: TEXT, color: "#05070C" }}
          >
            Show it with today's sky
          </button>
        )}
        <Link href="/note" className="mt-3 block text-center text-[14px] underline underline-offset-4" style={{ color: "#A9C3E0" }}>
          Open your note
        </Link>
      </div>
    </div>
  );
}
