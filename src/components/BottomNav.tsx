import React from 'react';
import { Home, Search, BarChart3, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../hooks/useAppContext';

export const BottomNav = () => {
    const { view, setView } = useAppContext();

    // Defaulting other tabs to just open dashboard/profile for now
    const handleNavigation = (id: string) => {
        if (id === 'profile') setView('profile');
        else setView('dashboard');
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-zinc-400 border-t-8 border-black">
            <div className="flex items-center justify-between w-full max-w-lg mx-auto px-6 py-3 pb-safe">
                <button
                    onClick={() => handleNavigation('dashboard')}
                    className={cn(
                        "p-2 transition-transform active:scale-95",
                        view === 'dashboard' ? 'text-black scale-110' : 'text-zinc-700'
                    )}
                >
                    <Home className="w-8 h-8" strokeWidth={view === 'dashboard' ? 3 : 2} />
                </button>
                <button
                    onClick={() => handleNavigation('search')}
                    className="p-2 transition-transform active:scale-95 text-zinc-700"
                >
                    <Search className="w-8 h-8" strokeWidth={2} />
                </button>
                <button
                    onClick={() => handleNavigation('stats')}
                    className="p-2 transition-transform active:scale-95 text-zinc-700"
                >
                    <BarChart3 className="w-8 h-8" strokeWidth={2} />
                </button>
                <button
                    onClick={() => handleNavigation('profile')}
                    className={cn(
                        "p-2 transition-transform active:scale-95",
                        view === 'profile' ? 'text-black scale-110' : 'text-zinc-700'
                    )}
                >
                    <User className="w-8 h-8" strokeWidth={view === 'profile' ? 3 : 2} />
                </button>
            </div>
        </div>
    );
};

export default BottomNav;
