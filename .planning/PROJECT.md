# Guidorizzi Cálculo I — Projeto de Apoio Acadêmico

## O Que É Este Projeto?
Uma plataforma de aprendizado assistida por IA focada no livro **"Um Curso de Cálculo - Vol. 1" de Hamilton Guidorizzi**. O objetivo é servir como uma ferramenta de apoio completa para estudantes de Cálculo I, transformando conceitos teóricos complexos em experiências visuais interativas e acessíveis.

### Visão & Valores
1.  **Didática Guidorizzi:** O conteúdo e a progressão seguem rigorosamente a lógica do livro-texto referência no Brasil.
2.  **Visualização Primeiro:** Conceitos abstratos (limites, derivadas, integrais) devem ser demonstrados visualmente através de gráficos interativos (Mafs).
3.  **Acessibilidade Cognitiva:** Reduzir a barreira de entrada para o cálculo através de simplificação via chat e quizzes práticos.
4.  **Estética Premium:** Design Neobrutalista impactante que transmite modernidade e autoridade.

## Por Que Este Projeto Existe?
- **Problema:** Muitos estudantes de Cálculo I têm dificuldade em visualizar conceitos abstratos apenas com papel e caneta.
- **Desejo:** Uma ferramenta que permita "brincar" com os gráficos e receber explicações simplificadas do conteúdo do livro 24/7.
- **Público:** Estudantes de engenharia, matemática e ciências exatas que utilizam o livro do Guidorizzi.

## Requisitos Core (v1)
### Funcionalidades
- [ ] **Navegação Híbrida:** Índice completo por capítulos e busca inteligente por tópicos.
- [ ] **Gráficos Interativos:** Componentes Mafs configurados para demonstrar visualmente todos os principais teoremas do livro.
- [ ] **Chat Guidorizzi:** Assistente RAG treinado no conteúdo do livro e metodologia do autor.
- [ ] **Modo Prática:** Quizzes e Flashcards gerados dinamicamente para cada capítulo.
- [ ] **Dashboard Premium:** Interface Neobrutalista com acompanhamento de progresso e acesso rápido a tópicos.

## Decisões Principais
| Decisão | Racional | Estado |
|---------|----------|--------|
| **Neobrutalismo** | Diferenciação estética e foco em alto contraste para legibilidade técnica. | Implementada |
| **Padrão Bride (Express)** | Proteção de chaves de API e processamento centralizado para os agentes. | Implementada |
| **Mafs vs Canvas/SVG** | Mafs oferece uma API declarativa superior para gráficos matemáticos complexos. | Em Uso |
| **Navegação Híbrida** | Equilíbrio entre a estrutura linear do livro e a agilidade da busca por temas. | Pendente |

## Como Sabemos que Terminou?
- [ ] O app cobre 100% dos capítulos principais do Guidorizzi Vol. 1.
- [ ] Cada capítulo possui ao menos uma visualização interativa relevante.
- [ ] O chat responde com precisão baseada estritamente na didática do autor.

---
*Last updated: 2026-04-13 after initialization*
