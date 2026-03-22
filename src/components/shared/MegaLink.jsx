import React from 'react';

export const MegaLink = ({ icon: Icon, title, desc, onClick, disabled }) => (
  <div
    onClick={!disabled ? onClick : undefined}
    className={`flex items-center gap-4 p-3 rounded-lg transition-colors select-none ${
      disabled
        ? 'opacity-30 cursor-not-allowed grayscale'
        : 'hover:bg-slate-800 cursor-pointer group'
    }`}
  >
    <div
      className={`p-2 rounded-md ${
        disabled
          ? 'bg-slate-800 text-slate-600'
          : 'bg-slate-900 text-slate-400 group-hover:text-[#D10057] group-hover:bg-[#D10057]/10'
      }`}
    >
      <Icon size={20} />
    </div>
    <div>
      <h4
        className={`text-sm font-bold ${
          disabled ? 'text-slate-600' : 'text-slate-200 group-hover:text-white'
        }`}
      >
        {title}
      </h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  </div>
);
