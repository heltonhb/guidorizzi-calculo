/**
 * Centralized Prompt Management
 * Contains all prompts used by the Guidorizzi Bridge API.
 * 
 * Estratégias para acurácia:
 * 1. Few-shot learning com exemplos de respostas ideais
 * 2. Chain-of-thought (3 etapas obrigatórias)
 * 3. Restrições Anti-Alucinação
 */

// ==========================================
// RESTRIÇÕES ANTI-ALUCINAÇÃO (sempre incluir)
// ==========================================

export const ANTI_HALLUCINATION = `
RESTRIÇÕES ANTI-ALUCINAÇÃO:
- Use APENAS conceitos e fórmulas do livro do Guidorizzi
- NÃO invente teoremas ou propriedades que não existam
- Se não souber a resposta, diga "Não tenho certeza sobre isso"
- Cite o nome do teorema/propriedade usada quando aplicável
- Para fórmulas, use apenas as padrão do Cálculo I`;

// ==========================================
// STUDIO ARTIFACT PROMPTS
// ==========================================

export const getStudioSlidePrompt = (topic) =>
  `Crie um deck de slides focado em: ${topic}. Utilize os exemplos e a teoria do Guidorizzi.

${ANTI_HALLUCINATION}`;

export const getStudioAudioPrompt = (topic) =>
  `Explique detalhadamente o tema ${topic} seguindo a didática do Guidorizzi.

${ANTI_HALLUCINATION}`;

// ==========================================
// DYNAMIC GENERATION PROMPTS
// ==========================================

export const getDynamicFlashcardsPrompt = (topic) =>
  `Com base no conteúdo do Guidorizzi sobre "${topic}", gere exatamente 8 flashcards de estudo.

${ANTI_HALLUCINATION}

IMPORTANTE: Responda SOMENTE com JSON válido, sem texto adicional. Use este formato exato:

{
  "flashcards": [
    { "front": "Pergunta ou conceito (pode usar LaTeX com $...$)", "back": "Resposta ou definição detalhada (pode usar LaTeX com $...$)" }
  ]
}

EXEMPLO DE RESPOSTA IDEAL (para o tema "Derivadas"):
{
  "flashcards": [
    { "front": "O que é derivada de uma função?", "back": "A derivada representa a taxa de variação instantânea de f(x) em relação a x. Geometricamente, é o coeficiente angular da reta tangente ao gráfico no ponto. Notação: f'(x) = dy/dx" },
    { "front": "Qual a derivada de x^n?", "back": "Para n constante: d/dx(x^n) = nx^(n-1). Exemplo: d/dx(x^3) = 3x^2" },
    { "front": "O que é a regra da cadeia?", "back": "Para funções compostas: d/dx[f(g(x))] = f'(g(x)) · g'(x). Exemplo: d/dx(sen(x^2)) = cos(x^2) · 2x" }
  ]
}

Os flashcards devem cobrir:
- Definições fundamentais
- Fórmulas importantes (com exemplos numéricos)
- Teoremas-chave (citando o nome)
- Propriedades e regras
- Aplicações práticas

Use notação LaTeX para fórmulas matemáticas (ex: $\\frac{d}{dx}x^n = nx^{n-1}$).`;

export const getDynamicQuizPrompt = (topic, count = 5) =>
  `Com base no conteúdo do Guidorizzi sobre "${topic}", gere exatamente ${count} questões de múltipla escolha.

${ANTI_HALLUCINATION}

IMPORTANTE: Responda SOMENTE com JSON válido, sem texto adicional. Use este formato exato:

{
  "questions": [
    {
      "text": "Enunciado da questão (use LaTeX com $...$ para fórmulas)",
      "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
      "correct": 0,
      "explanation": "Explicação detalhada da resposta correta, referenciando o Guidorizzi"
    }
  ]
}

EXEMPLO DE RESPOSTA IDEAL (para o tema "Limites"):
{
  "questions": [
    {
      "text": "Calcule $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$",
      "options": ["4", "2", "0", "1"],
      "correct": 0,
      "explanation": "Factoramos x² - 4 = (x-2)(x+2), simplificando: lim(x→2)(x+2) = 4. Pelo Teorema do Fator Linear do Guidorizzi, quando o denominador zera, fatoramos."
    }
  ]
}

Regras CRÍTICAS:
- "correct" é o índice (0-3) da alternativa correta
- ⚠️ VALIDAÇÃO OBRIGATÓRIA: O valor em options[correct] DEVE corresponder exatamente ao resultado numérico mencionado na explicação. Se a explicação calcula "12", então options[correct] DEVE ser "12".
- ⚠️ VERIFICAÇÃO: Sempre calcule o resultado passo a passo na explicação ANTES de indicar qual índice é correto. Se o cálculo resulta em 12, mas está marcando como 20, RECALCULE imediatamente.
- Cada questão deve ter exatamente 4 opções
- Varie a dificuldade: 2 fáceis, 2 médias, 1 difícil
- Use notação LaTeX para fórmulas (ex: $\\lim_{x \\to 0} \\frac{\\sin x}{x}$)
- As explicações devem mencionar conceitos do Guidorizzi
- Inclua o passo a passo numérico na explicação
- Exemplo de ERRO CRÍTICO a evitar: 
  - ❌ ERRADO: text: "Calcule $\\lim_{x \\to 2} \\frac{x^3-8}{x-2}$", options: ["12", "20", "16", "14"], correct: 1, explanation: "...= 12" (correct aponta para "20", mas a explicação é "12")
  - ✅ CORRETO: correct deve apontar para o índice onde está "12"`;

