import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import Dashboard from './Dashboard';
import DashboardBrutalistPremium from './DashboardBrutalistPremium';
import DashboardBrutalistExperimental from './DashboardBrutalistExperimental';

interface DashboardContainerProps {
    onNavigate: (view: string, topic?: string) => void;
}

const DashboardContainer = ({ onNavigate }: DashboardContainerProps) => {
    const [variant, setVariant] = useState(() => {
        // Load variant preference from localStorage
        const saved = localStorage.getItem('dashboardVariant');
        return saved || 'original';
    });

    const [showSelector, setShowSelector] = useState(false);

    useEffect(() => {
        // Save variant preference to localStorage
        localStorage.setItem('dashboardVariant', variant);
    }, [variant]);

    const renderDashboard = () => {
        switch (variant) {
            case 'premium':
                return <DashboardBrutalistPremium onNavigate={onNavigate} />;
            case 'experimental':
                return <DashboardBrutalistExperimental onNavigate={onNavigate} />;
            case 'original':
            default:
                return <Dashboard onNavigate={onNavigate} />;
        }
    };

    const variants = [
        {
            id: 'original',
            name: 'Padrão',
            description: 'Layout original da aplicação'
        },
        {
            id: 'premium',
            name: 'Brutalist Premium',
            description: 'Design minimalista e robusto'
        },
        {
            id: 'experimental',
            name: 'Brutalist Experimental',
            description: 'Layout assimétrico e experimental'
        }
    ];

    return (
        <div className="relative w-full">
            {/* Variant Selector Toggle */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowSelector(!showSelector)}
                className="fixed bottom-24 right-6 z-40 p-3 bg-zinc-900 border-2 border-zinc-700 hover:border-[#00f0ff] rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                title="Alternar variante de dashboard"
            >
                <Settings className="w-5 h-5 text-zinc-400 hover:text-[#00f0ff]" />
            </motion.button>

            {/* Variant Menu */}
            {showSelector && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-32 right-6 z-50 bg-zinc-950 border-2 border-zinc-700 shadow-xl rounded-lg overflow-hidden"
                >
                    {variants.map((v, idx) => (
                        <button
                            key={v.id}
                            onClick={() => {
                                setVariant(v.id);
                                setShowSelector(false);
                            }}
                            className={cn(
                                "w-full px-6 py-4 text-left transition-all duration-300 font-mono",
                                variant === v.id 
                                    ? "bg-zinc-800 border-l-4 border-[#00f0ff]" 
                                    : "hover:bg-zinc-900 border-l-4 border-transparent",
                                idx < variants.length - 1 ? "border-b border-zinc-800" : ""
                            )}
                        >
                            <p className={cn(
                                "text-sm font-black uppercase",
                                variant === v.id ? "text-[#00f0ff]" : "text-zinc-300"
                            )}>
                                {v.name}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                {v.description}
                            </p>
                        </button>
                    ))}
                </motion.div>
            )}

            {/* Dashboard Content */}
            {renderDashboard()}
        </div>
    );
};

export default DashboardContainer;
