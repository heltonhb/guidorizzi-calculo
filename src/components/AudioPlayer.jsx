import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Headphones, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchStudioArtifacts, createStudioAudio } from '../services/api';
import { useToast } from './Toast';

const AudioPlayer = ({ topic, onBack }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [audioUrl, setAudioUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const audioRef = useRef(null);
    const toast = useToast();

    useEffect(() => {
        loadAudio();
    }, [topic]);

    const loadAudio = async () => {
        setLoading(true);
        try {
            const data = await fetchStudioArtifacts();
            const audioArtifact = data.artifacts?.find(a => a.type === 'audio_overview' && a.title.toLowerCase().includes(topic.toLowerCase()));
            if (audioArtifact) {
                setAudioUrl(audioArtifact.audio_url);
            }
        } catch (error) {
            console.error('Error loading audio:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAudio = async () => {
        setIsGenerating(true);
        try {
            await createStudioAudio(topic);
            toast.success('Audio Overview sendo gerado! Isso leva alguns minutos. O áudio aparecerá aqui quando pronto.');
            loadAudio();
        } catch (error) {
            toast.error('Erro ao gerar áudio: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setProgress((current / duration) * 100);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen gap-8">
            <div className="w-24 h-24 bg-zinc-950 border-4 border-[#ccff00] shadow-[8px_8px_0_#ccff00] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#ccff00] animate-spin" />
            </div>
            <div className="text-center p-4 border-2 border-white/10 bg-zinc-900">
                <span className="text-zinc-400 font-black uppercase tracking-widest text-xs">Buscando Audio Overview...</span>
            </div>
        </div>
    );

    if (!audioUrl) return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-8 text-center"
        >
            <div className="w-24 h-24 bg-zinc-950 border-4 border-white/20 shadow-[8px_8px_0_rgba(255,255,255,0.1)] flex items-center justify-center mb-4">
                <Headphones className="w-10 h-10 text-white/50" />
            </div>
            <div className="space-y-4">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter border-b-4 border-[#ccff00] pb-2 inline-block">SEM ÁUDIO: "{topic}"</h2>
                <p className="text-zinc-400 font-bold text-sm max-w-[250px] uppercase tracking-widest">Ainda não foi gerado um Audio Overview para este tema.</p>
            </div>
            <motion.button
                whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px #ccff00" }}
                whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
                disabled={isGenerating}
                onClick={handleCreateAudio}
                className="w-full max-w-xs py-4 bg-[#ccff00] border-2 border-[#ccff00] text-zinc-950 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
            >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? 'GRAVANDO...' : 'GERAR AUDIO OVERVIEW'}
            </motion.button>
            <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest border-b-2 border-zinc-700 hover:border-white pb-1">VOLTAR AO DASHBOARD</button>
        </motion.div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-12 p-8"
        >
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Visualizer Animation */}
                <div className="absolute inset-0 flex items-end justify-center gap-2 pb-8">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={isPlaying ? {
                                height: [10, Math.random() * 80 + 20, 10],
                            } : { height: 10 }}
                            transition={{
                                duration: 0.2 + Math.random() * 0.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-3 bg-[#00f0ff] border-2 border-zinc-950"
                        />
                    ))}
                </div>

                <div className="relative z-10 w-48 h-48 bg-zinc-950 border-8 border-white shadow-[16px_16px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
                    <Headphones className="w-20 h-20 text-white" />
                </div>
            </div>

            <div className="text-center space-y-4">
                <h2 className="text-3xl font-black tracking-tighter uppercase text-white bg-[#00f0ff] text-zinc-950 px-4 py-2 border-2 border-white inline-block">{topic}</h2>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Audio Overview • Deep Dive</p>
            </div>

            <div className="w-full max-w-sm space-y-8 bg-zinc-900 border-4 border-white/10 p-6 shadow-[8px_8px_0_rgba(255,255,255,0.05)]">
                <div className="relative h-4 bg-zinc-950 border-2 border-white/20">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-[#00f0ff] border-r-2 border-white/20"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-between px-4">
                    <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 flex items-center justify-center bg-zinc-950 border-2 border-white/20 text-white hover:border-white shadow-[2px_2px_0_rgba(255,255,255,0.1)] transition-colors">
                        <SkipBack className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px #ccff00" }}
                        whileTap={{ scale: 0.95, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
                        onClick={togglePlay}
                        className="w-20 h-20 bg-[#ccff00] border-4 border-white text-zinc-950 flex items-center justify-center transition-all shadow-[4px_4px_0_rgba(255,255,255,0.2)]"
                    >
                        {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 flex items-center justify-center bg-zinc-950 border-2 border-white/20 text-white hover:border-white shadow-[2px_2px_0_rgba(255,255,255,0.1)] transition-colors">
                        <SkipForward className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
            />

            <button
                onClick={onBack}
                className="mt-4 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors border-b-2 border-zinc-700 hover:border-white pb-1"
            >
                FECHAR PLAYER
            </button>
        </motion.div>
    );
};

export default AudioPlayer;
