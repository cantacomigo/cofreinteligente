// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, payload } = await req.json()
    const apiKey = Deno.env.get("GEMINI_API_KEY")
    
    if (!apiKey) {
      console.error("[gemini] GEMINI_API_KEY não configurada no Supabase.")
      return new Response(JSON.stringify({ error: "Configuração ausente" }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    let prompt = ""
    
    switch (action) {
      case 'getFinancialInsight':
        prompt = `Analise meta: ${payload.goal.title}, Alvo: ${payload.goal.targetAmount}, Atual: ${payload.goal.currentAmount}, Saldo: ${payload.userBalance}. Responda APENAS em JSON: {"analysis": "...", "monthlySuggestion": 0, "actionSteps": ["..."], "suggestedTargetAdjustment": 0}`
        break
      case 'detectSubscriptions':
        const history = payload.transactions.filter((t: any) => t.type === 'expense').map((t: any) => `${t.description}: R$${t.amount}`).join(', ')
        prompt = `Identifique assinaturas recorrentes em: ${history}. Responda APENAS array JSON: [{"name": "...", "amount": 0, "frequency": "mensal", "tip": "..."}]`
        break
      case 'chatFinancialAdvisor':
        prompt = `Contexto: ${payload.context}. Usuário: ${payload.message}. Responda de forma curta e prestativa em português brasileiro.`
        break
      case 'getInvestmentRecommendations':
        prompt = `Sugira 3 investimentos para metas: ${payload.goals.map((g: any) => g.title).join(", ")}. Saldo: ${payload.balance}. Responda APENAS JSON: [{"product": "...", "yield": "...", "liquidity": "...", "reasoning": "..."}]`
        break
      case 'categorizeTransaction':
        prompt = `Categorize: "${payload.description}" (${payload.type}). Responda APENAS JSON: {"category": "..."}`
        break
      case 'getCashFlowPrediction':
        const hist = payload.transactions.slice(0, 10).map((t: any) => `${t.type}: R$${t.amount}`).join(', ')
        prompt = `Preveja saldo em 30 dias. Saldo: ${payload.balance}. Histórico: ${hist}. Responda APENAS JSON: {"predictedBalance": 0, "alert": "...", "riskLevel": "low"}`
        break
      default:
        throw new Error("Ação inválida")
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      const cleaned = text.replace(/```json|```/g, "").trim()
      const json = JSON.parse(cleaned)
      return new Response(JSON.stringify(json), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (e) {
      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    console.error("[gemini] Erro crítico:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})