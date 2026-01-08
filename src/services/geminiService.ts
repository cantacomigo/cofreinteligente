import { supabase } from "../integrations/supabase/client";
import { Goal, Transaction } from "../types.ts";

const invokeGemini = async (action: string, payload: any) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn(`[IA] Sessão não encontrada para ação: ${action}`);
      return null;
    }

    const { data, error } = await supabase.functions.invoke('gemini', {
      body: { action, payload },
      // Explicitly pass the JWT token for the Edge Function to validate
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      }
    });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error(`[IA] Erro em ${action}:`, err);
    return null;
  }
};

export const getFinancialInsight = (goal: Goal, userBalance: number) => invokeGemini('getFinancialInsight', { goal, userBalance });
export const detectSubscriptions = (transactions: Transaction[]) => invokeGemini('detectSubscriptions', { transactions }).then(d => d || []);
export const chatFinancialAdvisor = (message: string, context: string) => invokeGemini('chatFinancialAdvisor', { message, context }).then(d => d?.text || d || "Erro ao consultar IA.");
export const getInvestmentRecommendations = (goals: Goal[], balance: number) => invokeGemini('getInvestmentRecommendations', { goals, balance }).then(d => d || []);
export const categorizeTransaction = (description: string, type: 'income' | 'expense') => invokeGemini('categorizeTransaction', { description, type }).then(d => d || {});
export const getCashFlowPrediction = (transactions: Transaction[], balance: number) => invokeGemini('getCashFlowPrediction', { transactions, balance }).then(d => d || null);