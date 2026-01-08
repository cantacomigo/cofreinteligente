import { supabase } from "../integrations/supabase/client";
import { Goal, Transaction } from "../types.ts";

/**
 * Utilitário para chamar a Edge Function centralizada de IA com tratamento de autenticação.
 */
const invokeGemini = async (action: string, payload: any) => {
  try {
    // Busca a sessão atual para garantir que o token esteja presente
    const { data: { session } } = await supabase.auth.getSession();
    
    const { data, error } = await supabase.functions.invoke('gemini', {
      body: { action, payload },
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    });
    
    if (error) {
      console.error(`[Cofre IA] Erro na função ${action}:`, error);
      throw error;
    }
    return data;
  } catch (err) {
    console.error(`[Cofre IA] Falha crítica em ${action}:`, err);
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