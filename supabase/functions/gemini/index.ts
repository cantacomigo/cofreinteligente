// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Lidar com o preflight do CORS (ESSENCIAL para evitar 401 em navegadores)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[gemini] Erro: Authorization header não recebido");
      return new Response(JSON.stringify({ error: 'Falta autorização' }), { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // Inicializa o cliente Supabase dentro da função para validar o usuário
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      console.error("[gemini] Erro: Usuário não autenticado pelo token", userError?.message);
      return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401, headers: corsHeaders })
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY")
    if (!apiKey) {
      console.error("[gemini] Erro: GEMINI_API_KEY não configurada no Supabase");
      return new Response(JSON.stringify({ error: 'Configuração ausente' }), { status: 500, headers: corsHeaders })
    }

    const { action, payload } = await req.json()
    console.log(`[gemini] Processando ação: ${action} para o usuário: ${user.id}`);

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Você é um consultor financeiro. Responda APENAS JSON se solicitado."
    })

    let prompt = ""
    switch (action) {
      case 'getFinancialInsight':
        prompt = `Analise a meta ${payload.goal.title}. Alvo: R$ ${payload.goal.targetAmount}. Atual: R$ ${payload.goal.currentAmount}. JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["..."]}`
        break;
      case 'detectSubscriptions':
        prompt = `Assinaturas recorrentes em: ${JSON.stringify(payload.transactions)}. JSON: [{"name": "...", "amount": 0, "frequency": "...", "tip": "..."}]`
        break;
      case 'chatFinancialAdvisor':
        prompt = `Contexto: ${payload.context}. Pergunta: ${payload.message}`
        break;
      case 'getInvestmentRecommendations':
        prompt = `3 investimentos para R$ ${payload.balance} e metas ${JSON.stringify(payload.goals)}. JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`
        break;
      case 'categorizeTransaction':
        prompt = `Categorize: ${payload.description}. JSON: {"category": "..."}`
        break;
      case 'getCashFlowPrediction':
        prompt = `Previsão 30 dias. Saldo R$ ${payload.balance}. Histórico: ${JSON.stringify(payload.transactions)}. JSON: {"predictedBalance": 0, "alert": "...", "riskLevel": "low|medium|high"}`
        break;
      default:
        return new Response(JSON.stringify({ error: 'Ação desconhecida' }), { status: 400, headers: corsHeaders })
    }

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Limpeza de blocos de código markdown que a IA às vezes insere
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    try {
      const parsed = JSON.parse(cleanJson);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    } catch {
      return new Response(JSON.stringify({ text: responseText }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

  } catch (error) {
    console.error("[gemini] Erro crítico:", error.message)
    return new Response(JSON.stringify({ error: 'Erro interno no servidor' }), { status: 500, headers: corsHeaders })
  }
})