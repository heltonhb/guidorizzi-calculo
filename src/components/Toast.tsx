import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastContext = createContext(null);

const ICONS = {
    success: <CheckCircle2 className="w-6 h-6 text-zinc-950" />,
    error: <XCircle className="w-6 h-6 text-zinc-950" />,
    info: <Info className="w-6 h-6 text-zinc-950" />,
    warning: <AlertTriangle className="w-6 h-6 text-zinc-950" />,
};

const COLORS = {
    success: 'border-emerald-500 bg-emerald-500 shadow-[4px_4px_0_rgba(0,0,0,1)]',
    error: 'border-signal bg-signal shadow-[4px_4px_0_rgba(0,0,0,1)]',
    info: 'border-blue-500 bg-blue-500 shadow-[4px_4px_0_rgba(0,0,0,1)]',
    warning: 'border-amber-400 bg-amber-400 shadow-[4px_4px_0_rgba(0,0,0,1)]',
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback({
        success: (msg, dur) => addToast(msg, 'success', dur),
        error: (msg, dur) => addToast(msg, 'error', dur ?? 6000),
        info: (msg, dur) => addToast(msg, 'info', dur),
        warning: (msg, dur) => addToast(msg, 'warning', dur ?? 5000),
    }, [addToast]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className={cn(
                                'pointer-events-auto flex items-start gap-3 p-4 border-2 border-zinc-950',
                                COLORS[t.type]
                            )}
                        >
                            <div className="flex-shrink-0 mt-0.5 bg-white rounded-full p-0.5 border-2 border-zinc-950">{ICONS[t.type]}</div>
                            <p className="flex-1 text-sm font-black text-zinc-950 uppercase tracking-widest leading-relaxed pt-1">{t.message}</p>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="flex-shrink-0 text-zinc-950/70 hover:text-zinc-950 transition-colors mt-1"
                            >
                                <X className="w-5 h-5 stroke-[3]" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};
