import { supabase } from "../integrations/supabase/client";
import { Goal, Transaction } from "../types.ts";

/**
 * Invoca a Edge Function 'gemini' garantindo um token de acesso válido e fresco.
 */
const invokeGemini = async (action: string, payload: any) => {
  try {
    // 1. Obtemos a sessão. getUser() é mais seguro que getSession() pois valida com o servidor se necessário.
    let { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // 2. Se não houver sessão ou houver erro, tentamos um refresh manual
    if (sessionError || !session) {
      const { data: refreshData } = await supabase.auth.refreshSession();
      session = refreshData.session;
    }

    if (!session?.access_token) {
      console.error(`[IA] Erro: Usuário não possui token de acesso válido para ${action}`);
      return null;
    }

    // 3. Chamada para a Edge Function
    // Nota: O cabeçalho 'Authorization' é adicionado manualmente para garantir que o token correto seja enviado.
    const { data, error } = await supabase.functions.invoke('gemini', {
      body: { action, payload },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (error) {
      // Se recebermos um 401 aqui, tentamos atualizar a sessão uma última vez para a próxima chamada
      if (error.status === 401) {
        console.warn("[IA] Token rejeitado pela função. Tentando atualizar sessão para futuras chamadas...");
        await supabase.auth.refreshSession();
      }
      console.error(`[IA] Erro retornado pela função (${action}):`, error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`[IA] Falha na comunicação com a IA (${action}):`, err);
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