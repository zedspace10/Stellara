import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Copy, Volume2, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";

const PLACEHOLDER_QUESTIONS = [
  "What is a black hole?",
  "How did the Moon form?",
  "Could life exist on Europa?",
  "What happens at the edge of the universe?",
  "How long until the Sun dies?",
  "What is dark matter?",
  "Are we alone?",
  "What is the Fermi Paradox?",
];

const SUGGESTED_QUESTIONS = [
  "What is a black hole?",
  "How big is the universe?",
  "Could life exist elsewhere?",
  "What is dark matter?",
  "How did Earth form?",
  "What happens when stars die?",
  "Is time travel possible?",
  "What is beyond the universe?",
  "How do we know the Big Bang happened?",
  "What is the Fermi Paradox?",
  "Could humans live on Mars?",
  "What is a neutron star?",
];

const DAILY_LIMIT = 10;

interface Message {
  role: "user" | "assistant";
  content: string;
  followUps?: string[];
  id: string;
}

function getDailyCount(): { count: number; date: string } {
  const today = new Date().toDateString();
  try {
    const stored = JSON.parse(localStorage.getItem("stellara_ask") || '{"date":"","count":0}');
    if (stored.date !== today) return { count: 0, date: today };
    return { count: stored.count, date: today };
  } catch {
    return { count: 0, date: today };
  }
}

function incrementDailyCount(): number {
  const today = new Date().toDateString();
  const current = getDailyCount();
  const newCount = current.count + 1;
  localStorage.setItem("stellara_ask", JSON.stringify({ date: today, count: newCount }));
  return newCount;
}

function wasFirstVisit(): boolean {
  const key = "stellara_ask_first";
  if (localStorage.getItem(key)) return false;
  localStorage.setItem(key, "1");
  return true;
}

