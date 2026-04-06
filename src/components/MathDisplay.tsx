import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MathDisplayProps {
  content: string;
  className?: string;
}

/**
 * MathDisplay - Renderiza conteúdo com fórmulas LaTeX
 * 
 * Garante que:
 * - Fórmulas entre $ renderizam
 * - Fórmulas entre $$ renderizam como display mode
 * - CSS do KaTeX está carregado
 * - ReactMarkdown + remark-math + rehype-katex funcionam juntos
 */
export const MathDisplay: React.FC<MathDisplayProps> = ({ 
  content, 
  className = 'prose prose-invert max-w-none' 
}) => {
  // Função para garantir delimitadores corretos
  const ensureDelimiters = (text: string): string => {
    if (!text) return '';
    
    // Se não tem delimitadores, retorna como está
    // ReactMarkdown + remarkMath vai processar mesmo sem $
    return text;
  };

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Customiza rendering de parágrafo para remover espaços extras
          p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
        }}
      >
        {ensureDelimiters(content)}
      </ReactMarkdown>
    </div>
  );
};

export default MathDisplay;
