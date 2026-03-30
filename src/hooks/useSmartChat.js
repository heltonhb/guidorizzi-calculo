/**
 * useSmartChat.js
 * 
 * Hook que gerencia chat inteligente:
 * - Prepara contexto automaticamente
 * - Seleciona prompts dinâmicos
 * - Integra com métricas de estudo
 * - Registra dúvidas
 */

import { useCallback, useMemo, useState } from 'react';
import { queryNotebook } from '../services/api';
import { buildChatContext, createContextMessage } from '../services/chatContext';
import { selectTemplate } from '../services/promptTemplates';
import useStudyMetrics from './useStudyMetrics';

export const useSmartChat = (currentTopic) => {
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

  // Query inteligente - registra dúvida e enriquece query
  const queryWithContext = useCallback(async (userQuery) => {
    try {
      // Registra a dúvida
      recordDoubts(currentTopic, userQuery);

      // Enriquece a query com contexto e prompts
      const enrichedQuery = buildEnrichedQuery(userQuery, true);

      // Consulta IA
      const response = await queryNotebook(enrichedQuery);

      return {
        answer: response.answer || response.content,
        success: true,
        context: chatContext,
      };
    } catch (error) {
      throw error;
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
      return [];
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
