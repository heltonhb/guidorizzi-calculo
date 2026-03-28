/**
 * Centralized Prompt Management
 * Contains all prompts used by the Guidorizzi Bridge API to communicate with NotebookLM.
 */

// ==========================================
// STUDIO ARTIFACT PROMPTS
// ==========================================

export const getStudioSlidePrompt = (topic) =>
  `Crie um deck de slides focado em: ${topic}. Utilize os exemplos e a teoria do Guidorizzi.`;

export const getStudioAudioPrompt = (topic) =>
  `Explique detalhadamente o tema ${topic} seguindo a didática do Guidorizzi.`;

// ==========================================
// DYNAMIC GENERATION PROMPTS
// ==========================================

export const getDynamicFlashcardsPrompt = (topic) =>
  `Com base no conteúdo do Guidorizzi sobre "${topic}", gere exatamente 8 flashcards de estudo.

IMPORTANTE: Responda SOMENTE com JSON válido, sem texto adicional. Use este formato exato:

{
  "flashcards": [
    { "front": "Pergunta ou conceito (pode usar LaTeX com $...$)", "back": "Resposta ou definição detalhada (pode usar LaTeX com $...$)" }
  ]
}

Os flashcards devem cobrir:
- Definições fundamentais
- Fórmulas importantes
- Teoremas-chave
- Propriedades e regras
- Aplicações práticas

Use notação LaTeX para fórmulas matemáticas (ex: $\\frac{d}{dx}x^n = nx^{n-1}$).`;

export const getDynamicQuizPrompt = (topic, count = 5) =>
  `Com base no conteúdo do Guidorizzi sobre "${topic}", gere exatamente ${count} questões de múltipla escolha.

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

Regras:
- "correct" é o índice (0-3) da alternativa correta
- Cada questão deve ter exatamente 4 opções
- Varie a dificuldade: 2 fáceis, 2 médias, 1 difícil
- Use notação LaTeX para fórmulas (ex: $\\lim_{x \\to 0} \\frac{\\sin x}{x}$)
- As explicações devem mencionar conceitos do Guidorizzi`;

export const getDynamicSlidesPrompt = (topic, count = 6) =>
  `Com base no conteúdo do Guidorizzi sobre "${topic}", gere exatamente ${count} slides para uma aula no formato VERTICAL (9:16, estilo mobile).

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
        { "type": "example", "content": "Exemplo: Se $f(x) = x^3$, então $f'(x) = 3x^2$" },
        { "type": "highlight", "content": "Ponto-chave a memorizar" }
      ]
    }
  ]
}

Regras para os slides:
- Slide 1: Título do tema + introdução/motivação
- Slides 2-${count - 1}: Conteúdo teórico progressivo com fórmulas LaTeX
- Último slide: Resumo ou exercício de fixação
- Cada slide deve ter 2-4 blocos (não muitos, é formato vertical mobile)
- Sempre que explicar uma função simples interativa (ex: parábolas, exponenciais, senos), inclua um bloco "type": "graph" definindo a equação de uma variável no campo "equation" (ex: "x^2", "x^3", "sin(x)", "cos(x)", "exp(x)", "2*x").
- Use "type": "formula" para fórmulas centralizadas ($$...$$)
- Use "type": "highlight" para conceitos-chave
- Use "type": "example" para exemplos práticos
- Use "type": "text" para explicações
- Use LaTeX com $...$ ou $$...$$ para matemática`;
