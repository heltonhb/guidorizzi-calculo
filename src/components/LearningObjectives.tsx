import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, ChevronDown, ChevronUp, BookOpen, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';

const LearningObjectives = ({ 
  objectives = [], 
  topic = '',
  showInitially = true,
  onObjectiveComplete,
  completedObjectives = []
}) => {
  const [isExpanded, setIsExpanded] = React.useState(showInitially);
  const [checkedItems, setCheckedItems] = React.useState(new Set(completedObjectives));

  const handleToggle = (index) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
      onObjectiveComplete?.(index);
    }
    setCheckedItems(newChecked);
  };

  if (!objectives || objectives.length === 0) {
    return null;
  }

  const completionRate = Math.round((checkedItems.size / objectives.length) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border-2 border-[#00f0ff] p-4 rounded-none shadow-[4px_4px_0_#00f0ff]"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00f0ff] flex items-center justify-center">
            <Target className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-wider text-sm">
              Objetivos de Aprendizagem
            </h3>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
              {topic}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress badge */}
          <div className={cn(
            "px-3 py-1 text-xs font-black uppercase",
            completionRate === 100 
              ? "bg-green-500 text-zinc-950" 
              : "bg-zinc-800 text-[#00f0ff]"
          )}>
            {completionRate}%
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-zinc-400 text-xs font-bold uppercase">
                  Ao final desta seção, você será capaz de:
                </span>
              </div>
              
              <ul className="space-y-2">
                {objectives.map((objective, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 group cursor-pointer"
                    onClick={() => handleToggle(index)}
                  >
                    <div className={cn(
                      "w-5 h-5 mt-0.5 flex-shrink-0 border-2 flex items-center justify-center transition-colors",
                      checkedItems.has(index)
                        ? "bg-green-500 border-green-500"
                        : "border-zinc-600 group-hover:border-[#00f0ff]"
                    )}>
                      {checkedItems.has(index) && (
                        <CheckCircle2 className="w-3 h-3 text-zinc-950" />
                      )}
                    </div>
                    <span className={cn(
                      "text-sm font-medium leading-relaxed",
                      checkedItems.has(index)
                        ? "text-zinc-500 line-through"
                        : "text-zinc-200 group-hover:text-white"
                    )}>
                      {objective}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Footer hint */}
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-500">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs">
                  Marque os objetivos que você já domina
                </span>
              </div>
              <span className="text-xs text-zinc-600">
                {checkedItems.size}/{objectives.length} concluídos
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LearningObjectives;