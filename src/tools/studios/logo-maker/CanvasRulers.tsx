import React, { useMemo } from 'react';

interface CanvasRulersProps {
  canvasWidth: number;
  canvasHeight: number;
  displayWidth: number;
  displayHeight: number;
  zoom: number;
  cursorPos: { x: number; y: number } | null;
}

export const CanvasRulers: React.FC<CanvasRulersProps> = ({
  canvasWidth,
  canvasHeight,
  displayWidth,
  displayHeight,
  cursorPos,
}) => {
  const step = 100;

  // Generate tick marks for horizontal ruler
  const hTicks = useMemo(() => {
    const ticks: { pos: number; label: number }[] = [];
    for (let val = 0; val <= canvasWidth; val += step) {
      const pct = (val / canvasWidth) * 100;
      ticks.push({ pos: pct, label: val });
    }
    return ticks;
  }, [canvasWidth]);

  // Generate tick marks for vertical ruler
  const vTicks = useMemo(() => {
    const ticks: { pos: number; label: number }[] = [];
    for (let val = 0; val <= canvasHeight; val += step) {
      const pct = (val / canvasHeight) * 100;
      ticks.push({ pos: pct, label: val });
    }
    return ticks;
  }, [canvasHeight]);

  const cursorXPct = cursorPos && canvasWidth > 0 ? Math.min(100, Math.max(0, (cursorPos.x / canvasWidth) * 100)) : null;
  const cursorYPct = cursorPos && canvasHeight > 0 ? Math.min(100, Math.max(0, (cursorPos.y / canvasHeight) * 100)) : null;

  return (
    <>
      {/* Top Horizontal Ruler */}
      <div
        className="absolute top-0 left-6 right-0 h-6 bg-slate-900/90 border-b border-slate-800 text-[9px] font-mono text-slate-400 select-none pointer-events-none z-10 flex items-center overflow-hidden"
        style={{ width: displayWidth }}
      >
        {hTicks.map((tick) => (
          <div
            key={`h-${tick.label}`}
            className="absolute top-0 bottom-0 flex flex-col justify-between"
            style={{ left: `${tick.pos}%` }}
          >
            <div className="w-[1px] h-2 bg-slate-600" />
            <span className="leading-none px-0.5 text-[8px] text-slate-400 transform -translate-x-1/2">
              {tick.label}
            </span>
            <div className="w-[1px] h-1.5 bg-slate-700" />
          </div>
        ))}

        {/* Cursor tracker indicator */}
        {cursorXPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-[1px] bg-red-500 z-20 transition-all duration-75"
            style={{ left: `${cursorXPct}%` }}
          />
        )}
      </div>

      {/* Left Vertical Ruler */}
      <div
        className="absolute top-6 left-0 bottom-0 w-6 bg-slate-900/90 border-r border-slate-800 text-[9px] font-mono text-slate-400 select-none pointer-events-none z-10 flex flex-col justify-between overflow-hidden"
        style={{ height: displayHeight }}
      >
        {vTicks.map((tick) => (
          <div
            key={`v-${tick.label}`}
            className="absolute left-0 right-0 flex items-center justify-between"
            style={{ top: `${tick.pos}%` }}
          >
            <div className="h-[1px] w-2 bg-slate-600" />
            <span className="leading-none px-0.5 text-[8px] text-slate-400 transform -translate-y-1/2 -rotate-90 origin-center">
              {tick.label}
            </span>
            <div className="h-[1px] w-1.5 bg-slate-700" />
          </div>
        ))}

        {/* Cursor tracker indicator */}
        {cursorYPct !== null && (
          <div
            className="absolute left-0 right-0 h-[1px] bg-red-500 z-20 transition-all duration-75"
            style={{ top: `${cursorYPct}%` }}
          />
        )}
      </div>

      {/* Corner Origin Square */}
      <div className="absolute top-0 left-0 w-6 h-6 bg-slate-950 border-r border-b border-slate-800 flex items-center justify-center text-[8px] text-slate-400 select-none z-20">
        px
      </div>
    </>
  );
};
