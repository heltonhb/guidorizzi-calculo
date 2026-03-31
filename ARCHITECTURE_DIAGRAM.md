# 🏗️ Arquitetura: Chat Inteligente com NotebookLM

## Diagrama do Sistema

```
┌────────────────────────────────────────────────────────────┐
│                    UI LAYER (React)                         │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │  Dashboard.jsx       │      │  StudyMaterial.jsx   │    │
│  │  ───────────────────│      │  ──────────────────  │    │
│  │ startTopicSession() │      │ endTopicSession()    │    │
│  └──────────────────────┘      └──────────────────────┘    │
│             ↓                           ↓                    │
│  ┌──────────────────────────────────────────────────┐      │
│  │              ChatGuidorizzi.jsx                  │      │
│  │  ────────────────────────────────────────────   │      │
│  │  • Input: pergunta do aluno                      │      │
│  │  • Passa: currentTopic                           │      │
│  │  • Mostra: Sugestões laterais                    │      │
│  └──────────────────────────────────────────────────┘      │
│             ↓                                                │
│  ┌──────────────────────────────────────────────────┐      │
│  │       IntelligentSuggestions.jsx                 │      │
│  │  ────────────────────────────────────────────   │      │
│  │  Painel lateral com próximos passos recomendados│      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                   HOOKS & LOGIC LAYER                        │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │         useSmartChat(currentTopic)              │       │
│  │  ──────────────────────────────────────────────│       │
│  │  Função principal que orquestra tudo:          │       │
│  │                                                 │       │
│  │  1. Prepara contexto → buildChatContext()     │       │
│  │  2. Monta contexto → createContextMessage()   │       │
│  │  3. Seleciona template → selectTemplate()     │       │
│  │  4. Enriquece query → buildEnrichedQuery()    │       │
│  │  5. Registra dúvida → recordDoubts()          │       │
│  │  6. Consulta IA → queryNotebook()             │       │
│  │  7. Gera sugestões → generateSuggestions()    │       │
│  │                                                 │       │
│  └─────────────────────────────────────────────────┘       │
│             ↓                ↓                               │
│  ┌──────────────────────────┐  ┌──────────────────────┐    │
│  │  useStudyMetrics()       │  │  localStorage        │    │
│  │  ────────────────────   │  │  ──────────────────  │    │
│  │  • recordDoubts()        │  │  studyMetrics = {    │    │
│  │  • recordQuizResult()    │  │    topics: {},       │    │
│  │  • startTopicSession()   │  │    doubts: [],       │    │
│  │  • endTopicSession()     │  │    sessions: []      │    │
│  │  • getTopicMetrics()     │  │  }                   │    │
│  │  • getProblemAreas()     │  │                      │    │
│  │  • getOverallPerfomance()│  │                      │    │
│  └──────────────────────────┘  └──────────────────────┘    │
│                                                              │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                   SERVICES LAYER                             │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │        chatContext.js                           │       │
│  │  ──────────────────────────────────────────────│       │
│  │  • buildChatContext(metrics, topic)            │       │
│  │    └─ Prepara: score, tempo, erros, dúvidas   │       │
│  │                                                 │       │
│  │  • createContextMessage(context)               │       │
│  │    └─ Formata para incluir no prompt           │       │
│  └─────────────────────────────────────────────────┘       │
│             ↓                                                │
│  ┌─────────────────────────────────────────────────┐       │
│  │       promptTemplates.js                        │       │
│  │  ──────────────────────────────────────────────│       │
│  │  5 Templates dinâmicos:                         │       │
│  │                                                 │       │
│  │  • beginner(topic, relatedTopics)              │       │
│  │    └─ Primeira vez no tópico                   │       │
│  │                                                 │       │
│  │  • struggling(topic, score, errors, doubts)    │       │
│  │    └─ Score < 50% (em dificuldade)             │       │
│  │                                                 │       │
│  │  • advancing(topic, score, nextTopic)          │       │
│  │    └─ Score >= 75% (dominando)                 │       │
│  │                                                 │       │
│  │  • specificQuestion(topic, question, context)  │       │
│  │    └─ Pergunta específica do aluno             │       │
│  │                                                 │       │
│  │  • recommendation(topic, candidates, perf)     │       │
│  │    └─ Qual tópico estudar agora                │       │
│  │                                                 │       │
│  │  selectTemplate(context, question)             │       │
│  │  └─ Escolhe template baseado em score          │       │
│  └─────────────────────────────────────────────────┘       │
│             ↓                                                │
│  ┌─────────────────────────────────────────────────┐       │
│  │         api.js                                  │       │
│  │  ──────────────────────────────────────────────│       │
│  │  • queryNotebook(notebookId, enrichedQuery)    │       │
│  │    └─ Envia prompt enriquecido + contexto      │       │
│  │    └─ Retry automático com backoff             │       │
│  │    └─ Timeout: 120s para queries MCP           │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│              EXTERNAL API LAYER                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │         NotebookLM (MCP Bridge)                 │       │
│  │  ──────────────────────────────────────────────│       │
│  │  • Recebe: prompt template + contexto          │       │
│  │  • Processa com AI (Guidorizzi)                │       │
│  │  • Retorna: resposta contextualizada           │       │
│  └─────────────────────────────────────────────────┘       │
│             ↓                                                │
│  ┌─────────────────────────────────────────────────┐       │
│  │           Response Flow                         │       │
│  │  ──────────────────────────────────────────────│       │
│  │  Response → parseAISuggestions()               │       │
│  │           → setMessages() display              │       │
│  │           → setsuggestions() lateral panel     │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    DISPLAY LAYER                             │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  Chat Message (Desktop Layout):                              │
│  ┌────────────────────────────────────────────┐            │
│  │  Chat Area              │  Suggestions     │            │
│  │  ────────────────────  │  ──────────────  │            │
│  │  [User message]        │  💡 Próximos     │            │
│  │  [Bot response + 🧠]   │  ✅ Pronto para  │            │
│  │  [Suggestions appear]  │     Avançar      │            │
│  │  [Input box]           │  📌 Sugestão 1   │            │
│  │  [Send button]         │  📌 Sugestão 2   │            │
│  │                        │  📌 Sugestão 3   │            │
│  │                        │  [Performance %] │            │
│  └────────────────────────────────────────────┘            │
│                                                              │
│  Mobile Layout:                                              │
│  ┌────────────────────────────────────────┐               │
│  │  [User message]                        │               │
│  │  [Bot response]                        │               │
│  │  [Hide suggestions - swipe left]       │               │
│  │  [Input box]                           │               │
│  └────────────────────────────────────────┘               │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados Completo

```
[Aluno abre Chat]
        ↓
