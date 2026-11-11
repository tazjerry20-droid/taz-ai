import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "8mb" }));
app.use(express.static(__dirname));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 25, standardHeaders: true, legacyHeaders: false }));

app.get("/api/status", (_req, res) => {
  res.json({ configured: Boolean(process.env.AI_API_KEY), model: process.env.AI_MODEL || "not set" });
});

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return res.status(400).json({ error: "Send between 1 and 30 chat messages." });
  }
  if (!process.env.AI_API_KEY) {
    return res.status(503).json({
      error: "TAZ AI is ready, but no AI API key is configured yet. Add AI_API_KEY to your .env file and restart the server."
    });
  }
  const base = (process.env.AI_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
  try {
    const upstream = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are TAZ AI, a helpful, accurate, friendly assistant. Reply in the user's language. Be clear about uncertainty. Never claim to have performed actions you did not perform." },
          ...messages.filter(m => m.role === "system").slice(0, 2).map(m => ({
            role: "system", content: String(m.content || "").slice(0, 3000)
          })),
          ...messages.filter(m => m.role !== "system").slice(-20).map(m => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content || "").slice(0, 12000)
          }))
        ],
        temperature: 0.7
      })
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data?.error?.message || "AI provider request failed. Check your provider settings and usage limits." });
    }
    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) return res.status(502).json({ error: "The AI provider returned an empty response." });
    res.json({ answer, model: data.model || process.env.AI_MODEL });
  } catch (err) {
    res.status(502).json({ error: "Could not reach the AI provider. Check your internet connection and provider URL." });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`TAZ AI running at http://localhost:${port}`));
