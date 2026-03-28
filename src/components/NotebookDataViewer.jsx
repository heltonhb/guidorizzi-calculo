/**
 * NotebookDataViewer.jsx
 * 
 * Componente para visualizar dados retornados pelo NotebookLM
 * Mostra: estrutura, conteúdo, timestamps, status
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Copy, Download, Zap, Database, Code, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export const NotebookDataViewer = ({ isOpen = false, onClose }) => {
  const [responses, setResponses] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [filter, setFilter] = useState('all'); // all, chat, studio, errors

  // Interceptar respostas do NotebookLM via localStorage
  useEffect(() => {
    if (!isOpen) return;

    const checkResponses = () => {
      const stored = localStorage.getItem('notebookResponses');
      if (stored) {
        try {
          setResponses(JSON.parse(stored));
        } catch (e) {
          console.error('Erro ao carregar respostas:', e);
        }
      }
    };

    checkResponses();
    const interval = setInterval(checkResponses, 500);
    return () => clearInterval(interval);
  }, [isOpen]);

  const clearData = () => {
    localStorage.removeItem('notebookResponses');
    setResponses([]);
  };

  const downloadData = () => {
    const dataStr = JSON.stringify(responses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notebooklm-data-${Date.now()}.json`;
    link.click();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
  };

  const filteredResponses = responses.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'chat') return r.type === 'chat';
    if (filter === 'studio') return r.type === 'studio';
    if (filter === 'errors') return r.isError;
    return true;
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 right-0 h-screen w-full md:w-[50%] bg-zinc-900 border-l border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-800/50">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-bold text-white">NotebookLM Data Viewer</h3>
            <p className="text-xs text-zinc-400">{responses.length} respostas capturadas</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-200 transition"
        >
          Fechar
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-zinc-800/30 flex-wrap">
        <div className="flex gap-2">
          {['all', 'chat', 'studio', 'errors'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 text-xs rounded transition",
                filter === f
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              )}
            >
              {f === 'all' ? 'Todos' : f === 'chat' ? 'Chat' : f === 'studio' ? 'Studio' : 'Erros'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="p-2 hover:bg-zinc-700 rounded text-zinc-300 transition"
            title="Toggle raw JSON"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={downloadData}
            className="p-2 hover:bg-zinc-700 rounded text-zinc-300 transition"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearData}
            className="p-2 hover:bg-red-700/20 rounded text-red-300 transition"
            title="Clear"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredResponses.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma resposta capturada</p>
              <p className="text-xs mt-2">Faça perguntas no chat ou use Studio para gerar dados</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredResponses.map((response, idx) => (
                <DataResponseCard
                  key={idx}
                  response={response}
                  isExpanded={expanded === idx}
                  onToggle={() => setExpanded(expanded === idx ? null : idx)}
                  onCopy={() => copyToClipboard(response)}
                  showRaw={showRaw}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/**
 * Card individual para cada resposta
 */
const DataResponseCard = ({ response, isExpanded, onToggle, onCopy, showRaw }) => {
  const statusColor = response.isError
    ? 'bg-red-500/10 border-red-500/30 text-red-300'
    : response.type === 'chat'
    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
    : 'bg-purple-500/10 border-purple-500/30 text-purple-300';

  const truncate = (str, len = 100) => {
    if (!str) return '(vazio)';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "border rounded-lg p-4 transition-all cursor-pointer hover:bg-zinc-800/50",
        statusColor
      )}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase">
              {response.isError ? '❌ Erro' : response.type === 'chat' ? '💬 Chat' : '🎬 Studio'}
            </span>
            <span className="text-xs text-zinc-400">
              {new Date(response.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm font-mono text-zinc-200 mb-2">
            {response.query ? truncate(response.query, 80) : '(sem query)'}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 transition-transform flex-shrink-0",
            isExpanded && 'rotate-180'
          )}
        />
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            {showRaw ? (
              /* JSON Raw */
              <div className="bg-black/30 rounded p-3 overflow-x-auto">
                <pre className="text-xs text-zinc-300 font-mono overflow-x-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            ) : (
              /* Formatted View */
              <div className="space-y-3 text-sm">
                {response.type && (
                  <div>
                    <span className="text-zinc-400">Tipo:</span>
                    <span className="ml-2 font-mono text-zinc-200">{response.type}</span>
                  </div>
                )}

                {response.query && (
                  <div>
                    <span className="text-zinc-400">Query:</span>
                    <div className="mt-1 p-2 bg-black/20 rounded font-mono text-xs text-zinc-300 max-h-24 overflow-y-auto">
                      {response.query}
                    </div>
                  </div>
                )}

                {response.content && (
                  <div>
                    <span className="text-zinc-400">Resposta:</span>
                    <div className="mt-1 p-2 bg-black/20 rounded text-xs text-zinc-300 max-h-32 overflow-y-auto">
                      {typeof response.content === 'string'
                        ? truncate(response.content, 500)
                        : JSON.stringify(response.content).substring(0, 500)}
                    </div>
                  </div>
                )}

                {response.answer && (
                  <div>
                    <span className="text-zinc-400">Answer:</span>
                    <div className="mt-1 p-2 bg-black/20 rounded text-xs text-zinc-300 max-h-32 overflow-y-auto">
                      {truncate(response.answer, 500)}
                    </div>
                  </div>
                )}

                {response.isError && (
                  <div>
                    <span className="text-red-400">Erro:</span>
                    <div className="mt-1 p-2 bg-red-500/10 rounded text-xs text-red-300 font-mono">
                      {response.error}
                    </div>
                  </div>
                )}

                {response.metadata && (
                  <div>
                    <span className="text-zinc-400">Metadata:</span>
                    <div className="mt-1 p-2 bg-black/20 rounded text-xs text-zinc-300 font-mono">
                      {JSON.stringify(response.metadata, null, 2)}
                    </div>
                  </div>
                )}

                {/* Copy Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy();
                  }}
                  className="mt-2 px-3 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded flex items-center gap-2 transition"
                >
                  <Copy className="w-3 h-3" />
                  Copiar JSON
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotebookDataViewer;
