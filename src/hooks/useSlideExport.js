// hooks/useSlideExport.js
import { useCallback } from 'react';

/**
 * Hook para exportar slides em PDF ou Markdown
 * Usa html2canvas para capturar conteúdo renderizado
 */
export const useSlideExport = () => {
  const exportToPDF = useCallback(async (slideElement, slideTitle) => {
    try {
      // Importar dinamicamente para reduzir bundle inicial
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const canvas = await html2canvas(slideElement, {
        backgroundColor: '#050505',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slideTitle}.pdf`);

      return { success: true, message: 'PDF exportado com sucesso' };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return { success: false, message: `Erro: ${error.message}` };
    }
  }, []);

  const exportAllToPDF = useCallback(async (slides, slideElements, presentationTitle) => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage();

        const element = slideElements[i];
        if (!element) continue;

        const canvas = await html2canvas(element, {
          backgroundColor: '#050505',
          scale: 1.5,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // Mostrar progresso
        console.log(`Processando slide ${i + 1}/${slides.length}`);
      }

      pdf.save(`${presentationTitle}.pdf`);
      return { success: true, message: 'Apresentação exportada com sucesso' };
    } catch (error) {
      console.error('Erro ao exportar apresentação:', error);
      return { success: false, message: `Erro: ${error.message}` };
    }
  }, []);

  const exportToMarkdown = useCallback((slides, annotations) => {
    let markdown = '# Apresentação de Slides\n\n';

    slides.forEach((slide, idx) => {
      markdown += `## Slide ${idx + 1}: ${slide.title}\n\n`;
      markdown += `${slide.content}\n\n`;

      if (annotations[idx]) {
        markdown += `**Anotações Pessoais:**\n${annotations[idx]}\n\n`;
      }

      markdown += '---\n\n';
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slides.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Markdown exportado com sucesso' };
  }, []);

  const exportToJSON = useCallback((slides, annotations, favorites) => {
    const data = {
      exportedAt: new Date().toISOString(),
      slides,
      annotations,
      favorites,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slides-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Dados exportados com sucesso' };
  }, []);

  return {
    exportToPDF,
    exportAllToPDF,
    exportToMarkdown,
    exportToJSON,
  };
};
