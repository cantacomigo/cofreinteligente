import { supabase } from "../integrations/supabase/client";
import { Goal, Transaction } from "../types.ts";

/**
 * Invocação da Edge Function 'gemini'.
 * O SDK gerencia automaticamente a URL e o Token JWT do usuário logado.
 */
const invokeGemini = async (action: string, payload: any) => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini', {
      body: { action, payload }
    });
    
    if (error) {
      console.error(`[IA] Erro na ação ${action}:`, error);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`[IA] Falha na comunicação com a Edge Function:`, err);
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