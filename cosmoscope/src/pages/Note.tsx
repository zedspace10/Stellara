import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "@/components/Footer";
import {
  Note, Milestone, MAX_NOTE, C_KM_S,
  loadNotes, saveNotes, lastSeen, markSeen, newNote, noteLink, noteFromHash,
  milestonesFor, kmTravelled, whenReached, duration, bigKm, dateLabel, calendarFile, inSentence,
} from "@/lib/notes";

const BG = "#05070C";
const TEXT = "#E8ECF1";
const BODY = "#C9D2DC";
const MUTED = "#8E9AA8";
const TINT = "#A9C3E0";
const WARM = "#F3DDB0";
const RULE = "#1C2533";
const PANEL = "#0A0F17";

// Names short enough to sit under the track.
const SHORT: Record<string, string> = {
  moon: "Moon",
  sun: "Sun",
  "voyager-1": "Voyager 1",
  proxima: "Nearest star",
  centre: "Galaxy centre",
  andromeda: "Andromeda",
};

const LOG_MIN = 5;
const LOG_MAX = 19.5;
const trackPct = (km: number) => Math.min(100, Math.max(0, ((Math.log10(Math.max(km, 1e5)) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100));

function listNames(ms: Milestone[]) {
  const names = ms.map((m) => inSentence(m.name));
  if (names.length <= 1) return names.join("");
  if (names.length > 4) return `${names.slice(-3).reverse().join(", ")} and ${names.length - 3} more`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function Button({ children, onClick, primary, disabled }: { children: React.ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md px-4 py-2 text-[15px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={primary ? { background: TEXT, color: BG } : { border: "1px solid #2A3546", color: TEXT }}
    >
      {children}
    </button>
  );
}

// ── Writing the note ───────────────────────────────────────────────────────────
function Compose({ onSend, hasOthers, onCancel }: { onSend: (text: string) => void; hasOthers: boolean; onCancel: () => void }) {
  const [text, setText] = useState("");
  const [leaving, setLeaving] = useState(false);
  const send = () => {
    if (!text.trim() || leaving) return;
    setLeaving(true);
    window.setTimeout(() => onSend(text), 900);
  };
  return (
    <div className="max-w-[40rem] mx-auto px-5 md:px-0 pt-14 pb-16">
      <h1 className="m-0 text-[40px] md:text-[56px] leading-[1.05]" style={{ color: TEXT }}>Send a note to the universe</h1>
      <p className="mt-4 mb-0 text-[17px] leading-relaxed" style={{ color: BODY }}>
        Write down whatever is on your mind. When you send it, follow the light that leaves Earth at that moment as it
        travels out past the Moon, the planets and the stars. Come back whenever you like to see how far it has gone.
      </p>

      <div
        className="mt-10 transition-all duration-[900ms] ease-in"
        style={{ opacity: leaving ? 0 : 1, transform: leaving ? "translateY(-40px) scale(0.96)" : "none", filter: leaving ? "blur(2px)" : "none" }}
      >
        <label htmlFor="note" className="block text-[14px] mb-2" style={{ color: MUTED }}>Your note</label>
        <textarea
          id="note"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_NOTE))}
          rows={6}
          placeholder="Something you are carrying, something you hope for, something you want to let go of."
          className="w-full rounded-lg px-4 py-3 font-serif text-[20px] leading-snug outline-none resize-none focus:ring-1"
          style={{ background: PANEL, border: `1px solid ${RULE}`, color: TEXT }}
        />
        <div className="mt-2 flex justify-between text-[13px]" style={{ color: MUTED }}>
          <span>Your note stays on this device. Nobody else can read it, including us.</span>
          <span className="tabular-nums shrink-0 ml-4">{text.length} / {MAX_NOTE}</span>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button primary onClick={send} disabled={!text.trim() || leaving}>{leaving ? "Sending" : "Send it"}</Button>
        {hasOthers && !leaving && <Button onClick={onCancel}>Back to my notes</Button>}
      </div>
    </div>
  );
}

// ── Following it ───────────────────────────────────────────────────────────────
function Journey({
  note, saved, since, justSent, others,
  onKeep, onLetGo, onWrite, onOpen,
}: {
  note: Note;
  saved: boolean;
  since: { from: number } | null;
  justSent: boolean;
  others: Note[];
  onKeep: () => void;
  onLetGo: () => void;
  onWrite: () => void;
  onOpen: (id: string) => void;
}) {
  const milestones = useMemo(() => milestonesFor(note.sentAt), [note.sentAt]);
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const kmRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  // The distance counts up live; everything else refreshes a few times a second.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const km = kmTravelled(note.sentAt, Date.now());
      if (kmRef.current) kmRef.current.textContent = `${Math.round(km).toLocaleString("en-GB")} km`;
      if (markerRef.current) markerRef.current.style.left = `${trackPct(km)}%`;
    };
    raf = requestAnimationFrame(tick);
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => { cancelAnimationFrame(raf); clearInterval(id); };
  }, [note.sentAt]);

  const km = kmTravelled(note.sentAt, now);
  const passed = milestones.filter((m) => m.km <= km);
  const ahead = milestones.filter((m) => m.km > km);
  const next = ahead[0];
  const remindable = ahead.find((m) => whenReached(m, note.sentAt) - now > 6 * 3600 * 1000);
  const link = noteLink(note);

  const sinceKm = since ? km - kmTravelled(note.sentAt, Math.max(since.from, note.sentAt)) : 0;
  const sincePassed = since ? passed.filter((m) => m.km > kmTravelled(note.sentAt, Math.max(since.from, note.sentAt))) : [];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const t = document.createElement("textarea");
      t.value = link;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };
  const remind = (m: Milestone) => {
    const blob = new Blob([calendarFile(note, m, link)], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pale-note-${m.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  return (
    <div className="max-w-[44rem] mx-auto px-5 md:px-0 pt-12 pb-16" style={{ animation: justSent ? "pale-note-in 1.2s ease-out" : undefined }}>
      {!saved && (
        <div className="mb-8 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3" style={{ background: PANEL, border: `1px solid ${RULE}` }}>
          <span className="text-[15px]" style={{ color: BODY }}>This note was opened from a link.</span>
          <Button onClick={onKeep}>Keep it on this device</Button>
        </div>
      )}
      {since && sinceKm > 0 && (
        <div className="mb-10 rounded-lg px-4 py-3 text-[16px] leading-relaxed" style={{ background: PANEL, border: `1px solid ${RULE}`, color: BODY }}>
          Since you were last here, {duration(now - since.from)} ago, your note has travelled{" "}
          <span style={{ color: TEXT }}>{bigKm(sinceKm)}</span>
          {sincePassed.length ? <> and passed {listNames(sincePassed)}.</> : "."}
        </div>
      )}

      <p className="m-0 text-[14px]" style={{ color: MUTED }}>Your note, sent {dateLabel(note.sentAt)}</p>
      <blockquote className="m-0 mt-3 pl-4 font-serif italic text-[20px] leading-snug whitespace-pre-wrap break-words" style={{ color: BODY, borderLeft: `1px solid #2A3546` }}>
        {note.text}
      </blockquote>

      <section className="mt-12">
        <p className="m-0 text-[15px]" style={{ color: MUTED }}>The light that left Earth when you sent it is now</p>
        <p className="m-0 mt-2 font-serif text-[34px] sm:text-[48px] leading-tight tabular-nums break-all" style={{ color: TEXT }}>
          <span ref={kmRef}>{Math.round(km).toLocaleString("en-GB")} km</span>
        </p>
        <p className="m-0 mt-2 text-[15px]" style={{ color: MUTED }}>
          from home, and {Math.round(C_KM_S).toLocaleString("en-GB")} km further every second.
          {km > 9.46e12 ? ` That is ${bigKm(km)}.` : ""}
        </p>
      </section>

      {/* The track: every step on the way, spaced by powers of ten */}
      <section className="mt-12" aria-label="How far the note has travelled">
        <div className="relative h-14 mt-6">
          <div className="absolute left-0 right-0 top-3 h-px" style={{ background: "#2A3546" }} />
          <div className="absolute left-0 top-3 h-px" style={{ width: `${trackPct(km)}%`, background: WARM, opacity: 0.6 }} />
          {milestones.map((m) => (
            <div
              key={m.id}
              className="absolute top-[9px] w-[9px] h-[9px] -translate-x-1/2 rounded-full"
              title={m.name}
              style={{ left: `${trackPct(m.km)}%`, background: m.km <= km ? WARM : BG, border: `1px solid ${m.km <= km ? WARM : "#4A5668"}` }}
            />
          ))}
          {milestones.filter((m) => SHORT[m.id]).map((m) => {
            const p = trackPct(m.km);
            return (
              <span
                key={m.id + "l"}
                className={`absolute text-[12px] whitespace-nowrap ${m.id === "centre" ? "hidden sm:inline -top-3" : "top-7"}`}
                style={{ left: `${p}%`, transform: p > 92 ? "translateX(-100%)" : p < 4 ? "none" : "translateX(-50%)", color: m.km <= km ? WARM : MUTED }}
              >
                {SHORT[m.id]}
              </span>
            );
          })}
          <div ref={markerRef} className="absolute top-[5px] w-[17px] h-[17px] -translate-x-1/2 rounded-full" style={{ left: `${trackPct(km)}%`, background: TEXT, boxShadow: "0 0 18px 4px rgba(243,221,176,0.45)" }} />
        </div>
      </section>

      {next && (
        <section className="mt-10 rounded-lg px-5 py-4" style={{ background: PANEL, border: `1px solid ${RULE}` }}>
          <p className="m-0 text-[14px]" style={{ color: MUTED }}>Next</p>
          <p className="m-0 mt-1 font-serif text-[26px] leading-tight" style={{ color: TEXT }}>{next.name}</p>
          <p className="m-0 mt-2 text-[15px] leading-relaxed" style={{ color: BODY }}>{next.line}</p>
          <p className="m-0 mt-3 text-[15px] tabular-nums" style={{ color: WARM }}>In {duration(whenReached(next, note.sentAt) - now)}</p>
        </section>
      )}

      {remindable && saved && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg px-5 py-4" style={{ border: `1px solid ${RULE}` }}>
          <span className="text-[15px] leading-relaxed" style={{ color: BODY }}>
            It reaches {inSentence(remindable.name)} on {dateLabel(whenReached(remindable, note.sentAt))}.
          </span>
          <Button onClick={() => remind(remindable)}>Remind me</Button>
        </div>
      )}

      {passed.length > 0 && (
        <section className="mt-12">
          <h2 className="m-0 text-[22px] font-normal" style={{ color: TEXT }}>Already passed</h2>
          <ol className="m-0 mt-4 p-0 list-none" style={{ borderTop: `1px solid ${RULE}` }}>
            {[...passed].reverse().slice(0, 8).map((m) => (
              <li key={m.id} className="py-3 grid grid-cols-[1fr_auto] gap-x-4" style={{ borderBottom: `1px solid ${RULE}` }}>
                <span>
                  <span className="block text-[16px]" style={{ color: TEXT }}>{m.name}</span>
                  <span className="block mt-0.5 text-[14px] leading-relaxed" style={{ color: MUTED }}>{m.line}</span>
                </span>
                <span className="text-[13px] text-right tabular-nums pt-0.5" style={{ color: MUTED }}>after {duration(whenReached(m, note.sentAt) - note.sentAt)}</span>
              </li>
            ))}
          </ol>
          {passed.length > 8 && <p className="mt-3 mb-0 text-[14px]" style={{ color: MUTED }}>And {passed.length - 8} more before those.</p>}
        </section>
      )}

      {ahead.length > 1 && (
        <section className="mt-12">
          <h2 className="m-0 text-[22px] font-normal" style={{ color: TEXT }}>Still ahead</h2>
          <ol className="m-0 mt-4 p-0 list-none" style={{ borderTop: `1px solid ${RULE}` }}>
            {ahead.slice(1, 6).map((m) => {
              const t = whenReached(m, note.sentAt);
              return (
                <li key={m.id} className="py-3 grid grid-cols-[1fr_auto] gap-x-4" style={{ borderBottom: `1px solid ${RULE}` }}>
                  <span className="text-[16px]" style={{ color: BODY }}>{m.name}</span>
                  <span className="text-[13px] text-right tabular-nums" style={{ color: MUTED }}>
                    {t - now < 2 * 86400000 ? `in ${duration(t - now)}` : new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className="mt-12 flex flex-wrap gap-3">
        <Button onClick={copy}>{copied ? "Link copied" : "Copy a link to follow it anywhere"}</Button>
        <Button onClick={onWrite}>Write another note</Button>
        {saved && !confirming && <Button onClick={() => setConfirming(true)}>Let it go</Button>}
      </section>
      {confirming && (
        <div className="mt-4 rounded-lg px-5 py-4" style={{ border: `1px solid ${RULE}` }}>
          <p className="m-0 text-[15px] leading-relaxed" style={{ color: BODY }}>
            The note will be gone from this device. Its light keeps travelling.
          </p>
          <div className="mt-3 flex gap-3">
            <Button onClick={onLetGo}>Let it go</Button>
            <Button onClick={() => setConfirming(false)}>Keep it</Button>
          </div>
        </div>
      )}

      {others.length > 0 && (
        <section className="mt-12">
          <h2 className="m-0 text-[22px] font-normal" style={{ color: TEXT }}>Your other notes</h2>
          <ul className="m-0 mt-4 p-0 list-none" style={{ borderTop: `1px solid ${RULE}` }}>
            {others.map((o) => (
              <li key={o.id} style={{ borderBottom: `1px solid ${RULE}` }}>
                <button type="button" onClick={() => onOpen(o.id)} className="w-full text-left py-3 grid grid-cols-[1fr_auto] gap-x-4 hover:bg-white/[0.02]">
                  <span className="text-[15px] truncate" style={{ color: BODY }}>{o.text}</span>
                  <span className="text-[13px] tabular-nums" style={{ color: MUTED }}>{bigKm(kmTravelled(o.sentAt, now))}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-14 space-y-3 text-[14px] leading-relaxed" style={{ color: MUTED }}>
        <p className="m-0">
          Your note never leaves this device. But the light that left Earth when you sent it is real, and this is exactly
          how far it has gone. A copied link carries the note inside it, so anyone you give it to can read it.
        </p>
        <p className="m-0">
          If something you wrote feels too heavy to carry alone, you can talk to Samaritans any time, for free, on{" "}
          <a href="tel:116123" className="underline underline-offset-4" style={{ color: TINT }}>116 123</a> (UK and Ireland).
        </p>
      </div>
    </div>
  );
}

// ── The page ───────────────────────────────────────────────────────────────────
export default function NotePage() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [linked, setLinked] = useState<Note | null>(() => noteFromHash(window.location.hash));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [justSent, setJustSent] = useState(false);
  // When they were last here, read once as the page opens.
  const [since] = useState(() => {
    const prev = lastSeen();
    return prev && Date.now() - prev > 60000 ? { from: prev } : null;
  });

  useEffect(() => {
    document.title = "Send a note | PALE";
    markSeen();
    const id = window.setInterval(() => markSeen(), 30000);
    const onHide = () => { if (document.visibilityState === "hidden") markSeen(); };
    document.addEventListener("visibilitychange", onHide);
    const onHash = () => setLinked(noteFromHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  // A link to a note already kept here simply opens that note.
  const linkedSaved = linked ? notes.find((n) => n.sentAt === linked.sentAt && n.text === linked.text) : undefined;
  const sorted = [...notes].sort((a, b) => b.sentAt - a.sentAt);
  const active: Note | undefined =
    (activeId ? notes.find((n) => n.id === activeId) : undefined) ?? linkedSaved ?? linked ?? sorted[0];
  const activeSaved = !!active && notes.some((n) => n.id === active.id);

  const clearHash = () => {
    if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
    setLinked(null);
  };

  const send = (text: string) => {
    const n = newNote(text);
    const list = [...notes, n];
    saveNotes(list);
    setNotes(list);
    clearHash();
    setActiveId(n.id);
    setJustSent(true);
    setComposing(false);
    window.scrollTo({ top: 0 });
  };
  const keep = () => {
    if (!linked) return;
    const n = { ...linked, id: newNote(linked.text).id };
    const list = [...notes, n];
    saveNotes(list);
    setNotes(list);
    clearHash();
    setActiveId(n.id);
  };
  const letGo = () => {
    if (!active) return;
    const list = notes.filter((n) => n.id !== active.id);
    saveNotes(list);
    setNotes(list);
    setActiveId(null);
    window.scrollTo({ top: 0 });
  };

  const showCompose = composing || !active;

  return (
    <div className="min-h-screen pt-16" style={{ background: BG }}>
      <style>{`@keyframes pale-note-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { [style*="pale-note-in"] { animation: none !important; } }`}</style>
      {showCompose ? (
        <Compose onSend={send} hasOthers={!!active} onCancel={() => setComposing(false)} />
      ) : (
        <Journey
          key={active.id}
          note={active}
          saved={activeSaved}
          since={activeSaved && since && since.from > active.sentAt ? since : null}
          justSent={justSent}
          others={sorted.filter((n) => n.id !== active.id)}
          onKeep={keep}
          onLetGo={letGo}
          onWrite={() => { setComposing(true); setJustSent(false); window.scrollTo({ top: 0 }); }}
          onOpen={(id) => { clearHash(); setActiveId(id); setJustSent(false); window.scrollTo({ top: 0 }); }}
        />
      )}
      <Footer />
    </div>
  );
}
