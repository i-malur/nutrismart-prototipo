import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: "10mb" }));

// Modelo padrão atualizado para o identificador oficial do Groq
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// Inicialização segura da SDK do Groq
function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GROQ_API_KEY não encontrada nas variáveis de ambiente!");
    return null;
  }
  return new Groq({ apiKey });
}

// Função auxiliar para limpar marcações Markdown de JSON da IA
function cleanJsonText(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "NutriSmart", engine: "Groq", timestamp: new Date().toISOString() });
});

// 1. Endpoint: Sugestão de Receitas com Groq
app.post("/api/ai/suggest-recipes", async (req, res) => {
  try {
    const { 
      pantryItems = [], 
      preference = "Equilibrada", 
      maxTime = 30, 
      servings = 2, 
      customNotes = "",
      dietaryRestrictions = [],
      customRestrictions = "" 
    } = req.body;
    
    const groq = getGroqClient();
    const pantryNames = pantryItems.map((item: any) => `${item.name} (${item.quantity} ${item.unit || 'un'})`).join(", ");

    if (!groq) {
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
              "Higienize todos os vegetais e corte em cubos uniformes.",
              "Aqueça uma frigideira com azeite de oliva.",
              "Doure primeiro os temperos e proteínas.",
              "Adicione os vegetais e refogue até ficarem al dente.",
              "Tempere a gosto e sirva imediatamente."
            ],
            chefTips: "Utilize cascas de legumes para caldos caseiros."
          }
        ]
      });
    }

    const systemPrompt = `Você é o chef e nutricionista sênior do aplicativo NutriSmart.
Crie 3 receitas saudáveis, práticas e criativas em português do Brasil, priorizando os ingredientes disponíveis na dispensa do usuário.

REGRAS RÍGIDAS DE SEGURANÇA ALIMENTAR:
- JAMAIS inclua ingredientes que violem as restrições alimentares do usuário.
- Restrições Selecionadas: ${JSON.stringify(dietaryRestrictions)}
- Restrições Personalizadas (Texto Livre): ${JSON.stringify(customRestrictions)}

Ingredientes na dispensa: ${pantryNames || 'Ovos, Arroz integral, Tomates, Abobrinha, Azeite, Frango'}
Preferência: ${preference} | Tempo máximo: ${maxTime} min | Porções: ${servings}
Observações: ${customNotes || 'Nenhuma'}

Responda EXCLUSIVAMENTE um array JSON válido no formato:
[
  {
    "id": "rec-ai-1",
    "title": "Nome da receita",
    "description": "Breve descrição (2 frases)",
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
      { "name": "Nome", "amount": "Qtd", "isInPantry": true }
    ],
    "instructions": [
      "Passo 1...",
      "Passo 2..."
    ],
    "chefTips": "Dica de chef."
  }
]`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Gere as 3 receitas conforme as instruções." }
      ],
      model: GROQ_MODEL,
      temperature: 0.6,
      max_tokens: 2048,
    });

    const responseText = cleanJsonText(completion.choices[0]?.message?.content || "[]");
    let recipes = [];
    try {
      recipes = JSON.parse(responseText);
      if (!Array.isArray(recipes) && (recipes as any).recipes) {
        recipes = (recipes as any).recipes;
      }
    } catch (e) {
      console.error("Erro ao converter JSON do Groq:", e);
    }

    res.json({ success: true, recipes });
  } catch (error: any) {
    console.error("Erro em /api/ai/suggest-recipes:", error);
    res.status(500).json({ error: error.message || "Erro ao gerar receitas com Groq" });
  }
});

// 2. Endpoint: Gerador de Cardápio Semanal
app.post("/api/ai/generate-meal-plan", async (req, res) => {
  try {
    const { 
      goal = "Equilíbrio & Vitalidade", 
      calorieTarget = 2000, 
      pantryItems = [], 
      dietaryRestrictions = [], 
      customRestrictions = "" 
    } = req.body;
    
    const groq = getGroqClient();
    const pantryList = pantryItems.map((i: any) => i.name).slice(0, 15).join(", ");

    if (!groq) {
      return res.status(200).json({
        success: true,
        isFallback: true,
        message: "Cardápio padrão carregado."
      });
    }

    const systemPrompt = `Você é o planejador nutricional com IA do aplicativo NutriSmart.
Crie um cardápio semanal personalizado de 7 dias (Segunda a Domingo) para um usuário brasileiro.

REGRAS DE SEGURANÇA ALIMENTAR:
- Respeite rigorosamente as restrições alimentares: ${JSON.stringify(dietaryRestrictions)}
- Restrições personalizadas em texto livre: ${JSON.stringify(customRestrictions)}

Meta: ${goal} | Calorias diárias: ${calorieTarget} kcal
Dispensa: ${pantryList || 'Ovos, arroz, feijão, frango, legumes, aveia, frutas'}

Retorne um array JSON válido contendo os 7 dias (Segunda-feira a Domingo).`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Gere o cardápio semanal em formato JSON." }
      ],
      model: GROQ_MODEL,
      temperature: 0.6,
      max_tokens: 3000,
    });

    const parsed = JSON.parse(cleanJsonText(completion.choices[0]?.message?.content || "[]"));
    res.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error("Erro em /api/ai/generate-meal-plan:", error);
    res.status(500).json({ error: error.message || "Erro ao gerar cardápio com Groq" });
  }
});

