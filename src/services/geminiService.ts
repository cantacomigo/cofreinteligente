import { GoogleGenAI } from "@google/genai";
import { Goal } from "../types.ts";

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
const client = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = "gemini-1.5-flash";

export async function getFinancialInsight(goal: Goal, userBalance: number) {
  if (!API_KEY) return null;

  const prompt = `
    Analise esta meta financeira:
    Título: ${goal.title}, Alvo: R$ ${goal.targetAmount}, Atual: R$ ${goal.currentAmount}, Prazo: ${goal.deadline}.
    Saldo disponível do usuário: R$ ${userBalance}.
    Forneça uma análise curta, sugestão mensal e 3 passos.
    Retorne OBRIGATORIAMENTE um JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["...", "...", "..."]}
  `;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: [{ 
        role: 'user', 
        parts: [{ text: prompt }] 
      }],
      config: { 
        responseMimeType: "application/json" 
      }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("[geminiService] Insight Error:", error);
    return null;
  }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  if (!API_KEY || goals.length === 0) return [];

  const prompt = `
    Sugira 3 investimentos conservadores para: ${goals.map(g => g.title).join(", ")}. Saldo: R$ ${balance}.
    Retorne JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]
  `;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: [{ 
        role: 'user', 
        parts: [{ text: prompt }] 
      }],
      config: { 
        responseMimeType: "application/json" 
      }
    });

    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("[geminiService] Recs Error:", error);
    return [];
  }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  if (!API_KEY) return "Serviço de IA indisponível no momento.";

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: [{ 
        role: 'user',
        parts: [{ text: `Contexto: ${context}. Você é um consultor financeiro brasileiro. Pergunta: ${message}` }] 
      }]
    });
    
    return response.text || "Não consegui processar sua resposta.";
  } catch (error) {
    console.error("[geminiService] Chat Error:", error);
    return "Erro ao conectar com o consultor IA.";
  }
}