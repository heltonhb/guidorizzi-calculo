/**
 * useStudyMetrics.js
 * 
 * Hook para rastrear:
 * - Tempo de estudo por tópico
 * - Acertos/erros em quiz
 * - Tópicos visitados
 * - Dúvidas registradas
 * - Desempenho geral
 */

import { useCallback, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

const defaultMetrics = {
  topics: {},           // {topicName: {timeSpent, errors, questions, score}}
  sessions: [],         // [{date, topic, duration, score}]
  doubts: [],           // [{date, topic, question, resolved}]
  currentSession: null, // {topic, startTime}
};

export const useStudyMetrics = () => {
  const [metrics, setMetrics] = useLocalStorage('studyMetrics', defaultMetrics);
  const [currentSessionTopic, setCurrentSessionTopic] = useState(null);

  // Registra início de sessão em tópico
  const startTopicSession = useCallback((topicName) => {
    setCurrentSessionTopic(topicName);
    setMetrics(prev => ({
      ...prev,
      currentSession: {
        topic: topicName,
        startTime: Date.now(),
      }
    }));
  }, [setMetrics]);

  // Registra fim de sessão
  const endTopicSession = useCallback(() => {
    setMetrics(prev => {
      if (!prev.currentSession) return prev;

      const { topic, startTime } = prev.currentSession;
      const duration = Math.floor((Date.now() - startTime) / 1000 / 60); // minutos

      return {
        ...prev,
        currentSession: null,
        sessions: [...(prev.sessions || []), {
          date: new Date().toISOString(),
          topic,
          duration,
        }],
        topics: {
          ...prev.topics,
          [topic]: {
            ...(prev.topics[topic] || {}),
            timeSpent: (prev.topics[topic]?.timeSpent || 0) + duration,
            lastVisited: new Date().toISOString(),
          }
        }
      };
    });
    setCurrentSessionTopic(null);
  }, [setMetrics]);

  // Registra pergunta/dúvida
  const recordDoubts = useCallback((topicName, question) => {
    setMetrics(prev => ({
      ...prev,
      doubts: [...(prev.doubts || []), {
        date: new Date().toISOString(),
        topic: topicName,
        question,
        resolved: false,
      }]
    }));
  }, [setMetrics]);

  // Registra resultado do quiz
  const recordQuizResult = useCallback((topicName, score, totalQuestions) => {
    const percentage = Math.round((score / totalQuestions) * 100);

    setMetrics(prev => ({
      ...prev,
      topics: {
        ...prev.topics,
        [topicName]: {
          ...(prev.topics[topicName] || {}),
          quizAttempts: (prev.topics[topicName]?.quizAttempts || 0) + 1,
          score: percentage,
          lastQuizDate: new Date().toISOString(),
          errors: score < totalQuestions ?
            (prev.topics[topicName]?.errors || 0) + (totalQuestions - score) :
            prev.topics[topicName]?.errors || 0
        }
      }
    }));
  }, [setMetrics]);

  // Obter métricas de um tópico específico
  const getTopicMetrics = useCallback((topicName) => {
    return metrics.topics[topicName] || {
      timeSpent: 0,
      score: 0,
      errors: 0,
      quizAttempts: 0,
      lastVisited: null,
    };
  }, [metrics.topics]);

  // Obter dúvidas específicas de um tópico
  const getTopicDoubts = useCallback((topicName) => {
    return (metrics.doubts || []).filter(d => d.topic === topicName);
  }, [metrics.doubts]);

  // Calcular desempenho geral
  const getOverallPerformance = useCallback(() => {
    const topicsWithScores = Object.entries(metrics.topics || {})
      .filter(([, data]) => data.score)
      .map(([, data]) => data.score);

    if (topicsWithScores.length === 0) return 0;
    return Math.round(topicsWithScores.reduce((a, b) => a + b) / topicsWithScores.length);
  }, [metrics.topics]);

  // Identifica tópicos problemáticos (score < 60%)
  const getProblemAreas = useCallback(() => {
    return Object.entries(metrics.topics || {})
      .filter(([, data]) => data.score && data.score < 60)
      .map(([topic, data]) => ({
        topic,
        score: data.score,
        errors: data.errors || 0,
        doubts: getTopicDoubts(topic).length
      }));
  }, [metrics.topics, getTopicDoubts]);

  // Obter sessões recentes (últimos 7 dias)
  const getRecentSessions = useCallback(() => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return (metrics.sessions || [])
      .filter(s => new Date(s.date).getTime() > sevenDaysAgo)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [metrics.sessions]);

  return {
    metrics,
    startTopicSession,
    endTopicSession,
    recordDoubts,
    recordQuizResult,
    getTopicMetrics,
    getTopicDoubts,
    getOverallPerformance,
    getProblemAreas,
    getRecentSessions,
    currentSessionTopic,
  };
};

export default useStudyMetrics;
