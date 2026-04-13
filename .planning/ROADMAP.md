# Roadmap: Guidorizzi Cálculo I

## Overview
Transformar o livro "Um Curso de Cálculo - Vol. 1" de Hamilton Guidorizzi em uma plataforma interativa de apoio aos estudantes, cobrindo 100% do conteúdo através de visualizações, chat inteligente e prática guiada.

## Phases

- [ ] **Phase 1: Estrutura do Índice & Dashboard** - Implementação da navegação híbrida e fundação do app.
- [ ] **Phase 2: Motor de RAG & Chat** - Indexação total do conteúdo do livro e refinamento do assistente.
- [ ] **Phase 3: Limites & Continuidade** - Visualizações Mafs e prática focada no Capítulo 3.
- [ ] **Phase 4: Derivadas & Taxas de Variação** - Visualizações e aplicações dos Capítulos 4 e 5.
- [ ] **Phase 5: Integrais & Áreas** - Somas de Riemann e TFC (Capítulos 6 e 7).
- [ ] **Phase 6: Polimento & Mobile** - Ajustes de UX e auditoria final de cobertura.

## Phase Details

### Phase 1: Estrutura do Índice & Dashboard
**Goal**: Estabelecer a fundação de navegação e a experiência de entrada do aluno.
**Depends on**: Nothing
**Requirements**: REQ-01, REQ-02, REQ-06
**Success Criteria**:
  1. Menu lateral renderiza todos os capítulos do Vol. 1 do Guidorizzi.
  2. Barra de busca retorna resultados relevantes para tópicos do livro.
  3. Dashboard exibe progresso persistido localmente para ao menos um capítulo.
**Plans**: 3 plans

Plans:
- [ ] 01-01: Implementar Menu de Navegação Híbrido (Index + Search).
- [ ] 01-02: Refinar Dashboard Neobrutalista com cards de progresso.
- [ ] 01-03: Configurar persistência de estado para conclusão de tópicos.

### Phase 2: Motor de RAG & Chat
**Goal**: Garantir que o assistente de IA tenha acesso completo à didática do autor.
**Depends on**: Phase 1
**Requirements**: REQ-04, REQ-07, REQ-08
**Success Criteria**:
  1. IA responde citando capítulos e seções específicas do Guidorizzi.
  2. O chat consegue explicar conceitos teóricos usando a terminologia do livro.
**Plans**: 2 plans

### Phase 3: Limites & Continuidade
**Goal**: Tornar o Capítulo 3 (Limites) uma experiência visual e interativa.
**Depends on**: Phase 2
**Requirements**: REQ-03, REQ-05
**Success Criteria**:
  1. Gráfico interativo Mafs demonstra a noção intuitiva de limite.
  2. Aluno consegue arrastar pontos para ver a aproximação de f(x).
**Plans**: 2 plans

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Estrutura Índice | 0/3 | Not started | - |
| 2. RAG & Chat | 0/2 | Not started | - |
| 3. Limites | 0/2 | Not started | - |
| 4. Derivadas | 0/2 | Not started | - |
| 5. Integrais | 0/1 | Not started | - |
| 6. Polimento | 0/1 | Not started | - |
