/**
 * useLearningPath.js
 * 
 * Hook que analisa erros do quiz e gera trilhas personalizadas de estudo.
 * Identifica gaps de conhecimento e sugere revisas baseadas em prerequisites.
 */

import { useCallback } from 'react';
import { useStudyMetrics } from './useStudyMetrics';
import contentData from '../data/content.json';

// Mapeamento de conceitos por tópico para identificar gaps
const CONCEPT_MAPPING = {
  'Limites': ['propriedades de limites', 'fatoração', 'racionalização', 'limites laterais', 'ε-δ', 'continuidade'],
  'Derivadas': ['definição de derivada', 'regra do produto', 'regra do quociente', 'regra da cadeia', 'derivada implícita'],
  'Derivadas por Regra da Cadeia': ['regra da cadeia', 'funções compostas', 'derivada de polinômios', 'derivada trigonométrica'],
  'Regra de L\'Hôpital': ['formas indeterminadas', 'derivação', 'limites'],
  'Teorema do Confronto': ['teorema do confronto', 'limite trigonométrico', 'funções limitadas'],
  'Continuidade': ['continuidade', 'descontinuidade', 'TVI', 'limites'],
  'Teorema do Valor Médio': ['TVM', 'Teorema de Rolle', 'derivadas', 'crescimento'],
  'Máximos e Mínimos': ['pontos críticos', 'teste da derivada', 'otimização', 'concavidade'],
  'Integrais Indefinidas': ['primitivas', 'técnicas de integração', 'substituição', 'por partes'],
  'Integrais Definidas': ['TFC', 'áreas', 'teorema fundamental']
};

export const useLearningPath = (currentTopic) => {
  const { metrics: _metrics, getTopicMetrics, getProblemAreas, recordQuizResult } = useStudyMetrics();

  /**
   * Analisa erros do quiz e retorna recomendações personalizadas
   */
  const analyzeQuizErrors = useCallback((topic, questions, userAnswers) => {
    const _topicMetrics = getTopicMetrics(topic);
    const recommendations = [];

    // Analisar cada questão errada
    questions.forEach((q, index) => {
      if (userAnswers[index] !== q.correct) {
        // Identificar conceitos relacionados à questão
        const questionText = q.text.toLowerCase();
        const relatedConcepts = identifyConcepts(questionText, topic);

        // Verificar se pré-requisitos não foram dominados
        const prerequisites = contentData[topic]?.prerequisites || [];
        prerequisites.forEach(prereq => {
          const prereqMetrics = getTopicMetrics(prereq);
          if (prereqMetrics.score < 70) {
            recommendations.push({
              type: 'prerequisite',
              topic: prereq,
              reason: `Você errou questões sobre "${topic}" mas sua nota em "${prereq}" é apenas ${prereqMetrics.score}%`,
              priority: 'high'
            });
          }
        });

        // Adicionar recomendações baseadas nos conceitos
        relatedConcepts.forEach(concept => {
          recommendations.push({
            type: 'concept',
            concept,
            topic,
            reason: `Revise o conceito de "${concept}" para melhorar seu desempenho`,
            priority: 'medium'
          });
        });
      }
    });

    return recommendations;
  }, [getTopicMetrics]);

  /**
   * Gera a próxima sugestão de estudo baseada no desempenho
   */
  const getNextStudySuggestion = useCallback(() => {
    const problemAreas = getProblemAreas();

    if (problemAreas.length === 0) {
      // Se não há áreas problemáticas, sugerir próximo tópico
      const topicOrder = Object.keys(contentData);
      const currentIndex = topicOrder.indexOf(currentTopic);

      if (currentIndex < topicOrder.length - 1) {
        const nextTopic = topicOrder[currentIndex + 1];
        return {
          type: 'next_topic',
          topic: nextTopic,
          reason: 'Você dominou o conteúdo atual! Ready para avançar?',
          priority: 'low'
        };
      }

      return {
        type: 'review',
        topic: currentTopic,
        reason: 'Revise o conteúdo para fixar o aprendizado',
        priority: 'low'
      };
    }

    // Retornar a área mais problemática
    const worstArea = problemAreas[0];
    return {
      type: 'weakness',
      topic: worstArea.topic,
      reason: `Você teve difficulties em "${worstArea.topic}" (${worstArea.score}% de acerto). Recomendo revisar este tópico primeiro.`,
      priority: 'high',
      score: worstArea.score,
      errors: worstArea.errors
    };
  }, [getProblemAreas, currentTopic]);

  /**
   * Gera a trilha de aprendizado personalizada completa
   */
  const generateLearningPath = useCallback(() => {
    const path = [];
    const problemAreas = getProblemAreas();

    // 1. Adicionar áreas problemáticas primeiro
    problemAreas.forEach(area => {
      path.push({
        topic: area.topic,
        reason: `Domínio: ${area.score}% - ${area.errors} erros`,
        priority: area.score < 40 ? 'high' : 'medium',
        type: 'review'
      });
    });

    // 2. Adicionar pré-requisitos não dominados
    const currentPrereqs = contentData[currentTopic]?.prerequisites || [];
    currentPrereqs.forEach(prereq => {
      const prereqMetrics = getTopicMetrics(prereq);
      if (prereqMetrics.score < 70) {
        path.push({
          topic: prereq,
          reason: `Pré-requisito para ${currentTopic} - Domínio: ${prereqMetrics.score}%`,
          priority: 'high',
          type: 'prerequisite'
        });
      }
    });

    // 3. Adicionar próximo tópico se o atual estiver dominado
    const currentMetrics = getTopicMetrics(currentTopic);
    if (currentMetrics.score >= 70) {
      const topicOrder = Object.keys(contentData);
      const currentIndex = topicOrder.indexOf(currentTopic);

      if (currentIndex < topicOrder.length - 1) {
        const nextTopic = topicOrder[currentIndex + 1];
        path.push({
          topic: nextTopic,
          reason: 'Próximo passo na sequência do Guidorizzi',
          priority: 'low',
          type: 'next'
        });
      }
    }

    return path;
  }, [getProblemAreas, getTopicMetrics, currentTopic]);

  /**
   * Registra o resultado do quiz e atualiza recomendações
   */
  const handleQuizCompletion = useCallback((topic, score, totalQuestions) => {
    recordQuizResult(topic, score, totalQuestions);
  }, [recordQuizResult]);

  return {
    analyzeQuizErrors,
    getNextStudySuggestion,
    generateLearningPath,
    handleQuizCompletion
  };
};

/**
 * Identifica conceitos baseados no texto da questão
 */
const identifyConcepts = (questionText, topic) => {
  const concepts = [];
  const mapping = CONCEPT_MAPPING[topic] || [];

  mapping.forEach(concept => {
    if (questionText.includes(concept.toLowerCase().split(' ')[0])) {
      concepts.push(concept);
    }
  });

  return concepts.length > 0 ? concepts : [topic];
};

export default useLearningPath;