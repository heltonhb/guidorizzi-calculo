/**
 * Theme toggle button for switching between dark and light modes.
 */

import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

/**
 * Toggle button component for theme switching.
 */
const ThemeToggle = () => {
  const { theme, toggleTheme, isDark, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="w-10 h-10 bg-zinc-800 rounded-none" />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="w-10 h-10 flex items-center justify-center border-2 border-white/20 bg-zinc-950 hover:bg-zinc-900 transition-colors"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Moon className="w-5 h-5 text-[#00f0ff]" />
      ) : (
        <Sun className="w-5 h-5 text-[#ff5500]" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;