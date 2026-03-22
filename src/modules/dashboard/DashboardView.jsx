import React from 'react';
import { LayoutDashboard, Globe } from 'lucide-react';

export const DashboardView = ({ currentSkin }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in zoom-in duration-300">
    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700 shadow-2xl shadow-[#D10057]/20">
      {/* 👇 Si es global, mostramos el mundo. Si es local, el dashboard */}
      {currentSkin ? (
        <LayoutDashboard size={48} className="text-[#D10057]" />
      ) : (
        <Globe size={48} className="text-[#D10057]" />
      )}
    </div>
    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight text-slate-200">
      Back Office V.4.0.0
    </h1>
    <p className="text-slate-400 text-lg mb-4">
      {/* 👇 Mensaje dinámico según la arquitectura */}
      {currentSkin ? (
        <>
          Bienvenido al entorno operativo{' '}
          <span className="text-[#D10057] font-bold">{currentSkin.name}</span>
        </>
      ) : (
        <>
          Bienvenido a la Administración de{' '}
          <span className="text-[#D10057] font-bold">Permisos Globales</span>
        </>
      )}
    </p>
  </div>
);
