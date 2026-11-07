// novo index

import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Rota de Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "NutriSmart" });
});

// Chat com IA
app.post("/api/ai/assistant-chat", async (req, res) => {
  try {
    const { message, chatHistory = [], userContext = {} } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: "Olá! Sou o Assistente NutriSmart. A chave GEMINI_API_KEY não foi encontrada nas variáveis de ambiente da Vercel."
      });
    }

    const systemInstruction = `Você é o NutriSmart AI, assistente virtual inteligente de nutrição e culinária prática.
Usuário: ${userContext.name || 'Usuário'}`;

    const formattedHistory = Array.isArray(chatHistory)
      ? chatHistory
          .map((h: any) => `${h.role === "assistant" ? "Assistente" : "Usuário"}: ${h.text || h.content || ""}`)
          .join("\n")
      : "";

    const prompt = `Instrução: ${systemInstruction}\n\nHistórico:\n${formattedHistory}\n\nUsuário: ${message || "Olá"}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return res.json({ reply: response.text || "Sem resposta do modelo." });
  } catch (error: any) {
    console.error("Error in assistant-chat:", error);
    return res.status(200).json({
      reply: "Tive um problema ao consultar a IA no momento. Tente novamente em instantes.",
      error: error.message
    });
  }
});

export default function handler(req: any, res: any) {
  return app(req, res);
}