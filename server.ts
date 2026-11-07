import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

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

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "NutriSmart", timestamp: new Date().toISOString() });
});

// 1. AI Recipe Suggestion Endpoint
app.post("/api/ai/suggest-recipes", async (req, res) => {
  try {
    const { pantryItems = [], preference = "Equilibrada", maxTime = 30, servings = 2, customNotes = "" } = req.body;
    const ai = getGeminiClient();

    const pantryNames = pantryItems.map((item: any) => `${item.name} (${item.quantity} ${item.unit || 'un'})`).join(", ");

    if (!ai) {
      // Fallback intelligent response if offline / without key
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
            imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
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

Ingredientes disponíveis na dispensa do usuário:
${pantryNames || 'Ovos, Arroz integral, Tomates, Abobrinha, Azeite, Frango'}

Preferência alimentar do usuário: ${preference}
Tempo máximo de preparo: ${maxTime} minutos
Número de porções: ${servings}
Observações extras do usuário: ${customNotes || 'Nenhuma'}

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
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    "ingredients": [
      { "name": "Nome do ingrediente", "amount": "Quantidade", "isInPantry": true }
    ],
    "instructions": [
      "Passo 1 detalhado...",
      "Passo 2 detalhado...",
      "Passo 3 detalhado..."
    ],
    "chefTips": "Dica prática de chef ou nutricionista para conservar ou turbinar o sabor."
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "[]";
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
    const { goal = "Equilíbrio & Vitalidade", calorieTarget = 2000, pantryItems = [], days = 7 } = req.body;
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
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "[]");
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
      .map((i: any) => `- ${i.name}: ${i.quantity} ${i.unit || ''} (Validade: ${i.expirationDate || 'N/A'}, restam ${i.daysLeft || '?'} dias)`)
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
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Error in /api/ai/analyze-pantry:", error);
    res.status(500).json({ error: error.message || "Erro ao analisar dispensa" });
  }
});

// 4. AI Nutrition & Cooking Assistant Chat
app.post("/api/ai/assistant-chat", async (req, res) => {
  try {
    const { message, chatHistory = [], userContext = {} } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: `Olá! Sou o Assistente NutriSmart com IA. Para aproveitar ao máximo seus alimentos, tente combinar suas proteínas com vegetais frescos e fibras. Como posso ajudar com suas receitas ou rotina hoje?`
      });
    }

    const systemInstruction = `Você é o NutriSmart AI, assistente virtual inteligente e acolhedor de nutrição saudável, culinária prática e sustentabilidade alimentar.
Responda sempre de forma encorajadora, com rigor científico e aplicabilidade na rotina brasileira. Dê dicas de substituições saudáveis, conservação de alimentos, tempo de preparo e adequação aos objetivos do usuário.
Usuário atual: ${userContext.name || 'Usuário'}
Objetivos: ${JSON.stringify(userContext.goals || ['Equilíbrio'])}
Alergias: ${JSON.stringify(userContext.allergies || [])}
`;

    const contents = [
      ...chatHistory.map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.text || h.content || "" }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error in /api/ai/assistant-chat:", error);
    res.status(500).json({ error: error.message || "Erro no chat com IA" });
  }
});

// -----------------------------------------------------------
// CONFIGURAÇÃO DE AMBIENTE (PRODUÇÃO / LOCAL / VERCEL)
// -----------------------------------------------------------

// Em ambiente de produção tradicional (fora da Vercel)
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Rodar localmente apenas quando NÃO estiver na Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NutriSmart Server running on http://localhost:${PORT}`);
  });
}

// EXPORTAÇÃO COMPATÍVEL COM VERCEL SERVERLESS (.cjs / CommonJS):
module.exports = app;
export default app;