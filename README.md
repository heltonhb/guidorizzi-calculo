# Guidorizzi — Cálculo I

Uma plataforma web interativa e inteligente para aprendizado de Cálculo I baseada no livro de Hamilton Guidorizzi, com suporte a chat com IA, gráficos interativos, quizzes, flashcards e apresentações de slides.

## 🚀 Quickstart

### Pré-requisitos
- Node.js ≥ 18
- npm ou yarn

### Setup Inicial

```bash
# 1. Clone o repositório
git clone <repo-url>
cd app-gemini

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env e adicione suas chaves de API:
# - VITE_GROQ_API_KEY (obtenha em https://console.groq.com)
# - VITE_GOOGLE_API_KEY (obtenha em https://ai.google.dev)

# 4. Inicie servidor de desenvolvimento
npm run dev          # Cliente Vite (localhost:5173)
npm run bridge       # Backend Express (localhost:3001)

# Ou ambos simultaneamente:
npm run dev:all
```

### Visualizar em Produção
```bash
npm run build        # Build otimizado
npm run preview      # Preview local do build
```

---

## 📁 Estrutura do Projeto

```
app-gemini/
├── src/
│   ├── components/          # Componentes React (Chat, Quiz, Slides, etc)
│   ├── context/             # React Context (AppContext, ThemeContext)
│   ├── hooks/               # Custom hooks (useSmartChat, useLocalStorage, etc)
│   ├── services/            # Lógica de negócio (API, prompts, validação)
│   ├── utils/               # Utilitários (preprocessador math, JSON parser)
│   ├── lib/                 # Bibliotecas auxiliares
│   ├── __tests__/           # Testes unitários
│   ├── App.tsx              # Componente raiz
│   └── main.tsx             # Entry point
├── server/                  # Backend Express
│   ├── routes/              # Endpoints da API
│   ├── services/            # Serviços backend (RAG, Groq integration)
│   └── middleware/          # Middlewares (auth, rate-limit, CORS)
├── public/                  # Assets estáticos (PWA icons, etc)
├── vite.config.ts           # Configuração Vite + PWA
├── vitest.config.ts         # Configuração testes
├── tsconfig.json            # Configuração TypeScript
├── eslint.config.js         # Configuração ESLint
├── .env.example             # Template de variáveis de ambiente
└── package.json             # Dependências e scripts
```

---

## 🛠️ Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev              # Dev server (Vite)
npm run bridge          # Backend Express
npm run dev:all         # Ambos simultaneamente (recomendado)
```

### Build
```bash
npm run build           # Produção optimizado
npm run preview         # Preview do build
```

### Qualidade de Código
```bash
npm run lint            # Lint com ESLint
npm run lint --fix      # Fix automático
```

### Testes
```bash
npm run test            # Watch mode
npm run test:run        # Executar uma vez
npm run test:coverage   # Com coverage report
```

### Específicos
```bash
vitest run src/__tests__/mathPreprocessor.test.js        # Um arquivo
vitest run --grep "mathPreprocessor"                     # Pattern matching
```

---

## 🧠 Funcionalidades Principais

### 1. **Chat Inteligente com IA**
- Perguntas sobre conceitos de Cálculo I
- Validação contra base de conteúdo local
- Anti-alucinação com constraints na prompt
- Histórico persistente

### 2. **Gráficos Interativos**
- Visualização de funções em tempo real
- Usando biblioteca `mafs`
- Manipulação interativa de parâmetros

### 3. **Quiz e Validação**
- Respostas estruturadas
- Validação cross-referencing
- Feedback inteligente

### 4. **Flashcards**
- Repetição espaçada
- Rastreamento de performance
- Gamificação

### 5. **Apresentação de Slides**
- Apresentação estruturada de tópicos
- Anotações e export (PDF/PNG)
- Modo apresentador

---

## 🔐 Variáveis de Ambiente

Crie `.env` baseado em `.env.example`:

```env
# Backend
VITE_GROQ_API_KEY=gsk_...           # Obtenha em https://console.groq.com
VITE_GOOGLE_API_KEY=AIzaSy...       # Obtenha em https://ai.google.dev
NODE_ENV=development                # development | production
LOG_LEVEL=info                       # debug | info | warn | error

# Frontend
VITE_API_URL=http://localhost:3001  # URL do backend
```

---

## 🏗️ Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| **Build** | Vite 7, SWC |
| **Runtime** | Node.js ≥18, ES Modules |
| **Frontend** | React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Matemática** | KaTeX, remark-math, rehype-katex |
| **Backend** | Express.js |
| **AI** | Groq SDK, Google GenAI |
| **State** | React Context, React Query |
| **Testing** | Vitest, jsdom, Testing Library |
| **PWA** | vite-plugin-pwa (offline-capable) |

---

## 📋 Código & Convenções

### TypeScript/JavaScript

- **Extensões**: `.tsx` para componentes React, `.ts` para lógica pura
- **Indentação**: 2 espaços
- **Semicolons**: Obrigatórios
- **Quotes**: Double quotes (`"`)
- **Line width**: ~100 caracteres (soft limit)

### Imports

