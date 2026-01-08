import { supabase } from "../integrations/supabase/client";
import { Goal, Transaction } from "../types.ts";

/**
 * Invoca a Edge Function 'gemini' garantindo a presença do token.
 */
const invokeGemini = async (action: string, payload: any) => {
  try {
    // Pegamos a sessão atual de forma assíncrona para garantir que o token é o mais recente
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.warn(`[IA] Falha: Sessão não encontrada para a ação ${action}`);
      return null;
    }

    // Chamada explícita passando o Authorization header
    const { data, error } = await supabase.functions.invoke('gemini', {
      body: { action, payload },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (error) {
      console.error(`[IA] Erro na Edge Function (${action}):`, error);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`[IA] Erro inesperado ao invocar IA (${action}):`, err);
    return null;
  }
};

export async function getFinancialInsight(goal: Goal, userBalance: number) {
  return await invokeGemini('getFinancialInsight', { goal, userBalance });
}

export async function detectSubscriptions(transactions: Transaction[]) {
  const data = await invokeGemini('detectSubscriptions', { transactions });
  return data || [];
}

export async function chatFinancialAdvisor(message: string, context: string) {
  const data = await invokeGemini('chatFinancialAdvisor', { message, context });
  return data?.text || data || "Desculpe, tive um problema ao processar sua pergunta.";
}

export async function getInvestmentRecommendations(goals: Goal[], balance: number) {
  const data = await invokeGemini('getInvestmentRecommendations', { goals, balance });
  return data || [];
}

export async function categorizeTransaction(description: string, type: 'income' | 'expense') {
  return await invokeGemini('categorizeTransaction', { description, type });
}

export async function getCashFlowPrediction(transactions: Transaction[], balance: number) {
  return await invokeGemini('getCashFlowPrediction', { transactions, balance });
}