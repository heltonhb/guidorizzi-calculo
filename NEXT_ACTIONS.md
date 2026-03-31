# ✅ Próximas Ações - Roadmap de Integração

## 🎯 FASE IMEDIATA (Esta Semana)

### ✅ Tarefa 1: Integrar com Dashboard
**Tempo**: 10 minutos

```javascript
// src/components/Dashboard.jsx - Find handleSelectTopic, add:

import { useStudyMetrics } from '../hooks/useStudyMetrics';

function Dashboard() {
    const { startTopicSession } = useStudyMetrics();
    
    const handleSelectTopic = (topicName) => {
        // 🔥 Adicione esta linha:
        startTopicSession(topicName);
        
        // Resto do código existente:
        navigateTo('study', topicName);
    };
    
    // Rest of component...
}
```

**Verificar**: Quando clicar em tópico, localStorage deve ter cronômetro.

---

### ✅ Tarefa 2: Integrar com StudyMaterial
**Tempo**: 10 minutos

```javascript
// src/components/StudyMaterial.jsx - Add at top:

import { useEffect } from 'react';
import { useStudyMetrics } from '../hooks/useStudyMetrics';

function StudyMaterial({ topic }) {
    const { endTopicSession } = useStudyMetrics();
    
    // 🔥 Adicione este useEffect:
    useEffect(() => {
        return () => {
            endTopicSession();  // Runs when component unmounts
        };
    }, [endTopicSession]);
    
    // Rest of component...
}
```

**Verificar**: Quando sair do estudo, localStorage deve registrar tempo total.

---

### ✅ Tarefa 3: Integrar com QuizMode
**Tempo**: 10 minutos

```javascript
// src/components/QuizMode.jsx - Find handleComplete, modify:

import { useStudyMetrics } from '../hooks/useStudyMetrics';

function QuizMode({ topic }) {
    const { recordQuizResult } = useStudyMetrics();
    
    const handleQuizComplete = (userAnswers, questions) => {
        const score = userAnswers.filter(
            (ans, i) => ans === questions[i].correctAnswer
        ).length;
        
        // 🔥 Adicione estas linhas:
        recordQuizResult(topic, score, questions.length);
        
        // Resto do código existente:
        showResults(score, questions.length);
    };
    
    // Rest of component...
}
```

**Verificar**: Após completar quiz, localStorage deve ter score % atualizado.

---

### ✅ Tarefa 4: Verificar a Integração
**Tempo**: 5 minutos

```bash
# Terminal:
npm run dev

# Browser DevTools (F12):
JSON.parse(localStorage.studyMetrics)

# Você deve ver:
{
  "topics": {
    "Limites": {
      "timeSpent": 45,
      "score": 35,
      "errors": 3,
      ...
    }
  },
  "doubts": [...],
  "sessions": [...]
}
```

**✅ Se isto aparecer, a integração está OK!**

---

## 📅 FASE PRÓXIMA (Próxima Semana)

### 📊 Dashboard com Analytics

```javascript
// Criar: src/components/Analytics.jsx

import { useStudyMetrics } from '../hooks/useStudyMetrics';
import { LineChart } from 'recharts';  // npm install recharts

function Analytics() {
    const metrics = useStudyMetrics();
    
    return (
        <div>
            {/* Gráfico de progresso */}
            <LineChart data={metrics.getSessions()} />
            
            {/* Tópicos em risco */}
            {metrics.getProblemAreas().map(area => (
                <Alert level="warning">
                    {area.topic}: {area.score}%
                </Alert>
            ))}
            
            {/* Performance geral */}
            <ProgressBar value={metrics.getOverallPerformance()} />
        </div>
    );
}
```

---

### 🤖 Chat Automático nas Recomendações

```javascript
// src/services/autoChat.js

export const suggestChatHelp = (metrics, topic) => {
    const topicMetrics = metrics.topics[topic];
    
    if (topicMetrics.score < 50) {
        return "Você está com dificuldade em " + topic + 
               ". Quer conversar com o Guidorizzi?";
    } else if (topicMetrics.score < 75) {
        return "Progredindo bem! Tem alguma dúvida?";
    }
};
```

---

### 🎯 Integração Dashboard → Chat → Quiz → Estudo

```javascript
// Fluxo completo:
Dashboard (startSession)
    ↓
Study Material (tracked)
    ↓
Chat (com contexto)
    ↓
Quiz (com métricas)
    ↓
Recomendações (proxámo tópico)
    ↓
Voltar para Dashboard (complete)
```

---

## 🧪 Testes Recomendados

### Teste 1: Lifecycle Completo (15 min)

```bash
1. Clear localStorage: localStorage.clear()
2. Abra Dashboard
3. Clique em "Limites"
4. Aguarde 30 segundos
5. Abra Chat
6. Digite: "Como provar um limite?"
7. Clique em uma sugestão
8. Volte para Dashboard
9. Clique em "Quiz"
10. Responda 3 perguntas (máx. 66%)
11. Termine quiz
12. Abra DevTools: JSON.parse(localStorage.studyMetrics)

Verificar:
✅ timeSpent: ~1-2 minutos
✅ score: 66%
✅ doubts: 1 pergunta registrada
✅ errors: 1 erro
✅ sessions: 1 sessão
```

