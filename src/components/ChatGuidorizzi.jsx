import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Bot, User, Sparkles, Loader2, RotateCcw, AlertCircle, Zap, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import useSmartChat from '../hooks/useSmartChat';
import IntelligentSuggestions from './IntelligentSuggestions';
import 'katex/dist/katex.min.css';

const ChatGuidorizzi = ({ onBack, currentTopic = 'Cálculo Geral' }) => {
    const [messages, setMessages] = useState([
        { id: '1', role: 'assistant', content: 'Olá! Sou o assistente inteligente baseado no Guidorizzi. Como posso ajudar em seus estudos de Cálculo hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastQuery, setLastQuery] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const scrollRef = useRef(null);

    // Hooks inteligentes
    const { queryWithContext, chatContext, suggestions, generateSuggestions, isGeneratingSuggestions } = useSmartChat(currentTopic);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

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
            <header className="md:hidden flex items-center justify-between p-4 border-b-4 border-white/20 bg-zinc-950">
                <motion.button
                    whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: "0px 0px 0px transparent" }}
                    onClick={onBack}
                    className="w-12 h-12 flex items-center justify-center bg-zinc-950 border-2 border-white/20 hover:bg-white hover:text-zinc-950 transition-colors shadow-[2px_2px_0_rgba(255,255,255,0.2)]"
                >
                    <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <div className="flex-1 text-center">
                    <h2 className="text-xl font-black tracking-tighter uppercase text-white">Guidorizzi IA</h2>
                    <p className="text-signal text-[10px] uppercase font-black tracking-widest leading-none mt-1">Chat Inteligente</p>
                </div>
                <div className="w-12" />
            </header>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col md:border-4 md:border-white/20 md:bg-zinc-950 md:p-6 shadow-[8px_8px_0_rgba(255,255,255,0.1)]">
                <div className="hidden md:flex items-center justify-between mb-6 pb-6 border-b-4 border-white/20">
                    <div className="space-y-1 pl-4 border-l-4 border-[#00f0ff]">
                        <h2 className="text-2xl font-black tracking-tighter uppercase text-white">Ask Guidorizzi</h2>
                        <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Contexto Inteligente</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: "0px 0px 0px transparent" }}
                            onClick={onBack}
                            className="px-4 py-2 h-12 flex items-center justify-center bg-zinc-950 border-2 border-white/20 shadow-[4px_4px_0_rgba(255,255,255,0.2)] uppercase font-black tracking-widest text-xs hover:bg-white hover:text-zinc-950 transition-colors"
                        >
                            Voltar ✕
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
                                    "relative flex gap-4 p-6 border-2 transition-all duration-300",
                                    message.role === 'user'
                                        ? "bg-zinc-900 border-[#00f0ff] ml-12 shadow-[4px_4px_0_#00f0ff]"
                                        : message.isError
                                            ? "bg-zinc-900 border-red-500 mr-12 shadow-[4px_4px_0_theme(colors.red.500)]"
                                            : "bg-white text-zinc-950 border-white mr-12 shadow-[4px_4px_0_theme(colors.zinc.700)]"
                                )}
                            >
                                {message.role === 'assistant' && !message.isError && (
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-950 border-2 border-zinc-950 rounded-none flex items-center justify-center shadow-[2px_2px_0_#fff]">
                                        {message.hasContext ? <Zap className="w-4 h-4 text-[#00f0ff]" /> : <Sparkles className="w-4 h-4 text-[#00f0ff]" />}
                                    </div>
                                )}
                                {message.isError && (
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-950 border-2 border-red-500 flex items-center justify-center shadow-[2px_2px_0_theme(colors.red.500)]">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                                <div className={cn(
                                    "w-12 h-12 flex items-center justify-center flex-shrink-0 border-2 shadow-[2px_2px_0_rgba(0,0,0,1)]",
                                    message.role === 'user'
                                        ? "bg-[#00f0ff] border-zinc-950 text-zinc-950"
                                        : message.isError
                                            ? "bg-red-500 border-zinc-950 text-zinc-950"
                                            : "bg-zinc-950 border-zinc-900 text-white"
                                )}>
                                    {message.isError
                                        ? <AlertCircle className="w-6 h-6" />
                                        : message.role === 'user'
                                            ? <User className="w-6 h-6" />
                                            : <Bot className="w-6 h-6" />
                                    }
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className={cn("prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border-2 prose-pre:border-zinc-800 prose-pre:-mx-4 prose-pre:px-4 prose-pre:py-3 prose-pre:rounded-none", message.role === 'user' ? "prose-invert" : "prose-zinc prose-strong:text-zinc-900 prose-code:text-zinc-800 prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:border prose-code:border-zinc-300 text-zinc-800")}>
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
                                            className="mt-4 px-6 py-3 bg-red-500 border-2 border-zinc-950 text-xs font-black uppercase tracking-widest text-zinc-950 hover:bg-red-600 flex items-center gap-2 transition-colors shadow-[2px_2px_0_#000]"
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
                                className="bg-zinc-900 border-2 border-[#00f0ff] p-6 mr-12 flex items-center gap-4 shadow-[4px_4px_0_#00f0ff]"
                            >
                                <Loader2 className="w-6 h-6 text-[#00f0ff] animate-spin" />
                                <span className="text-sm font-bold text-white uppercase tracking-widest">Consultando inteligência Guidorizzi...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-4">
                    {/* Sugestões no Mobile */}
                    {suggestions.length > 0 && (
                        <div className="md:hidden overflow-x-auto pb-2 -mx-2 px-2 custom-scrollbar">
                            <div className="flex gap-4 w-max">
                                {suggestions.slice(0, 5).map((sug, i) => (
                                    <motion.button
                                        key={i}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSuggestionClick(sug)}
                                        className="flex-shrink-0 px-5 py-3 bg-zinc-950 border-2 border-white/20 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-zinc-950 hover:border-white transition-all shadow-[2px_2px_0_rgba(255,255,255,0.2)] whitespace-nowrap"
                                    >
                                        <Sparkles className="w-3 h-3 inline mr-2" />
                                        {typeof sug === 'string' ? (sug.length > 35 ? sug.substring(0, 35) + '...' : sug) : sug}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="relative flex gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Tire sua dúvida de Cálculo..."
                            className="flex-1 bg-zinc-950 border-4 border-white/20 px-6 py-5 focus:outline-none focus:border-[#00f0ff] text-white placeholder:text-zinc-500 font-bold tracking-wide transition-colors rounded-none"
                        />
                        <motion.button
                            whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px #00f0ff" }}
                            whileTap={{ scale: 0.95, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="w-16 h-auto bg-[#00f0ff] border-2 border-[#00f0ff] flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all text-zinc-950"
                        >
                            <Send className="w-6 h-6 ml-1" />
                        </motion.button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs">
                        <Zap className="w-4 h-4 text-[#00f0ff]" />
                        <span className="text-zinc-500 font-black uppercase tracking-widest">Guidorizzi 4 volumes</span>
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

        </motion.div>
    );
};

export default ChatGuidorizzi;
