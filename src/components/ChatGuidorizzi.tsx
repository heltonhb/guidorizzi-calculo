import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useSmartChat from '../hooks/useSmartChat';
import IntelligentSuggestions from './IntelligentSuggestions';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import 'katex/dist/katex.min.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
  hasContext?: boolean;
}

interface ChatGuidorizziProps {
  onBack: () => void;
  currentTopic?: string;
}

const ChatGuidorizzi: React.FC<ChatGuidorizziProps> = ({ onBack, currentTopic = 'Cálculo Geral' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Hooks inteligentes
  const { queryWithContext, chatContext, suggestions, generateSuggestions, isGeneratingSuggestions } = useSmartChat(currentTopic);

  // Gera sugestões quando abre o chat
  useEffect(() => {
    if (!showSuggestions && suggestions.length === 0) {
      const timer = setTimeout(() => {
        generateSuggestions();
        setShowSuggestions(true);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Startup sequence
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setMessages([
        { id: 'init-1', role: 'assistant', content: 'Olá! Sou o assistente inteligente baseado no Guidorizzi. Como posso ajudar em seus estudos de Cálculo hoje?' }
      ]);
    }, 800);
    return () => clearTimeout(initTimer);
  }, []);

  const handleSend = async (queryText: string | null = null) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);

    if (!queryText) {
      setInput('');
    }
    setLoading(true);
    setLastQuery(textToSend);

    try {
      // Usa chat inteligente com contexto
      const response = await queryWithContext(textToSend);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer || 'Não encontrei uma resposta específica no Guidorizzi para isso agora.',
        isError: false,
        hasContext: true
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Sanitizar erro para evitar circular references
      const errorMessage_safe = error instanceof Error ? error.message : String(error);
      console.error('❌ Chat error:', errorMessage_safe);

      // Extrair mensagem de erro
      let errorMessage = 'Houve um erro ao processar sua pergunta.';
      if (errorMessage_safe?.includes('expirou')) {
        errorMessage = 'A requisição expirou (timeout). O servidor pode estar lento ou indisponível.';
      } else if (errorMessage_safe?.includes('localhost:3001')) {
        errorMessage = 'Não foi possível conectar com o servidor da API.';
      } else {
        errorMessage = `${errorMessage_safe || 'Erro desconhecido ao consultar o assistente.'}`;
      }

      const errorMessage_obj: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage_obj]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSend(lastQuery);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-screen md:h-screen w-full overflow-hidden"
      style={{
        backgroundColor: '#1a1a1a',
        backgroundImage: 'linear-gradient(rgba(249,115,22,0.2) 2px, transparent 2px), linear-gradient(90deg, rgba(249,115,22,0.2) 2px, transparent 2px)',
        backgroundSize: '60px 60px',
        backgroundPosition: 'center top'
      }}
    >
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto shadow-2xl relative bg-transparent overflow-hidden">
        <ChatHeader onBack={onBack} />

        <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full h-full pb-0">
          <ChatMessages messages={messages} loading={loading} onRetry={handleRetry} />

          <div className="w-full mt-auto px-4 pb-4">
            <ChatInput
              input={input}
              setInput={setInput}
              onSend={() => handleSend(null)}
              loading={loading}
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatGuidorizzi;
