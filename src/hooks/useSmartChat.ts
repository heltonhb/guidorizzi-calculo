/**
 * Custom hook for managing intelligent chat interactions with AI tutoring.
 *
 * This hook provides a comprehensive chat system that:
 * - Automatically prepares student context based on study metrics
 * - Dynamically selects appropriate prompts based on student performance
 * - Integrates with study tracking and doubt recording
 * - Validates AI responses against local content for accuracy
 * - Implements caching and automatic fallback mechanisms
 * - Generates contextual suggestions for continued learning
 *
 * @param {string} currentTopic - The current calculus topic being studied
 * @returns {Object} Chat functionality and state
 * @property {Function} queryWithContext - Main function to send queries with context
 * @property {Object} chatContext - Current student context and metrics
 * @property {Array} suggestions - Generated learning suggestions
 * @property {Function} generateSuggestions - Function to generate new suggestions
 * @property {boolean} isGeneratingSuggestions - Loading state for suggestion generation
 */

import { useCallback, useMemo, useState } from 'react';
import { queryNotebook } from '../services/api';
import { buildChatContext, createContextMessage } from '../services/chatContext';
import { selectTemplate } from '../services/promptTemplates';
import { 
  queryWithValidation, 
  getCachedAnswer, 
  cacheAnswer,
  getLocalContent 
} from '../services/answerValidator';
import useStudyMetrics from './useStudyMetrics';

interface ChatContext {
  topic: string;
  performance: number;
  doubts: string[];
  timeSpent: number;
}

interface UseSmartChatReturn {
  queryWithContext: (query: string) => Promise<{ answer: string; hasContext: boolean }>;
  chatContext: ChatContext;
  suggestions: string[];
  generateSuggestions: () => Promise<void>;
  isGeneratingSuggestions: boolean;
}

