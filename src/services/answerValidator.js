/**
 * answerValidator.js
 * 
 * Sistema de validação, caching e fallback para respostas da IA
 * Aumenta acurácia verificando conteúdo contra o livro do Guidorizzi
 */

import content from '../data/content.json';

/**
 * ==========================================
 * VALIDAÇÃO CRUZADA COM CONTENT.JSON
 * ==========================================
 */

// Extrai fórmulas LaTeX mencionadas na resposta
// const extractFormulas = (text) => {
//   const latexPattern = /\$([^$]+)\$\$|\$\$([^$]+)\$\$/g;
//   const matches = text.match(latexPattern);
//   return matches || [];
// };

/**
 * Verifica se a resposta contém conceitos esperados para o tópico
 * Retorna { isValid, missingConcepts, foundConcepts }
 */
export const validateAnswerAgainstBook = (answer, topic) => {
  const bookContent = content[topic];

  if (!bookContent) {
    return {
      isValid: true, // Sem referência no livro, não podemos validar
      missingConcepts: [],
      foundConcepts: [],
      warning: `Tópico "${topic}" não encontrado no conteúdo local`
    };
  }

  // const bookMaterial = bookContent.material;
  const answerLower = answer.toLowerCase();

  // Conceitos-chave esperados por tópico (simplificado)
  const expectedConcepts = {
    'Limites': ['limite', 'epsilon', 'delta', 'contínua', 'função'],
    'Derivadas': ['derivada', 'tangente', 'regras', 'diferenciação'],
    'Funções': ['função', 'domínio', 'contradomínio', 'gráfico'],
    'Integrais': ['integral', 'primitiva', 'antiderivada', 'áre'],
  };

  const expected = expectedConcepts[topic] || [];
  const found = expected.filter(concept => answerLower.includes(concept.toLowerCase()));
  const missing = expected.filter(concept => !answerLower.includes(concept.toLowerCase()));

  // Verifica se mencionou algo que contradiz o livro
  const contradictions = checkForContradictions(answer, topic);

  return {
    isValid: contradictions.length === 0 && missing.length < expected.length,
    missingConcepts: missing,
    foundConcepts: found,
    contradictions,
    hasSufficientContent: answer.length > 100
  };
};

/**
 * Verifica contradições potenciais com o conteúdo do livro
 */
const checkForContradictions = (answer, topic) => {
  const contradictions = [];
  const answerLower = answer.toLowerCase();

  // Verificações simples de contradição
  if (topic === 'Limites') {
    if (answerLower.includes('limite não existe') && answerLower.includes('x→0')) {
      // Verificar se é sobre sen(x)/x que DEVE existir
      if (answerLower.includes('sen') || answerLower.includes('sin')) {
        contradictions.push('Cuidado: lim(x→0) sen(x)/x = 1 é um limite fundamental');
      }
    }
  }

  if (topic === 'Derivadas') {
    if (answerLower.includes('derivada de constante') && !answerLower.includes('= 0')) {
      contradictions.push('A derivada de qualquer CONSTANTE é sempre 0');
    }
  }

  return contradictions;
};

/**
 * ==========================================
 * CACHING DE RESPOSTAS
 * ==========================================
 */

// Cache em memória (em produção, usar Redis ou localStorage)
const answerCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutos
const MAX_CACHE_SIZE = 100;

/**
 * Gera hash simples para a pergunta
 */
const hashQuestion = (question) => {
  let hash = 0;
  for (let i = 0; i < question.length; i++) {
    const char = question.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

/**
 * Verifica se resposta está em cache e ainda válida
 */
export const getCachedAnswer = (question, topic) => {
  const key = `${topic}:${hashQuestion(question)}`;
  const cached = answerCache.get(key);

  if (!cached) return null;

  // Verifica TTL
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    answerCache.delete(key);
    return null;
  }

  return cached.answer;
};

/**
 * Armazena resposta em cache
 */
export const cacheAnswer = (question, topic, answer) => {
  // Limpa cache se estiver muito grande
  if (answerCache.size >= MAX_CACHE_SIZE) {
    const firstKey = answerCache.keys().next().value;
    answerCache.delete(firstKey);
  }

  const key = `${topic}:${hashQuestion(question)}`;
  answerCache.set(key, {
    answer,
    timestamp: Date.now()
  });
};

/**
 * Limpa cache antigo
 */
export const clearCache = () => {
  answerCache.clear();
};

/**
 * ==========================================
 * FALLBACK PARA CONTEÚDO LOCAL
 * ==========================================
 */

/**
 * Obtém conteúdo local como fallback
 */
export const getLocalContent = (topic, type = 'material') => {
  const topicContent = content[topic];

  if (!topicContent) {
    return {
      success: false,
      error: `Tópico "${topic}" não encontrado no conteúdo local`,
      answer: `Desculpe, não tenho informações locais sobre "${topic}".`
    };
  }

  const data = topicContent[type];

  if (!data) {
    return {
      success: false,
      error: `Tipo "${type}" não encontrado para "${topic}"`,
      answer: topicContent.material || `Conteúdo sobre "${topic}": ${JSON.stringify(topicContent)}`
    };
  }

  return {
    success: true,
    source: 'local-fallback',
    answer: data,
    topic
  };
};

/**
 * Obtém exercícios do conteúdo local
 */
export const getLocalExercises = (topic, difficulty = null) => {
  const topicContent = content[topic];

  if (!topicContent?.exercises) {
    return { exercises: [], source: 'local-fallback' };
  }

  let exercises = topicContent.exercises;

  if (difficulty) {
    exercises = exercises.filter(e => e.difficulty === difficulty);
  }

  return {
    exercises,
    source: 'local-fallback'
  };
};

/**
 * ==========================================
 * CONSULTA COM FALLBACK INTEGRADO
 * ==========================================
 */

/**
 * Query com validação, cache e fallback
 */
export const queryWithValidation = async (question, topic, queryFn) => {
  // 1. Verifica cache primeiro
  const cached = getCachedAnswer(question, topic);
  if (cached) {
    return {
      answer: cached,
      source: 'cache',
      cached: true
    };
  }

  try {
    // 2. Consulta normal
    const response = await queryFn(question);
    const answer = response.answer || response.content || JSON.stringify(response);

    // 3. Valida contra conteúdo local
    const validation = validateAnswerAgainstBook(answer, topic);

    // 4. Armazena em cache
    cacheAnswer(question, topic, answer);

    return {
      answer,
      source: 'ai',
      validation,
      cached: false
    };

  } catch (error) {
    // 5. Fallback em caso de erro
    console.warn(`Erro na query, usando fallback local: ${error.message}`);

    const localContent = getLocalContent(topic);

    return {
      answer: localContent.answer,
      source: 'local-fallback',
      error: error.message,
      fallbackUsed: true
    };
  }
};

export default {
  validateAnswerAgainstBook,
  getCachedAnswer,
  cacheAnswer,
  clearCache,
  getLocalContent,
  getLocalExercises,
  queryWithValidation
};
