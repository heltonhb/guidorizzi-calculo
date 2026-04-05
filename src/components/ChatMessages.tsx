import React, { useRef, useEffect } from 'react';
import { RotateCcw, Zap, Sparkles } from 'lucide-react';
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
      className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-6"
    >
      <div className="flex flex-col border-t-2 border-white/10">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "relative flex flex-col gap-3 py-8 px-4 border-b-2 border-white/10 transition-all duration-300 w-full group",
                message.role === 'user'
                  ? "bg-transparent hover:bg-white/[0.02]"
                  : message.isError
                    ? "bg-zinc-950/80 border-l-8 border-l-red-500 pl-6"
                    : "bg-zinc-950/80 border-l-8 border-l-[#FF5500] pl-6"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {message.role === 'user' ? (
                    <span className="text-[#00f0ff] font-mono text-sm font-black tracking-widest uppercase">&gt; QUERY.INPUT // [USER]</span>
                  ) : message.isError ? (
                    <span className="text-red-500 font-mono text-xs font-black tracking-widest uppercase">&gt;&gt; SYSTEM.ERROR // [FAILED]</span>
                  ) : (
                    <span className="text-[#FF5500] font-mono text-xs font-black tracking-widest uppercase">&gt;&gt; GUIDORIZZI.AI.CORE // [SUCCESS]</span>
                  )}
                </div>
                {/* Context Indicator for AI Messages */}
                {message.role === 'assistant' && !message.isError && (
                  <div className="hidden sm:flex items-center gap-2 text-zinc-600 font-mono text-[10px] tracking-widest uppercase">
                    {message.hasContext ? (
                      <><Zap className="w-3 h-3 text-[#FF5500]" /> CONTEXT: ACTIVE</>
                    ) : (
                      <><Sparkles className="w-3 h-3 text-zinc-600" /> CONTEXT: NONE</>
                    )}
                  </div>
                )}
              </div>

              <div className={cn(
                "prose max-w-none prose-p:leading-relaxed prose-pre:bg-[#0a0a0a] prose-pre:border-2 prose-pre:border-white/10 prose-pre:-mx-4 sm:prose-pre:mx-0 prose-pre:px-4 prose-pre:py-4 prose-pre:rounded-none",
                message.role === 'user'
                  ? "prose-invert prose-p:text-xl sm:prose-p:text-2xl prose-p:font-bold prose-p:text-white"
                  : "prose-invert prose-zinc prose-strong:text-white prose-code:text-[#FF5500] prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:border prose-code:border-zinc-800 text-zinc-300"
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
                  whileHover={{ x: 2, y: -2, boxShadow: "-4px 4px 0px 0px #000" }}
                  whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
                  onClick={onRetry}
                  className="mt-4 self-start px-6 py-3 bg-red-500 border-2 border-red-500 text-xs font-black uppercase tracking-widest text-zinc-950 flex items-center gap-2 transition-all rounded-none"
                >
                  <RotateCcw className="w-4 h-4" />
                  RERUN.SEQUENCE
                </motion.button>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3 py-8 px-4 bg-zinc-950/80 border-l-8 border-l-[#00f0ff] pl-6 w-full border-b-2 border-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#00f0ff] font-mono text-xs font-black tracking-widest uppercase animate-pulse">
                  &gt;&gt; GUIDORIZZI.AI.CORE // [PROCESSING...]
                </span>
              </div>
              <div className="flex items-center gap-4 py-4">
                <div className="w-3 h-8 bg-[#00f0ff] animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-8 bg-[#00f0ff] animate-pulse" style={{ animationDelay: '150ms', animationDuration: '1.2s' }} />
                <div className="w-3 h-8 bg-[#00f0ff] animate-pulse" style={{ animationDelay: '300ms', animationDuration: '0.8s' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatMessages;