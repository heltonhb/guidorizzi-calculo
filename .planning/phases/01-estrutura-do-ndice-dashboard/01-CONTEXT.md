# Context: Phase 1 — Estrutura do Índice & Dashboard

Este documento registra as decisões tomadas durante a discussão da Phase 1 para guiar a pesquisa e o planejamento.

## Decisões de Implementação

### 1. Sistema de Navegação
- **Formato:** Menu Lateral Toggle (Drawer). Foco total no modo de leitura/visualização, com o índice acessível sob demanda.
- **Estrutura:** Deve refletir a hierarquia exata do Guidorizzi Vol. 1 (Capítulos > Seções).

### 2. Dashboard & Progresso
- **Granularidade:** Rastreamento a nível de **Seção**. O usuário verá seu progresso detalhado dentro de cada capítulo no Dashboard.
- **Persistência:** **Mock State**. Para esta versão inicial, o progresso será mantido apenas em memória/estado React (reseta ao atualizar).

### 3. Busca Inteligente
- **Escopo:** Busca por **Palavra-Chave (Deep Search)**. A barra de busca no Dashboard deve ser capaz de localizar tópicos específicos dentro do conteúdo das seções, não apenas títulos de capítulos.

### 4. Estética
- **Estilo:** Neobrutalista (conforme decidido no PROJECT.md). Uso de bordas grossas e sombras exageradas nos componentes de navegação e busca.

## Referências Canônicas
- Livro: "Um Curso de Cálculo - Vol. 1" (Hamilton Guidorizzi).
- UI Framework: Tailwind CSS v4 + Framer Motion (para animação do Toggle).
- Graph Engine: Mafs (para futuras integrações).

## Itens Diferidos
- Persistência com LocalStorage ou DB (adiado para Milestone 2).
- Sistema de favoritos (adiado para Milestone 3).

---
*Capture Date: 2026-04-13*
