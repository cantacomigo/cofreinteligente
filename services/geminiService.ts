
import { GoogleGenAI, Type } from "@google/genai";
import { Goal } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFinancialInsight(goal: Goal, userBalance: number) {
  const prompt = `
    Como um assistente financeiro sênior da fintech "Cofre Inteligente", analise a seguinte meta do usuário:
    Título: ${goal.title}
    Valor Alvo: R$ ${goal.targetAmount}
    Valor Atual: R$ ${goal.currentAmount}
    Prazo: ${goal.deadline}
    Saldo Total do Usuário: R$ ${userBalance}

    Forneça um plano de ação curto (3 tópicos) para atingir essa meta mais rápido, incluindo uma sugestão de economia mensal e uma dica de investimento conservador.
    Responda em JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  const prompt = `
    Analise a carteira de metas do usuário:
    Metas: ${goals.map(g => `${g.title} (Saldo: R$${g.currentAmount}, Alvo: R$${g.targetAmount}, Prazo: ${g.deadline})`).join('; ')}
    Saldo Total Acumulado: R$ ${balance}

    Com base nos prazos das metas, sugira 3 produtos de investimento conservadores do mercado brasileiro (ex: Tesouro Selic, CDB 100% CDI, LCI/LCA).
    Retorne um JSON com uma lista de objetos contendo: product (nome), yield (rentabilidade esperada), liquidity (tipo de liquidez), e reasoning (por que este produto é ideal para as metas citadas).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    console.error("Gemini Recommendations Error:", error);
    return [];
  }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'Você é o consultor do Cofre Inteligente. Seja educado, use termos de educação financeira brasileiros e incentive o usuário a poupar com inteligência.',
    },
  });

  const response = await chat.sendMessage({ message: `${message}. Contexto das minhas metas atuais: ${context}` });
  return response.text;
}
