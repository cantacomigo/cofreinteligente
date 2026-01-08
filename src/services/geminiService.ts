import { GoogleGenerativeAI } from "@google/generative-ai";
import { Goal, Transaction } from "../types.ts";

// Prioriza variáveis do sistema e evita strings de erro comuns
const API_KEY = process.env.GEMINI_API_KEY || "";
const isKeyValid = typeof API_KEY === 'string' && API_KEY.length > 20;

const genAI = isKeyValid ? new GoogleGenerativeAI(API_KEY) : null;
const MODEL_NAME = "gemini-1.5-flash";

export async function getFinancialInsight(goal: Goal, userBalance: number) {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Analise meta: ${goal.title}, Alvo: ${goal.targetAmount}, Atual: ${goal.currentAmount}, Saldo: ${userBalance}. Retorne JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["..."], "suggestedTargetAdjustment": 0}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { 
    console.error("[Gemini] API Error:", error);
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
    const prompt = `Liste assinaturas recorrentes: ${history}. JSON array: [{"name": "...", "amount": 0, "frequency": "mensal", "tip": "..."}]`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { return []; }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  if (!genAI) return "IA não disponível. Verifique sua chave API.";
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const fullPrompt = `Contexto: ${context}. Pergunta: ${message}. Responda curto e em português.`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) { return "Erro ao processar consulta."; }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  if (!genAI || goals.length === 0) return [];
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Sugira 3 investimentos para metas: ${goals.map(g => g.title).join(", ")}. Saldo: ${balance}. JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { return []; }
}

export async function categorizeTransaction(description: string, type: 'income' | 'expense') {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Categorize: "${description}" (${type}). JSON: {"category": "..."}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { return null; }
}

export async function getCashFlowPrediction(transactions: Transaction[], balance: number) {
  if (!genAI || transactions.length < 3) return null;
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const history = transactions.slice(0, 10).map(t => `${t.type}: R$${t.amount}`).join(', ');
    const prompt = `Preveja saldo em 30 dias. Saldo: ${balance}. Histórico: ${history}. JSON: {"predictedBalance": 0, "alert": "...", "riskLevel": "low"}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { return null; }
}