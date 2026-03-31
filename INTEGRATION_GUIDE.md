// INTEGRATION_GUIDE.md

# 🔗 Guia de Integração - Slides Interativos

Este guia mostra como integrar todos os novos componentes e hooks no seu `PresentationMode.jsx`.

## ✅ O QUE FOI CRIADO

### Hooks (em `src/hooks/`)
- ✅ `useSlideState.js` - Gerenciamento centralizado de estado de slides
- ✅ `useSlideAnnotations.js` - Persistência de anotações por slide
- ✅ `useSlideExport.js` - Exportação em PDF, Markdown, JSON

### Componentes (em `src/components/`)
- ✅ `SlideAnnotations.jsx` - Editor de anotações com preview
- ✅ `SlideSidebar.jsx` - Thumbnails de slides com favoritos
- ✅ `SlideControls.jsx` - Play/pause, velocidade, favorito, export
- ✅ `DrawingCanvas.jsx` - Canvas para markup/desenho nos slides
- ✅ `ExportDialog.jsx` - Dialog de seleção de formato de exportação

---

## 📝 PASSO 1: INSTALAR DEPENDÊNCIAS

```bash
npm install --save jspdf html2canvas
```

---

## 🎨 PASSO 2: REFATORAR PresentationMode.jsx

Substitua o conteúdo do seu `src/components/PresentationMode.jsx` com a versão refatorada abaixo:

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { queryNotebook, fetchStudioArtifacts, createStudioSlides } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// NOVOS IMPORTS
import { useSlideState } from '../hooks/useSlideState';
import { useSlideAnnotations } from '../hooks/useSlideAnnotations';
import { useSlideExport } from '../hooks/useSlideExport';
import InteractiveGraph from './InteractiveGraph';
import SlideAnnotations from './SlideAnnotations';
import SlideSidebar from './SlideSidebar';
import SlideControls from './SlideControls';
import DrawingCanvas from './DrawingCanvas';
import ExportDialog from './ExportDialog';

const GUIDORIZZI_NOTEBOOK_ID = 'b7988097-f2a3-4a68-a71d-b2d424d96b9a';

