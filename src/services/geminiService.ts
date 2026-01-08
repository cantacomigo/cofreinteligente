import { GoogleGenerativeAI } from "@google/generative-ai";
import { Goal } from "../types.ts";

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
const genAI = API_KEY && API_KEY !== "undefined" && API_KEY.length > 10 ? new GoogleGenerativeAI(API_KEY) : null;
const MODEL_NAME = "gemini-1.5-flash";

export async function getFinancialInsight(goal: Goal, userBalance: number) {
  if (!genAI) return null;

  const prompt = `
    Analise esta meta financeira:
    Título: ${goal.title}, Alvo: R$ ${goal.targetAmount}, Atual: R$ ${goal.currentAmount}, Prazo: ${goal.deadline}.
    Saldo disponível do usuário: R$ ${userBalance}.
    Forneça uma análise curta, sugestão mensal e 3 passos.
    Retorne OBRIGATORIAMENTE um JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["...", "...", "..."]}
  `;

  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    // Silenciando o erro para não poluir o console do usuário se a chave for inválida
    return null;
  }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  if (!genAI || goals.length === 0) return [];

  const prompt = `
    Sugira 3 investimentos conservadores para: ${goals.map(g => g.title).join(", ")}. Saldo: R$ ${balance}.
    Retorne JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]
  `;

  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    return [];
  }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  if (!genAI) return "O serviço de consultoria IA requer uma configuração de chave de API válida.";

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const fullPrompt = `Contexto: ${context}. Você é um consultor financeiro brasileiro experiente. Pergunta: ${message}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text() || "Não consegui processar sua resposta.";
  } catch (error) {
    return "Erro de conexão com o serviço de IA. Verifique sua chave de API.";
  }
}