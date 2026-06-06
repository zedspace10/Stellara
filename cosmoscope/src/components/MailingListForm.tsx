import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function MailingListForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { ok?: boolean; message?: string; error?: string };

      if (data.ok) {
        setStatus("success");
        setMessage(data.message ?? "You're in!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2" style={{ color: "#4fc3f7" }}>
        <CheckCircle className="w-4 h-4 shrink-0" />
        <span className={compact ? "text-xs" : "text-sm"}>{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex gap-2 ${compact ? "flex-row" : "flex-col sm:flex-row"}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
          placeholder="your@email.com"
          required
          className={`flex-1 rounded-xl bg-white/5 border outline-none transition-all placeholder:text-white/20 text-white ${
            compact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"
          } ${status === "error" ? "border-red-400/50 focus:border-red-400" : "border-white/10 focus:border-[#4fc3f7]/50"}`}
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className={`flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all disabled:opacity-40 shrink-0 ${
            compact ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm"
          }`}
          style={{ background: "linear-gradient(135deg, #4fc3f7, #0288d1)", color: "#000" }}
        >
          {status === "loading" ? (
            <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <Send className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              {!compact && "Subscribe"}
            </>
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-1.5 text-xs" style={{ color: "#f87171" }}>{message}</p>
      )}
    </form>
  );
}