const PresentationMode = ({ topic, onBack }) => {
  // Estado de apresentação
  const slideState = useSlideState(topic, []);
  
  // Anotações do slide atual
  const annotations = useSlideAnnotations(
    topic, 
    slideState.currentSlide
  );

  // Exportação
  const { exportToPDF, exportAllToPDF, exportToMarkdown, exportToJSON } = 
    useSlideExport();

  // UI State
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('dynamic');
  const [studioArtifacts, setStudioArtifacts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studioContentLoading, setStudioContentLoading] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const slideRefMap = useRef({});

  // Carregar slides iniciais
  useEffect(() => {
    if (topic && mode === 'dynamic' && slideState.slides.length === 0) {
      fetchInitialSlides();
    }
  }, [topic, mode]);

  const fetchInitialSlides = async () => {
    setLoading(true);
    try {
      const prompt = `Gere 5 slides detalhados para uma aula sobre ${topic} baseada no Guidorizzi. 
      Cada slide deve ter um título e uma explicação didática clara.
      Use exatamente o formato: # Slide 1: Título... # Slide 2: Título...`;
      
      const response = await queryNotebook(GUIDORIZZI_NOTEBOOK_ID, prompt);
      parseAndSetSlides(response.answer || "");
    } catch (error) {
      console.error('Erro ao buscar slides:', error);
      alert('Erro ao buscar slides. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const parseAndSetSlides = (text) => {
    const slideBlocks = text.split('# Slide').filter(s => s.trim().length > 10);
    const parsed = slideBlocks.map((block, idx) => {
      const lines = block.split('\n');
      const title = lines[0].replace(/^\d+:\s*/, '').trim();
      const content = lines.slice(1).join('\n').trim();
      return { 
        id: idx,
        title: title || 'Tópico de Cálculo', 
        content: content || 'Conteúdo em processamento...' 
      };
    });
    slideState.setSlides(
      parsed.length > 0 
        ? parsed 
        : [{ id: 0, title: "Fim", content: "Todos os tópicos foram cobertos." }]
    );
  };

  const handleViewStudioArtifact = async (artifact) => {
    setStudioContentLoading(true);
    try {
      const prompt = `Extraia o conteúdo principal deste artefato do Studio: ${artifact.title}. 
      Transforme em 5 slides verticais no formato: # Slide 1: Título... # Slide 2: Título...`;
      
      const response = await queryNotebook(GUIDORIZZI_NOTEBOOK_ID, prompt);
      parseAndSetSlides(response.answer || "");
      slideState.goToSlide(0);
      setMode('dynamic');
      setIsTheaterMode(true);
    } catch (error) {
      console.error('Erro ao processar artefato:', error);
      alert('Falha ao processar artefato. Tente novamente.');
    } finally {
      setStudioContentLoading(false);
    }
  };

  const loadStudio = async () => {
    setMode('studio');
    setLoading(true);
    try {
      const data = await fetchStudioArtifacts();
      setStudioArtifacts(data.artifacts || []);
    } catch (error) {
      console.error('Erro ao carregar studio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudio = async () => {
    setIsGenerating(true);
    try {
      await createStudioSlides(topic);
      alert('Solicitação enviada ao Studio!');
      loadStudio();
    } catch (error) {
      alert(`Erro: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Exportar com base na seleção do dialog
  const handleExport = async (options) => {
    setIsExporting(true);
    try {
      // Coletar anotações associadas
      const allAnnotations = {};
      if (options.includeAnnotations) {
        slideState.slides.forEach((_, idx) => {
          const key = `annotations_${topic}_slide_${idx}`;
          const saved = localStorage.getItem(key);
          if (saved) allAnnotations[idx] = saved;
        });
      }

      if (options.format === 'pdf') {
        if (options.exportAll) {
          // Exportar todos os slides em um PDF
          const slideElements = slideState.slides.map((_, idx) => 
            slideRefMap.current[idx]
          );
          await exportAllToPDF(slideState.slides, slideElements, topic);
        } else {
          // Exportar slide atual
          const slideRef = slideRefMap.current[slideState.currentSlide];
          if (slideRef) {
            await exportToPDF(slideRef, `${topic}-slide-${slideState.currentSlide + 1}`);
          }
        }
      } else if (options.format === 'markdown') {
        exportToMarkdown(slideState.slides, allAnnotations);
      } else if (options.format === 'json') {
        exportToJSON(slideState.slides, allAnnotations, slideState.favorites);
      }

      setShowExportDialog(false);
      alert('Exportação concluída com sucesso!');
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert(`Erro ao exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading && slideState.slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <span className="text-zinc-600 font-black uppercase tracking-widest text-xs">
          Sincronizando IA...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col h-[calc(100vh-4rem)] transition-all duration-700",
        isTheaterMode ? "fixed inset-0 z-[100] bg-black h-screen p-0" : "overflow-hidden"
      )}
    >
      {/* HEADER (esconde em modo teatro) */}
      {!isTheaterMode && (
        <header className="flex items-center justify-between mb-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-500" />
          </motion.button>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setMode('dynamic')}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                mode === 'dynamic' ? "bg-purple-500 text-white" : "text-zinc-500"
              )}
            >
              Exploração
            </button>
            <button
              onClick={loadStudio}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                mode === 'studio' ? "bg-emerald-500 text-white" : "text-zinc-500"
              )}
            >
              Studio
            </button>
          </div>

          <div className="w-12" />
        </header>
      )}

      {/* MODO DINÂMICO (com slides) */}
      {mode === 'dynamic' && slideState.slides.length > 0 && (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* SIDEBAR COM THUMBNAILS */}
          {!isTheaterMode && (
            <SlideSidebar
              slides={slideState.slides}
              currentSlide={slideState.currentSlide}
              onSelectSlide={slideState.goToSlide}
              favorites={slideState.favorites}
              onToggleFavorite={slideState.toggleFavorite}
            />
          )}

          {/* CONTEÚDO CENTRAL */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={slideState.currentSlide}
                initial={{ opacity: 0, x: 200 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -200 }}
                ref={el => slideRefMap.current[slideState.currentSlide] = el}
                className={cn(
                  "flex-1 rounded-[60px] bg-white/5 border border-white/10 backdrop-blur-3xl flex flex-col relative overflow-hidden group",
                  isTheaterMode ? "max-w-6xl mx-auto w-full p-16" : "p-10"
                )}
              >
                {/* Slide Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 min-h-0 items-center">
                  {/* Texto e Título */}
                  <div className="space-y-6 overflow-y-auto pr-4">
                    <h2 className="text-4xl font-black text-white leading-tight">
                      {slideState.slides[slideState.currentSlide]?.title}
                    </h2>
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                      >
                        {slideState.slides[slideState.currentSlide]?.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Gráfico Interativo */}
                  <div className="h-full min-h-[300px] flex items-center justify-center">
                    <InteractiveGraph
                      equation={slideState.currentSlide % 2 === 0 ? "x^2" : "sin(x)"}
                      range={[-5, 5]}
                    />
                  </div>
                </div>

                {/* Navegação de Slides */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 -right-4 flex justify-between pointer-events-none px-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={slideState.prevSlide}
                    className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-white/10"
                  >
                    ◀
                  </button>
                  <button
                    onClick={slideState.nextSlide}
                    className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-white/10"
                  >
                    ▶
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ANOTAÇÕES */}
            {!isTheaterMode && (
              <div className="h-48 flex-shrink-0">
                <SlideAnnotations
                  annotations={annotations.annotations}
                  onUpdate={annotations.updateAnnotations}
                  onClear={annotations.clearAnnotations}
                  hasChanges={annotations.hasChanges}
                  lastSaved={annotations.lastSaved}
                />
              </div>
            )}

            {/* CONTROLES */}
            {!isTheaterMode && (
              <SlideControls
                autoPlay={slideState.autoPlay}
                onToggleAutoPlay={() => slideState.setAutoPlay(!slideState.autoPlay)}
                onNextSlide={slideState.nextSlide}
                onPrevSlide={slideState.prevSlide}
                isFavorite={slideState.favorites.includes(slideState.currentSlide)}
                onToggleFavorite={() => 
                  slideState.toggleFavorite(slideState.currentSlide)
                }
                playbackSpeed={slideState.playbackSpeed}
                onSpeedChange={slideState.setPlaybackSpeed}
                onExport={() => setShowExportDialog(true)}
                onTheaterMode={() => setIsTheaterMode(true)}
                currentSlide={slideState.currentSlide + 1}
                totalSlides={slideState.slides.length}
              />
            )}
          </div>
        </div>
      )}

      {/* CANVAS DE DESENHO */}
      <DrawingCanvas 
        visible={showDrawing}
        onClose={() => setShowDrawing(false)}
      />

      {/* DIALOG DE EXPORTAÇÃO */}
      <ExportDialog
        visible={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        isLoading={isExporting}
      />
    </motion.div>
  );
};

