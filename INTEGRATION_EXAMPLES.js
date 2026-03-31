/**
 * EXEMPLO DE INTEGRAÇÃO: Como usar useStudyMetrics nos componentes
 * 
 * Este arquivo mostra onde adicionar as chamadas de rastreamento
 */

// ============================================
// 1. EXEMPLO: Dashboard.jsx
// ============================================

import { useStudyMetrics } from '../hooks/useStudyMetrics';

function Dashboard() {
    const { startTopicSession, getOverallPerformance, getProblemAreas } = useStudyMetrics();
    
    const handleSelectTopic = (topicName) => {
        // 🔥 AO ENTRAR EM UM TÓPICO, registre a sessão
        startTopicSession(topicName);
        
        navigateTo('study', topicName);
    };

    return (
        <div>
            {/* ... */}
            <div>
                <p>Progresso geral: {getOverallPerformance()}%</p>
                <h3>Tópicos com dificuldade:</h3>
                {getProblemAreas().map(area => (
                    <div key={area.topic}>
                        {area.topic}: {area.score}% ({area.errors} erros)
                    </div>
                ))}
            </div>
            {/* ... */}
        </div>
    );
}

// ============================================
// 2. EXEMPLO: StudyMaterial.jsx
// ============================================

import { useStudyMetrics } from '../hooks/useStudyMetrics';

function StudyMaterial({ topic }) {
    const { endTopicSession, recordDoubts } = useStudyMetrics();

    // 🔥 AO SAIR DE UM TÓPICO, encerre a sessão
    useEffect(() => {
        return () => {
            endTopicSession();  // Registra tempo total
        };
    }, [endTopicSession]);

    // Se usuário fizer uma pergunta/anotação
    const handleAddNote = (noteText) => {
        // Opcionalmente, registre como dúvida
        if (noteText.includes('?')) {
            recordDoubts(topic, noteText);
        }
    };

    return (
        <div>
            {/* Conteúdo do estudo */}
        </div>
    );
}

// ============================================
// 3. EXEMPLO: QuizMode.jsx
// ============================================

import { useStudyMetrics } from '../hooks/useStudyMetrics';

function QuizMode({ topic }) {
    const { recordQuizResult } = useStudyMetrics();
    
    const handleQuizComplete = (userAnswers, correctAnswers) => {
        const score = userAnswers.filter((ans, i) => ans === correctAnswers[i]).length;
        const total = correctAnswers.length;
        
        // 🔥 AO TERMINAR QUIZ, registre o resultado
        recordQuizResult(topic, score, total);
        
        // Mostra resultado
        console.log(`Score: ${score}/${total} = ${(score/total*100).toFixed(0)}%`);
    };

    return (
        <div>
            {/* Quiz UI */}
        </div>
    );
}

// ============================================
// 4. EXEMPLO: ChatGuidorizzi.jsx (já implementado)
// ============================================

import useSmartChat from '../hooks/useSmartChat';
import IntelligentSuggestions from './IntelligentSuggestions';

function ChatGuidorizzi({ currentTopic }) {
    // 🔥 useSmartChat já integra tudo automaticamente:
    // - Rastreia dúvidas
    // - Prepara contexto
    // - Seleciona templates
    // - Gera sugestões
    
    const { queryWithContext, chatContext, suggestions } = useSmartChat(currentTopic);
    
    return (
        <div>
            {/* Chat com sugestões automáticas */}
            <IntelligentSuggestions 
                suggestions={suggestions}
                chatContext={chatContext}
            />
        </div>
    );
}

// ============================================
// 5. EXEMPLO: App.jsx - Passando currentTopic
// ============================================

function App() {
    const { view, currentTopic } = useContext(AppContext);
    
    return (
        <div>
            {view === 'chat' && (
                <ChatGuidorizzi 
                    currentTopic={currentTopic}  // 🔥 passar o tópico atual
                    onBack={() => setView('dashboard')}
                />
            )}
        </div>
    );
}

// ============================================
// 6. COMAND: Verificar rastreamento em Console
// ============================================

/*
Abra DevTools (F12) e execute:

// Ver todas as métricas
JSON.parse(localStorage.studyMetrics)

// Ver dúvidas de um tópico
const metrics = JSON.parse(localStorage.studyMetrics);
metrics.doubts.filter(d => d.topic === 'Limites')

// Ver desempenho por tópico
Object.entries(metrics.topics).map(([topic, data]) => ({
    topic,
    score: data.score,
    timeSpent: data.timeSpent,
    errors: data.errors
}))

// Limpar localStorage (se necessário para testes)
localStorage.removeItem('studyMetrics')
*/

// ============================================
// 7. VERIFICAR SE ESTÁ FUNCIONANDO
// ============================================

console.log(`
✅ Sistema de rastreamento ativo quando:
1. Usuário abre tópico → startTopicSession() chamado
2. Usuário sai do tópico → endTopicSession() chamado
3. Usuário faz pergunta no chat → recordDoubts() chamado
4. Usuário conclui quiz → recordQuizResult() chamado

📊 Verifique localStorage.studyMetrics no DevTools!
`);

export { Dashboard, StudyMaterial, QuizMode, ChatGuidorizzi };
