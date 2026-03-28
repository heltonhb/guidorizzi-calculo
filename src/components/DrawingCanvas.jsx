// components/DrawingCanvas.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Pen, Undo2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const DrawingCanvas = ({ visible, width = 1200, height = 700, onClose }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('pen'); // 'pen', 'marker', 'eraser'
  const [color, setColor] = useState('#ec4899'); // Rosa default
  const [lineWidth, setLineWidth] = useState(3);
  const [history, setHistory] = useState([]);

  // Cores disponíveis
  const colors = [
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Amarelo', value: '#eab308' },
    { name: 'Verde', value: '#10b981' },
    { name: 'Azul', value: '#06b6d4' },
    { name: 'Vermelho', value: '#ef4444' },
    { name: 'Branco', value: '#ffffff' },
  ];

  // Inicializar canvas
  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    contextRef.current = ctx;

    // Salvar estado inicial
    setHistory([canvas.toDataURL()]);
  }, [visible, width, height]);

  // Atualizar estilos do canvas baseado no mode
  useEffect(() => {
    if (!contextRef.current) return;

    switch (mode) {
      case 'pen':
        contextRef.current.globalAlpha = 1;
        contextRef.current.lineWidth = 2;
        contextRef.current.strokeStyle = color;
        break;
      case 'marker':
        contextRef.current.globalAlpha = 0.4;
        contextRef.current.lineWidth = 15;
        contextRef.current.strokeStyle = color;
        break;
      case 'eraser':
        contextRef.current.globalAlpha = 1;
        contextRef.current.lineWidth = 20;
        contextRef.current.strokeStyle = '#050505';
        contextRef.current.clearRect = true; // Flag custom
        break;
      default:
        break;
    }
  }, [mode, color]);

  const startDrawing = (e) => {
    if (mode === 'eraser') {
      contextRef.current.clearRect = true;
      contextRef.current.globalCompositeOperation = 'destination-out';
    } else {
      contextRef.current.globalCompositeOperation = 'source-over';
    }

    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);

    // Salvar no histórico
    if (canvasRef.current) {
      setHistory([...history, canvasRef.current.toDataURL()]);
    }
  };

  const undo = () => {
    if (history.length <= 1) return;

    const newHistory = history.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];

    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      contextRef.current.clearRect(0, 0, width, height);
      contextRef.current.drawImage(img, 0, 0);
      setHistory(newHistory);
    };
  };

  const clear = () => {
    contextRef.current.fillStyle = '#050505';
    contextRef.current.fillRect(0, 0, width, height);
    contextRef.current.globalCompositeOperation = 'source-over';
    setHistory([canvasRef.current.toDataURL()]);
  };

  const downloadDrawing = () => {
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `slide-markup-${Date.now()}.png`;
    link.click();
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-black"
    >
      {/* Header Controls */}
      <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
        <h3 className="text-white font-black text-lg">Markup nos Slides</h3>

        <div className="flex items-center gap-3">
          {/* Modo de Desenho */}
          <div className="flex gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
            {[
              { type: 'pen', icon: '✏️', label: 'Caneta' },
              { type: 'marker', icon: '🖍️', label: 'Marcador' },
              { type: 'eraser', icon: '🧹', label: 'Borracha' },
            ].map(btn => (
              <motion.button
                key={btn.type}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(btn.type)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all',
                  mode === btn.type
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-zinc-400 hover:text-white'
                )}
                title={btn.label}
              >
                {btn.icon}
              </motion.button>
            ))}
          </div>

          {/* Cores */}
          {mode !== 'eraser' && (
            <div className="flex gap-2">
              {colors.map(c => (
                <motion.button
                  key={c.value}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all',
                    color === c.value
                      ? 'border-white scale-110'
                      : 'border-white/20'
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={undo}
              disabled={history.length <= 1}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50"
            >
              <Undo2 size={18} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={clear}
              className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 text-red-400"
            >
              <RotateCcw size={18} />
            </motion.button>
          </div>

          {/* Fechar */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 font-bold text-sm"
          >
            Fechar ✕
          </motion.button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair"
          style={{
            maxWidth: '95%',
            maxHeight: '95%',
            border: '2px solid #ffffff20',
            borderRadius: '16px',
          }}
        />
      </div>

      {/* Footer */}
      <div className="bg-white/5 border-t border-white/10 p-4 flex justify-end gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={downloadDrawing}
          className="px-6 py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-600 transition-colors"
        >
          ⬇️ Baixar Markup
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DrawingCanvas;
