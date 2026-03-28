import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

export const ErrorNotification = () => {
  const { errors, removeError } = useAppContext();

  return (
    <AnimatePresence>
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {errors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: 400, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-md max-w-sm pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-100">{error.message}</p>
              </div>
              <button
                onClick={() => removeError(error.id)}
                className="text-red-500 hover:text-red-300 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};
