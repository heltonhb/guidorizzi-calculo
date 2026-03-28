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
        <div className="w-full h-full bg-zinc-950/50 rounded-[40px] overflow-hidden border border-white/5 relative group">
            <Mafs
                pan={true}
                zoom={true}
                height={400}
                viewBox={{ x: range, y: range }}
            >
                <Coordinates.Cartesian />
                <Plot.OfX y={fn} color={Theme.indigo} />
                <MovablePoint
                    constrain={(p) => [p[0], fn(p[0])]}
                    point={point}
                    onMove={setPoint}
                    color={Theme.purple}
                />
            </Mafs>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-[10px] font-black uppercase text-purple-400 tracking-tighter">f(x) = {equation}</span>
                </div>
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter">Arraste o ponto para explorar</span>
                </div>
            </div>
        </div>
    );
};

export default InteractiveGraph;
