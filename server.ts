import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Função auxiliar para limpar markdown de respostas JSON da IA
function cleanJsonText(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "NutriSmart", timestamp: new Date().toISOString() });
});

// 1. AI Recipe Suggestion Endpoint
app.post("/api/ai/suggest-recipes", async (req, res) => {
  try {
    const { 
      pantryItems = [], 
      preference = "Equilibrada", 
      maxTime = 30, 
      servings = 2, 
      customNotes = "",
      dietaryRestrictions = [],
      customRestrictions = [] 
    } = req.body;
    
    const ai = getGeminiClient();
    const pantryNames = pantryItems.map((item: any) => `${item.name} (${item.quantity} ${item.unit || 'un'})`).join(", ");

    if (!ai) {
      // Fallback inteligente caso a chave não esteja configurada ou offline
      return res.json({
        success: true,
        isFallback: true,
        recipes: [
          {
            id: `rec-ai-${Date.now()}-1`,
            title: `Salteado Rústico NutriSmart com ${pantryItems[0]?.name || 'Vegetais'}`,
            description: "Receita rápida e saborosa desenvolvida para maximizar o aproveitamento dos itens da sua dispensa.",
            prepTimeMinutes: Math.min(Number(maxTime) || 20, 20),
            difficulty: "Fácil",
            calories: 340,
            proteinGrams: 24,
            carbsGrams: 32,
            fatGrams: 12,
            servings: Number(servings) || 2,
            tags: [preference, "Zero Desperdício", "Rápida"],
            pantryMatchPercent: 90,
            imageUrl: "[https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80](https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80)",
            ingredients: pantryItems.slice(0, 5).map((p: any) => ({
              name: p.name,
              amount: `${p.quantity} ${p.unit || 'un'}`,
              isInPantry: true
            })),
            instructions: [
              "Higienize todos os vegetais e corte em cubos ou fatias uniformes.",
              "Aqueça uma frigideira média com azeite ou óleo vegetal em fogo médio.",
              "Doure primeiro os temperos e proteínas até selarem bem.",
              "Adicione os vegetais e refogue por 5 a 7 minutos até ficarem al dente.",
              "Acerte o sal, pimenta e ervas a gosto e sirva imediatamente bem quentinho."
            ],
            chefTips: "Guarde as cascas limpas para fazer um caldo caseiro aromático."
          }
        ]
      });
    }

    const prompt = `Você é o chef e nutricionista executivo sênior do aplicativo NutriSmart.
Crie 3 receitas saudáveis, práticas e criativas em português do Brasil, priorizando ao máximo os ingredientes que o usuário tem na dispensa.

REGRAS DE OURO:
- NUNCA inclua ingredientes que violem as restrições alimentares do usuário!
- Restrições Alimentares Selecionadas: ${JSON.stringify(dietaryRestrictions)}
- Restrições Personalizadas (Texto Livre): ${JSON.stringify(customRestrictions)}

Ingredientes disponíveis na dispensa do usuário:
${pantryNames || 'Ovos, Arroz integral, Tomates, Abobrinha, Azeite, Frango'}

Preferência alimentar: ${preference}
Tempo máximo de preparo: ${maxTime} minutos
Número de porções: ${servings}
Observações extras: ${customNotes || 'Nenhuma'}

Responda OBRIGATORIAMENTE em JSON válido, com a seguinte estrutura de array:
[
  {
    "id": "rec-ai-1",
    "title": "Nome criativo e apetitoso do prato",
    "description": "Breve descrição apetitosa e nutricional (2 frases)",
    "prepTimeMinutes": 20,
    "difficulty": "Fácil",
    "calories": 350,
    "proteinGrams": 28,
    "carbsGrams": 30,
    "fatGrams": 12,
    "servings": ${servings},
    "tags": ["Low Carb", "Zero Desperdício"],
    "pantryMatchPercent": 95,
    "imageUrl": "[https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80](https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80)",
    "ingredients": [
      { "name": "Nome do ingrediente", "amount": "Quantidade", "isInPantry": true }
    ],
    "instructions": [
      "Passo 1 detalhado...",
      "Passo 2 detalhado...",
      "Passo 3 detalhado..."
    ],
    "chefTips": "Dica prática de chef para conservar ou turbinar o sabor."
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = cleanJsonText(response.text || "[]");
    let recipes = [];
    try {
      recipes = JSON.parse(responseText);
      if (!Array.isArray(recipes) && (recipes as any).recipes) {
        recipes = (recipes as any).recipes;
      }
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
    }

    res.json({ success: true, recipes });
  } catch (error: any) {
    console.error("Error in /api/ai/suggest-recipes:", error);
    res.status(500).json({ error: error.message || "Erro ao gerar receitas com IA" });
  }
});

// 2. AI Weekly Meal Plan Generator
app.post("/api/ai/generate-meal-plan", async (req, res) => {
  try {
    const { 
      goal = "Equilíbrio & Vitalidade", 
      calorieTarget = 2000, 
      pantryItems = [], 
      dietaryRestrictions = [], 
      customRestrictions = [] 
    } = req.body;
    
    const ai = getGeminiClient();
    const pantryList = pantryItems.map((i: any) => i.name).slice(0, 15).join(", ");

    if (!ai) {
      return res.status(200).json({
        success: true,
        isFallback: true,
        message: "Cardápio padrão otimizado carregado."
      });
    }

    const prompt = `Você é o planejador nutricional com IA do aplicativo NutriSmart.
Crie um cardápio semanal personalizado de 7 dias (Segunda a Domingo) para um usuário brasileiro.

REGRAS DE SEGURANÇA ALIMENTAR:
- Respeite rigorosamente as restrições alimentares do usuário: ${JSON.stringify(dietaryRestrictions)}
- Respeite as restrições personalizadas em texto livre: ${JSON.stringify(customRestrictions)}

Meta nutricional: ${goal}
Calorias diárias estimadas: ${calorieTarget} kcal
Alimentos disponíveis na dispensa para priorizar: ${pantryList || 'Ovos, arroz, feijão, frango, legumes, aveia, frutas'}

Retorne um array JSON com 7 dias, no formato exato:
[
  {
    "dayName": "Segunda-feira",
    "dayShort": "SEG",
    "date": "Semana Atual",
    "breakfast": {
      "id": "m-ai-1",
      "name": "Nome do Café da Manhã",
      "calories": 320,
      "protein": 16,
      "carbs": 38,
      "fat": 10,
      "prepTime": "10 min",
      "description": "Benefício nutricional rápido",
      "ingredients": ["Ovo", "Aveia", "Banana"]
    },
    "lunch": {
      "id": "m-ai-2",
      "name": "Nome do Almoço",
      "calories": 520,
      "protein": 40,
      "carbs": 50,
      "fat": 14,
      "prepTime": "25 min",
      "description": "Prato principal balanceado",
      "ingredients": ["Frango", "Arroz integral", "Salada"]
    },
    "snack": {
      "id": "m-ai-3",
      "name": "Nome do Lanche",
      "calories": 200,
      "protein": 10,
      "carbs": 22,
      "fat": 8,
      "prepTime": "5 min",
      "description": "Lanche prático",
      "ingredients": ["Iogurte", "Castanhas"]
    },
    "dinner": {
      "id": "m-ai-4",
      "name": "Nome do Jantar",
      "calories": 360,
      "protein": 28,
      "carbs": 20,
      "fat": 12,
      "prepTime": "20 min",
      "description": "Jantar leve de fácil digestão",
      "ingredients": ["Ovos", "Legumes refogados"]
    },
    "totalCalories": 1400,
    "totalProtein": 94,
    "totalCarbs": 130,
    "totalFat": 44,
    "waterGoalLiters": 2.5
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(cleanJsonText(response.text || "[]"));
    res.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error("Error in /api/ai/generate-meal-plan:", error);
    res.status(500).json({ error: error.message || "Erro ao gerar cardápio com IA" });
  }
});

// 3. AI Pantry Analysis & Anti-Waste Diagnostics
app.post("/api/ai/analyze-pantry", async (req, res) => {
  try {
    const { pantryItems = [] } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        summary: "Sua dispensa possui uma boa base de proteínas e carboidratos complexos.",
        urgentAction: "Consuma o Espinafre e os Tomates nas próximas 48 horas.",
        missingNutrients: ["Folhas verdes escuras adicionais", "Frutas ricas em vitamina C"],
        wasteScore: 92,
        suggestedCombos: [
          "Frittata de espinafre com queijo e tomates maduros",
          "Panqueca de banana com aveia e canela"
        ]
      });
    }

    const itemsSummary = pantryItems
      .map((i: any) => `- ${i.name}: ${i.quantity} ${i.unit || ''} (Validade: ${i.expirationDate || 'Não informada'})`)
      .join("\n");

    const prompt = `Analise a dispensa do usuário e forneça um diagnóstico nutricional e anti-desperdício em português do Brasil:
Itens na dispensa:
${itemsSummary}

Responda em JSON com o formato:
{
  "summary": "Resumo geral do equilíbrio nutricional da dispensa (2 frases)",
  "urgentAction": "Qual item deve ser consumido imediatamente e por quê",
  "missingNutrients": ["Nutriente ou grupo alimentar que falta para equilibrar a semana"],
  "wasteScore": 88,
  "suggestedCombos": ["Sugestão rápida de combinação 1", "Sugestão rápida de combinação 2", "Sugestão 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(cleanJsonText(response.text || "{}"));
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Error in /api/ai/analyze-pantry:", error);
    res.status(500).json({ error: error.message || "Erro ao analisar dispensa" });
  }
});

// 4. AI Nutrition & Cooking Assistant Chat
app.post("/api/ai/assistant-chat", async (req, res) => {
  try {
    const { message, chatHistory = [], userContext = {}, pantryItems = [] } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: "Olá! Sou a NutriSmart IA 🥗. Estou conectada à sua dispensa e às suas restrições. Como posso te ajudar com receitas ou rotina hoje?"
      });
    }

    const systemInstruction = `
Você é a NutriSmart IA, uma assistente virtual especialista em nutrição prática, culinária consciente e combate ao desperdício de alimentos no contexto brasileiro.

### PERFIL E DADOS DO USUÁRIO
- **Nome:** ${userContext.name || 'Usuário'}
- **Estilo de Alimentação:** ${userContext.diet || 'Equilibrada'}
- **Restrições Alimentares Selecionadas:** ${JSON.stringify(userContext.dietaryRestrictions || [])}
- **Restrições Personalizadas em Texto Livre:** ${JSON.stringify(userContext.customRestrictions || [])}
- **Dispensa Atual do Usuário (${pantryItems.length} itens):**
${pantryItems.map((i: any) => `- ${i.name}: ${i.quantity} ${i.unit || 'un'}`).join('\n')}

### REGRAS RÍGIDAS DE ATUAÇÃO
1. **Segurança Alimentar Absoluta:** Respeite estritamente as restrições alimentares e personalizadas. NUNCA sugira ingredientes proibidos ao usuário (ex.: se houver "Não como carne de porco", proíba derivados suínos).
2. **Combate ao Desperdício:** Priorize o reaproveitamento dos itens da dispensa do usuário.
3. **Escopo Profissional:** Não faça diagnósticos médicos. Se o usuário pedir orientações clínicas avançadas, recomende que consulte um nutricionista na aba "Nutricionistas".
4. **Tom de Voz:** Acolhedor, prático, encorajador e direto ao ponto. Use negrito para destacar pontos-chave e bullet points.`;

    const formattedHistory = Array.isArray(chatHistory)
      ? chatHistory
          .map((h: any) => `${h.role === "assistant" ? "Assistente" : "Usuário"}: ${h.text || h.content || ""}`)
          .join("\n")
      : "";

    const prompt = `Histórico da Conversa:\n${formattedHistory}\n\nUsuário: ${message || "Olá"}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return res.json({ 
      reply: response.text || "Não foi possível gerar uma resposta no momento." 
    });
  } catch (error: any) {
    console.error("Error in /api/ai/assistant-chat:", error);
    
    return res.status(200).json({ 
      reply: "Tive um problema ao processar sua solicitação com a IA. Por favor, tente novamente em alguns instantes.",
      error: error.message || "Erro interno no servidor de IA"
    });
  }
});

// -----------------------------------------------------------
// CONFIGURAÇÃO DE AMBIENTE (PRODUÇÃO / LOCAL / VERCEL)
// -----------------------------------------------------------

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NutriSmart Server running on http://localhost:${PORT}`);
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = app;
}

export default app;