export default function AskTheUniverse() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Searching the cosmos...");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [dailyCount, setDailyCount] = useState(() => getDailyCount().count);
  const [showWelcome, setShowWelcome] = useState(false);
  const [milestone10, setMilestone10] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasConversation = messages.length > 0;
  const remaining = DAILY_LIMIT - dailyCount;

  // Cycle placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_QUESTIONS.length);
        setPlaceholderVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const ask = useCallback(async (question: string) => {
    if (!question.trim() || loading) return;

    if (question.length > 500) {
      setError("That's a big question — could you focus it a little? (max 500 characters)");
      return;
    }

    const count = getDailyCount().count;
    if (count >= DAILY_LIMIT) {
      setError("You've reached today's limit for Ask the Universe. Come back tomorrow — the cosmos will still be here.");
      return;
    }

    setError(null);

    const userMsg: Message = { role: "user", content: question, id: Date.now().toString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setLoadingMsg("Searching the cosmos...");

    // 15s timeout message
    loadingTimerRef.current = setTimeout(() => setLoadingMsg("Still searching the cosmos..."), 15000);

    // Build history for API
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
 const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      });

      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);

      if (res.status === 503) {
        setApiUnavailable(true);
        setLoading(false);
        return;
      }

      if (res.status === 429) {
        setError("Very popular right now. Please try again in a moment.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        setError(data.message ?? "Something went wrong in the void. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json() as { answer: string; followUps: string[] };
      const newCount = incrementDailyCount();
      setDailyCount(newCount);

      const aiMsg: Message = {
        role: "assistant",
        content: data.answer,
        followUps: data.followUps ?? [],
        id: (Date.now() + 1).toString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Special moments
      if (newCount === 1 && wasFirstVisit()) {
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 5000);
      }
      if (newCount === 10) {
        setMilestone10(true);
        setTimeout(() => setMilestone10(false), 8000);
      }
    } catch {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      setError("Something went wrong in the void. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    ask(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask(input);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const handleReadAloud = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ""));
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#020208", fontFamily: "Inter, sans-serif" }}
    >
      {/* Star field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 150 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 71.3) % 100}%`,
              top: `${(i * 37.7) % 100}%`,
              width: `${0.5 + (i % 3) * 0.5}px`,
              height: `${0.5 + (i % 3) * 0.5}px`,
              opacity: 0.1 + (i % 5) * 0.08,
            }}
          />
        ))}
      </div>

      {/* Back nav */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-2">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </Link>
        {hasConversation && (
          <button
            onClick={() => setMessages([])}
            className="text-xs transition-colors"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Clear conversation
          </button>
        )}
      </div>

      {/* API Unavailable banner */}
      {apiUnavailable && (
        <div className="relative z-10 mx-5 mt-4 rounded-xl p-4 text-center" style={{ background: "rgba(255,213,79,0.06)", border: "1px solid rgba(255,213,79,0.2)" }}>
          <p className="text-sm" style={{ color: "#ffd54f" }}>
            Ask the Universe is coming soon. <br />
            <span className="text-xs" style={{ color: "rgba(255,213,79,0.6)" }}>The ANTHROPIC_API_KEY environment variable needs to be configured.</span>
          </p>
        </div>
      )}

      {/* Special moment: welcome */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 text-center px-6 py-3 rounded-2xl w-auto max-w-sm"
            style={{ background: "rgba(79,195,247,0.08)", border: "1px solid rgba(79,195,247,0.2)" }}
          >
            <p className="text-sm" style={{ color: "#4fc3f7" }}>
              Welcome to Ask the Universe.<br />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Every question you ask is a good one.</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone 10 */}
      <AnimatePresence>
        {milestone10 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 text-center px-6 py-4 rounded-2xl"
            style={{ background: "rgba(255,213,79,0.06)", border: "1px solid rgba(255,213,79,0.3)" }}
          >
            <p className="text-sm" style={{ color: "#ffd54f" }}>
              You've asked 10 questions.<br />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                The universe has approximately 10<sup>80</sup> atoms worth of answers left.
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`relative z-10 flex-1 flex flex-col ${hasConversation ? "pt-2" : "justify-center pt-16 pb-8"}`}>

        {/* Entry state */}
        {!hasConversation && (
          <div className="text-center px-6 mb-10">
            <h1
              className="text-6xl md:text-8xl font-bold text-white mb-3"
              style={{ fontFamily: "Orbitron, sans-serif", letterSpacing: "0.1em" }}
            >
              ASK
            </h1>
            <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>
              Anything. About the universe.
            </p>

            {/* Suggested pills */}
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto mb-10">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="text-sm transition-all"
                  style={{
                    background: "rgba(79,195,247,0.06)",
                    border: "1px solid rgba(79,195,247,0.2)",
                    color: "#4fc3f7",
                    borderRadius: "20px",
                    padding: "8px 16px",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation */}
        {hasConversation && (
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 max-w-2xl mx-auto w-full" style={{ paddingBottom: "140px" }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-6 ${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}>
                {msg.role === "user" ? (
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-3 text-sm text-white"
                    style={{
                      background: "rgba(79,195,247,0.12)",
                      border: "1px solid rgba(79,195,247,0.3)",
                      borderRadius: "16px 16px 4px 16px",
                    }}
                  >
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[90%]">
                    <div
                      className="text-sm leading-relaxed"
                      style={{
                        borderLeft: "3px solid rgba(255,213,79,0.5)",
                        paddingLeft: "16px",
                        color: "rgba(255,255,255,0.88)",
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          strong: ({ children }) => <strong style={{ color: "#e0e0e0" }}>{children}</strong>,
                          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="mb-3 space-y-1 list-none">{children}</ul>,
                          li: ({ children }) => <li style={{ color: "rgba(255,255,255,0.75)" }}>· {children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Answer actions */}
                    <div className="flex items-center gap-3 mt-2 pl-5">
                      <button
                        onClick={() => handleCopy(msg.content)}
                        className="flex items-center gap-1 text-[11px] transition-colors"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                      <button
                        onClick={() => handleReadAloud(msg.content)}
                        className="flex items-center gap-1 text-[11px] transition-colors"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        <Volume2 className="w-3 h-3" /> Read aloud
                      </button>
                    </div>

                    {/* Follow-up pills */}
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pl-5">
                        {msg.followUps.map((fq, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.08 }}
                            onClick={() => ask(fq)}
                            className="text-xs transition-all"
                            style={{
                              background: "rgba(79,195,247,0.06)",
                              border: "1px solid rgba(79,195,247,0.2)",
                              color: "#4fc3f7",
                              borderRadius: "20px",
                              padding: "6px 14px",
                            }}
                          >
                            {fq}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start mb-6">
                <div style={{ borderLeft: "3px solid rgba(255,213,79,0.4)", paddingLeft: "16px" }}>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#ffd54f" }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                    <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {loadingMsg}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Fixed input area */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-4"
        style={{ background: "linear-gradient(to top, rgba(2,2,8,1) 60%, rgba(2,2,8,0))" }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-3 text-center text-xs px-4 py-2 rounded-xl"
                style={{ color: "#ff8080", background: "rgba(255,80,80,0.06)", border: "1px solid rgba(255,80,80,0.15)" }}
              >
                {error}
                <button onClick={() => setError(null)} className="ml-3 underline opacity-60">Dismiss</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Remaining indicator */}
          {remaining <= 3 && remaining > 0 && (
            <p className="text-center text-xs mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
              {remaining} question{remaining !== 1 ? "s" : ""} remaining today
            </p>
          )}
          {remaining <= 0 && (
            <p className="text-center text-xs mb-2" style={{ color: "rgba(255,213,79,0.5)" }}>
              You've reached today's limit. Come back tomorrow.
            </p>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholderVisible ? PLACEHOLDER_QUESTIONS[placeholderIdx] : ""}
              rows={1}
              maxLength={500}
              disabled={loading || remaining <= 0}
              className="w-full resize-none rounded-2xl px-5 py-4 pr-14 text-sm text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontFamily: "Inter, sans-serif",
                minHeight: "56px",
                maxHeight: "160px",
                color: "rgba(255,255,255,0.9)",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || remaining <= 0}
              className="absolute right-3 bottom-3 w-9 h-9 flex items-center justify-center rounded-xl transition-all disabled:opacity-30"
              style={{ background: "rgba(255,213,79,0.15)", border: "1px solid rgba(255,213,79,0.3)" }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#ffd54f" }} />
              ) : (
                <Send className="w-4 h-4" style={{ color: "#ffd54f" }} />
              )}
            </button>
          </form>

          {/* Responsible AI notice */}
          <p className="text-center text-[10px] mt-3" style={{ color: "rgba(255,255,255,0.2)" }}>
            Ask the Universe is powered by AI and aims for scientific accuracy. For critical research, always verify with primary sources.
          </p>
        </div>
      </div>
    </div>
  );
}
