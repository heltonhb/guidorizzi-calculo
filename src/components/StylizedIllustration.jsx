import React from 'react';
import { motion } from 'framer-motion';

/**
 * Componente abstrato Neo-Brutalista para ilustrações matemáticas vitais.
 * Exibe visuais geométricos afiados dependendo do contexto matemático repassado.
 */
const StylizedIllustration = ({ concept = 'geral' }) => {
    const type = concept.toLowerCase().trim();

    // Contêiner padrão Neo-Brutalista com clip agressivo e alto contraste
    const containerClasses = "relative w-full h-48 md:h-64 bg-zinc-950 border-4 border-white/20 shadow-[8px_8px_0_rgba(255,255,255,0.1)] overflow-hidden my-8 flex items-center justify-center hover:border-white/50 transition-colors";

    // 1. LIMITE (Tensão assimétrica - Chegando perto, nunca tocando)
    if (type.includes('limit')) {
        return (
            <div className={containerClasses} title={`Ilustração: ${concept}`}>
                {/* Assíntota rigorosa */}
                <div className="absolute right-[20%] top-0 bottom-0 w-2 bg-[#ff5500] border-l-2 border-white/50" />

                {/* Curva da Função (Tensão Dinâmica) */}
                <motion.div
                    initial={{ x: "-100%", y: "150%", rotate: -15 }}
                    animate={{ x: "65%", y: "-20%", rotate: -15 }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "backIn" }}
                    className="absolute w-40 h-3 bg-[#00f0ff] border-2 border-zinc-950 shadow-[4px_4px_0_#00f0ff]"
                />

                {/* Label de contexto */}
                <div className="absolute left-4 top-4 z-20 px-3 py-1 bg-zinc-900 border-2 border-[#00f0ff] text-[#00f0ff] text-[10px] font-black uppercase tracking-[0.3em] shadow-[4px_4px_0_theme(colors.zinc.950)]">
                    L I M I T E
                </div>

                {/* Grid Quebrado de fundo */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.05)_2px,transparent_2px)] bg-[size:32px_32px] pointer-events-none z-0 mix-blend-overlay"></div>
            </div>
        );
    }

    // 2. DERIVADA (Plano tangente violento cavalgando a curva)
    if (type.includes('deriv') || type.includes('taxa')) {
        return (
            <div className={containerClasses} title={`Ilustração: ${concept}`}>
                {/* Curva irregular fixa */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
                    <path d="M -50,150 Q 150,20 300,180 T 700,50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeDasharray="12 12" />
                </svg>

                {/* Reta Tangente animada (Angulação forçada) */}
                <motion.div
                    animate={{ x: [-80, 200, 400], y: [-50, -20, -80], rotate: [-45, 10, -30] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", repeatType: "reverse" }}
                    className="absolute w-48 h-[6px] bg-[#ccff00] border-2 border-zinc-950 shadow-[4px_4px_0_#ccff00] z-20 origin-center"
                />

                {/* Pontos de foco / Ruído */}
                <motion.div
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rotate-45 mix-blend-difference"
                />

                <div className="absolute left-4 top-4 z-30 px-3 py-1 bg-zinc-900 border-2 border-[#ccff00] text-[#ccff00] text-[10px] font-black uppercase tracking-[0.3em] shadow-[4px_4px_0_theme(colors.zinc.950)]">
                    D E R I V A D A
                </div>
            </div>
        );
    }

    // 3. INTEGRAL (Acúmulo agressivo de blocos brutais - Riemann)
    if (type.includes('integral') || type.includes('integra') || type.includes('área') || type.includes('area')) {
        return (
            <div className={containerClasses} title={`Ilustração: ${concept}`}>
                {/* Linha limitadora de cima da integral */}
                <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" preserveAspectRatio="none">
                    <path d="M 0,80 C 150,40 250,140 400,20 L 400,-10 L 0,-10 Z" fill="none" stroke="#00f0ff" strokeWidth="6" />
                </svg>

                {/* Somatórias (Blocos subindo) */}
                <div className="absolute bottom-0 left-0 w-[120%] -ml-10 h-[220px] flex items-end gap-[2px] px-8 z-10 opacity-90">
                    {[140, 160, 130, 90, 70, 80, 120, 180, 200, 170, 120].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 10 }}
                            animate={{ height: h }}
                            transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse', delay: i * 0.08, ease: "anticipate" }}
                            className="flex-1 bg-[#ff5500] border-2 border-zinc-950 shadow-[2px_0_0_#ff5500] origin-bottom hover:bg-white transition-colors"
                        />
                    ))}
                </div>

                <div className="absolute right-4 top-4 z-30 px-3 py-1 bg-zinc-900 border-2 border-[#ff5500] text-[#ff5500] text-[10px] font-black uppercase tracking-[0.3em] shadow-[4px_4px_0_theme(colors.zinc.950)]">
                    I N T E G R A L
                </div>
            </div>
        );
    }

    // Default Abstract Meta-Math (Caos Geométrico Controlado)
    return (
        <div className={containerClasses} title={`Ilustração Estrutural: ${concept}`}>
            <motion.div
                animate={{ rotate: 360, borderRadius: ["0%", "50%", "0%"] }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="w-32 h-32 border-8 border-white/80 flex items-center justify-center mix-blend-exclusion z-10"
            >
                <div className="w-16 h-16 bg-[#ff5500] border-4 border-zinc-950" />
            </motion.div>

            <motion.div
                animate={{ scale: [1, 1.8, 1], rotate: [0, -90, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "circInOut" }}
                className="absolute border-8 border-[#00f0ff] w-48 h-48 opacity-40 z-0 pointer-events-none"
            />

            {/* Ruído vetorial para textura cruzada */}
            <div className="absolute top-8 right-8 flex gap-2 z-20">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                <div className="w-2 h-2 bg-[#ccff00]" />
            </div>

            <div className="absolute bottom-4 left-4 z-30 px-3 py-1 bg-zinc-900 border-2 border-white/40 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-[4px_4px_0_rgba(255,255,255,0.2)] max-w-[80%] truncate">
                {concept.substring(0, 20)} // Abstração
            </div>
        </div>
    );
};

export default StylizedIllustration;
