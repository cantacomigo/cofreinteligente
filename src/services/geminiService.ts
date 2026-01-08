import { GoogleGenAI, getGenerativeModel } from "@google/genai";
import { Goal } from "../types.ts";

// Inicialização correta com objeto de opções para @google/genai
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
const MODEL_NAME = "gemini-1.5-flash";

export async function getFinancialInsight(goal: Goal, userBalance: number) {
  // getGenerativeModel é uma função standalone neste SDK
  const model = getGenerativeModel(genAI, {
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object" as any,
        properties: {
          analysis: { type: "string" as any },
          monthlySuggestion: { type: "number" as any },
          actionSteps: {
            type: "array" as any,
            items: { type: "string" as any }
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
  const model = getGenerativeModel(genAI, {
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "array" as any,
        items: {
          type: "object" as any,
          properties: {
            product: { type: "string" as any },
            yield: { type: "string" as any },
            liquidity: { type: "string" as any },
            reasoning: { type: "string" as any }
          },
          required: ["product", "yield", "liquidity", "reasoning"]
        }
      },
    },
  });

  const prompt = `
    Sugira 3 investimentos para estas metas: ${goals.map(g => g.title).join(", ")}. 
    Saldo atual investido: R$ ${balance}.
    Foque em produtos conservadores (CDB, Tesouro, LCI/LCA).
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
  const model = getGenerativeModel(genAI, { model: MODEL_NAME });
  
  const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 500,
    },
  });

  try {
    const fullMessage = `Contexto do usuário: ${context}. Pergunta: ${message}`;
    const result = await chat.sendMessage(fullMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("[geminiService] Chat Error:", error);
    return "Desculpe, tive um problema ao processar sua pergunta.";
  }
}