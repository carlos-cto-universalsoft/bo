import React, { useState } from 'react';
import {
  HardHat,
  AlertTriangle,
  ArrowLeft,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import { ProfileDashboard } from './ProfileDashboard';
import { ProfileDetails } from './ProfileDetails';
import { ProfileSalesReport } from './ProfileSalesReport';
import { ProfileTransactions } from './ProfileTransactions';
import { ProfileDeposits } from './ProfileDeposits';
import { ProfileWithdrawals } from './ProfileWithdrawals';
import { useData } from '../../context/DataContext';
// 👈 REMOVIDO: import { AVAILABLE_SKINS } from '../../config/constants';

const SUB_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'details', label: 'Detalles de Usuario' },
  { id: 'deposits', label: 'Depósitos' },
  { id: 'withdrawals', label: 'Retiros' },
  { id: 'transactions', label: 'Transacciones' },
  { id: 'limits', label: 'Límite' },
  { id: 'log', label: 'Log' },
  { id: 'sales_report', label: 'Reporte de Ventas' },
  { id: 'provider', label: 'Proveedor' },
  { id: 'bonus', label: 'Bono' },
  { id: 'freebets', label: 'Freebets' },
];

export const NetworkProfileView = ({ currentSkin, targetNode }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // 👈 LECTURA DINÁMICA: Extraemos skins del DataContext
  const { hasPermission, networks, skins } = useData();

  const userData = networks.find((n) => n.id === targetNode.id) || targetNode;

  // 👈 MOTOR APLICADO: Busca en la BD real, no en el archivo estático
  const getSkinName = (skinId) => {
    const skinFound = skins.find((s) => s.id === skinId);
    return skinFound ? skinFound.name : skinId;
  };

  const canReadProfile = hasPermission(currentSkin.id, 'net_profile_read');

  if (!canReadProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0b1120] p-6 text-center animate-in zoom-in duration-300">
        <div className="p-5 bg-red-500/10 rounded-full mb-6 ring-1 ring-red-500/30">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 uppercase tracking-widest">
          Acceso Denegado
        </h2>
        <p className="text-slate-400 max-w-lg leading-relaxed">
          Tu rol actual no posee permisos de lectura para auditar expedientes de
          red.
        </p>
      </div>
    );
  }

  if (currentSkin.id !== userData.skinId) {
    const targetSkinName = getSkinName(userData.skinId);

    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0b1120] p-6 text-center animate-in fade-in">
        <div className="p-6 bg-amber-500/10 rounded-full mb-8 ring-1 ring-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <Globe className="w-16 h-16 text-amber-500" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
          Conflicto de Entorno (Jurisdicción)
        </h2>

        <div className="bg-[#111827] border border-slate-800 p-8 rounded-2xl max-w-xl shadow-2xl relative">
          <p className="text-slate-300 mb-6 text-base leading-relaxed">
            Estás intentando auditar a{' '}
            <span className="text-white font-bold px-2 py-1 bg-slate-800 rounded">
              {userData.username}
            </span>
            , quien pertenece exclusivamente a la unidad de negocio:
          </p>

          <div className="mb-8">
            <div className="px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 font-bold text-lg tracking-tight inline-block shadow-inner">
              {targetSkinName}
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg text-sm text-slate-400 flex items-start gap-4 text-left">
            <ArrowLeft size={20} className="text-blue-500 flex-shrink-0 mt-1" />
            <p>
              Tu entorno operativo actual es{' '}
              <span className="text-white font-bold">{currentSkin.name}</span>.
              Por seguridad, cambia de Skin en el selector superior para
              gestionar este perfil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const visibleTabs = SUB_TABS.filter((tab) => {
    if (tab.id === 'deposits') {
      return (
        hasPermission(currentSkin.id, 'net_deposit_read') ||
        hasPermission(currentSkin.id, 'net_deposit_write')
      );
    }
    if (tab.id === 'withdrawals') {
      return (
        hasPermission(currentSkin.id, 'net_withdraw_read') ||
        hasPermission(currentSkin.id, 'net_withdraw_write')
      );
    }
    if (tab.id === 'transactions') {
      return hasPermission(currentSkin.id, 'net_tx_read');
    }
    return true;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ProfileDashboard userData={userData} currentSkin={currentSkin} />
        );
      case 'details':
        return <ProfileDetails userData={userData} currentSkin={currentSkin} />;
      case 'deposits':
        return (
          <ProfileDeposits userData={userData} currentSkin={currentSkin} />
        );
      case 'withdrawals':
        return (
          <ProfileWithdrawals userData={userData} currentSkin={currentSkin} />
        );
      case 'sales_report':
        return (
          <ProfileSalesReport userData={userData} currentSkin={currentSkin} />
        );
      case 'transactions':
        return (
          <ProfileTransactions userData={userData} currentSkin={currentSkin} />
        );
      default:
        return (
          <PlaceholderView
            tabName={SUB_TABS.find((t) => t.id === activeTab)?.label}
            userName={userData?.username}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1120] text-slate-200">
      <div className="border-b border-slate-800 px-4 md:px-6 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex space-x-6 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-2 border-b-2 font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 ${
                activeTab === tab.id
                  ? 'border-[#D10057] text-white shadow-[0_15px_15px_-10px_rgba(209,0,87,0.3)]'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};

const PlaceholderView = ({ tabName, userName }) => (
  <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
    <div className="p-4 bg-slate-800/50 rounded-full mb-4 ring-1 ring-slate-700">
      <HardHat className="w-12 h-12 text-[#D10057] opacity-80" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">
      {tabName}
    </h3>
    <p className="text-slate-500 text-center max-w-md text-sm px-4">
      Módulo bajo mantenimiento de protocolos para{' '}
      <span className="text-slate-300 font-bold">{userName}</span>.
    </p>
  </div>
);