export default PresentationMode;
```

---

## 🚀 PASSO 3: TESTAR

1. **Abra um tópico em modo de apresentação**
2. **Teste cada funcionalidade:**
   - ✅ Escreva anotações e veja que são persistidas ao trocar de slide
   - ✅ Clique em ★ nos thumbnails para marcar favoritos
   - ✅ Clique Play → velocidade aumenta/diminui
   - ✅ Clique em ⬇️ → seleção de formato de exportação
   - ✅ Clique 🖍️ → entra em modo de desenho

---

## 📦 ESTRUTURA FINAL

```
src/
├── components/
│   ├── PresentationMode.jsx (REFATORADO)
│   ├── SlideAnnotations.jsx (NOVO)
│   ├── SlideSidebar.jsx (NOVO)
│   ├── SlideControls.jsx (NOVO)
│   ├── DrawingCanvas.jsx (NOVO)
│   ├── ExportDialog.jsx (NOVO)
│   └── ...outros
├── hooks/
│   ├── useSlideState.js (NOVO)
│   ├── useSlideAnnotations.js (NOVO)
│   ├── useSlideExport.js (NOVO)
│   └── ...outros
├── services/
│   ├── api.js
│   └── ...
└── ...
```

---

## 🎯 FUNCIONALIDADES HABILITADAS

✅ **Anotações persistentes** - Salvas em localStorage
✅ **Favoritos** - Marcar slides importantes
✅ **Auto-play** - Reprodução automática com velocidade configurável
✅ **Exportação** - PDF, Markdown, JSON
✅ **Markup** - Desenho e marcação nos slides
✅ **Sidebar** - Navegação visual rápida
✅ **Responsividade** - Mobile e desktop otimizados

---

## 💡 PRÓXIMOS PASSOS (Futuro)

- [ ] Quiz integrado aos slides
- [ ] Sync das anotações com backend
- [ ] Modo speaker notes
- [ ] Timeline visual
- [ ] Relatório de aprendizado
- [ ] Colaboração em tempo real

---

## 🐛 TROUBLESHOOTING

**P: "Anotações não estão sendo salvas"**
R: Verifique se o localStorage está habilitado no seu navegador (`F12 → Application → Storage`)

**P: "Exportação para PDF falha"**
R: Instale `npm install jspdf html2canvas` e recarregue a página

**P: "Canvas de desenho não funciona"**
R: Verifique se o navegador suporta HTML5 Canvas (todos os modernos suportam)

---

## 📚 RESOURCES

- [Canvas API](https://developer.mozilla.org/pt-BR/docs/Web/API/Canvas_API)
- [localStorage](https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage)
- [jsPDF Docs](https://github.com/parallax/jsPDF)
- [html2canvas](https://html2canvas.hertzen.com/)
