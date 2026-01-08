import { GoogleGenerativeAI } from "@google/generative-ai";
import { Goal, Transaction } from "../types.ts";

// Tenta pegar a chave de diferentes fontes de ambiente
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";

// Validação mais rigorosa: evita strings "null" ou "undefined" literais
const isKeyValid = API_KEY && 
                   API_KEY !== "undefined" && 
                   API_KEY !== "null" && 
                   API_KEY.trim().length > 10;

const genAI = isKeyValid ? new GoogleGenerativeAI(API_KEY) : null;
const MODEL_NAME = "gemini-1.5-flash";

export async function getFinancialInsight(goal: Goal, userBalance: number) {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Analise esta meta: ${goal.title}, Alvo: R$ ${goal.targetAmount}, Atual: R$ ${goal.currentAmount}. Saldo: R$ ${userBalance}. Retorne JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["..."], "suggestedTargetAdjustment": 0}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { 
    console.error("[Gemini] Insight error:", error);
    return null; 
  }
}

export async function detectSubscriptions(transactions: Transaction[]) {
  if (!genAI || transactions.length < 5) return [];
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const history = transactions.filter(t => t.type === 'expense').map(t => `${t.description}: R$${t.amount}`).join(', ');
    const prompt = `Identifique assinaturas recorrentes: ${history}. Retorne array JSON: [{"name": "...", "amount": 0, "frequency": "mensal", "tip": "..."}]`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { 
    return []; 
  }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  if (!genAI) return "IA não configurada. Verifique sua GEMINI_API_KEY.";
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const fullPrompt = `Você é o consultor do Cofre Inteligente. Metas: ${context}. Responda em português: ${message}`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) { 
    return "Desculpe, não consigo responder agora."; 
  }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  if (!genAI || goals.length === 0) return [];
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Sugira 3 investimentos para metas: ${goals.map(g => g.title).join(", ")}. Saldo: R$ ${balance}. Retorne JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { 
    return []; 
  }
}

export async function categorizeTransaction(description: string, type: 'income' | 'expense') {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Categorize: "${description}" (${type}). Retorne JSON: {"category": "..."}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { 
    return null; 
  }
}

export async function getCashFlowPrediction(transactions: Transaction[], balance: number) {
  if (!genAI || transactions.length < 3) return null;
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const history = transactions.slice(0, 10).map(t => `${t.type}: R$${t.amount}`).join(', ');
    const prompt = `Preveja saldo em 30 dias. Saldo: R$${balance}. Histórico: ${history}. Retorne JSON: {"predictedBalance": 0, "alert": "...", "riskLevel": "low"}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { 
    return null; 
  }
}