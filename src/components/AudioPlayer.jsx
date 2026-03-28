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
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <span className="text-zinc-600 font-black uppercase tracking-widest text-xs">Buscando Podcast...</span>
        </div>
    );

    if (!audioUrl) return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-8 text-center"
        >
            <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Headphones className="w-10 h-10 text-zinc-500" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Sem Áudio para "{topic}"</h2>
                <p className="text-zinc-500 text-sm max-w-[250px]">O Guidorizzi ainda não gravou uma explicação para este tema em seu notebook.</p>
            </div>
            <button
                disabled={isGenerating}
                onClick={handleCreateAudio}
                className="w-full max-w-xs py-6 rounded-[32px] bg-purple-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? 'Gravando...' : 'Gerar Audio Overview'}
            </button>
            <button onClick={onBack} className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Voltar</button>
        </motion.div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-12 p-8"
        >
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Visualizer Animation */}
                <div className="absolute inset-0 flex items-center justify-center gap-1">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={isPlaying ? {
                                height: [20, Math.random() * 80 + 20, 20],
                            } : { height: 20 }}
                            transition={{
                                duration: 0.5 + Math.random(),
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-1.5 bg-purple-500/40 rounded-full"
                        />
                    ))}
                </div>

                <div className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 flex items-center justify-center backdrop-blur-3xl shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                    <Headphones className="w-16 h-16 text-purple-400" />
                </div>
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black tracking-tight">{topic}</h2>
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Guidorizzi Intelligence Podcast</p>
            </div>

            <div className="w-full max-w-xs space-y-6">
                <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-center gap-8">
                    <button className="text-zinc-500 hover:text-white transition-colors">
                        <SkipBack className="w-6 h-6" />
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlay}
                        className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl shadow-white/5"
                    >
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </motion.button>
                    <button className="text-zinc-500 hover:text-white transition-colors">
                        <SkipForward className="w-6 h-6" />
                    </button>
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
                className="mt-8 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
            >
                Fechar Player
            </button>
        </motion.div>
    );
};

export default AudioPlayer;
