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
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Olá! Sou o assistente inteligente baseado no Guidorizzi. Como posso ajudar em seus estudos de Cálculo hoje?' }
  ]);
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

    const handleSend = async (queryText = null) => {
        const textToSend = queryText || input.trim();
        if (!textToSend || loading) return;

        const userMessage = { id: Date.now().toString(), role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);

        if (!queryText) {
            setInput('');
        }
        setLoading(true);
        setLastQuery(textToSend);

        try {
            // Usa chat inteligente com contexto
            const response = await queryWithContext(textToSend);

            const assistantMessage = {
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
                errorMessage = '⏳ A requisição expirou (timeout). O servidor pode estar lento ou indisponível. Estamos re-tentando automaticamente (até 3 tentativas).';
            } else if (errorMessage_safe?.includes('localhost:3001')) {
                errorMessage = '🔌 Não foi possível conectar com o servidor da API. Certifique-se de que ele está rodando:\n\n```bash\nnpm run bridge\n```';
            } else {
                errorMessage = `${errorMessage_safe || 'Erro desconhecido ao consultar o assistente.'}`;
            }

            const errorMessage_obj = {
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

    const handleSuggestionClick = (suggestion) => {
        handleSend(suggestion);
    };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[85vh] gap-6 md:flex-row md:gap-4"
    >
      <ChatHeader onBack={onBack} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col md:border-4 md:border-white/20 md:bg-zinc-950 md:p-6 shadow-[8px_8px_0_rgba(255,255,255,0.1)]">
        <ChatMessages messages={messages} loading={loading} onRetry={handleRetry} />

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          loading={loading}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      </div>

      {/* Sidebar with Suggestions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex md:w-80 flex-col"
      >
        <IntelligentSuggestions
          suggestions={suggestions}
          isLoading={isGeneratingSuggestions}
          chatContext={chatContext}
          onSuggestionClick={handleSuggestionClick}
        />
      </motion.div>

    </motion.div>
    );
};

export default ChatGuidorizzi;