### Teste 2: Template Adaptatívidade (10 min)

```javascript
// DevTools Console:

// Simular score baixo:
let metrics = JSON.parse(localStorage.studyMetrics);
metrics.topics['Limites'].score = 30;
localStorage.studyMetrics = JSON.stringify(metrics);

// Abrir Chat → Vê template "struggling"

// Simular score alto:
metrics.topics['Limites'].score = 85;
localStorage.studyMetrics = JSON.stringify(metrics);

// Abrir Chat → Vê template "advancing"

// Verificar: As recomendações mudam de acordo?
```

### Teste 3: Multi-tópico (15 min)

```
Estude 3 tópicos diferentes:
1. Limites (35%)
2. Derivadas (82%)
3. Integrais (50%)

DevTools: getProblemAreas() deve retornar Limites
Dashboard deve mostrar progresso geral
Chat de cada tópico deve ser diferente
```

---

## 🐛 Troubleshooting

### ❌ localStorage não persiste

```javascript
// Verificar:
1. localStorage está habilitado?
   localStorage.setItem('test', '1');
   localStorage.getItem('test');  // deve retornar '1'

2. Tamanho limite?
   // localStorage tem limite ~5-10MB
   // Nossos dados são pequenos, não deve exceder
```

### ❌ Sugestões não aparecem

```javascript
// Verificar:
1. DevTools → Console → erros?
2. ChatGuidorizzi recebe currentTopic?
3. NotebookLM está respondendo?
   // Teste: fazer pergunta simples
4. parseAISuggestions() retorna array?
```

### ❌ Chat demora muito

```javascript
// Esperado: até 120 segundos para MCP queries (Normal)
// Se > 120s: MCP server pode estar down
// Solução: Rodar: npm run bridge
```

---

## 📋 Checklist de Implementação

```
HOJE:
☐ Integrar com Dashboard (startTopicSession)
☐ Integrar com StudyMaterial (endTopicSession)
☐ Integrar com QuizMode (recordQuizResult)
☐ Testar localStorage com DevTools

PRÓXIMA SEMANA:
☐ Criar Analytics.jsx com gráficos
☐ Adicionar alertas de "Tópico em Risco"
☐ Dashboard automático sugerir chat

FUTURO:
☐ TypeScript gradualmente
☐ Testes unitários dos hooks
☐ PWA/Offline mode
☐ Gamificação
```

---

## 🎓 Métricas de Sucesso

Depois de integração completa, monitorar:

```
Antes: Chat genérico
- Taxa de engajamento: X%
- Tempo médio sessão: Y min
- Conclusão de topicos: Z%

Depois: Chat inteligente
- Taxa de engajamento: X% + 30%
- Tempo médio sessão: Y + 20%
- Conclusão de topicos: Z% + 25%
```

---

## 📞 Referências Rápidas

| O Quê | Arquivo | Função |
|-------|---------|--------|
| Rastrear tempo | `useStudyMetrics` | `startTopicSession()` |
| Finalizar sessão | `useStudyMetrics` | `endTopicSession()` |
| Chat inteligente | `useSmartChat` | `queryWithContext()` |
| Gerar sugestões | `useSmartChat` | `generateSuggestions()` |
| Contexto enriquecido | `chatContext.js` | `buildChatContext()` |
| Templates | `promptTemplates.js` | `selectTemplate()` |

Ver também:
- `INTEGRATION_EXAMPLES.js` - Exemplos completos
- `SMART_CHAT_GUIDE.md` - Guia de uso
- `ARCHITECTURE_DIAGRAM.md` - Visão detalhada

---

## 🚀 Quick Win: Dashboard Analytics com 0 integração

Se quiser ver analytics SEM integração com Dashboard/Quiz:

```javascript
// Abra DevTools console e execute:

const metrics = JSON.parse(localStorage.studyMetrics);

// Total de horas estudadas:
const hours = Object.values(metrics.topics)
    .reduce((sum, t) => sum + t.timeSpent, 0) / 60;
console.log('Horas estudadas:', hours.toFixed(1));

// Desempenho médio:
const avg = Object.values(metrics.topics)
    .reduce((sum, t) => sum + (t.score || 0), 0) / 
    Object.keys(metrics.topics).length;
console.log('Desempenho médio:', avg.toFixed(0) + '%');

// Tópico mais estudado:
const topTopic = Object.entries(metrics.topics)
    .sort(([,a], [,b]) => b.timeSpent - a.timeSpent)[0];
console.log('Mais estudado:', topTopic[0], topTopic[1].timeSpent, 'min');

// Tópico com dificuldade:
const hardTopic = Object.entries(metrics.topics)
    .filter(([,t]) => t.score && t.score < 50)[0];
console.log('Difícil:', hardTopic[0], hardTopic[1].score + '%');
```

---

## 🎉 Próximo Marco

**Quando esta integração estiver 100% pronta:**

1. ✅ Dashboard rastreia tempo
2. ✅ StudyMaterial salva sessão
3. ✅ QuizMode registra score
4. ✅ Chat usa contexto
5. ✅ Sugestões aparecem

**Resultado**: Aluno terá **tutor pessoal** que sabe:
- Quanto tempo estudou
- Onde tem dificuldade
- O que estudar depois
- Como o IA pode ajudar

