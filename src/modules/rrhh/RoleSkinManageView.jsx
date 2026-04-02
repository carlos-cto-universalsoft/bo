import React, { useState } from 'react';
import { Globe, Lock, Check, ShieldAlert } from 'lucide-react';
import { THEME } from '../../config/constants';
import { useData } from '../../context/DataContext';
import { ViewHeader } from '../../components/shared/ViewHeader';

export const RoleSkinManageView = ({
  onNavigate,
  onCloseTab,
  currentSkin,
  targetRole,
}) => {
  const { editRole, currentUser, hasGlobalPermission, roles, skins, sites } =
    useData();
  const [selectedSkins, setSelectedSkins] = useState(targetRole?.skins || []);

  const userRoleData = roles.find((r) => r.id === currentUser.roleId);
  const combinedAllowedSkins = [
    ...new Set([...currentUser.allowedSkins, ...(userRoleData?.skins || [])]),
  ];

  const isSuperAdmin = currentUser?.contractId === 'c-001';

  // 👇 INYECCIÓN 1: Deducción Arquitectónica del Contrato (Traduciendo Skin -> Site -> Contract)
  let exactTargetRoleContractId = targetRole?.contractId;
  
  if (!exactTargetRoleContractId) {
    if (targetRole?.id === '00001') {
      exactTargetRoleContractId = 'c-001';
    } else if (targetRole?.baseSkin) {
      const baseSkinObj = skins.find((s) => s.id === targetRole.baseSkin);
      if (baseSkinObj) {
        const parentSite = sites.find((site) => site.id === baseSkinObj.siteId);
        exactTargetRoleContractId = parentSite?.contractId;
      }
    }
  }

  // 👇 INYECCIÓN 2: Filtro B2B Estricto
  const assignableSkins = skins.filter((skin) => {
    const isAllowedByUser = combinedAllowedSkins.includes(skin.id);
    
    // Si el cargo es de Universal Soft (c-001), mostramos todo lo permitido para dar soporte global
    if (exactTargetRoleContractId === 'c-001') return isAllowedByUser;

    // Si el cargo es de un Cliente B2B (Ej. GoldenBet), buscamos el dueño de cada skin y filtramos
    if (exactTargetRoleContractId) {
      const parentSite = sites.find((s) => s.id === skin.siteId);
      const isSkinFromThisContract = parentSite && parentSite.contractId === exactTargetRoleContractId;
      return isAllowedByUser && isSkinFromThisContract;
    }

    return isAllowedByUser; // Fallback de seguridad
  });

  const hiddenSkinsCount = (targetRole?.skins || []).filter(
    (s) => !combinedAllowedSkins.includes(s)
  ).length;

  const skinsBySite = assignableSkins.reduce((acc, skin) => {
    const parentSite = sites.find((s) => s.id === skin.siteId);
    const siteName = parentSite ? parentSite.name : 'Otras Plataformas';

    if (!acc[siteName]) {
      acc[siteName] = { logo: parentSite?.logo, skins: [] };
    }
    acc[siteName].skins.push(skin);
    return acc;
  }, {});

  const getSkinLogo = (skinId) => {
    const skinObj = skins.find((s) => s.id === skinId);
    if (skinObj && skinObj.siteId && sites) {
      const parentSite = sites.find((s) => s.id === skinObj.siteId);
      if (parentSite && parentSite.logo) return parentSite.logo;
    }
    return skinObj?.site === 'XLIVE' ? '/logo-xlive.png' : '/ur-logo.png';
  };

  const toggleSkin = (skinId) => {
    setSelectedSkins((prev) =>
      prev.includes(skinId)
        ? prev.filter((id) => id !== skinId)
        : [...prev, skinId]
    );
  };

  const handleSave = () => {
    if (!hasGlobalPermission('rol_skin_act'))
      return alert(
        'Acceso Denegado: No tienes permiso de ACCIÓN para asignar o retirar países a un cargo.'
      );

    let updatedPermissions = { ...(targetRole?.permissions || {}) };
    const oldSkins = targetRole?.skins || [];
    const newSkins = selectedSkins.filter(
      (skinId) => !oldSkins.includes(skinId)
    );

    if (newSkins.length > 0 && oldSkins.length > 0) {
      const baseSkin = oldSkins[0];
      const basePermissions = updatedPermissions[baseSkin] || {};
      newSkins.forEach((newSkinId) => {
        updatedPermissions[newSkinId] = { ...basePermissions };
      });
    }

    editRole({
      ...targetRole,
      skins: selectedSkins,
      permissions: updatedPermissions,
      contractId: exactTargetRoleContractId, // 👇 INYECCIÓN 3: Persistencia del dueño del cargo
    });
    onNavigate('role_list', 'Listar Cargos', Globe);
    if (onCloseTab) onCloseTab();
  };

  if (!targetRole) return <div className="p-8 text-white">Cargando...</div>;

  if (targetRole.id === currentUser.roleId) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center border-2 border-amber-500/50 mb-6 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
          <Lock size={48} className="text-amber-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Inmutabilidad de Sesión
        </h2>
        <p className="text-slate-400 max-w-md text-sm mb-8 leading-relaxed">
          Por normativas de seguridad y auditoría, no puedes modificar la
          cobertura geográfica del cargo que tienes asignado actualmente. Debes
          utilizar un rol con privilegios superiores o solicitar el cambio a un
          administrador jerárquico.
        </p>
        <button
          onClick={() => {
            onNavigate('role_list', 'Listar Cargos', Globe);
            if (onCloseTab) onCloseTab();
          }}
          className={`${THEME.primary} ${THEME.primaryHover} px-8 py-3 rounded-xl text-white font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95`}
        >
          Volver a Directorio de Cargos
        </button>
      </div>
    );
  }

  if (targetRole.id === '00001' && !isSuperAdmin) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/50 mb-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <ShieldAlert size={48} className="text-red-500 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Inmunidad de Sistema
        </h2>
        <p className="text-slate-400 max-w-md text-sm mb-8 leading-relaxed">
          Has intentado acceder a la cobertura geográfica de un cargo reservado
          para la administración central (Nivel 1). Esta acción ha sido
          bloqueada.
        </p>
        <button
          onClick={() => {
            onNavigate('role_list', 'Listar Cargos', Globe);
            if (onCloseTab) onCloseTab();
          }}
          className={`${THEME.primary} ${THEME.primaryHover} px-8 py-3 rounded-xl text-white font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95`}
        >
          Volver a Directorio de Cargos
        </button>
      </div>
    );
  }

  // 👇 INYECCIÓN 4: Actualización del control Zero Trust con la nueva variable
  if (!isSuperAdmin && exactTargetRoleContractId !== currentUser.contractId) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/50 mb-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <ShieldAlert size={48} className="text-red-500 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Violación de Entorno B2B
        </h2>
        <p className="text-slate-400 max-w-md text-sm mb-8 leading-relaxed">
          Acceso denegado. Este cargo pertenece a otra empresa o entidad dentro
          de la red. El principio Zero Trust ha bloqueado esta operación.
        </p>
        <button
          onClick={() => {
            onNavigate('role_list', 'Listar Cargos', Globe);
            if (onCloseTab) onCloseTab();
          }}
          className={`${THEME.primary} ${THEME.primaryHover} px-8 py-3 rounded-xl text-white font-bold text-sm shadow-xl transition-all`}
        >
          Volver a Directorio de Cargos
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-24 w-full h-full mx-auto overflow-y-auto text-slate-200 custom-scrollbar flex flex-col">
      <ViewHeader
        title={`Cobertura Geográfica: ${targetRole.name}`}
        icon={Globe}
        currentSkin={currentSkin}
      />
      <div
        className={`${THEME.panel} p-8 rounded-xl border ${THEME.border} shadow-xl`}
      >
        <div className="mb-6 text-center">
          <h3 className="text-white font-bold text-lg mb-2">
            Asignar Skin Inicial
          </h3>
          <p className="text-slate-400 text-xs">
            Seleccione las unidades de negocio permitidas en su jurisdicción.
          </p>
        </div>

        {hiddenSkinsCount > 0 && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
            <Lock size={14} />{' '}
            <span>
              Este cargo posee <b>{hiddenSkinsCount} skin(s) globales</b> que no
              puedes visualizar ni modificar.
            </span>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(skinsBySite).map(([siteName, siteData]) => (
            <div
              key={siteName}
              className="bg-[#0f1522] rounded-lg p-4 border border-slate-800/50"
            >
              <div className="flex items-center gap-2 mb-4 opacity-70">
                {siteData.logo && (
                  <img
                    src={siteData.logo}
                    alt="Logo"
                    className="w-5 h-5 object-contain grayscale"
                  />
                )}
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {siteName}
                </h5>
              </div>

              <div className="flex flex-wrap gap-3">
                {siteData.skins.map((skin) => {
                  const isSelected = selectedSkins.includes(skin.id);
                  return (
                    <div
                      key={skin.id}
                      onClick={() => toggleSkin(skin.id)}
                      className={`cursor-pointer p-2.5 rounded-xl border transition-all flex items-center gap-3 w-48 select-none ${
                        isSelected
                          ? 'bg-[#D10057]/10 border-[#D10057] shadow-[0_0_15px_rgba(209,0,87,0.15)] scale-105'
                          : 'bg-[#111827] border-slate-700 hover:border-slate-500 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={getSkinLogo(skin.id)}
                          alt={skin.site}
                          className="w-6 h-6 object-contain"
                        />
                        <span className="absolute -bottom-1.5 -right-1.5 bg-[#0B1120] text-slate-300 font-mono text-[8px] uppercase font-bold px-1 rounded border border-slate-600 z-10">
                          {skin.code}
                        </span>
                      </div>
                      <div className="text-left overflow-hidden ml-2 flex-1">
                        <div
                          className={`font-bold text-[11px] truncate uppercase leading-tight ${
                            isSelected ? 'text-[#D10057]' : 'text-slate-300'
                          }`}
                          title={siteName}
                        >
                          {siteName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {skin.currency}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="ml-auto bg-[#D10057] rounded-full p-0.5 shrink-0">
                          <Check
                            size={10}
                            className="text-white"
                            strokeWidth={4}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {Object.keys(skinsBySite).length === 0 && (
             <div className="p-4 text-center text-slate-500 text-xs italic border border-dashed border-slate-800 rounded-xl">
               No hay skins (entornos operativos) disponibles para esta empresa.
             </div>
          )}

        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-[#111827] border-t border-slate-800 p-4 flex justify-end gap-3 z-50 shadow-2xl">
        <button
          onClick={() => onCloseTab()}
          className="px-6 py-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="bg-[#D10057] px-8 py-2 rounded-lg text-white font-bold text-xs shadow-lg uppercase tracking-widest hover:bg-[#b00049] transition-colors"
        >
          Actualizar Cobertura
        </button>
      </div>
    </div>
  );
};