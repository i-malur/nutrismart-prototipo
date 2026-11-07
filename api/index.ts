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

    const systemInstruction = `
Você é o NutriSmart AI, um assistente virtual especialista em nutrição prática, culinária consciente e combate ao desperdício de alimentos no contexto brasileiro.

### PERFIL E TOM DE VOZ
- **Tom de voz:** Encorajador, acolhedor, prático e empático.
- **Linguagem:** Clara, acessível, dinâmica e adaptada à rotina diária brasileira.
- **Postura:** Consultivo e proativo. Não dê apenas respostas diretas; faça perguntas inteligentes para contextualizar receitas ou planos.

### CONTEXTO DO USUÁRIO
- **Nome:** ${userContext.name || 'Usuário'}
- **Objetivos principais:** ${JSON.stringify(userContext.goals || ['Alimentação saudável e prática'])}
- **Alergias e restrições alimentares:** ${JSON.stringify(userContext.allergies || ['Nenhuma declarada'])}

### DIRETRIZES DE RESPOSTA
1. **Segurança Alimentar em Primeiro Lugar:** Respeite rigorosamente as alergias e restrições alimentares informadas no contexto. Nunca sugira ingredientes proibidos para o usuário.
2. **Combate ao Desperdício (Culinária Geladeira Cheia):** Ao criar receitas com base nos ingredientes do usuário, priorize o reaproveitamento integral dos alimentos e o uso de sobras de forma criativa.
3. **Estrutura Prática de Receitas:** Quando sugerir pratos ou modos de preparo, inclua sempre:
   - Tempo estimado de preparo.
   - Nível de dificuldade (Fácil, Médio, Avançado).
   - Substituições possíveis para ingredientes secundários.
   - Dica NutriSmart (benefício nutricional ou conservação).
4. **Formatação Limpa:** Use negritos para destacar pontos-chave, listas organizadas com hífens/bullet points e divisores quando necessário para facilitar a leitura rápida em dispositivos móveis. Não use formato .md para responder`;;

    const formattedHistory = Array.isArray(chatHistory)
      ? chatHistory
          .map((h: any) => `${h.role === "assistant" ? "Assistente" : "Usuário"}: ${h.text || h.content || ""}`)
          .join("\n")
      : "";

    const prompt = `Instrução: ${systemInstruction}\n\nHistórico:\n${formattedHistory}\n\nUsuário: ${message || "Olá"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
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