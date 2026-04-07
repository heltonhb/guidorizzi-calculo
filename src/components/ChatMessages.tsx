import React, { useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { preprocessMathContent } from '../utils/mathPreprocessor';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
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
      className="flex-1 overflow-y-auto w-full px-4 py-8 space-y-6 scroll-smooth custom-scrollbar"
    >
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "w-full bg-black p-4 sm:p-6 shadow-[8px_8px_0_rgba(0,0,0,0.5)]",
              message.role === 'assistant' ? "border-l-[8px] border-[#f97316]" : ""
            )}
          >
            <p className={cn(
              "font-mono text-sm sm:text-base font-black uppercase tracking-widest mb-3",
              message.isError ? "text-[#ef4444]" : "text-[#f97316]"
            )}>
              {message.role === 'assistant' && !message.isError && ">> GUIDORIZZI.AI.CORE // [SUCCESS]"}
              {message.role === 'assistant' && message.isError && ">> GUIDORIZZI.AI.CORE // [ERROR]"}
              {message.role === 'user' && ">> [USER]"}
            </p>

            <div className={cn(
              "prose max-w-none prose-p:leading-[1.6]",
              "prose-invert prose-p:font-mono prose-p:text-white prose-p:text-base sm:prose-p:text-lg prose-p:tracking-tight",
              "prose-strong:text-[#f97316] prose-code:text-[#f97316] prose-code:bg-zinc-900 prose-code:px-1"
            )}>
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {preprocessMathContent(message.content)}
              </ReactMarkdown>
            </div>

            {message.isError && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="mt-6 px-6 py-3 bg-black border-4 border-[#ef4444] text-xs font-black uppercase tracking-widest text-[#ef4444] hover:bg-[#ef4444] hover:text-black flex items-center gap-3 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                RE.EXECUTE()
              </motion.button>
            )}
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full bg-black border-l-[8px] border-[#f97316] p-4 sm:p-6 shadow-[8px_8px_0_rgba(0,0,0,0.5)]"
          >
            <p className="text-[#f97316] font-mono text-sm sm:text-base font-black uppercase tracking-widest mb-3">
              &gt;&gt; GUIDORIZZI.AI.CORE // [PROCESSING]
            </p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-6 bg-[#f97316] animate-ping" style={{ animationDuration: '1s' }} />
              <span className="w-3 h-6 bg-[#f97316] animate-ping" style={{ animationDuration: '1.2s' }} />
              <span className="w-3 h-6 bg-[#f97316] animate-ping" style={{ animationDuration: '1.4s' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatMessages;