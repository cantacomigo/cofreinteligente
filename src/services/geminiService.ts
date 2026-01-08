import { GoogleGenAI } from "@google/genai";
import { Goal } from "../types.ts";

// Inicialização com a chave de API conforme as regras do projeto
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
const client = new GoogleGenAI({ apiKey: API_KEY });
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
    Retorne OBRIGATORIAMENTE um JSON neste formato:
    {
      "analysis": "texto",
      "monthlySuggestion": 100,
      "actionSteps": ["passo 1", "passo 2", "passo 3"]
    }
  `;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("[geminiService] Insight Error:", error);
    return null;
  }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  const prompt = `
    Sugira 3 investimentos conservadores para estas metas: ${goals.map(g => g.title).join(", ")}. 
    Saldo atual investido: R$ ${balance}.
    Retorne um JSON (lista de objetos com product, yield, liquidity, reasoning).
  `;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("[geminiService] Recs Error:", error);
    return [];
  }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: [{ 
        role: 'user', 
        parts: [{ text: `Contexto: ${context}. Pergunta: ${message}. Instrução: Seja um consultor financeiro educado.` }] 
      }]
    });
    
    return response.text || "Desculpe, não consegui processar sua resposta.";
  } catch (error) {
    console.error("[geminiService] Chat Error:", error);
    return "Desculpe, tive um problema ao processar sua pergunta.";
  }
}