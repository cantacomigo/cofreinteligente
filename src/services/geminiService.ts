import { GoogleGenerativeAI } from "@google/generative-ai";
import { Goal, Transaction } from "../types.ts";

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
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
    return JSON.parse(result.response.text());
  } catch (error) { return null; }
}

export async function categorizeTransaction(description: string, type: 'income' | 'expense') {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Categorize esta transação: "${description}" (${type}). Escolha uma categoria curta (ex: Alimentação, Transporte, Lazer, etc). Retorne JSON: {"category": "...", "reason": "..."}`;
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
    const history = transactions.slice(0, 20).map(t => `${t.type}: R$${t.amount} em ${t.category}`).join(', ');
    const prompt = `Com base no histórico: ${history}. Saldo atual: R$${balance}. Preveja o saldo daqui a 30 dias e identifique 1 risco ou padrão (ex: gastos excessivos em delivery). Retorne JSON: {"predictedBalance": 0, "alert": "...", "riskLevel": "low|medium|high"}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { return null; }
}

export async function chatFinancialAdvisor(message: string, context: string) {
  if (!genAI) return "Consultoria indisponível. Por favor, configure sua GEMINI_API_KEY.";
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const fullPrompt = `Você é um consultor financeiro. Contexto: ${context}. Pergunta: ${message}`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) { return "Desculpe, não consigo responder agora."; }
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  if (!genAI || goals.length === 0) return [];
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Sugira 3 investimentos brasileiros para as metas: ${goals.map(g => g.title).join(", ")}. Saldo: R$ ${balance}. Retorne JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) { return []; }
}