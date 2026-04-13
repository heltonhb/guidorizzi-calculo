# Requisitos do Projeto — Guidorizzi Cálculo I

Este documento define os objetivos técnicos e funcionais para a entrega da v1 da plataforma.

## 1. Experiência do Usuário (UX/UI)
- **REQ-01: Estética Neobrutalista.** O app deve manter bordas pretas grossas (2-4px), cores primárias de alto contraste sobre fundo escuro e sombras projetadas (offset-shadow).
- **REQ-02: Navegação Híbrida.** O usuário deve poder alternar entre um menu lateral com o índice completo do Guidorizzi e uma barra de busca global.
- **REQ-03: Visualizações Mafs.** Cada conceito visualizado deve ser interativo (permite arrastar pontos ou alterar valores via sliders) e renderizado de forma fluida.

## 2. Conteúdo & Didática
- **REQ-04: Fidelidade ao Livro.** Todas as definições, teoremas e exemplos devem ser referenciados por "Capítulo/Seção" do Vol. 1 do Guidorizzi.
- **REQ-05: Suporte Matemático.** Renderização perfeita de fórmulas complexas usando KaTeX em toda a plataforma (chat, teoria, quizzes).
- **REQ-06: Banco de Questões.** Implementação de um sistema de progresso que rastreia quais capítulos o aluno já praticou e seu desempenho.

## 3. Inteligência Artificial
- **REQ-07: RAG Guidorizzi.** O backend deve utilizar o conteúdo do livro como base de conhecimento (contexto) para responder dúvidas no chat.
- **REQ-08: Explicação Passo-a-Passo.** A IA deve ser capaz de decompor a resolução de um exercício em etapas lógicas menores.

## 4. Requisitos Técnicos
- **REQ-09: Modelo Llama-3.3.** Uso mandatório do Groq SDK (backend) para garantir latência baixa nas respostas.
- **REQ-10: Saneamento de LaTeX.** Pré-processamento de strings LaTeX para evitar quebra de layout em componentes React.

## Exclusões (Out of Scope)
- Suporte para Cálculo II ou III nesta versão.
- Resolução de exercícios manuscritos via câmera (OCR avançado).
- Sistema de turmas ou fórum entre alunos.

---
*Assinado: Antigravity AI — 2026-04-13*
