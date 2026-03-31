import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { AppContext } from './context/createAppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorNotification } from './components/ErrorNotification';
import { ToastProvider } from './components/Toast';
import Dashboard from './components/Dashboard';
import StudyMaterial from './components/StudyMaterial';
import ExerciseList from './components/ExerciseList';
import PresentationMode from './components/PresentationMode';
import ChatGuidorizzi from './components/ChatGuidorizzi';
import AudioPlayer from './components/AudioPlayer';
import QuizMode from './components/QuizMode';
import Flashcards from './components/Flashcards';
import { installConsoleCommands } from './lib/notebookConsole';

function AppContent() {
  const { view, setView, currentTopic, navigateTo } = React.useContext(AppContext);

  // 🔥 Inicializar console commands
  React.useEffect(() => {
    installConsoleCommands();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-cyber selection:text-zinc-950 relative max-w-[100vw]" style={{ overflowX: 'clip' }}>
      {/* Brutalist Vibrant Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Laranja Vibrante */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] bg-[#ff5500] blur-[120px] rounded-full"
        />
        {/* Ciano Elétrico */}
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
            opacity: [0.12, 0.25, 0.12]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[20%] w-[70%] h-[70%] bg-[#00f0ff] blur-[140px] rounded-full"
        />
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] contrast-150 brightness-100 pointer-events-none"></div>
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      </div>

      <main className="relative z-10 max-w-lg mx-auto px-4 md:px-6 pt-10 pb-24 min-h-screen overflow-x-hidden">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Dashboard onNavigate={navigateTo} />
            </motion.div>
          )}
          {view === 'material' && (
            <motion.div
              key="material"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <StudyMaterial topic={currentTopic} onBack={() => setView('dashboard')} />
            </motion.div>
          )}
          {view === 'exercises' && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <ExerciseList topic={currentTopic} onBack={() => setView('dashboard')} />
            </motion.div>
          )}
          {view === 'presentation' && (
            <motion.div
              key="presentation"
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.1, rotateY: -90 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <PresentationMode topic={currentTopic} onBack={() => setView('dashboard')} />
            </motion.div>
          )}
          {view === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <ChatGuidorizzi onBack={() => setView('dashboard')} />
            </motion.div>
          )}
          {view === 'audio' && (
            <motion.div
              key="audio"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
            >
              <AudioPlayer topic={currentTopic} onBack={() => setView('dashboard')} />
            </motion.div>
          )}
          {view === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <QuizMode topic={currentTopic} onBack={() => setView('dashboard')} />
            </motion.div>
          )}
          {view === 'flashcards' && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <Flashcards topic={currentTopic} onBack={() => setView('dashboard')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <ToastProvider>
          <ErrorNotification />
          <AppContent />
        </ToastProvider>
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
