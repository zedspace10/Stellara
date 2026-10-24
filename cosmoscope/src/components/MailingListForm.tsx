import { useState } from "react";

export default function MailingListForm() {
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
        setMessage(data.message ?? "You're on the list. Look out for the first note.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message ?? "That didn't go through. Check the address and try again.");
      }
    } catch {
      setStatus("error");
      setMessage("We couldn't reach the server. Check your connection and try again.");
    }
  }

  if (status === "success") {
    return <p className="m-0 text-[15px]" style={{ color: "#A9C3E0" }} role="status">{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[28rem]">
      <div className="flex gap-2">
        <label htmlFor="mailing-email" className="sr-only">Email address</label>
        <input
          id="mailing-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
          placeholder="Your email"
          required
          autoComplete="email"
          className="flex-1 min-w-0 rounded-md bg-transparent px-3 py-2 text-[15px] outline-none transition-colors placeholder:text-[#5D6B79]"
          style={{ border: `1px solid ${status === "error" ? "#B7615A" : "#2A3546"}`, color: "#E8ECF1" }}
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="shrink-0 rounded-md px-4 py-2 text-[15px] font-medium transition-opacity disabled:opacity-40"
          style={{ background: "#E8ECF1", color: "#05070C" }}
        >
          {status === "loading" ? "Signing up" : "Sign up"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 mb-0 text-[13px]" style={{ color: "#E0948D" }} role="alert">{message}</p>
      )}
    </form>
  );
}
