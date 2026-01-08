import { GoogleGenAI, Type } from "@google/genai";
import { Goal } from "../types.ts";

// Inicialização correta com objeto de opções
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = "gemini-1.5-flash";

export async function getFinancialInsight(goal: Goal, userBalance: number) {
  // Usamos 'as any' para contornar a falta da propriedade na definição de tipo do SDK, mantendo a funcionalidade
  const model = (genAI as any).getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          monthlySuggestion: { type: Type.NUMBER },
          actionSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["analysis", "monthlySuggestion", "actionSteps"]
      },
    },
  });

  const prompt = `
    Analise esta meta financeira:
    Título: ${goal.title}
    Valor Alvo: R$ ${goal.targetAmount}
    Valor Atual: R$ ${goal.currentAmount}
    Prazo: ${goal.deadline}
    Saldo disponível do usuário: R$ ${userBalance}

    Forneça uma análise curta, uma sugestão de valor para poupar mensalmente e 3 passos de ação.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("[geminiService] Insight Error:", error);
    return null;
  }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  const model = (genAI as any).getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            product: { type: Type.STRING },
            yield: { type: Type.STRING },
            liquidity: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["product", "yield", "liquidity", "reasoning"]
        }
      },
    },
  });

  const prompt = `
    Sugira 3 investimentos conservadores (CDB, Tesouro Selic, LCI/LCA) para estas metas: ${goals.map(g => g.title).join(", ")}. 
    Saldo atual investido: R$ ${balance}.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("[geminiService] Recs Error:", error);
    return [];
  }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  const model = (genAI as any).getGenerativeModel({
    model: MODEL_NAME,
  });

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Você é o consultor do Cofre Inteligente. Seja educado e use termos de educação financeira brasileiros." }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido. Como posso ajudar com suas finanças hoje?" }],
        },
      ],
    });

    const result = await chat.sendMessage(`Contexto das metas atuais: ${context}. Pergunta do usuário: ${message}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("[geminiService] Chat Error:", error);
    return "Desculpe, tive um problema ao processar sua pergunta.";
  }
}