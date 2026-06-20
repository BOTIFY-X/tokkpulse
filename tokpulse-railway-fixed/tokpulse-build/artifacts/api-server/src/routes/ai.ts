import { Router } from "express";
import { requireAuth, requirePremium } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router = Router();

const OPENAI_KEY = process.env.OPENAI_API_KEY ?? "";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? "";

type AIProvider = { baseUrl: string; key: string; model: string };

function getProvider(): AIProvider | null {
  if (OPENAI_KEY) {
    return { baseUrl: "https://api.openai.com/v1", key: OPENAI_KEY, model: "gpt-4o-mini" };
  }
  if (OPENROUTER_KEY) {
    return { baseUrl: "https://openrouter.ai/api/v1", key: OPENROUTER_KEY, model: "meta-llama/llama-3.3-70b-instruct:free" };
  }
  return null;
}

async function callAI(messages: { role: string; content: string }[]): Promise<string> {
  const provider = getProvider();
  if (!provider) {
    return "AI assistant is not configured yet. Please add your OPENAI_API_KEY in the Secrets tab.";
  }
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${provider.key}`,
      "Content-Type": "application/json",
    };
    if (provider.baseUrl.includes("openrouter")) {
      headers["HTTP-Referer"] = "https://tokpulse.app";
      headers["X-Title"] = "TokPulse";
    }

    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error({ status: res.status, errText }, "AI API error");
      return `AI service returned an error (${res.status}). Please check your API key.`;
    }

    const data = await res.json() as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      logger.error({ data }, "AI returned empty content");
      return "The AI didn't return a response. Please try again.";
    }
    return content;
  } catch (err) {
    logger.error({ err }, "AI call failed");
    return "AI service temporarily unavailable. Please try again.";
  }
}

router.post("/ai/generate", requireAuth, requirePremium, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const { type, topic, videoTitle, niche } = req.body;

  const userNiche = niche ?? user.niche ?? "general content creation";

  let prompt = "";
  switch (type) {
    case "caption":
      prompt = `You are a viral TikTok content expert. Generate 3 punchy, engaging captions for a TikTok video${videoTitle ? ` titled "${videoTitle}"` : ""}${topic ? ` about "${topic}"` : ""} for a ${userNiche} creator. Each caption should be 1-2 sentences, hook-driven, and include a call to action. Format as a numbered list.`;
      break;
    case "hashtags":
      prompt = `You are a TikTok growth expert. Generate 15-20 viral hashtags for a ${userNiche} creator${topic ? ` posting about "${topic}"` : ""}. Include a mix of trending, niche, and broad hashtags. Format as a space-separated list with # prefix.`;
      break;
    case "viral_ideas":
      prompt = `You are a viral TikTok strategist. Generate 5 high-potential video ideas for a ${userNiche} creator${topic ? ` around the theme "${topic}"` : ""}. For each idea, provide: title, hook (first 3 seconds), and why it will go viral. Format as a numbered list.`;
      break;
    case "content_plan":
      prompt = `You are a TikTok content strategist. Create a 7-day content plan for a ${userNiche} TikTok creator. For each day provide: video concept, best posting time, and expected engagement type. Make it practical and actionable.`;
      break;
    default:
      prompt = `You are a TikTok content expert. Help a ${userNiche} creator with: ${topic ?? "growing their TikTok account"}.`;
  }

  const result = await callAI([{ role: "user", content: prompt }]);
  const suggestions = result.split("\n").filter(l => l.trim().match(/^\d+\./)).map(l => l.trim());

  res.json({ result, suggestions });
});

router.post("/ai/chat", requireAuth, requirePremium, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const { message, history } = req.body;

  const systemPrompt = `You are TokPulse AI, a friendly and expert TikTok growth assistant. You help Nigerian and African creators go viral with caption writing, hashtag strategies, content ideas, and analytics insights. The user's content niche is: ${user.niche ?? "general"}. Be concise, practical, and energetic. Use data-driven advice when possible.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...(history ?? []).slice(-10),
    { role: "user", content: message },
  ];

  const reply = await callAI(messages);
  res.json({ reply });
});

export default router;