// 3. Endpoint: Análise de Dispensa & Anti-desperdício
app.post("/api/ai/analyze-pantry", async (req, res) => {
  try {
    const { pantryItems = [] } = req.body;
    const groq = getGroqClient();

    if (!groq) {
      return res.json({
        success: true,
        summary: "Sua dispensa possui uma boa base de proteínas e carboidratos complexos.",
        urgentAction: "Consuma itens frescos nas próximas 48 horas.",
        missingNutrients: ["Folhas verdes escuras", "Frutas frescas"],
        wasteScore: 90,
        suggestedCombos: [
          "Omelete de espinafre com tomates",
          "Panqueca de banana com aveia"
        ]
      });
    }

    const itemsSummary = pantryItems
      .map((i: any) => `- ${i.name}: ${i.quantity} ${i.unit || ''} (Validade: ${i.expirationDate || 'Não informada'})`)
      .join("\n");

    const systemPrompt = `Analise a dispensa do usuário e forneça um diagnóstico nutricional e anti-desperdício em português do Brasil:
Itens na dispensa:
${itemsSummary}

Responda obrigatoriamente no formato JSON:
{
  "summary": "Resumo do equilíbrio nutricional da dispensa",
  "urgentAction": "Item a ser consumido imediatamente",
  "missingNutrients": ["Nutrientes ou alimentos faltantes"],
  "wasteScore": 88,
  "suggestedCombos": ["Combinação rápida 1", "Combinação rápida 2"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }],
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 1024,
    });

    const parsed = JSON.parse(cleanJsonText(completion.choices[0]?.message?.content || "{}"));
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Erro em /api/ai/analyze-pantry:", error);
    res.status(500).json({ error: error.message || "Erro ao analisar dispensa com Groq" });
  }
});

// 4. Endpoint: Chat com o Assistente Virtual (NutriSmart IA)
app.post("/api/ai/assistant-chat", async (req, res) => {
  try {
    const { message, chatHistory = [], userContext = {}, pantryItems = [] } = req.body || {};
    const groq = getGroqClient();

    if (!groq) {
      return res.json({
        reply: "Olá! Sou a NutriSmart IA 🥗. Defina sua GROQ_API_KEY no arquivo .env para ativarmos o atendimento inteligente via Groq!"
      });
    }

    const restrictions = [
      ...(userContext.dietaryRestrictions || []),
      userContext.customRestrictions
    ].filter(Boolean).join(", ");

    const systemInstruction = `Você é a NutriSmart IA, especialista em nutrição prática, culinária consciente e combate ao desperdício alimentar no Brasil.

### DADOS DO USUÁRIO
- **Nome:** ${userContext.name || 'Usuário'}
- **Restrições Alimentares Absolutas:** ${restrictions || 'Nenhuma restrição declarada'}
- **Dispensa Atual (${pantryItems.length} itens):**
${pantryItems.map((i: any) => `- ${i.name}: ${i.quantity} ${i.unit || 'un'}`).join('\n')}

### REGRAS RÍGIDAS DE RESPOSTA:
1. Sempre que o usuário pedir sugestão de receita, forneça OBRIGATORIAMENTE APENAS 2 RECEITAS práticas.
2. NUNCA utilize caracteres especiais de Markdown como **, ##, --- ou tabelas (|).
3. Responda em texto limpo com quebras de linha normais.
4. Respeite rigorosamente as restrições alimentares do usuário (${restrictions}). Nunca sugira alimentos que estão na restrição do usuário.
5. Priorize produtos próximos do vencimento na dispensa.
6. Seja amigável, acolhedor e direto. Use negrito para destacar pratos e ingredientes.
`;

    const formattedHistory = Array.isArray(chatHistory)
      ? chatHistory
          .map((h: any) => `${h.role === "assistant" ? "Assistente" : "Usuário"}: ${h.text || h.content || ""}`)
          .join("\n")
      : "";

    const fullUserPrompt = `Histórico:\n${formattedHistory}\n\nUsuário: ${message || "Olá"}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: fullUserPrompt }
      ],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || "Não foi possível gerar uma resposta no momento.";

    return res.json({ reply });
  } catch (error: any) {
    console.error("Erro em /api/ai/assistant-chat:", error);
    return res.status(200).json({ 
      reply: "Tive um pequeno contratempo ao conectar com o serviço do Groq. Por favor, tente novamente.",
      error: error.message || "Erro interno na chamada do Groq"
    });
  }
});

// -----------------------------------------------------------
// CONFIGURAÇÃO DO SERVIDOR (LOCAL / PRODUÇÃO / VERCEL)
// -----------------------------------------------------------

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor NutriSmart rodando em http://localhost:${PORT}`);
    console.log(`🤖 IA ativa via Groq (Modelo: ${GROQ_MODEL})`);
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = app;
}

export default app;