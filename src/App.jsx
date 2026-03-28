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
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-purple-500/30 overflow-x-hidden relative">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[15%] w-[60%] h-[60%] bg-purple-600 blur-[140px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[20%] w-[70%] h-[70%] bg-blue-600 blur-[160px] rounded-full"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.14] contrast-150 brightness-100 pointer-events-none"></div>
      </div>

      <main className="relative z-10 max-w-lg mx-auto px-6 pt-12 pb-24 min-h-screen">
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
