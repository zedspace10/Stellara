import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

router.post("/subscribe", async (req, res) => {
  const apiKey = process.env["MAILCHIMP_API_KEY"];
  const listId = process.env["MAILCHIMP_LIST_ID"];

  if (!apiKey || !listId) {
    res.status(503).json({ error: "subscribe_unavailable", message: "Mailing list not configured." });
    return;
  }

  const dc = apiKey.split("-").pop();
  if (!dc) {
    res.status(503).json({ error: "invalid_key", message: "Invalid Mailchimp API key format." });
    return;
  }

  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "invalid_request", message: "Email is required." });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "invalid_email", message: "Please enter a valid email address." });
    return;
  }

  try {
    const mcRes = await fetch(
      `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email_address: email.toLowerCase().trim(),
          status: "subscribed",
          tags: ["stellara-web"],
        }),
      }
    );

    if (mcRes.status === 400) {
      const body = await mcRes.json() as { title?: string };
      if (body.title === "Member Exists") {
        res.status(200).json({ ok: true, message: "You're already on the list!" });
        return;
      }
      req.log.warn({ title: body.title }, "Mailchimp 400");
      res.status(400).json({ error: "invalid_email", message: "Please check your email address and try again." });
      return;
    }

    if (!mcRes.ok) {
      const errText = await mcRes.text();
      req.log.error({ status: mcRes.status, body: errText }, "Mailchimp API error");
      res.status(502).json({ error: "upstream_error", message: "Something went wrong. Please try again." });
      return;
    }

    res.json({ ok: true, message: "You're in! Welcome to the STELLARA community." });
  } catch (err) {
    logger.error({ err }, "Mailchimp subscribe fetch failed");
    res.status(500).json({ error: "network_error", message: "Something went wrong. Please try again." });
  }
});

export default router;