export const getDynamicSlidesPrompt = (topic, count = 6) =>
  `Com base no conteúdo do Guidorizzi sobre "${topic}", gere exatamente ${count} slides para uma aula no formato VERTICAL (9:16, estilo mobile).

${ANTI_HALLUCINATION}

ESTRUTURA PEDAGÓGICA OBRIGATÓRIA:
Cada slide deve seguir esta progressão:

**Slide 1 - ABERTURA:**
- Título motivador sobre "${topic}"
- Uma Pergunta provocativa ou problema do dia-a-dia
- Por que isso é importante (aplicações reais)

**Slides 2 a ${count - 1} - DESENVOLVIMENTO:**
- Definição clara (o que é, geometricamente)
- Uma fórmula com nome do teorema (ex: "Regra de L'Hôpital")
- EXEMPLO NUMÉRICO CONCRETO (não genérico! Use números reais)
- Visualização (bloco graph para funções simples)
- Um erro comum a evitar (警示)

**Slide ${count} - ENCERRAMENTO:**
- Resumo dos 3 pontos-chave
- Conexão com o próximo tópico
- Uma questão para auto-avaliação

${ANTI_HALLUCINATION}

IMPORTANTE: Responda SOMENTE com JSON válido, sem texto adicional. Use este formato exato:

{
  "slides": [
    {
      "title": "Título do Slide",
      "subtitle": "Subtítulo curto ou contexto",
      "blocks": [
        { "type": "text", "content": "Parágrafo de explicação didática" },
        { "type": "formula", "content": "$$\\\\frac{d}{dx}x^n = nx^{n-1}$$" },
        { "type": "graph", "equation": "x^2" },
        { "type": "illustration", "concept": "derivada" },
        { "type": "example", "content": "Exemplo: Se $f(x) = x^3$, então $f'(x) = 3x^2$" },
        { "type": "highlight", "content": "Ponto-chave a memorizar" }
      ]
    }
  ]
}

EXEMPLO DE RESPOSTA IDEAL (para o tema "Integrais"):
{
  "slides": [
    {
      "title": "O que é Integral?",
      "subtitle": "Área sob a curva",
      "blocks": [
        { "type": "text", "content": "A integral é a operação inversa da derivada. Se derivar uma função e obter f'(x), integrar f'(x) recuperamos f(x) + C." },
        { "type": "formula", "content": "$$\\\\int f(x) dx = F(x) + C$$" },
        { "type": "highlight", "content": "C é a constante de integração" },
        { "type": "example", "content": "$$\\\\int 2x dx = x^2 + C$$" }
      ]
    }
  ]
}

Regras para os slides:
- Slide 1: Título motivador + pergunta provocativa + importância/aplicações
- Slides 2-${count - 1}: Definição → Fórmula → Exemplo numérico → Gráfico → Erro comum
- Último slide: Resumo 3 pontos + conexão próximo tópico + auto-avaliação
- Cada slide deve ter 3-5 blocos (não muitos, é formato vertical mobile)
- Sempre que explicar uma função simples interativa (ex: parábolas, exponenciais, senos), inclua um bloco "type": "graph" definindo a equação de uma variável no campo "equation" (ex: "x^2", "x^3", "sin(x)", "cos(x)", "exp(x)", "2*x").
- Use "type": "illustration" e passe "concept" (ex: "limite", "derivada", "integral") MUITO OCASIONALMENTE para gerar uma arte abstrata Neo-Brutalista.
- Use "type": "formula" para fórmulas centralizadas ($$...$$)
- Use "type": "highlight" para conceitos-chave a memorizar
- Use "type": "example" para exemplos práticos com números REAIS
- Use "type": "text" para explicações
- Use "type": "warning" para erros comuns a evitar
- Use LaTeX com $...$ ou $$...$$ para matemática`;
