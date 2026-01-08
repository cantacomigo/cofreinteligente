// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função auxiliar para decodificar o User ID do JWT sem consultar o banco de dados de sessões
function getUserIdFromToken(authHeader: string) {
  try {
    const token = authHeader.replace('Bearer ', '');
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    return payload.sub; // O 'sub' é o UUID do usuário no Supabase
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
      console.error("[gemini] Erro: Usuário não identificado no token");
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: corsHeaders })
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY")
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key não configurada' }), { status: 500, headers: corsHeaders })
    }

    const { action, payload } = await req.json()
    console.log(`[gemini] Ação: ${action} | Usuário: ${userId}`);

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Você é um consultor financeiro brasileiro. Responda sempre em Português e retorne JSON puro quando solicitado."
    })

    let prompt = ""
    switch (action) {
      case 'getFinancialInsight':
        prompt = `Analise a meta ${payload.goal.title}. Objetivo: R$ ${payload.goal.targetAmount}. Atual: R$ ${payload.goal.currentAmount}. Retorne JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["..."]}`
        break;
      case 'detectSubscriptions':
        prompt = `Liste assinaturas recorrentes nestas transações: ${JSON.stringify(payload.transactions)}. Retorne JSON: [{"name": "...", "amount": 0, "frequency": "...", "tip": "..."}]`
        break;
      case 'chatFinancialAdvisor':
        prompt = `Metas: ${payload.context}. Pergunta: ${payload.message}`
        break;
      case 'getInvestmentRecommendations':
        prompt = `Sugira 3 investimentos para saldo R$ ${payload.balance} e metas ${JSON.stringify(payload.goals)}. Retorne JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`
        break;
      case 'categorizeTransaction':
        prompt = `Dê uma categoria curta para '${payload.description}' (${payload.type}). Retorne JSON: {"category": "..."}`
        break;
      case 'getCashFlowPrediction':
        prompt = `Previsão 30 dias. Saldo R$ ${payload.balance}. Transações: ${JSON.stringify(payload.transactions)}. Retorne JSON: {"predictedBalance": 0, "alert": "...", "riskLevel": "low|medium|high"}`
        break;
      default:
        return new Response(JSON.stringify({ error: 'Ação inválida' }), { status: 400, headers: corsHeaders })
    }

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    try {
      const parsed = JSON.parse(cleanJson);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    } catch {
      return new Response(JSON.stringify({ text: responseText }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

  } catch (error) {
    console.error("[gemini] Erro:", error.message)
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500, headers: corsHeaders })
  }
})