import { GoogleGenerativeAI } from "@google/generative-ai";
import { Goal } from "../types.ts";

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
// Só inicializa se a chave parecer válida
const genAI = API_KEY && API_KEY !== "undefined" && API_KEY.length > 20 ? new GoogleGenerativeAI(API_KEY) : null;
const MODEL_NAME = "gemini-1.5-flash";

export async function getFinancialInsight(goal: Goal, userBalance: number) {
  if (!genAI) return null;

  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Analise esta meta financeira: Título: ${goal.title}, Alvo: R$ ${goal.targetAmount}, Atual: R$ ${goal.currentAmount}, Prazo: ${goal.deadline}. Saldo do usuário: R$ ${userBalance}. Forneça uma análise curta, sugestão mensal e 3 passos. Retorne JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["...", "...", "..."]}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.warn("[IA] Funcionalidade de insights indisponível (Chave de API pode estar ausente ou inválida)");
    return null;
  }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  if (!genAI || goals.length === 0) return [];

  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Sugira 3 investimentos conservadores brasileiros para as metas: ${goals.map(g => g.title).join(", ")}. Saldo total: R$ ${balance}. Retorne JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    return [];
  }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  if (!genAI) return "Consultoria indisponível. Por favor, configure sua GEMINI_API_KEY.";

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const fullPrompt = `Você é um consultor financeiro. Contexto: ${context}. Pergunta: ${message}`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    return "Desculpe, não consigo responder agora.";
  }
}