useSmartChat(currentTopic) inicializa
        ↓
Aluno digita: "Como provar limite?"
        ↓
handleSend(textToSend)
        ↓
recordDoubts(topic, question)  ← localStorage atualiza
        ↓
buildChatContext(metrics, topic)
  |- score: 35%
  |- errors: 6
  |- doubts: ["Como provar?"]
        ↓
selectTemplate(context) → retorna "struggling"
        ↓
buildEnrichedQuery() combina:
  |- Template "struggling"
  |- Contexto do aluno
  |- Pergunta original
        ↓
queryWithContext() envia para NotebookLM
        ↓
API com retry + timeout 120s
        ↓
NotebookLM retorna: "Vejo que você tem 35%...
 [conteúdo empático + exemplos] Próximos: [sugestões]"
        ↓
parseAISuggestions() extrai recomendações
        ↓
setSuggestions() atualiza painel lateral
        ↓
Tela mostra:
  ✅ Resposta em chat
  ✅ Badge 🧠 (contexto inteligente)
  ✅ Sugestões no painel lateral
  ✅ Barra de progresso do desempenho
```

---

## 📦 Estrutura de Pastas

```
src/
├── hooks/
│   ├── useStudyMetrics.js        ← Rastreamento
│   ├── useSmartChat.js           ← Orquestrador
│   ├── useSlideState.js          (existente)
│   ├── useSlideAnnotations.js    (existente)
│   └── ...
│
├── services/
│   ├── chatContext.js            ← Contexto
│   ├── promptTemplates.js        ← Templates
│   ├── api.js                    (melhorado)
│   └── ...
│
├── components/
│   ├── ChatGuidorizzi.jsx        ← Refatorado
│   ├── IntelligentSuggestions.jsx ← Novo
│   ├── Dashboard.jsx             (precisa integração)
│   ├── StudyMaterial.jsx         (precisa integração)
│   └── ...
│
└── context/
    └── AppContext.jsx            (existente)
```

---

## 🔗 Conexões Principais

| De | Para | Via |
|-------|------|-----|
| ChatGuidorizzi | useSmartChat | import hook |
| useSmartChat | useStudyMetrics | import hook |
| useSmartChat | chatContext | import service |
| useSmartChat | promptTemplates | import service |
| promptTemplates | queryNotebook | import api |
| IntelligentSuggestions | ChatGuidorizzi | props |
| ChatGuidorizzi | localStorage | useState |

---

## ⚙️ Sequência de Inicialização

```
1. App.jsx renderiza ChatGuidorizzi
   ├─ Passa: currentTopic prop
   └─ Passa: onBack callback

2. ChatGuidorizzi inicializa
   ├─ useState: messages, input, loading
   ├─ useSmartChat(currentTopic)  ← Hooks chain inicia
   │  ├─ useStudyMetrics() ← acessa localStorage
   │  ├─ useMemoization(chatContext)
   │  └─ useCallback(functions)
   └─ useRef: scrollRef

3. useEffect → generateSuggestions()
   ├─ queryNotebook(...) 
   └─ parseAISuggestions() + setState

4. User types → handleSend()
   ├─ recordDoubts() ← localStorage update
   ├─ queryWithContext() ← contexto + template
   ├─ await queryNotebook() ← IA processing
   └─ setState messages ← render

5. UI renders com Markdown + KaTeX
   ├─ ChatGuidorizzi shows mensagens
   └─ IntelligentSuggestions shows panel
```

---

## 🎯 Performance Considerations

```
✅ Lazy loading: Sugestões carregam com delay
✅ Memoization: useMemoization() para computações
✅ useCallback: Handlers não recriam toda render
✅ localStorage: Sync local, sem API call
✅ Retry logic: Timeout 120s + backoff exponencial
✅ No infinite loops: useEffect dependencies corretas
```

---

## 📝 Notas de Implementação

- **Contexto**: Montado apenas quando necessário
- **Templates**: Selecionados dinamicamente por score
- **Sugestões**: Parseadas do response de IA
- **localStorage**: Estrutura simples, sem criptografia
- **Erros circulares**: Sanitizados em sanitizeError()
- **Timeouts**: 120s para queries (MCP é lento)

