import React from 'react';
import { Building2, Plus, Globe, Briefcase, FileSignature } from 'lucide-react';
import { THEME } from '../../config/constants';
import { useData } from '../../context/DataContext';
import { RestrictedView } from '../../components/shared/RestrictedView';
// 👇 INYECCIÓN: Importamos el ViewHeader para estandarizar el título
import { ViewHeader } from '../../components/shared/ViewHeader';

export const ContractListView = ({ currentSkin, onNavigate }) => {
  // 👇 INYECCIÓN APLICADA: Extraemos hasGlobalPermission
  const { contracts, sites, skins, hasGlobalPermission, currentUser, roles } =
    useData();

  const isSuperAdmin = currentUser?.contractId === 'c-001';

  // 👇 CORRECCIÓN APLICADA: Se evalúa contra el catálogo Global, no contra currentSkin
  if (!isSuperAdmin || !hasGlobalPermission('contract_view')) {
    // Si la skin es undefined o no existe, mandamos un nombre por defecto a la vista restringida
    return (
      <RestrictedView
        currentSkin={currentSkin || { name: 'Módulo Protegido' }}
      />
    );
  }

  // 👇 CORRECCIÓN APLICADA: Se evalúa la acción de crear usando el catálogo Global
  const canCreate = hasGlobalPermission('contract_create');

  const userRoleData = roles.find((r) => r.id === currentUser.roleId);
  const combinedAllowedSkins = [
    ...new Set([
      ...(currentUser.allowedSkins || []),
      ...(userRoleData?.skins || []),
    ]),
  ];

  const mySkins = skins.filter((s) => combinedAllowedSkins.includes(s.id));
  const mySiteIds = [...new Set(mySkins.map((s) => s.siteId))];
  const mySites = sites.filter((s) => mySiteIds.includes(s.id));
  const myContractIds = [...new Set(mySites.map((s) => s.contractId))];

  const visibleContracts = isSuperAdmin
    ? contracts
    : contracts.filter((c) => myContractIds.includes(c.id));

  const handleOpenCreate = (modo, title, contractId = null, siteId = null) => {
    if (modo === 'CONTRACT') {
      sessionStorage.removeItem('ContractCreateContext');
    } else {
      sessionStorage.setItem(
        'ContractCreateContext',
        JSON.stringify({ modo, contractId, siteId })
      );
    }
    onNavigate('contract_create', title, Plus);
  };

  return (
    <div className="p-8 pb-24 w-full h-full overflow-y-auto text-slate-200 custom-scrollbar animate-in fade-in">
      {/* 👇 ENCABEZADO Y BOTONES ESTANDARIZADOS */}
      <div className="relative w-full z-20">
        <ViewHeader title="Gestión de Contratos (SaaS)" icon={Building2} />

        <div className="absolute right-0 top-0 hidden sm:flex items-center gap-3">
          {canCreate && (
            <button
              onClick={() => handleOpenCreate('CONTRACT', 'Nuevo Contrato')}
              className={`${THEME.primary} ${THEME.primaryHover} text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm flex items-center gap-2 transition-transform hover:-translate-y-0.5`}
            >
              <Plus size={14} /> Nuevo Contrato
            </button>
          )}
        </div>
      </div>
      {/* 👆 FIN ENCABEZADO ESTANDARIZADO */}

      <div className="space-y-8">
        {visibleContracts.map((contract) => {
          const contractSites = (isSuperAdmin ? sites : mySites).filter(
            (s) => s.contractId === contract.id
          );

          return (
            <div
              key={contract.id}
              className={`${THEME.panel} rounded-xl border ${THEME.border} overflow-hidden shadow-xl`}
            >
              <div className="bg-[#0f1522] p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      {contract.companyName}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <FileSignature size={12} /> {contract.contractNumber}
                      </span>
                      <span>•</span>
                      <span>
                        Suscrito:{' '}
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                {contractSites.length === 0 && (
                  <p className="text-slate-500 text-sm italic col-span-full">
                    Este contrato aún no tiene marcas asignadas.
                  </p>
                )}

                {contractSites.map((site) => {
                  const siteSkins = (isSuperAdmin ? skins : mySkins).filter(
                    (sk) => sk.siteId === site.id
                  );

                  return (
                    <div
                      key={site.id}
                      className="bg-slate-800/30 border border-slate-700 rounded-lg p-5 relative overflow-hidden flex flex-col"
                    >
                      <div
                        className="absolute top-0 left-0 w-full h-1"
                        style={{
                          backgroundColor: site.colors?.primary || '#D10057',
                        }}
                      />
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#111827] p-2 rounded border border-slate-700 h-12 w-12 flex items-center justify-center">
                            <img
                              src={site.logo}
                              alt={site.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">
                              {site.name}
                            </h3>
                            <a
                              href={`https://${site.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Globe size={10} /> {site.url}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col mt-2">
                        <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest border-b border-slate-700 pb-1 flex justify-between items-center">
                          <span>Entornos Operativos ({siteSkins.length})</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-2">
                          {siteSkins.map((skin) => (
                            <div
                              key={skin.id}
                              className="flex items-center justify-between bg-[#111827] border border-slate-700 p-2 rounded-lg text-xs hover:border-slate-500 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-slate-800 border border-slate-600 flex items-center justify-center overflow-hidden shadow-inner shrink-0 relative">
                                  <img
                                    src={site.logo}
                                    alt={skin.code}
                                    className="w-full h-full object-contain p-1.5 opacity-90"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-white text-xs">
                                    {skin.code} - {skin.currency}
                                  </span>
                                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                                    Divisa
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end pr-1 overflow-hidden">
                                <span
                                  className="text-[10px] font-mono text-slate-400 truncate max-w-[80px]"
                                  title={skin.username}
                                >
                                  {skin.username}
                                </span>
                                <span className="text-[9px] text-slate-600 uppercase tracking-widest">
                                  Entorno
                                </span>
                              </div>
                            </div>
                          ))}

                          {canCreate && (
                            <button
                              onClick={() =>
                                handleOpenCreate(
                                  'SKIN',
                                  'Nuevo Entorno',
                                  contract.id,
                                  site.id
                                )
                              }
                              className="flex items-center justify-center gap-2 bg-slate-800/10 border-2 border-dashed border-slate-700 hover:border-[#D10057]/50 hover:bg-[#D10057]/5 p-2 rounded-lg text-xs transition-all group min-h-[58px]"
                            >
                              <Plus
                                size={16}
                                className="text-slate-500 group-hover:text-[#D10057]"
                              />
                              <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 uppercase tracking-wider">
                                Nuevo Entorno
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {canCreate && (
                  <button
                    onClick={() =>
                      handleOpenCreate('SITE', 'Nueva Marca', contract.id)
                    }
                    className="bg-slate-800/10 border-2 border-dashed border-slate-700 hover:border-[#D10057]/50 hover:bg-[#D10057]/5 rounded-lg p-5 flex flex-col items-center justify-center min-h-[220px] transition-all group"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-[#D10057]/20 transition-colors">
                      <Plus
                        size={32}
                        className="text-slate-500 group-hover:text-[#D10057]"
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-400 group-hover:text-white uppercase tracking-widest">
                      Agregar Nueva Marca
                    </span>
                    <span className="text-xs text-slate-600 mt-2 text-center max-w-[200px]">
                      Añade un nuevo frente comercial a este contrato.
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
