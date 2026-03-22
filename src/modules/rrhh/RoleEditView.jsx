import React, { useState } from 'react';
import {
  Edit3,
  Lock,
  AlertCircle,
  Shield,
  Check,
  ChevronDown,
  ShieldAlert,
  Globe,
  Settings,
  CheckSquare,
  Map,
  Briefcase,
} from 'lucide-react';
import { THEME, GLOBAL_CATALOG, LOCAL_CATALOG } from '../../config/constants';
import { useData } from '../../context/DataContext';
import { ViewHeader } from '../../components/shared/ViewHeader';
import { PermissionGrid } from '../../components/shared/PermissionGrid';

export const RoleEditView = ({
  onNavigate,
  onCloseTab,
  currentSkin,
  targetRole,
}) => {
  const { editRole, currentUser, hasGlobalPermission, roles, skins, sites } =
    useData();

  // 1. Estados Básicos
  const [name, setName] = useState(targetRole?.name || '');
  const [desc, setDesc] = useState(targetRole?.description || '');
  const [expandedModule, setExpandedModule] = useState(null);

  // 2. Estados de Seguridad Separados (ARQUITECTURA DUAL)
  const [globalPermissions, setGlobalPermissions] = useState(
    targetRole?.globalPermissions || {}
  );
  const [skinPermissions, setSkinPermissions] = useState(
    targetRole?.skinPermissions || {}
  );

  const userRoleData = roles.find((r) => r.id === currentUser.roleId);
  const combinedAllowedSkins = [
    ...new Set([...currentUser.allowedSkins, ...(userRoleData?.skins || [])]),
  ];

  const isSuperAdmin = currentUser?.roleId === '00001';

  const isPartialEditor =
    targetRole?.origin === 'Predefinido' ||
    (targetRole?.skins || []).length === 0 ||
    (targetRole?.skins || []).some(
      (skinId) => !combinedAllowedSkins.includes(skinId)
    );

  const cargoSkins = skins.filter(
    (s) =>
      (targetRole?.skins || []).includes(s.id) &&
      combinedAllowedSkins.includes(s.id)
  );

  const [selectedSkinId, setSelectedSkinId] = useState(
    cargoSkins.length > 0 ? cargoSkins[0].id : ''
  );

  // Agrupamos las skins por Site (Marca) para la matriz visual
  const skinsBySite = cargoSkins.reduce((acc, skin) => {
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

  // Manejadores de Permisos DUALES
  const toggleGlobalPermission = (skinIdIgnored, permId) => {
    setGlobalPermissions((prev) => ({
      ...prev,
      [permId]: !prev[permId],
    }));
  };

  const toggleGlobalModulePermissions = (e, module, isAllSelected) => {
    e.stopPropagation();
    setGlobalPermissions((prev) => {
      const next = { ...prev };
      module.permissions.forEach((p) => {
        next[p.id] = !isAllSelected;
      });
      return next;
    });
  };

  const toggleLocalPermission = (skinId, permId) => {
    setSkinPermissions((prev) => ({
      ...prev,
      [skinId]: {
        ...(prev[skinId] || {}),
        [permId]: !prev[skinId]?.[permId],
      },
    }));
  };

  const toggleLocalModulePermissions = (e, module, isAllSelected) => {
    e.stopPropagation();
    if (!selectedSkinId) return;
    setSkinPermissions((prev) => {
      const skinPerms = { ...(prev[selectedSkinId] || {}) };
      module.permissions.forEach((p) => {
        skinPerms[p.id] = !isAllSelected;
      });
      return { ...prev, [selectedSkinId]: skinPerms };
    });
  };

  // 🛡️ REGLA DE SEGURIDAD L1 vs L2 (TENANT ISOLATION)
  const allowedGlobalModules = GLOBAL_CATALOG.filter((modulo) => {
    if (targetRole?.contractId === 'c-001') return true;
    return modulo.isAdminOnly !== true;
  });

  const handleSave = () => {
    if (!hasGlobalPermission('rol_edit_act'))
      return alert(
        'Acceso Denegado: No tienes permiso de ACCIÓN para modificar la matriz de seguridad.'
      );
    if (!name) return alert('El nombre del cargo es obligatorio.');

    editRole({
      ...targetRole,
      name,
      description: desc,
      globalPermissions,
      skinPermissions,
    });
    onNavigate('role_list', 'Listar Cargos', Edit3);
    if (onCloseTab) onCloseTab();
  };

  if (!targetRole)
    return (
      <div className="p-8 text-white text-center font-bold">
        Cargando datos del cargo...
      </div>
    );

  // 👇 INYECCIÓN ZERO TRUST: Bloqueo Vertical (Nivel 1)
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
          Has intentado acceder a la matriz de seguridad de un cargo reservado
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

  // 👇 INYECCIÓN ZERO TRUST: Bloqueo Horizontal B2B (Muro entre inquilinos)
  const targetRoleSkinObj = skins.find((s) => s.id === targetRole.baseSkin);
  const targetRoleContractId =
    targetRole.contractId ||
    (targetRole.id === '00001' ? 'c-001' : targetRoleSkinObj?.contractId);

  if (!isSuperAdmin && targetRoleContractId !== currentUser.contractId) {
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
          className={`${THEME.primary} ${THEME.primaryHover} px-8 py-3 rounded-xl text-white font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95`}
        >
          Volver a Directorio de Cargos
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-24 w-full h-full mx-auto overflow-y-auto text-slate-200 custom-scrollbar flex flex-col">
      <ViewHeader
        title={`Gestionar Cargo: ${targetRole.name}`}
        icon={Edit3}
        currentSkin={currentSkin}
      />

      {/* BLOQUE 1: Datos Generales */}
      <div
        className={`${THEME.panel} p-6 rounded-xl border ${THEME.border} shadow-xl mb-6`}
      >
        <h4 className="text-[#D10057] font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
          <Briefcase size={18} /> Datos Generales del Cargo
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-slate-500 text-[10px] font-bold mb-1 block uppercase tracking-widest">
              Nombre del Cargo *
            </label>
            <input
              autoFocus
              value={name}
              disabled={isPartialEditor}
              onChange={(e) => setName(e.target.value)}
              className={`${THEME.input} w-full p-3 rounded-lg font-bold text-base`}
              placeholder="Ej: Supervisor Regional"
            />
            {isPartialEditor && (
              <div className="text-amber-500 text-[10px] mt-1 flex items-center gap-1">
                <Lock size={10} /> Campos globales bloqueados por jurisdicción.
              </div>
            )}
          </div>
          <div>
            <label className="text-slate-500 text-[10px] font-bold mb-1 block uppercase tracking-widest">
              Descripción
            </label>
            <input
              value={desc}
              disabled={isPartialEditor}
              onChange={(e) => setDesc(e.target.value)}
              className={`${THEME.input} w-full p-3 rounded-lg`}
              placeholder="Responsabilidades del cargo..."
            />
          </div>
        </div>
      </div>

      {/* BLOQUE 2: Permisos Globales (Nivel Empresa) */}
      <div
        className={`${THEME.panel} p-6 rounded-xl border ${THEME.border} shadow-xl mb-6`}
      >
        <h4 className="text-[#D10057] font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
          <Globe size={18} /> Permisos Globales (Nivel Empresa)
        </h4>
        <p className="text-[11px] text-slate-500 mb-6 uppercase tracking-widest">
          Módulos administrativos que aplican a toda la operación, sin importar
          la Skin.
        </p>

        <div className="space-y-4">
          {allowedGlobalModules.map((module) => {
            const isOpen = expandedModule === module.id;
            const modulePermIds = module.permissions.map((p) => p.id);
            const selectedCount = modulePermIds.filter(
              (id) => globalPermissions[id]
            ).length;
            const isAllSelected =
              selectedCount === modulePermIds.length &&
              modulePermIds.length > 0;
            const isPartial =
              selectedCount > 0 && selectedCount < modulePermIds.length;

            return (
              <div
                key={module.id}
                className={`${THEME.bg} rounded-xl border ${THEME.border} overflow-hidden shadow-md`}
              >
                <div
                  onClick={() => setExpandedModule(isOpen ? null : module.id)}
                  className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors ${
                    isOpen ? 'bg-slate-800/30' : ''
                  }`}
                >
                  <span className="font-bold text-white flex items-center gap-3 text-xs uppercase tracking-widest">
                    {module.title}
                  </span>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) =>
                        toggleGlobalModulePermissions(e, module, isAllSelected)
                      }
                      className={`w-9 h-5 rounded-full relative transition-colors border border-slate-700 ${
                        isAllSelected
                          ? 'bg-[#D10057] border-[#D10057]'
                          : isPartial
                          ? 'bg-amber-500 border-amber-500'
                          : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`absolute top-[1px] left-[2px] bg-white w-4 h-4 rounded-full transition-transform shadow-md ${
                          isAllSelected || isPartial
                            ? 'translate-x-[16px]'
                            : 'translate-x-0'
                        }`}
                      ></div>
                    </button>
                    <ChevronDown
                      size={18}
                      className={
                        isOpen
                          ? 'rotate-180 transition-transform text-[#D10057]'
                          : 'transition-transform text-slate-500'
                      }
                    />
                  </div>
                </div>
                {isOpen && (
                  <PermissionGrid
                    module={module}
                    rolePermissions={{ global: globalPermissions }}
                    selectedSkinId="global"
                    togglePermission={toggleGlobalPermission}
                  />
                )}
              </div>
            );
          })}
          {allowedGlobalModules.length === 0 && (
            <div className="p-4 text-center text-slate-500 text-xs italic border border-dashed border-slate-800 rounded-xl">
              No hay módulos globales disponibles para esta empresa.
            </div>
          )}
        </div>
      </div>

      {/* BLOQUE 3: Asignación de Skin */}
      <div
        className={`${THEME.panel} p-6 rounded-xl border ${THEME.border} shadow-xl mb-6`}
      >
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-2">
          <label className="text-[#D10057] font-bold flex items-center gap-2">
            <Map size={18} /> Asignar Skin Inicial (Opcional)
          </label>
          <button
            onClick={() => setSelectedSkinId('')}
            className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 px-3 py-1.5 rounded transition-colors"
          >
            Deseleccionar (Enviar al Limbo)
          </button>
        </div>

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
                {siteData.skins.map((skin) => (
                  <div
                    key={skin.id}
                    onClick={() => setSelectedSkinId(skin.id)}
                    className={`cursor-pointer p-2.5 rounded-xl border transition-all flex items-center gap-3 w-48 select-none ${
                      selectedSkinId === skin.id
                        ? 'bg-[#D10057]/10 border-[#D10057] shadow-[0_0_15px_rgba(209,0,87,0.15)]'
                        : 'bg-[#111827] border-slate-700 hover:border-slate-500'
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
                          selectedSkinId === skin.id
                            ? 'text-[#D10057]'
                            : 'text-slate-300'
                        }`}
                        title={siteName}
                      >
                        {siteName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {skin.currency}
                      </div>
                    </div>
                    {selectedSkinId === skin.id && (
                      <div className="ml-auto bg-[#D10057] rounded-full p-0.5 shrink-0">
                        <Check
                          size={10}
                          className="text-white"
                          strokeWidth={4}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BLOQUE 4: Matriz de Permisos Filtrada */}
      {selectedSkinId ? (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <h3 className="text-[#D10057] font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Settings size={18} /> Matriz de Permisos para{' '}
            {skins.find((s) => s.id === selectedSkinId)?.name}
          </h3>
          <div className="space-y-4">
            {LOCAL_CATALOG.map((module) => {
              const isOpen = expandedModule === module.id;
              const modulePermIds = module.permissions.map((p) => p.id);
              const selectedCount = modulePermIds.filter(
                (id) => (skinPermissions[selectedSkinId] || {})[id]
              ).length;
              const isAllSelected =
                selectedCount === modulePermIds.length &&
                modulePermIds.length > 0;
              const isPartial =
                selectedCount > 0 && selectedCount < modulePermIds.length;

              return (
                <div
                  key={module.id}
                  className={`${THEME.panel} rounded-xl border ${THEME.border} overflow-hidden shadow-md`}
                >
                  <div
                    onClick={() => setExpandedModule(isOpen ? null : module.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors ${
                      isOpen ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    <span className="font-bold text-white flex items-center gap-3 text-xs uppercase tracking-widest">
                      {module.title}
                    </span>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) =>
                          toggleLocalModulePermissions(e, module, isAllSelected)
                        }
                        className={`w-9 h-5 rounded-full relative transition-colors border border-slate-700 ${
                          isAllSelected
                            ? 'bg-[#D10057] border-[#D10057]'
                            : isPartial
                            ? 'bg-amber-500 border-amber-500'
                            : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`absolute top-[1px] left-[2px] bg-white w-4 h-4 rounded-full transition-transform shadow-md ${
                            isAllSelected || isPartial
                              ? 'translate-x-[16px]'
                              : 'translate-x-0'
                          }`}
                        ></div>
                      </button>
                      <ChevronDown
                        size={18}
                        className={
                          isOpen
                            ? 'rotate-180 transition-transform text-[#D10057]'
                            : 'transition-transform text-slate-500'
                        }
                      />
                    </div>
                  </div>
                  {isOpen && (
                    <PermissionGrid
                      module={module}
                      rolePermissions={skinPermissions}
                      selectedSkinId={selectedSkinId}
                      togglePermission={toggleLocalPermission}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center p-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30 mt-auto">
          <Globe size={48} className="mx-auto text-slate-700 mb-4" />
          <h3 className="text-slate-400 font-bold text-lg">
            Cargo Global (En el Limbo)
          </h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            No has seleccionado ninguna Skin. Los permisos operativos deberán
            ser asignados después.
          </p>
        </div>
      )}

      {/* BARRA DE ACCIÓN FIJA */}
      <div className="fixed bottom-0 left-0 w-full bg-[#111827] border-t border-slate-800 p-4 flex justify-end gap-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => onCloseTab()}
          className="px-6 py-2.5 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors border border-transparent hover:border-slate-700 rounded-lg"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="bg-[#D10057] px-10 py-2.5 rounded-lg text-white font-bold text-xs shadow-lg shadow-[#D10057]/20 uppercase tracking-widest hover:bg-[#b00049] transition-colors"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};