```typescript
// Order: 1) External libs, 2) Services, 3) Components, 4) Utils
import React from 'react';
import { AppContext } from '../context/AppContext';
import ChatGuidorizzi from '../components/ChatGuidorizzi';
import { mathPreprocessor } from '../utils/mathPreprocessor';
```

### Componentes React

```typescript
// Use functional components + hooks
interface ChatProps {
  initialTopic: string;
  onClose?: () => void;
}

export default function Chat({ initialTopic, onClose }: ChatProps): JSX.Element {
  const [messages, setMessages] = React.useState([]);
  
  return <div>{/* JSX */}</div>;
}
```

### Custom Hooks

```typescript
// Arquivo: src/hooks/useSmartChat.ts
export default function useSmartChat(config: ChatConfig) {
  const [state, setState] = React.useState(initialState);
  
  return { state, sendMessage, reset };
}
```

---

## 🧪 Testes

### Estrutura

```
src/__tests__/
├── components/           # (TODO) Testes de componentes
├── hooks/                # (TODO) Testes de hooks
├── services/             # (TODO) Testes de serviços
├── utils/
│   ├── mathPreprocessor.test.js
│   ├── answerValidator.test.js
│   └── jsonParser.test.js
└── ThemeContext.test.js
```

### Escrevendo Testes

```typescript
// src/__tests__/components/ChatGuidorizzi.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vitest } from 'vitest';
import ChatGuidorizzi from '../../components/ChatGuidorizzi';

describe('ChatGuidorizzi', () => {
  it('deve enviar mensagem', async () => {
    render(<ChatGuidorizzi />);
    
    const input = screen.getByPlaceholderText('Digite...');
    fireEvent.change(input, { target: { value: 'O que é limite?' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/resposta/i)).toBeInTheDocument();
    });
  });
});
```

### Executar Testes

```bash
npm run test              # Watch mode (desenvolvimento)
npm run test:run          # Uma execução
npm run test:coverage     # Com coverage report (mín 60%)
```

---

## 🔍 Qualidade de Código

### Linting

```bash
npm run lint              # Verificar erros
npm run lint --fix        # Fix automático (ESLint)
```

ESLint é configurado para:
- Recomendações JS (js.recommended)
- React Hooks rules
- React Refresh
- No unused vars (exceto `^[A-Z_]`)

### Coverage Mínimo

O projeto requer **mínimo 60%** de cobertura:
- Lines: 60%
- Functions: 60%
- Branches: 50%
- Statements: 60%

Build falha se não atingir threshold. Aumento gradual planejado.

---

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# 1. Connect repo no https://vercel.com
# 2. Add env vars (VITE_GROQ_API_KEY, VITE_GOOGLE_API_KEY)
# 3. Deploy automático em cada push
```

### Docker

```bash
# Build
docker build -t guidorizzi-app .

# Run
docker run -e VITE_GROQ_API_KEY=... -p 3000:3000 guidorizzi-app
```

### PM2 (Production Linux)

```bash
npm run build
pm2 start server.js --name "guidorizzi"
pm2 save
```

---

## 🐛 Troubleshooting

### Erro: "VITE_GROQ_API_KEY não definido"
```bash
# Solução: Copie .env.example para .env e adicione chaves
cp .env.example .env
vi .env
```

### Erro: "Port 3001 already in use"
```bash
# Solução: Libere a porta ou use outra
lsof -ti:3001 | xargs kill -9
# Ou configure: export API_PORT=3002
```

### Chat não responde
```bash
# Verificar logs do backend:
npm run bridge  # olhar console para erros de API
```

---

## 📚 Documentação Adicional

- [AGENTS.md](./AGENTS.md) — Diretrizes para contribuidores (AI agents)
- [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) — Diagrama da arquitetura
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) — Integração com AI providers

---

## 🤝 Contribuindo

### Setup de Desenvolvimento

1. Fork e clone
2. `npm install`
3. `cp .env.example .env` + configure chaves
4. `npm run dev:all` para rodar dev

### Antes de Submeter PR

```bash
# 1. Faça lint
npm run lint --fix

# 2. Escreva/atualize testes
npm run test

# 3. Verifique coverage
npm run test:coverage   # deve estar ≥ 60%

# 4. Build de produção
npm run build
```

### Convenções de Commit

```
feat: Add chat message caching
fix: Resolve KaTeX rendering on mobile
test: Add ChatGuidorizzi component tests
docs: Update API documentation
refactor: Extract validation logic to service
style: Fix indentation (eslint --fix)
chore: Update dependencies
```

---

## 📄 Licença

[Definir licença - MIT, Apache 2.0, etc]

---

## 📞 Suporte

- **Issues**: [GitHub Issues](./issues)
- **Discussions**: [GitHub Discussions](./discussions)
- **Email**: [contato@exemplo.com]

---

## 🎯 Roadmap

- [ ] Testes de componentes (60% cobertura até mês 2)
- [ ] Storybook para component catalog
- [ ] Observabilidade (logging, metrics)
- [ ] Performance optimization (ImageOptim, Bundle analysis)
- [ ] Mobile app (React Native / Flutter)
- [ ] Análise de performance do aluno (dashboard analytics)

---

**Última atualização**: 6 de abril de 2026  
**Versão**: 1.0.0
