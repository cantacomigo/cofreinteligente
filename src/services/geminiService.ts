import { GoogleGenerativeAI } from "@google/generative-ai";
import { Goal, Transaction } from "../types.ts";

// Verificação robusta da chave API
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
const isKeyValid = typeof API_KEY === 'string' && API_KEY.trim().length > 10 && API_KEY !== "undefined";

// Inicialização segura
const genAI = isKeyValid ? new GoogleGenerativeAI(API_KEY) : null;
// Usamos o modelo estável
const MODEL_NAME = "gemini-1.5-flash";

if (!isKeyValid) {
  console.warn("[Cofre IA] Aviso: GEMINI_API_KEY não detectada ou inválida. As funções de IA estarão desativadas.");
}

export async function getFinancialInsight(goal: Goal, userBalance: number) {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `Analise meta: ${goal.title}, Alvo: ${goal.targetAmount}, Atual: ${goal.currentAmount}, Saldo: ${userBalance}. Responda APENAS em JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["..."], "suggestedTargetAdjustment": 0}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) { 
    console.error("[Cofre IA] Erro em getFinancialInsight:", error);
    return null; 
  }
}

export async function detectSubscriptions(transactions: Transaction[]) {
  if (!genAI || transactions.length < 5) return [];
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const history = transactions.filter(t => t.type === 'expense').map(t => `${t.description}: R$${t.amount}`).join(', ');
    const prompt = `Identifique assinaturas recorrentes em: ${history}. Responda APENAS array JSON: [{"name": "...", "amount": 0, "frequency": "mensal", "tip": "..."}]`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) { return []; }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  if (!genAI) return "A inteligência artificial não está configurada (Chave API ausente).";
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const fullPrompt = `Contexto: ${context}. Usuário: ${message}. Responda de forma curta e prestativa em português brasileiro.`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) { return "Desculpe, tive um problema ao processar sua pergunta."; }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  if (!genAI || goals.length === 0) return [];
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `Sugira 3 investimentos para metas: ${goals.map(g => g.title).join(", ")}. Saldo: ${balance}. Responda APENAS JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) { return []; }
}

export async function categorizeTransaction(description: string, type: 'income' | 'expense') {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `Categorize: "${description}" (${type}). Responda APENAS JSON: {"category": "..."}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) { return null; }
}

export async function getCashFlowPrediction(transactions: Transaction[], balance: number) {
  if (!genAI || transactions.length < 3) return null;
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const history = transactions.slice(0, 10).map(t => `${t.type}: R$${t.amount}`).join(', ');
    const prompt = `Preveja saldo em 30 dias. Saldo: ${balance}. Histórico: ${history}. Responda APENAS JSON: {"predictedBalance": 0, "alert": "...", "riskLevel": "low"}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) { return null; }
}