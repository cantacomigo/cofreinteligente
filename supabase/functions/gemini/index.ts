// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("[gemini] Nova requisição recebida");

    // 1. Verificação de Autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("[gemini] Erro: Cabeçalho de autorização ausente");
      return new Response(JSON.stringify({ error: "Não autorizado" }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 2. Variáveis de Ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("[gemini] Erro: GEMINI_API_KEY não configurada no Supabase");
      return new Response(JSON.stringify({ error: "Configuração de IA ausente" }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 3. Validar Usuário no Supabase
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("[gemini] Erro de autenticação:", authError?.message);
      return new Response(JSON.stringify({ error: "Sessão inválida" }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 4. Parse do Body
    const bodyText = await req.text();
    if (!bodyText) {
       console.error("[gemini] Erro: Corpo da requisição vazio");
       return new Response(JSON.stringify({ error: "Body vazio" }), { status: 400, headers: corsHeaders });
    }
    
    const { action, payload } = JSON.parse(bodyText);
    console.log(`[gemini] Executando ação: ${action}`);

    // 5. Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Você é o assistente financeiro do Cofre Inteligente. Responda de forma concisa e útil. Se a tarefa pedir JSON, responda APENAS o JSON puro, sem markdown."
    });

    const sanitize = (str: any) => typeof str === 'string' ? str.replace(/[<>]/g, '') : '';

    let prompt = "";
    switch (action) {
      case 'getFinancialInsight':
        prompt = `Analise a meta "${sanitize(payload.goal.title)}" (Alvo: ${payload.goal.targetAmount}, Atual: ${payload.goal.currentAmount}). Saldo do usuário: ${payload.userBalance}. Retorne JSON: {"analysis": "string", "monthlySuggestion": number, "actionSteps": ["string"], "suggestedTargetAdjustment": number}`;
        break;
      case 'detectSubscriptions':
        const txs = payload.transactions?.filter((t: any) => t.type === 'expense').slice(0, 15).map((t: any) => `${sanitize(t.description)}: R$${t.amount}`).join(', ') || "";
        prompt = `Detecte assinaturas recorrentes nestas transações: ${txs}. Retorne JSON: [{"name": "string", "amount": number, "frequency": "string", "tip": "string"}]`;
        break;
      case 'chatFinancialAdvisor':
        prompt = `Metas do usuário: ${sanitize(payload.context)}. Usuário pergunta: ${sanitize(payload.message)}`;
        break;
      case 'getInvestmentRecommendations':
        prompt = `Sugira 3 investimentos para estas metas: ${payload.goals?.map((g: any) => sanitize(g.title)).join(", ")}. Saldo: ${payload.balance}. Retorne JSON: [{"product": "string", "yield": "string", "liquidity": "string", "reasoning": "string"}]`;
        break;
      case 'categorizeTransaction':
        prompt = `Categorize: "${sanitize(payload.description)}" (${payload.type}). Retorne JSON: {"category": "string"}`;
        break;
      case 'getCashFlowPrediction':
        const history = payload.transactions?.slice(0, 10).map((t: any) => `${t.type}: R$${t.amount}`).join(', ') || "";
        prompt = `Preveja saldo em 30 dias. Saldo atual: ${payload.balance}. Histórico: ${history}. Retorne JSON: {"predictedBalance": number, "alert": "string", "riskLevel": "low|medium|high"}`;
        break;
      default:
        console.error(`[gemini] Ação desconhecida: ${action}`);
        return new Response(JSON.stringify({ error: "Ação inválida" }), { status: 400, headers: corsHeaders });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("[gemini] Resposta gerada com sucesso");

    try {
      // Tenta extrair JSON caso o modelo tenha retornado texto extra ou markdown
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      const cleaned = jsonMatch ? jsonMatch[0] : text;
      const jsonResponse = JSON.parse(cleaned);
      return new Response(JSON.stringify(jsonResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      // Se não for JSON, retorna como texto plano no campo 'text'
      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("[gemini] Erro crítico na função:", error.message);
    return new Response(JSON.stringify({ error: error.message || "Erro interno no processamento de IA" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});