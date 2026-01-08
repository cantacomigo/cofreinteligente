import { GoogleGenerativeAI } from "@google/generative-ai";
import { Goal, Transaction } from "../types.ts";

// Tenta obter a chave de múltiplas fontes possíveis no ambiente Vite
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";

// Validação rigorosa: A chave precisa existir e ter um tamanho mínimo real
const isKeyValid = typeof API_KEY === 'string' && API_KEY.trim().length > 20;

// Inicializa o SDK apenas se a chave for válida para evitar chamadas 404
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
    console.warn("[Gemini Advisor] Insight bypass due to error/limit");
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
  } catch (error) { return []; }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  if (!genAI) return "A inteligência artificial não está configurada (Chave API ausente).";
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const fullPrompt = `Contexto: ${context}. Usuário: ${message}. Responda de forma curta e prestativa em português brasileiro.`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) { return "Desculpe, tive um problema ao processar sua pergunta."; }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  if (!genAI || goals.length === 0) return [];
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Sugira 3 investimentos para estas metas: ${goals.map(g => g.title).join(", ")}. Saldo atual: ${balance}. Retorne JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`;
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
    const prompt = `Categorize esta transação: "${description}" (Tipo: ${type}). Retorne JSON: {"category": "..."}`;
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
    const prompt = `Preveja o saldo para os próximos 30 dias. Saldo atual: ${balance}. Histórico recente: ${history}. Retorne JSON: {"predictedBalance": 0, "alert": "...", "riskLevel": "low"}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { return null; }
}