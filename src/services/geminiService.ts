import { GoogleGenerativeAI } from "@google/generative-ai";
import { Goal, Transaction } from "../types.ts";

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
// Validação rigorosa da chave para evitar chamadas 404
const isKeyValid = API_KEY && API_KEY !== "undefined" && API_KEY.length > 10;
const genAI = isKeyValid ? new GoogleGenerativeAI(API_KEY) : null;
const MODEL_NAME = "gemini-1.5-flash";

export async function getFinancialInsight(goal: Goal, userBalance: number) {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Analise esta meta: ${goal.title}, Alvo: R$ ${goal.targetAmount}, Atual: R$ ${goal.currentAmount}. Saldo: R$ ${userBalance}. Sugira um ajuste dinâmico se a renda permitir. Retorne JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["...", "..."], "suggestedTargetAdjustment": 0}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { 
    console.error("[Gemini] Error fetching insight:", error);
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
    const prompt = `Identifique possíveis assinaturas recorrentes ou gastos fixos desnecessários neste histórico: ${history}. Retorne um array JSON: [{"name": "...", "amount": 0, "frequency": "mensal", "tip": "..."}]`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { 
    console.error("[Gemini] Error detecting subscriptions:", error);
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
    const prompt = `Categorize: "${description}" (${type}). Retorne JSON: {"category": "...", "reason": "..."}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { 
    console.error("[Gemini] Error categorizing:", error);
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
    const history = transactions.slice(0, 20).map(t => `${t.type}: R$${t.amount}`).join(', ');
    const prompt = `Preveja saldo em 30 dias. Saldo atual: R$${balance}. Histórico: ${history}. Retorne JSON: {"predictedBalance": 0, "alert": "...", "riskLevel": "low|medium|high"}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { 
    console.error("[Gemini] Error predicting cash flow:", error);
    return null; 
  }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  if (!genAI) return "Consultoria indisponível. Verifique sua chave de API.";
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const fullPrompt = `Você é o consultor do Cofre Inteligente. Contexto de metas: ${context}. Responda de forma curta e amigável em português. Pergunta: ${message}`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) { 
    console.error("[Gemini] Chat error:", error);
    return "Tive um problema ao processar sua pergunta."; 
  }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  if (!genAI || goals.length === 0) return [];
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Sugira 3 investimentos brasileiros reais para metas: ${goals.map(g => g.title).join(", ")}. Saldo: R$ ${balance}. Considere CDI atual (~13.25%). Retorne JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { 
    console.error("[Gemini] Error getting recommendations:", error);
    return []; 
  }
}