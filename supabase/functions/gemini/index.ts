// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[gemini] Falta cabeçalho Authorization")
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Validação robusta do usuário
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      console.error("[gemini] Usuário inválido ou token expirado:", userError?.message)
      return new Response(JSON.stringify({ error: 'Invalid Token' }), { status: 401, headers: corsHeaders })
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY")
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key missing' }), { status: 500, headers: corsHeaders })
    }

    const { action, payload } = await req.json()
    console.log(`[gemini] Usuário ${user.id} solicitou ${action}`)

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Você é um consultor financeiro. Responda APENAS JSON puro se solicitado, sem blocos de código markdown."
    })

    let prompt = ""
    switch (action) {
      case 'getFinancialInsight':
        prompt = `Analise a meta ${payload.goal.title} (Faltam R$ ${payload.goal.targetAmount - payload.goal.currentAmount}). Saldo: R$ ${payload.userBalance}. JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["..."]}`
        break;
      case 'detectSubscriptions':
        prompt = `Identifique assinaturas recorrentes: ${JSON.stringify(payload.transactions)}. JSON: [{"name": "...", "amount": 0, "frequency": "...", "tip": "..."}]`
        break;
      case 'chatFinancialAdvisor':
        prompt = `Contexto Metas: ${payload.context}. Pergunta: ${payload.message}`
        break;
      case 'getInvestmentRecommendations':
        prompt = `Sugira 3 investimentos para saldo R$ ${payload.balance} e metas ${payload.goals.map(g => g.title).join(", ")}. JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`
        break;
      case 'categorizeTransaction':
        prompt = `Categorize: ${payload.description} (${payload.type}). JSON: {"category": "..."}`
        break;
      case 'getCashFlowPrediction':
        prompt = `Preveja saldo em 30 dias. Atual: R$ ${payload.balance}. Histórico: ${JSON.stringify(payload.transactions)}. JSON: {"predictedBalance": 0, "alert": "...", "riskLevel": "low|medium|high"}`
        break;
      default:
        return new Response(JSON.stringify({ error: 'Action not found' }), { status: 400, headers: corsHeaders })
    }

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    try {
      // Limpeza de possíveis blocos de código que a IA possa gerar por engano
      const cleaned = text.replace(/```json|```/g, "").trim()
      const json = JSON.parse(cleaned)
      return new Response(JSON.stringify(json), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    } catch {
      return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

  } catch (error) {
    console.error("[gemini] Erro crítico:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})