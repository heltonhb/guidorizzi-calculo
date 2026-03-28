/**
 * useNotebookResponseCapture.js
 * 
 * Hook para capturar e armazenar respostas do NotebookLM
 * Útil para debug, análise e visualização
 */

import { useCallback, useRef, useEffect } from 'react';

export const useNotebookResponseCapture = () => {
  const captureRef = useRef(true);

  // Capturar resposta
  const captureResponse = useCallback((data) => {
    if (!captureRef.current) return;

    const response = {
      timestamp: new Date().toISOString(),
      type: data.type || 'unknown', // 'chat', 'studio', 'query'
      query: data.query || null,
      content: data.content || null,
      answer: data.answer || null,
      isError: data.isError || false,
      error: data.error || null,
      metadata: data.metadata || {},
    };

    // Armazenar em localStorage (últimas 50 respostas)
    try {
      let responses = [];
      const stored = localStorage.getItem('notebookResponses');
      if (stored) {
        responses = JSON.parse(stored);
      }

      responses.push(response);
      if (responses.length > 50) {
        responses = responses.slice(-50); // Manter últimas 50
      }

      localStorage.setItem('notebookResponses', JSON.stringify(responses));

      // Log estruturado no console
      console.group(`[NotebookLM] ${response.type.toUpperCase()}`);
      console.log('Time:', response.timestamp);
      console.log('Query:', response.query);
      console.log('Response:', response.content || response.answer);
      if (response.isError) console.error('Error:', response.error);
      console.groupEnd();
    } catch (e) {
      console.error('Erro ao capturar resposta:', e);
    }
  }, []);

  // Limpar dados
  const clearCaptures = useCallback(() => {
    localStorage.removeItem('notebookResponses');
  }, []);

  // Obter todas as respostas
  const getCaptures = useCallback(() => {
    try {
      const stored = localStorage.getItem('notebookResponses');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Erro ao recuperar respostas:', e);
      return [];
    }
  }, []);

  // Habilitar/desabilitar captura
  const setCapture = useCallback((enabled) => {
    captureRef.current = enabled;
  }, []);

  return {
    captureResponse,
    clearCaptures,
    getCaptures,
    setCapture,
  };
};

export default useNotebookResponseCapture;
