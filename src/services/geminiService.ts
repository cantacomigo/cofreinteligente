import { GoogleGenAI, Type } from "@google/genai";
import { Goal } from "../types.ts";

// Inicialização correta com objeto de opções para @google/genai
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
const MODEL_NAME = "gemini-1.5-flash";

export async function getFinancialInsight(goal: Goal, userBalance: number) {
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
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
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
        }
      }
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) return null;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("[geminiService] Insight Error:", error);
    return null;
  }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  const prompt = `
    Sugira 3 investimentos para estas metas: ${goals.map(g => g.title).join(", ")}. 
    Saldo atual investido: R$ ${balance}.
    Foque em produtos conservadores (CDB, Tesouro, LCI/LCA).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
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
        }
      }
    });

    const jsonStr = response.text?.trim();
    return jsonStr ? JSON.parse(jsonStr) : [];
  } catch (error) {
    console.error("[geminiService] Recs Error:", error);
    return [];
  }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "Você é o consultor do Cofre Inteligente. Seja educado e use termos de educação financeira brasileiros.",
      }
    });

    const response = await chat.sendMessage({ 
      message: `Contexto do usuário: ${context}. Pergunta: ${message}` 
    });
    
    return response.text;
  } catch (error) {
    console.error("[geminiService] Chat Error:", error);
    return "Desculpe, tive um problema ao processar sua pergunta.";
  }
}