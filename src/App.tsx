import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppContext } from './context/createAppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorNotification } from './components/ErrorNotification';
import { ToastProvider } from './components/Toast';
import Dashboard from './components/Dashboard';
import BottomNav from './components/BottomNav';
import { installConsoleCommands } from './lib/notebookConsole';

// Lazy load heavy components for better performance
const StudyMaterial = lazy(() => import('./components/StudyMaterial'));
const ExerciseList = lazy(() => import('./components/ExerciseList'));
const PresentationMode = lazy(() => import('./components/PresentationMode'));
const ChatGuidorizzi = lazy(() => import('./components/ChatGuidorizzi'));
const QuizMode = lazy(() => import('./components/QuizMode'));
const Flashcards = lazy(() => import('./components/Flashcards'));
const Profile = lazy(() => import('./components/Profile'));

// Create a client
const queryClient = new QueryClient();

// Loading component for lazy-loaded routes
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-[#00f0ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-zinc-400 text-sm">Carregando...</p>
    </div>
  </div>
);

function AppContent(): JSX.Element {
  const { view, setView, currentTopic, navigateTo } = React.useContext(AppContext);

  // Background diferente para dashboard vs outras views
  const isDashboard = view === 'dashboard';

  // 🔥 Inicializar console commands
  React.useEffect(() => {
    installConsoleCommands();
  }, []);

  return (
    <div
      className="min-h-screen text-zinc-100 font-sans selection:bg-cyber selection:text-zinc-950 relative max-w-[100vw]"
      style={{
        overflowX: 'clip',
        background: isDashboard
          ? '#e4e4e7'
          : '#050505'
      }}
    >
      {/* Background apenas quando NÃO é dashboard */}
      {!isDashboard && (
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
      )}

      <main className="relative z-10 w-full max-w-lg mx-auto px-4 md:px-6 pt-10 pb-24 min-h-screen" style={{ overflowX: 'clip' }}>
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
              <Suspense fallback={<LoadingSpinner />}>
                <StudyMaterial topic={currentTopic} onBack={() => setView('dashboard')} />
              </Suspense>
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
              <Suspense fallback={<LoadingSpinner />}>
                <ExerciseList topic={currentTopic} onBack={() => setView('dashboard')} />
              </Suspense>
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
              <Suspense fallback={<LoadingSpinner />}>
                <PresentationMode topic={currentTopic} onBack={() => setView('dashboard')} />
              </Suspense>
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
              <Suspense fallback={<LoadingSpinner />}>
                <ChatGuidorizzi onBack={() => setView('dashboard')} />
              </Suspense>
            </motion.div>
          )}
          {view === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <Suspense fallback={<LoadingSpinner />}>
                <QuizMode topic={currentTopic} onBack={() => setView('dashboard')} />
              </Suspense>
            </motion.div>
          )}
          {view === 'flashcards' && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <Suspense fallback={<LoadingSpinner />}>
                <Flashcards topic={currentTopic} onBack={() => setView('dashboard')} />
              </Suspense>
            </motion.div>
          )}
          {view === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Suspense fallback={<LoadingSpinner />}>
                <Profile onBack={() => setView('dashboard')} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}

function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <ErrorBoundary>
            <ToastProvider>
              <ErrorNotification />
              <AppContent />
            </ToastProvider>
          </ErrorBoundary>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
