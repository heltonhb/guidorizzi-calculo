// components/ExportDialog.jsx
import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const ExportDialog = ({ visible, onClose, onExport, isLoading }) => {
  const [exportFormat, setExportFormat] = useState('pdf'); // pdf, markdown, json
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  const [exportAll, setExportAll] = useState(false);

  const exportOptions = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Exportar slide(s) como PDF de alta qualidade',
      icon: '📄',
      color: 'from-red-500 to-pink-500',
    },
    {
      id: 'markdown',
      name: 'Markdown',
      description: 'Exportar com conteúdo em Markdown + anotações',
      icon: '📝',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Exportar dados brutos (slides, anotações, favoritos)',
      icon: '⚙️',
      color: 'from-purple-500 to-indigo-500',
    },
  ];

  const handleExport = () => {
    onExport({
      format: exportFormat,
      includeAnnotations,
      exportAll,
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-white/10 border border-white/20 rounded-3xl backdrop-blur-xl p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">Exportar Slides</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                disabled={isLoading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Formato */}
            <div className="mb-6">
              <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
                Formato de Exportação
              </p>
              <div className="grid gap-2">
                {exportOptions.map(option => (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExportFormat(option.id)}
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all text-left',
                      exportFormat === option.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1">
                        <p className="font-black text-white text-sm">{option.name}</p>
                        <p className="text-xs text-zinc-400 leading-tight">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Opções */}
            <div className="mb-6 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeAnnotations}
                  onChange={(e) => setIncludeAnnotations(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded cursor-pointer accent-purple-500"
                />
                <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
                  Incluir minhas anotações
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={exportAll}
                  onChange={(e) => setExportAll(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded cursor-pointer accent-purple-500"
                />
                <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
                  Exportar todos os slides (vs slide atual)
                </span>
              </label>
            </div>

            {/* Help Text */}
            <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-blue-300 font-medium">
                💡 PDF exporta renderização visual. Markdown inclui código-fonte. JSON
                permite importar depois.
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                Cancelar
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl font-black hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span> Exportando...
                  </>
                ) : (
                  <>
                    <Download size={18} /> Exportar
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExportDialog;
