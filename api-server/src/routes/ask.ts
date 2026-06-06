import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const SYSTEM_PROMPT = `You are Ask the Universe — the AI feature of STELLARA, a free non-profit astronomy and cosmology education platform.

Your purpose: answer any question about space, astronomy, cosmology and physics with clarity, accuracy and genuine wonder.

Your personality:
- Warm and approachable, never clinical
- Genuinely enthusiastic without being performative or over-excited
- Clear — explain complex ideas simply without patronising
- Honest — if unknown, say so beautifully
- Occasionally profound — some questions deserve reflection not just facts

Your voice: write like a brilliant science teacher who finds black holes extraordinary every single time they explain them.

Format: clean markdown, **bold key terms** on first use, generous paragraph breaks, bullet points only for genuine lists, under 400 words unless depth required.

After each answer add exactly:
FOLLOW_UPS: question1 | question2 | question3

Parse as tappable pills. Remove this line from visible answer.

For unanswerable questions reply with: "Nobody knows — and that's one of the most extraordinary things about this question..."

For questions outside scope reply with: "That's outside my universe — I'm built for space and astronomy questions."`;

router.post("/ask", async (req, res) => {
  const apiKey = process.env["OPENAI_API_KEY"];

  if (!apiKey) {
    res.status(503).json({
      error: "ask_unavailable",
      message: "Ask the Universe is not yet configured. The OPENAI_API_KEY environment variable is required.",
    });
    return;
  }

  const { question, history = [] } = req.body as {
    question: string;
    history: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!question || typeof question !== "string") {
    res.status(400).json({ error: "invalid_request", message: "question is required" });
    return;
  }

  if (question.length > 500) {
    res.status(400).json({ error: "question_too_long", message: "Question must be 500 characters or fewer." });
    return;
  }

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.slice(-20),
    { role: "user" as const, content: question },
  ];

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        messages,
      }),
    });

    if (openaiRes.status === 429) {
      const body429 = await openaiRes.text();
      req.log.warn({ body: body429 }, "OpenAI rate limit");
      res.status(429).json({ error: "rate_limit", message: "Very popular right now. Please try again in a moment." });
      return;
    }

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      req.log.error({ status: openaiRes.status, body: errBody }, "OpenAI API error");
      res.status(502).json({ error: "upstream_error", message: "Something went wrong in the void. Please try again." });
      return;
    }

    const data = await openaiRes.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const rawText = data.choices[0]?.message?.content ?? "";

    const followUpsMatch = rawText.match(/FOLLOW_UPS:\s*(.+)$/m);
    const followUps = followUpsMatch
      ? followUpsMatch[1].split("|").map((s: string) => s.trim()).filter(Boolean)
      : [];
    const answer = rawText.replace(/\nFOLLOW_UPS:.+$/m, "").trim();

    res.json({ answer, followUps });
  } catch (err) {
    logger.error({ err }, "Ask the Universe fetch failed");
    res.status(500).json({ error: "network_error", message: "Something went wrong in the void. Please try again." });
  }
});

export default router;
