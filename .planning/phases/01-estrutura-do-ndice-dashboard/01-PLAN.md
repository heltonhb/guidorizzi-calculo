# Plan: Phase 1 — Estrutura do Índice & Dashboard 🧭

Este plano detalha a implementação da navegação híbrida e a evolução do Dashboard para suportar o progresso em nível de seção, conforme definido na discussão da Phase 1.

## User Review Required

> [!IMPORTANT]
> O progresso será simulado (mock) nesta fase para agilizar a entrega da interface. A persistência real será tratada na Phase 2.

## Proposed Changes

### 1. Data & Context Layer
#### [MODIFY] [AppContext.tsx](file:///home/helton/disciplinas/calculo/app-gemini/src/context/AppContext.tsx)
- Adicionar estado `isSidebarOpen` e `toggleSidebar`.
- Adicionar `userProgress` (mock) para rastreamento a nível de seção.

### 2. Navigation Components
#### [NEW] [NavigationSidebar.tsx](file:///home/helton/disciplinas/calculo/app-gemini/src/components/NavigationSidebar.tsx)
- Implementar componente de menu lateral Neobrutalista.
- Hierarquia baseada no Guidorizzi: Capítulos expansíveis -> Seções.
- Integração com `navigateTo` para troca de tópicos.

#### [MODIFY] [App.tsx](file:///home/helton/disciplinas/calculo/app-gemini/src/App.tsx)
- Envolver a aplicação com o `NavigationSidebar`.
- Adicionar botão flutuante Toggle no cabeçalho.

### 3. Deep Search Logic
#### [NEW] [searchUtils.ts](file:///home/helton/disciplinas/calculo/app-gemini/src/utils/searchUtils.ts)
- Utilitário para busca profunda em `content.json` (títulos, material, exercícios).

#### [MODIFY] [Dashboard.tsx](file:///home/helton/disciplinas/calculo/app-gemini/src/components/Dashboard.tsx)
- Substituir busca simples pela `deepSearch`.
- Adicionar área de "Progresso Recente" com cards de seção.

## Verification Plan

### Automated Tests
- `npm test`: Verificar se os novos componentes renderizam sem erros.
- Vitest: Testar o utilitário de busca profunda com mocks de `content.json`.

### Manual Verification
- Abrir e fechar o sidebar via botão toggle.
- Pesquisar por uma palavra-chave (ex: "Riemann") e verificar se os resultados aparecem.
- Navegar para um novo capítulo através do sidebar.
