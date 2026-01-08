// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getUserIdFromToken(authHeader: string) {
  try {
    const token = authHeader.replace('Bearer ', '');
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    return payload.sub;
  } catch (e) {
    console.error("[gemini] Falha ao decodificar token:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const userId = authHeader ? getUserIdFromToken(authHeader) : null;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: corsHeaders })
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY")
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key não configurada' }), { status: 500, headers: corsHeaders })
    }

    const { action, payload } = await req.json()
    console.log(`[gemini] Usuário: ${userId} | Ação: ${action}`);

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Usando gemini-1.5-flash que é o modelo mais estável e rápido no momento
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash"
    })

    let prompt = `Você é um consultor financeiro brasileiro de alta performance. Responda sempre em Português do Brasil.\n\n`
    
    switch (action) {
      case 'getFinancialInsight':
        prompt += `Analise a meta "${payload.goal.title}". Valor Alvo: R$ ${payload.goal.targetAmount}. Valor Atual: R$ ${payload.goal.currentAmount}. Responda estritamente em JSON com este formato: {"analysis": "sua análise aqui", "monthlySuggestion": valor_numerico, "actionSteps": ["passo 1", "passo 2"]}`
        break;
      case 'detectSubscriptions':
        prompt += `Identifique gastos recorrentes (assinaturas) nesta lista de transações: ${JSON.stringify(payload.transactions)}. Responda estritamente em JSON: [{"name": "nome", "amount": valor, "frequency": "mensal/anual", "tip": "dica de economia"}]`
        break;
      case 'chatFinancialAdvisor':
        prompt += `Contexto das metas do usuário: ${payload.context}. Pergunta do usuário: ${payload.message}. Responda de forma direta e motivadora.`
        break;
      case 'getInvestmentRecommendations':
        prompt += `Baseado no saldo de R$ ${payload.balance} e nas metas ${JSON.stringify(payload.goals)}, sugira 3 investimentos conservadores/moderados. Responda estritamente em JSON: [{"product": "nome", "yield": "rentabilidade esperada", "liquidity": "liquidez", "reasoning": "por que investir aqui"}]`
        break;
      case 'categorizeTransaction':
        prompt += `Qual a melhor categoria financeira curta para a descrição "${payload.description}" do tipo "${payload.type}"? Responda estritamente em JSON: {"category": "categoria"}`
        break;
      case 'getCashFlowPrediction':
        prompt += `Faça uma previsão para os próximos 30 dias. Saldo atual: R$ ${payload.balance}. Histórico: ${JSON.stringify(payload.transactions)}. Responda estritamente em JSON: {"predictedBalance": valor, "alert": "mensagem curta de alerta", "riskLevel": "low|medium|high"}`
        break;
      default:
        return new Response(JSON.stringify({ error: 'Ação inválida' }), { status: 400, headers: corsHeaders })
    }

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Limpeza de blocos de código JSON se a IA retornar markdown
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    try {
      const parsed = JSON.parse(cleanJson);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    } catch {
      // Se não for JSON, retorna como texto plano
      return new Response(JSON.stringify({ text: responseText }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

  } catch (error) {
    console.error("[gemini] Erro crítico:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})