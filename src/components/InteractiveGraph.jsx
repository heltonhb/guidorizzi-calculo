import React, { useState } from 'react';
import { Mafs, Coordinates, Plot, Theme, MovablePoint } from "mafs";
import "mafs/core.css";

const InteractiveGraph = ({ equation = "x^2", range = [-5, 5] }) => {
    const [point, setPoint] = useState([1, 1]);

    // Simple parser for common calculus functions
    const getFn = (expr) => {
        try {
            if (expr.includes('sin')) return (x) => Math.sin(x);
            if (expr.includes('cos')) return (x) => Math.cos(x);
            if (expr.includes('exp') || expr.includes('e^')) return (x) => Math.exp(x);
            if (expr.includes('x^2')) return (x) => x * x;
            if (expr.includes('x^3')) return (x) => x * x * x;
            return (x) => x; // fallback linear
        } catch {
            return (x) => x;
        }
    };

    const fn = getFn(equation);

    return (
        <div className="w-full h-full bg-zinc-950 overflow-hidden border-4 border-white/20 relative group shadow-inner touch-pan-y">
            <Mafs
                pan={true}
                zoom={true}
                height={400}
                viewBox={{ x: range, y: range }}
                preventInteraction={(e) => {
                    // Allow touch on mobile but prevent conflict with parent scroll
                    return false;
                }}
            >
                <Coordinates.Cartesian />
                <Plot.OfX y={fn} color="#FFFFFF" />
                <MovablePoint
                    constrain={(p) => [p[0], fn(p[0])]}
                    point={point}
                    onMove={setPoint}
                    color="#FF4500"
                />
            </Mafs>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <div className="px-4 py-2 bg-zinc-950 border-2 border-signal shadow-[2px_2px_0_theme(colors.signal)]">
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">f(x) = {equation}</span>
                </div>
                <div className="px-4 py-2 bg-zinc-900 border-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0_rgba(255,255,255,0.1)]">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Arraste o ponto para explorar</span>
                </div>
            </div>
        </div>
    );
};

export default InteractiveGraph;
