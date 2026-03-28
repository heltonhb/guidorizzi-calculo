/**
 * chatContext.js
 * 
 * Prepara contexto enriquecido para enviar ao chat/IA
 * Inclui: tópico atual, desempenho, dúvidas, progresso
 */

export const buildChatContext = (metrics, currentTopic, recentActivities = []) => {
  if (!metrics || !currentTopic) {
    return {
      topic: currentTopic,
      context: "Iniciando estudo. Sem histórico ainda.",
    };
  }

  const topicMetrics = metrics.topics[currentTopic] || {};
  const topicDoubts = (metrics.doubts || []).filter(d => d.topic === currentTopic);
  const problemAreas = Object.entries(metrics.topics || {})
    .filter(([_, data]) => data.score && data.score < 60)
    .map(([topic]) => topic);

  const context = {
    topic: currentTopic,
    performance: {
      score: topicMetrics.score || 0,
      timeSpent: topicMetrics.timeSpent || 0,
      quizAttempts: topicMetrics.quizAttempts || 0,
      errors: topicMetrics.errors || 0,
    },
    recentDoubts: topicDoubts.map(d => d.question).slice(-3),
    problemAreas: problemAreas.slice(0, 3),
    lastVisited: topicMetrics.lastVisited,
    overallProgress: metrics.topics ? 
      Math.round(Object.values(metrics.topics).reduce((sum, t) => sum + (t.score || 0), 0) / 
        Object.keys(metrics.topics).length) : 0,
    sessionDuration: topicMetrics.timeSpent || 0,
  };

  return context;
};

/**
 * Cria mensagem de contexto para incluir no prompt
 */
export const createContextMessage = (context) => {
  if (!context.topic) {
    return "";
  }

  let message = `\n\n📊 CONTEXTO DO ALUNO:\n`;
  message += `- Tópico atual: ${context.topic}\n`;
  message += `- Desempenho no tópico: ${context.performance.score}%\n`;
  message += `- Tempo de estudo: ${context.performance.timeSpent} minutos\n`;
  message += `- Tentativas de quiz: ${context.performance.quizAttempts}\n`;

  if (context.recentDoubts.length > 0) {
    message += `- Dúvidas recentes: ${context.recentDoubts.join(", ")}\n`;
  }

  if (context.problemAreas.length > 0) {
    message += `- Tópicos com dificuldade: ${context.problemAreas.join(", ")}\n`;
  }

  if (context.performance.score < 50) {
    message += `\n⚠️ Aluno está com dificuldade neste tópico. Por favor use exemplos simples e progressivos.\n`;
  } else if (context.performance.score > 80) {
    message += `\n✅ Aluno domina este tópico. Pode aprofundar ou conectar com próximos conceitos.\n`;
  }

  return message;
};

export default { buildChatContext, createContextMessage };
