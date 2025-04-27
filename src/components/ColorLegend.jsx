import React from 'react';

export default function ColorLegend() {
  return (
    <div className="flex gap-4 items-center bg-white/90 rounded-lg px-3 py-2 shadow border border-purple-200 text-sm">
      <span className="inline-flex items-center gap-1"><span className="inline-block w-4 h-4 rounded-full bg-purple-400"></span> Patriarchs</span>
      <span className="inline-flex items-center gap-1"><span className="inline-block w-4 h-4 rounded-full bg-blue-400"></span> Tribes of Israel</span>
      <span className="inline-flex items-center gap-1"><span className="inline-block w-4 h-4 rounded-full bg-yellow-400"></span> Royal Line</span>
      <span className="inline-flex items-center gap-1"><span className="inline-block w-4 h-4 rounded-full bg-green-400"></span> Priestly Line</span>
    </div>
  );
}
