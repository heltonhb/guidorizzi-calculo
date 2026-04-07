import React, { useRef, useEffect } from 'react';
import { RotateCcw, Zap, Sparkles, Terminal } from 'lucide-react';
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

  const timestamp = new Date().toISOString().split('T')[1].substr(0, 8);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto w-full custom-scrollbar bg-zinc-950"
    >
      <div className="flex flex-col w-full max-w-5xl mx-auto border-x-4 border-zinc-900 min-h-full">
        {messages.length === 0 && !loading && (
          <div className="p-12 text-center border-b-4 border-zinc-900">
            <Terminal className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-zinc-700 uppercase tracking-widest">Sys.Ready</h2>
            <p className="text-zinc-500 font-mono text-sm mt-4 uppercase">Aguardando entrada de dados...</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "relative flex flex-col gap-6 py-10 px-8 border-b-4 border-zinc-900 w-full rounded-none transition-colors",
                message.role === 'user'
                  ? "bg-zinc-950 border-l-[12px] border-l-white"
                  : message.isError
                    ? "bg-rose-950/20 border-l-[12px] border-l-rose-500"
                    : "bg-premium-blue/5 border-l-[12px] border-l-premium-blue"
              )}
            >
              <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-4">
                <div className="flex items-center gap-4">
                  {message.role === 'user' ? (
                    <span className="bg-white text-zinc-950 px-3 py-1 font-mono text-xs font-black tracking-widest uppercase">USER_INPUT</span>
                  ) : message.isError ? (
                    <span className="bg-rose-500 text-zinc-950 px-3 py-1 font-mono text-xs font-black tracking-widest uppercase">CRITICAL_ERR</span>
                  ) : (
                    <span className="bg-premium-blue text-white px-3 py-1 font-mono text-xs font-black tracking-widest uppercase">GUIDORIZZI_CORE</span>
                  )}
                  <span className="text-zinc-600 font-mono text-[10px] tracking-widest hidden sm:block">MSG_ID: {message.id.substring(0, 8)}</span>
                </div>

                <div className="flex items-center gap-4 text-zinc-500 font-mono text-[10px] tracking-widest uppercase">
                  {message.role === 'assistant' && !message.isError && (
                    <div className="hidden sm:flex items-center gap-2">
                      {message.hasContext ? (
                        <><Zap className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-500">CTX: LOADED</span></>
                      ) : (
                        <><Sparkles className="w-3 h-3 text-zinc-600" /> CTX: NULL</>
                      )}
                      <span className="mx-2 text-zinc-800">|</span>
                    </div>
                  )}
                  <span>T={timestamp}</span>
                </div>
              </div>

              <div className={cn(
                "prose max-w-none prose-p:leading-[1.8] prose-pre:bg-zinc-950 prose-pre:border-4 prose-pre:border-zinc-800 prose-pre:rounded-none prose-pre:shadow-[8px_8px_0_rgba(0,0,0,1)] prose-pre:-mx-4 sm:prose-pre:mx-0 prose-pre:px-6 prose-pre:py-6",
                message.role === 'user'
                  ? "prose-invert prose-p:text-xl sm:prose-p:text-2xl prose-p:font-bold prose-p:text-white prose-p:tracking-wide"
                  : "prose-invert prose-zinc prose-p:text-lg prose-strong:text-white prose-code:text-premium-blue prose-code:bg-zinc-950 prose-code:px-2 prose-code:py-1 prose-code:border-2 prose-code:border-zinc-800 text-zinc-300 font-medium"
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
                  whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px rgba(244,63,94,0.5)" }}
                  whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
                  onClick={onRetry}
                  className="mt-8 self-start px-8 py-4 bg-zinc-950 border-4 border-rose-500 text-sm font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-zinc-950 flex items-center gap-3 transition-colors rounded-none"
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
              className="flex flex-col gap-6 py-10 px-8 bg-zinc-950 border-b-4 border-zinc-900 border-l-[12px] border-l-premium-blue w-full rounded-none"
            >
              <div className="flex items-center gap-4 border-b-2 border-zinc-800 pb-4">
                <span className="bg-premium-blue text-white px-3 py-1 font-mono text-xs font-black tracking-widest uppercase animate-pulse">PROC_ACTIVE</span>
              </div>
              <div className="flex items-end gap-3 py-8">
                <div className="w-4 h-12 bg-premium-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-4 h-8 bg-premium-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-4 h-16 bg-premium-blue animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-4 text-premium-blue font-black uppercase tracking-widest text-xl animate-pulse">Processando...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatMessages;