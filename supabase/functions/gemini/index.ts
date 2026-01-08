// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Preflight para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[gemini] Erro: Cabeçalho Authorization ausente na requisição");
      return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // Criar cliente Supabase com o token do usuário para validar a sessão
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Validar usuário. Se a sessão for inválida, o Supabase retornará o erro de session_id.
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error("[gemini] Erro de autenticação:", userError?.message || "Usuário não encontrado");
      return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || 'Invalid session'}` }), { status: 401, headers: corsHeaders })
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY")
    if (!apiKey) {
      console.error("[gemini] Erro: GEMINI_API_KEY não configurada");
      return new Response(JSON.stringify({ error: 'Internal Server Error: API Key missing' }), { status: 500, headers: corsHeaders })
    }

    const { action, payload } = await req.json()
    console.log(`[gemini] Usuário ${user.id} solicitou ação: ${action}`);

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Você é um consultor financeiro. Retorne sempre JSON puro sem formatação markdown quando solicitado."
    })

    let prompt = ""
    switch (action) {
      case 'getFinancialInsight':
        prompt = `Analise a meta ${payload.goal.title}. Objetivo: R$ ${payload.goal.targetAmount}. Atual: R$ ${payload.goal.currentAmount}. JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["..."]}`
        break;
      case 'detectSubscriptions':
        prompt = `Detecte gastos recorrentes: ${JSON.stringify(payload.transactions)}. JSON: [{"name": "...", "amount": 0, "frequency": "...", "tip": "..."}]`
        break;
      case 'chatFinancialAdvisor':
        prompt = `Metas do usuário: ${payload.context}. Pergunta: ${payload.message}`
        break;
      case 'getInvestmentRecommendations':
        prompt = `Recomende 3 investimentos para saldo R$ ${payload.balance} e metas ${JSON.stringify(payload.goals)}. JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`
        break;
      case 'categorizeTransaction':
        prompt = `Categorize a descrição '${payload.description}' para o tipo ${payload.type}. JSON: {"category": "..."}`
        break;
      case 'getCashFlowPrediction':
        prompt = `Previsão de 30 dias para saldo R$ ${payload.balance}. Histórico: ${JSON.stringify(payload.transactions)}. JSON: {"predictedBalance": 0, "alert": "...", "riskLevel": "low|medium|high"}`
        break;
      default:
        return new Response(JSON.stringify({ error: 'Action not recognized' }), { status: 400, headers: corsHeaders })
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
    console.error("[gemini] Erro interno:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})