import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Bot, User, Sparkles, Loader2, RotateCcw, AlertCircle, Zap, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import useSmartChat from '../hooks/useSmartChat';
import IntelligentSuggestions from './IntelligentSuggestions';
import NotebookDataViewer from './NotebookDataViewer';
import useNotebookResponseCapture from '../hooks/useNotebookResponseCapture';
import 'katex/dist/katex.min.css';

const ChatGuidorizzi = ({ onBack, currentTopic = 'Cálculo Geral' }) => {
    const [messages, setMessages] = useState([
        { id: '1', role: 'assistant', content: 'Olá! Sou o assistente inteligente baseado no Guidorizzi. Como posso ajudar em seus estudos de Cálculo hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastQuery, setLastQuery] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showDataViewer, setShowDataViewer] = useState(false);
    const scrollRef = useRef(null);

    // Hooks inteligentes
    const { queryWithContext, chatContext, suggestions, generateSuggestions, isGeneratingSuggestions } = useSmartChat(currentTopic);
    const { captureResponse } = useNotebookResponseCapture();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Gera sugestões quando abre o chat
    useEffect(() => {
        if (!showSuggestions && suggestions.length === 0) {
            const timer = setTimeout(() => {
                const notebookId = 'b7988097-f2a3-4a68-a71d-b2d424d96b9a';
                generateSuggestions(notebookId);
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
            const notebookId = 'b7988097-f2a3-4a68-a71d-b2d424d96b9a';

            // Usa chat inteligente com contexto
            const response = await queryWithContext(textToSend, notebookId);

            // 🔥 Capturar resposta para visualização
            captureResponse({
                type: 'chat',
                query: textToSend,
                content: response.answer,
                isError: false,
                metadata: {
                    topic: currentTopic,
                    context: chatContext,
                    timestamp: new Date().toISOString()
                }
            });

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

            // 🔥 Capturar erro
            captureResponse({
                type: 'chat',
                query: textToSend,
                isError: true,
                error: errorMessage_safe,
                metadata: { topic: currentTopic }
            });

            // Extrair mensagem de erro
            let errorMessage = 'Houve um erro ao processar sua pergunta.';
            if (errorMessage_safe?.includes('expirou')) {
                errorMessage = '⏳ A requisição expirou (timeout). O servidor do MCP pode estar lento ou indisponível. Estamos re-tentando automaticamente (até 3 tentativas).';
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
            <header className="md:hidden flex items-center justify-between">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onBack}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10"
                >
                    <ChevronLeft className="w-6 h-6 text-zinc-400" />
                </motion.button>
                <div className="flex-1 text-center">
                    <h2 className="text-xl font-bold tracking-tight">Guidorizzi IA</h2>
                    <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Inteligente</p>
                </div>
                <div className="w-12" />
            </header>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col md:rounded-3xl md:border md:border-white/10 md:bg-white/5 md:backdrop-blur-xl md:p-6">
                <div className="hidden md:flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                    <div className="space-y-1">
                        <h2 className="text-lg font-bold tracking-tight">Pergunte ao Guidorizzi</h2>
                        <p className="text-xs text-zinc-500">Contexto inteligente + recomendações</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowDataViewer(!showDataViewer)}
                            className="w-10 h-10 flex items-center justify-center bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-all group"
                            title="Ver dados NotebookLM"
                        >
                            <Database className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-zinc-400" />
                        </motion.button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar mb-6"
                >
                    <AnimatePresence initial={false}>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn(
                                    "relative flex gap-4 p-6 rounded-[28px] border backdrop-blur-xl transition-all duration-500 shadow-lg",
                                    message.role === 'user'
                                        ? "bg-purple-500/10 border-purple-500/20 ml-12"
                                        : message.isError
                                            ? "bg-red-500/10 border-red-500/20 mr-12"
                                            : "bg-white/5 border-white/10 mr-12"
                                )}
                            >
                                {message.role === 'assistant' && !message.isError && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                        {message.hasContext ? <Zap className="w-3 h-3 text-white" /> : <Sparkles className="w-3 h-3 text-white" />}
                                    </div>
                                )}
                                {message.isError && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                        <AlertCircle className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-inner",
                                    message.role === 'user'
                                        ? "bg-purple-500/20"
                                        : message.isError
                                            ? "bg-red-500/20"
                                            : "bg-blue-500/20"
                                )}>
                                    {message.isError
                                        ? <AlertCircle className="w-5 h-5 text-red-400" />
                                        : message.role === 'user'
                                            ? <User className="w-5 h-5 text-purple-400" />
                                            : <Bot className="w-5 h-5 text-blue-400" />
                                    }
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/5 prose-code:text-purple-300 prose-strong:text-purple-400">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                    {message.isError && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleRetry}
                                            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm font-semibold text-red-300 flex items-center gap-2 transition-all"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Tentar Novamente
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-zinc-900/50 border border-white/5 p-5 rounded-3xl mr-8 flex items-center gap-4"
                            >
                                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                <span className="text-xs font-medium text-zinc-500 italic">Consultando inteligência Guidorizzi... (pode levar até 2 minutos)</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-4">
                    {/* Sugestões no Mobile */}
                    {suggestions.length > 0 && (
                        <div className="md:hidden overflow-x-auto pb-2 -mx-2 px-2">
                            <div className="flex gap-2 w-max">
                                {suggestions.slice(0, 5).map((sug, i) => (
                                    <motion.button
                                        key={i}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSuggestionClick(sug)}
                                        className="flex-shrink-0 px-4 py-2.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all whitespace-nowrap"
                                    >
                                        <Sparkles className="w-3 h-3 inline mr-1.5 text-purple-400" />
                                        {typeof sug === 'string' ? (sug.length > 35 ? sug.substring(0, 35) + '...' : sug) : sug}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Tire sua dúvida de Cálculo..."
                            className="w-full bg-white/5 border border-white/10 rounded-[28px] px-6 py-5 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-zinc-600 font-medium pr-16"
                        />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:grayscale transition-all"
                        >
                            <Send className="w-5 h-5 text-white ml-0.5" />
                        </motion.button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span className="text-zinc-600 uppercase tracking-widest">Guidorizzi 4 volumes</span>
                    </div>
                </div>
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

            {/* NotebookLM Data Viewer */}
            <NotebookDataViewer
                isOpen={showDataViewer}
                onClose={() => setShowDataViewer(false)}
            />
        </motion.div>
    );
};

export default ChatGuidorizzi;
