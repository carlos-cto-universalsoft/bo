import React from 'react';

export const NavBtn = ({ label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'text-white bg-slate-800'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`}
  >
    <Icon size={16} /> {label}
  </button>
);
