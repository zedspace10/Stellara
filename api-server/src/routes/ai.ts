import { Router } from "express";

const aiRouter = Router();

aiRouter.post("/", async (req, res) => {
  const { system, messages, maxTokens = 800 } = req.body as {
    system?: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
  };

  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    return res.status(503).json({ error: "AI service not configured" });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return res.status(anthropicRes.status).json({ error: "Upstream error", detail: err });
    }

    const data = await anthropicRes.json();
    const text = (data as { content: Array<{ text: string }> }).content[0]?.text ?? "";
    return res.json({ text });
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      return res.status(504).json({ error: "Request timed out" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default aiRouter;
