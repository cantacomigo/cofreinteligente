# Regras de Desenvolvimento e Stack Técnica (AI_RULES)

Este documento define a stack técnica e as regras de uso de bibliotecas para garantir a consistência, manutenibilidade e elegância do projeto "Cofre Inteligente".

## 1. Stack Técnica Principal

*   **Frontend Framework:** React (v19+) utilizando componentes funcionais e hooks.
*   **Linguagem:** TypeScript (TS) é obrigatório para todos os arquivos de código-fonte (`.tsx`, `.ts`).
*   **Estilização:** Tailwind CSS para uma abordagem utility-first, garantindo designs responsivos e rápidos.
*   **Componentes UI:** Utilização da biblioteca shadcn/ui (baseada em Radix UI) para componentes de interface de usuário padronizados.
*   **Visualização de Dados:** Recharts é a biblioteca padrão para renderização de gráficos e dashboards.
*   **Ícones:** Lucide React para todos os ícones visuais.
*   **Inteligência Artificial:** Google GenAI SDK (`@google/genai`) para todas as funcionalidades de consultoria e análise financeira.
*   **Estrutura de Projeto:** Arquivos organizados em `src/pages`, `src/components`, e `src/services`.
*   **Build Tool:** Vite.

## 2. Regras de Uso de Bibliotecas

| Funcionalidade | Biblioteca/Tecnologia | Regra de Uso |
| :--- | :--- | :--- |
| **UI/Componentes** | shadcn/ui | Priorizar o uso de componentes shadcn/ui. Se for necessária uma variação significativa, crie um novo componente em `src/components/`. |
| **Estilo** | Tailwind CSS | **Exclusivo.** Não usar CSS puro ou módulos CSS. Garantir que todos os componentes sejam responsivos por padrão. |
| **Lógica de Negócio** | TypeScript / React Hooks | Manter a lógica de estado e efeitos em componentes funcionais usando hooks padrão (useState, useEffect, useMemo). |
| **Comunicação com IA** | Google GenAI SDK | Toda interação com o modelo Gemini deve ser encapsulada em funções dentro de `services/geminiService.ts`. |
| **Gráficos** | Recharts | Usar Recharts para todos os gráficos. Garantir que os gráficos sejam responsivos usando `ResponsiveContainer`. |
| **Ícones** | Lucide React | Usar apenas ícones do pacote `lucide-react`. |
| **Estrutura de Arquivos** | Padrão Dyad | Criar um novo arquivo para cada novo componente ou hook. Manter arquivos pequenos e focados. |