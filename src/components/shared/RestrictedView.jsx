import React from 'react';
import { Lock } from 'lucide-react';

export const RestrictedView = ({ currentSkin }) => (
  <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in">
    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
      <Lock size={40} className="text-red-500" />
    </div>
    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight uppercase tracking-widest">
      Acceso Restringido
    </h2>
    <p className="text-slate-500 max-sm:text-xs tracking-tight leading-relaxed">
      La skin <span className="text-white font-bold">{currentSkin.name}</span>{' '}
      no cuenta con privilegios para administrar este módulo.
    </p>
  </div>
);
