import React, { useRef, useEffect } from 'react';
import { AlertCircle, Bot, User, Zap, Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { preprocessMathContent } from '../utils/mathPreprocessor';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
  hasContext?: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  onRetry: () => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, loading, onRetry }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
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
                  {preprocessMathContent(message.content)}
                </ReactMarkdown>
              </div>
              {message.isError && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRetry}
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
  );
};

export default ChatMessages;