export const useSmartChat = (currentTopic: string): UseSmartChatReturn => {
  const { metrics, recordDoubts, getTopicMetrics } = useStudyMetrics();
  const [suggestions, setSuggestions] = useState([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  // Prepara contexto do aluno
  const chatContext = useMemo(() => {
    return buildChatContext(metrics, currentTopic);
  }, [metrics, currentTopic]);

  // Enriquece query com contexto e prompts dinâmicos
  const buildEnrichedQuery = useCallback((userQuery, includeContext = true) => {
    let enhancedQuery = userQuery;

    if (includeContext) {
      // Seleciona template baseado no contexto
      const template = selectTemplate(chatContext, userQuery);
      enhancedQuery = template + "\n\nPergunta do aluno: " + userQuery;
    }

    // Adiciona contexto do aluno para referência da IA
    const contextMessage = createContextMessage(chatContext);
    enhancedQuery += contextMessage;

    return enhancedQuery;
  }, [chatContext]);

  /**
   * Main function to send intelligent queries with context enrichment.
   * Records the doubt, applies dynamic prompts, validates responses, and caches results.
   *
   * @param {string} userQuery - The student's question or query
   * @returns {Promise<Object>} Response object with answer, context, and metadata
   * @property {string} answer - The AI-generated response
   * @property {boolean} success - Whether the query was successful
   * @property {Object} context - The chat context used
   * @property {string} source - Source of the answer ('cache', 'ai', 'local')
   */
  const queryWithContext = useCallback(async (userQuery: string) => {
    // 1. Verifica cache primeiro
    const cachedAnswer = getCachedAnswer(userQuery, currentTopic);
    if (cachedAnswer) {
      return {
        answer: cachedAnswer,
        success: true,
        context: chatContext,
        source: 'cache'
      };
    }

    try {
      // 2. Registra a dúvida
      recordDoubts(currentTopic, userQuery);

      // 3. Enriquece a query com contexto e prompts
      const enrichedQuery = buildEnrichedQuery(userQuery, true);

      // 4. Consulta IA com validação
      const result = await queryWithValidation(
        enrichedQuery, 
        currentTopic, 
        (q) => queryNotebook(q)
      );

      // 5. Se não teve erro, armazena em cache
      if (!result.fallbackUsed && result.answer) {
        cacheAnswer(userQuery, currentTopic, result.answer);
      }

      return {
        answer: result.answer,
        success: result.source !== 'local-fallback' || !!result.answer,
        context: chatContext,
        source: result.source,
        validation: result.validation,
        fallbackUsed: result.fallbackUsed
      };
    } catch (error) {
      // 6. Fallback em caso de erro na consulta
      console.warn('Erro na consulta, usando fallback local:', error.message);
      
      // Tenta obter conteúdo local diretamente
      const localContent = getLocalContent(currentTopic);
      
      // Se temos conteúdo local, cria uma resposta智能 berbasis no material
      if (localContent.success && localContent.answer) {
        // Resume o conteúdo local para caber no contexto
        const answer = localContent.answer.substring(0, 2000) + 
          (localContent.answer.length > 2000 ? '...' : '');
        
        return {
          answer: `Com base no conteúdo do Guidorizzi sobre "${currentTopic}":\n\n${answer}\n\n*Nota: Resposta baseada no material local. A API de IA não está disponível no momento.*`,
          success: true,
          context: chatContext,
          source: 'local-fallback',
          error: error.message,
          fallbackUsed: true
        };
      }
      
      // Se não tem conteúdo local, retorna erro amigável
      return {
        answer: `Desculpe, não consegui acessar o conteúdo sobre "${currentTopic}" no momento. Tente novamente mais tarde ou verifique sua conexão.`,
        success: false,
        context: chatContext,
        source: 'error',
        error: error.message,
        fallbackUsed: true
      };
    }
  }, [currentTopic, recordDoubts, buildEnrichedQuery, chatContext]);

  // Gera sugestões automáticas baseadas no contexto
  const generateSuggestions = useCallback(async () => {
    setIsGeneratingSuggestions(true);
    try {
      const { score, quizAttempts } = chatContext.performance || {};

      let suggestionPrompt = '';

      // Sugestão baseada em desempenho
      if (quizAttempts === 0) {
        suggestionPrompt = `Sem análise ainda, apenas liste 3 abordagens pedagógicas 
        diferentes para ensinar "${currentTopic}" (visual, prática, teórica).`;
      } else if (score < 50) {
        suggestionPrompt = `O aluno está com dificuldade em "${currentTopic}" (${score}% acerto).
        Sugira 3 conceitos-chave que podem estar faltando e 
        qual ordem revisar (mais simples primeiro).`;
      } else if (score >= 75) {
        suggestionPrompt = `O aluno domina "${currentTopic}".
        Sugira 3 aplicações práticas ou próximos tópicos lógicos.`;
      } else {
        suggestionPrompt = `O aluno está em progresso em "${currentTopic}" (${score}%).
        Sugira 3 caminhos para aprofundar.`;
      }

      const response = await queryNotebook(suggestionPrompt);
      const suggestions = parseAISuggestions(response.answer || response.content);
      setSuggestions(suggestions);

      return suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback com sugestões fixas
      const fallbackSuggestions = [
        'O que é um limite em cálculo?',
        'Como calcular derivadas?',
        'Explique o teorema fundamental do cálculo'
      ];
      setSuggestions(fallbackSuggestions);
      return fallbackSuggestions;
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, [currentTopic, chatContext]);

  return {
    queryWithContext,
    generateSuggestions,
    suggestions,
    isGeneratingSuggestions,
    chatContext,
    buildEnrichedQuery,
  };
};

/**
 * Parse sugestões da IA em array estruturado
 */
const parseAISuggestions = (aiText) => {
  if (!aiText) return [];

  // Tenta extrair itens numerados (1., 2., 3., etc)
  const lines = aiText.split('\n');
  const suggestions = [];

  lines.forEach((line) => {
    if (/^\d+\./.test(line.trim())) {
      suggestions.push(line.replace(/^\d+\.\s*/, '').trim());
    }
  });

  return suggestions.filter(s => s.length > 0).slice(0, 3);
};

export default useSmartChat;
