import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Dual-handle price range slider
 * Props: min, max, value=[low,high], onChange([low,high])
 */
const PriceRangeSlider = ({ min = 0, max = 10000, value, onChange, step = 10 }) => {
  const [low, setLow]   = useState(value?.[0] ?? min);
  const [high, setHigh] = useState(value?.[1] ?? max);
  const trackRef = useRef(null);
  const dragging = useRef(null); // 'low' | 'high'

  // Sync external value
  useEffect(() => {
    if (value) { setLow(value[0]); setHigh(value[1]); }
  }, [value?.[0], value?.[1]]);

  const clamp = (val) => Math.min(Math.max(val, min), max);
  const snap  = (val) => Math.round(val / step) * step;

  const pct = (val) => ((val - min) / (max - min)) * 100;

  // ── Mouse drag ──
  const getValFromX = useCallback((clientX) => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return snap(clamp(min + ratio * (max - min)));
  }, [min, max, step]);

  const onMouseDown = (handle) => (e) => {
    e.preventDefault();
    dragging.current = handle;
    const move = (me) => {
      const val = getValFromX(me.clientX);
      if (dragging.current === 'low') {
        const newLow = Math.min(val, high - step);
        setLow(newLow);
        onChange([newLow, high]);
      } else {
        const newHigh = Math.max(val, low + step);
        setHigh(newHigh);
        onChange([low, newHigh]);
      }
    };
    const up = () => { dragging.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  // ── Touch drag ──
  const onTouchStart = (handle) => (e) => {
    dragging.current = handle;
    const move = (te) => {
      const val = getValFromX(te.touches[0].clientX);
      if (dragging.current === 'low') {
        const newLow = Math.min(val, high - step);
        setLow(newLow); onChange([newLow, high]);
      } else {
        const newHigh = Math.max(val, low + step);
        setHigh(newHigh); onChange([low, newHigh]);
      }
    };
    const end = () => { dragging.current = null; window.removeEventListener('touchmove', move); window.removeEventListener('touchend', end); };
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', end);
  };

  // Track click
  const onTrackClick = (e) => {
    if (dragging.current) return;
    const val = getValFromX(e.clientX);
    const distLow  = Math.abs(val - low);
    const distHigh = Math.abs(val - high);
    if (distLow <= distHigh) {
      const newLow = Math.min(val, high - step);
      setLow(newLow); onChange([newLow, high]);
    } else {
      const newHigh = Math.max(val, low + step);
      setHigh(newHigh); onChange([low, newHigh]);
    }
  };

  return (
    <div className="px-1">
      {/* Price display */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="font-semibold text-gray-800">₹{low.toLocaleString()}</span>
        <span className="text-gray-400 text-xs">—</span>
        <span className="font-semibold text-gray-800">₹{high.toLocaleString()}</span>
      </div>

      {/* Slider track */}
      <div
        ref={trackRef}
        className="relative h-5 flex items-center cursor-pointer select-none"
        // onClick={onTrackClick}
        onClick={(e) => {
  if (dragging.current) return;
  onTrackClick(e);
}}
      >
        {/* Background track */}
        <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-1.5 bg-gray-200 rounded-full" />

        {/* Active range fill */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-primary-500 rounded-full pointer-events-none"
          style={{ left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%` }}
        />

        {/* Low handle */}
       
        <div
  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 md:w-5 md:h-5 bg-white border-2 border-primary-500 rounded-full shadow-md ring-2 ring-white cursor-grab active:cursor-grabbing hover:scale-110 hover:shadow-lg transition-all z-20"
//   style={{ left: `${pct(low)}%` }}
style={{ left: `${pct(low)}%`, zIndex: low > max - 100 ? 20 : 10 }}
  onMouseDown={onMouseDown('low')}
  onTouchStart={onTouchStart('low')}
/>

        {/* High handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 md:w-5 md:h-5 bg-white border-2 border-primary-500 rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
        //   style={{ left: `${pct(high)}%` }}
        style={{ left: `${pct(high)}%`, zIndex: 20 }}
          onMouseDown={onMouseDown('high')}
          onTouchStart={onTouchStart('high')}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1.5 text-xs text-gray-400">
        <span>₹{min.toLocaleString()}</span>
        <span>₹{max.toLocaleString()}</span>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {[
          { label: 'Under ₹500', range: [min, Math.min(500, max)] },
          { label: '₹500–₹2K',  range: [500, Math.min(2000, max)] },
          { label: '₹2K–₹5K',  range: [2000, Math.min(5000, max)] },
          { label: 'Above ₹5K', range: [5000, max] },
        ].filter(p => p.range[0] < max && p.range[1] > min).map(preset => {
          const active = low === preset.range[0] && high === preset.range[1];
          return (
            <button
              key={preset.label}
              onClick={() => { setLow(preset.range[0]); setHigh(preset.range[1]); onChange(preset.range); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PriceRangeSlider;