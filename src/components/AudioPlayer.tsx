import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Headphones, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { queryNotebook } from '../services/api';

const AudioPlayer = ({ topic, onBack }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [audioText, setAudioText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('');
    const utteranceRef = useRef(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        
        // Check if speech synthesis is supported
        if (!window.speechSynthesis) {
            setSpeechSupported(false);
        }
        
        setLoading(false);
        return () => {
            isMountedRef.current = false;
            // Cancel speech on unmount
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleGenerateAudio = async () => {
        setIsGenerating(true);
        setError(null);
        setStatus('Gerando conteúdo...');
        
        try {
            const response = await queryNotebook(`Explique o conceito de "${topic}" de forma simples e didática. Máximo 2 parágrafos.`);
            
            if (!isMountedRef.current) return;
            
            const text = response?.answer || response?.content || '';
            if (!text) {
                throw new Error('Sem resposta da IA');
            }
            setAudioText(text);
            setStatus('Áudio pronto! Clique em Play.');
        } catch (err) {
            if (!isMountedRef.current) return;
            console.error('Error generating audio text:', err);
            setError('Não foi possível gerar o conteúdo do áudio.');
            setStatus('');
        } finally {
            if (isMountedRef.current) {
                setIsGenerating(false);
            }
        }
    };

    const speak = () => {
        if (!audioText || !speechSupported) return;

        try {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(audioText);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            // Try to find a Portuguese or English voice
            const voices = window.speechSynthesis.getVoices() || [];
            const ptVoice = voices.find(v => v.lang.includes('pt') || v.lang.includes('BR'));
            const enVoice = voices.find(v => v.lang.includes('en'));
            
            utterance.voice = ptVoice || enVoice || voices[0];

            utterance.onend = () => {
                if (isMountedRef.current) {
                    setIsPlaying(false);
                    setProgress(0);
                }
            };

            utterance.onerror = (e) => {
                console.error('Speech error:', e);
                if (isMountedRef.current) {
                    setIsPlaying(false);
                    setError('Erro na reprodução de áudio');
                }
            };

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            
            if (isMountedRef.current) {
                setIsPlaying(true);
                setStatus('Reproduzindo...');
            }
        } catch (e) {
            console.error('Speak error:', e);
            if (isMountedRef.current) {
                setError('Erro ao iniciar reprodução');
            }
        }
    };

    const togglePlay = () => {
        if (!audioText) {
            handleGenerateAudio();
            return;
        }

        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setStatus('Pausado');
        } else {
            speak();
        }
    };

    const handleStop = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
        setProgress(0);
        setStatus('');
    };

    if (!speechSupported) return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-8 text-center"
        >
            <div className="w-24 h-24 bg-zinc-950 border-4 border-red-500 shadow-[8px_8px_0_theme(colors.red.600)] flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-4">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter border-b-4 border-red-500 pb-2">ÁUDIO NÃO SUPORTADO</h2>
                <p className="text-zinc-400 font-bold text-sm max-w-[250px]">Seu navegador não suporta síntese de voz. Tente usar Chrome ou Edge.</p>
            </div>
            <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest border-b-2 border-zinc-700 hover:border-white pb-1">VOLTAR AO DASHBOARD</button>
        </motion.div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen gap-8">
            <div className="w-24 h-24 bg-zinc-950 border-4 border-[#ccff00] shadow-[8px_8px_0_#ccff00] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#ccff00] animate-spin" />
            </div>
            <div className="text-center p-4 border-2 border-white/10 bg-zinc-900">
                <span className="text-zinc-400 font-black uppercase tracking-widest text-xs">Carregando...</span>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-4 sm:p-8"
        >
            <div className="relative w-40 h-40 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* Visualizer Animation */}
                <div className="absolute inset-0 flex items-end justify-center gap-1 sm:gap-2 pb-4 sm:pb-8">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={isPlaying ? {
                                height: [8, Math.random() * 60 + 20, 8],
                            } : { height: 8 }}
                            transition={{
                                duration: 0.2 + Math.random() * 0.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-2 sm:w-3 bg-[#00f0ff] border-2 border-zinc-950"
                        />
                    ))}
                </div>

                <div className="relative z-10 w-32 h-32 sm:w-48 sm:h-48 bg-zinc-950 border-4 sm:border-8 border-white shadow-[8px_8px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
                    <Headphones className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                </div>
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-3xl font-black tracking-tighter uppercase text-white bg-[#00f0ff] text-zinc-950 px-3 sm:px-4 py-1 sm:py-2 border-2 border-white inline-block">{topic}</h2>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Audio Overview • Síntese de Voz</p>
            </div>

            {status && (
                <div className="p-3 bg-zinc-900 border-2 border-[#00f0ff] text-[#00f0ff] text-xs font-bold uppercase tracking-widest">
                    {status}
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-950/50 border-2 border-red-500 text-red-400 text-xs font-bold uppercase tracking-widest">
                    {error}
                </div>
            )}

            {/* Text preview (collapsed) */}
            {audioText && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-md p-3 bg-zinc-900 border-2 border-white/10 text-zinc-400 text-xs font-bold max-h-24 overflow-y-auto custom-scrollbar"
                >
                    {audioText.substring(0, 500)}...
                </motion.div>
            )}

            <div className="w-full max-w-sm space-y-6 sm:space-y-8 bg-zinc-900 border-4 border-white/10 p-4 sm:p-6 shadow-[8px_8px_0_rgba(255,255,255,0.05)]">
                {/* Progress bar (simulated) */}
                <div className="relative h-2 sm:h-4 bg-zinc-950 border-2 border-white/20">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-[#00f0ff] border-r-2 border-white/20"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-center gap-3 sm:gap-4">
                    <motion.button 
                        whileTap={{ scale: 0.9 }} 
                        onClick={handleStop}
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-zinc-950 border-2 border-white/20 text-white hover:border-white shadow-[2px_2px_0_rgba(255,255,255,0.1)] transition-colors"
                    >
                        <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px #ccff00" }}
                        whileTap={{ scale: 0.95, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
                        onClick={togglePlay}
                        disabled={isGenerating}
                        className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ccff00] border-4 border-white text-zinc-950 flex items-center justify-center transition-all shadow-[4px_4px_0_rgba(255,255,255,0.2)] disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" />
                        ) : isPlaying ? (
                            <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
                        ) : (
                            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
                        )}
                    </motion.button>
                    <motion.button 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => {
                            handleStop();
                            handleGenerateAudio();
                        }}
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-zinc-950 border-2 border-white/20 text-white hover:border-white shadow-[2px_2px_0_rgba(255,255,255,0.1)] transition-colors"
                    >
                        <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                </div>
            </div>

            {/* Generate button */}
            {!audioText && !isGenerating && (
                <motion.button
                    whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px #ccff00" }}
                    whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
                    onClick={handleGenerateAudio}
                    className="w-full max-w-xs py-4 bg-[#ccff00] border-2 border-[#ccff00] text-zinc-950 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all"
                >
                    <Sparkles className="w-5 h-5" />
                    GERAR ÁUDIO OVERVIEW
                </motion.button>
            )}

            <button
                onClick={onBack}
                className="mt-2 sm:mt-4 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors border-b-2 border-zinc-700 hover:border-white pb-1"
            >
                FECHAR PLAYER
            </button>
        </motion.div>
    );
};

export default AudioPlayer;
