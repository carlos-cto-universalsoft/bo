import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Database,
  ChevronDown,
  Briefcase,
  Shield,
  UserPlus,
  Globe,
  X,
  UserCog,
  LogOut,
  Store,
  Check,
  Plus,
  Building2,
  Settings,
} from 'lucide-react';

import { THEME } from './config/constants';
import { DataProvider, useData } from './context/DataContext';

import { ScrollbarStyle } from './components/shared/ScrollbarStyle';
import { MegaLink } from './components/shared/MegaLink';
import { NavBtn } from './components/shared/NavBtn';
import { RestrictedView } from './components/shared/RestrictedView';

import { LoginView } from './modules/auth/LoginView';
import { DashboardView } from './modules/dashboard/DashboardView';

import { EmployeeListView } from './modules/rrhh/EmployeeListView';
import { EmployeeCreateView } from './modules/rrhh/EmployeeCreateView';
import { RoleListView } from './modules/rrhh/RoleListView';
import { RoleEditView } from './modules/rrhh/RoleEditView';
import { RoleCreateView } from './modules/rrhh/RoleCreateView';
import { RoleSkinManageView } from './modules/rrhh/RoleSkinManageView';
import { AssignRoleView } from './modules/rrhh/AssignRoleView';

import { NetworkCreateView } from './modules/network/NetworkCreateView';
import { NetworkListView } from './modules/network/NetworkListView';
import { NetworkProfileView } from './modules/network/NetworkProfileView';

import { ContractListView } from './modules/contracts/ContractListView';
import { ContractCreateView } from './modules/contracts/ContractCreateView';

import LogoUniversal from './assets/BOLA-UNIVERSAL.png';

// DICCIONARIO: Transforma el código en el nombre completo del país
const getCountryName = (code) => {
  const map = {
    PE: 'Perú',
    CO: 'Colombia',
    MX: 'México',
    EC: 'Ecuador',
    CL: 'Chile',
    AR: 'Argentina',
    BR: 'Brasil',
    UY: 'Uruguay',
    PY: 'Paraguay',
    BO: 'Bolivia',
    VE: 'Venezuela',
    CR: 'Costa Rica',
    PA: 'Panamá',
    DO: 'Rep. Dominicana',
    US: 'Estados Unidos',
  };
  return map[code?.toUpperCase()] || code;
};

// 👇 NUEVA FUNCIÓN: Detecta si la pestaña activa pertenece a un módulo Global
const isGlobalTab = (tabId) => {
  if (!tabId) return false;
  const globalPrefixes = ['employee_', 'role_', 'assign_role', 'contract_'];
  return globalPrefixes.some((prefix) => tabId.startsWith(prefix));
};

const TopNavigation = ({
  onOpenTab,
  activeTabId,
  activeTabSkin,
  onSkinChange,
  currentUser,
  onLogout,
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [skinMenuOpen, setSkinMenuOpen] = useState(false);
  const [expandedSite, setExpandedSite] = useState(null);

  const { hasPermission, hasGlobalPermission, sites, skins, roles } = useData();

  const userRoleData = roles.find((r) => r.id === currentUser.roleId);
  const combinedAllowedSkinIds = [
    ...new Set([
      ...(currentUser.allowedSkins || []),
      ...(userRoleData?.skins || []),
    ]),
  ];

  const allowedSkinObjects = skins.filter((s) =>
    combinedAllowedSkinIds.includes(s.id)
  );

  const getSkinLogo = (skinId, fallbackSite) => {
    if (!skinId)
      return fallbackSite === 'XLIVE' ? '/logo-xlive.png' : '/ur-logo.png';
    const skinObj = skins.find((s) => s.id === skinId);
    if (skinObj && skinObj.siteId && sites) {
      const parentSite = sites.find((s) => s.id === skinObj.siteId);
      if (parentSite && parentSite.logo) return parentSite.logo;
    }
    return fallbackSite === 'XLIVE' ? '/logo-xlive.png' : '/ur-logo.png';
  };

  const isSuperAdmin = currentUser?.contractId === 'c-001';

  const skinsBySite = allowedSkinObjects.reduce((acc, skin) => {
    const parentSite = sites?.find((s) => s.id === skin.siteId);
    const siteName = parentSite?.name || skin.site || 'UniversalSoft';
    const siteLogo = parentSite?.logo || getSkinLogo(skin.id, skin.site);

    if (!acc[siteName])
      acc[siteName] = { name: siteName, logo: siteLogo, skins: [] };
    acc[siteName].skins.push(skin);
    return acc;
  }, {});

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!skinMenuOpen && activeTabSkin) {
      const activeSiteName =
        sites?.find((s) => s.id === activeTabSkin.siteId)?.name ||
        activeTabSkin.site ||
        'UniversalSoft';
      setExpandedSite(activeSiteName);
    }
    setSkinMenuOpen(!skinMenuOpen);
  };

  const toggleSite = (e, siteName) => {
    e.stopPropagation();
    setExpandedSite(expandedSite === siteName ? null : siteName);
  };

  const isGlobalMode = isGlobalTab(activeTabId);

  // Validamos si es un usuario puramente global para evitar que intente ir al Dashboard local
  const isGlobalOnlyUser = allowedSkinObjects.length === 0;

  return (
    <nav className="h-[72px] bg-[#111827] border-b border-slate-800 flex items-center px-6 sticky top-0 z-50 shadow-lg select-none text-slate-200">
      <div
        className="flex items-center gap-3 mr-10 cursor-pointer group h-full"
        onClick={() => {
          if (!isGlobalOnlyUser)
            onOpenTab('dashboard', 'Dashboard', LayoutDashboard);
        }}
      >
        <img
          src={LogoUniversal}
          alt="UniversalSoft Logo"
          className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
        />
        <div className="flex flex-col justify-center h-full relative">
          <span className="text-white font-bold tracking-tight leading-tight">
            UNIVERSAL<span className="text-[#D10057]">SOFT</span>
          </span>
          <div>
            {isGlobalMode ? (
              <div className="flex items-center justify-center gap-1 mt-0.5 text-[10px] text-slate-300 cursor-default rounded px-1 py-0.5 -ml-1 w-max">
                <Globe size={11} className="text-[#D10057]" />
                <span className="font-bold tracking-wider">
                  Permisos Globales
                </span>
              </div>
            ) : (
              <div
                onClick={toggleMenu}
                className={`flex items-center justify-center gap-1 mt-0.5 text-[10px] transition-colors cursor-pointer rounded px-1 py-0.5 -ml-1 w-max ${
                  skinMenuOpen
                    ? 'text-white bg-slate-800/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <img
                  src={getSkinLogo(activeTabSkin?.id, activeTabSkin?.site)}
                  alt="Skin Activa"
                  className="w-3 h-3 object-contain opacity-70"
                />
                <span className="font-medium ml-1">
                  {activeTabSkin?.name || 'Cargando...'}
                </span>
                <ChevronDown
                  size={10}
                  className={`ml-1 transition-transform ${
                    skinMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            )}

            {skinMenuOpen && !isGlobalMode && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 bg-[#111827] border border-slate-800 border-t-transparent rounded-b-xl rounded-t-none shadow-[0_15px_40px_-10px_rgba(0,0,0,0.5)] z-[100] p-2 animate-in fade-in slide-in-from-top-2 max-h-[60vh] overflow-y-auto custom-scrollbar cursor-default w-64"
                onClick={(e) => e.stopPropagation()}
                style={{ marginTop: '-1px' }}
              >
                <div className="flex flex-col gap-1 pt-1">
                  {Object.values(skinsBySite).map((siteGroup) => {
                    const isExpanded = expandedSite === siteGroup.name;
                    return (
                      <div
                        key={siteGroup.name}
                        className="flex flex-col rounded-lg overflow-hidden bg-slate-800/20 border border-slate-700/50"
                      >
                        <button
                          onClick={(e) => toggleSite(e, siteGroup.name)}
                          className={`w-full flex items-center justify-between p-3 text-[12px] text-left transition-colors ${
                            isExpanded
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={siteGroup.logo}
                              alt={siteGroup.name}
                              className="w-4 h-4 object-contain shrink-0"
                            />
                            <span className="font-bold truncate">
                              {siteGroup.name}
                            </span>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`text-slate-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-[#D10057]' : ''
                            }`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="flex flex-col gap-0.5 p-1.5 bg-[#0f1522]">
                            {siteGroup.skins.map((skin) => (
                              <button
                                key={skin.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSkinChange(skin);
                                  setSkinMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-md text-[11px] text-left transition-colors ${
                                  activeTabSkin?.id === skin.id
                                    ? 'bg-[#D10057]/10 text-[#D10057] font-bold'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center truncate pr-2 pl-1">
                                  <span className="truncate">
                                    {getCountryName(skin.code)}
                                  </span>
                                </div>
                                <div className="flex items-center shrink-0">
                                  <span
                                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                      activeTabSkin?.id === skin.id
                                        ? 'bg-[#D10057] border-[#D10057] text-white shadow-md'
                                        : 'bg-slate-900 border-slate-700/50 text-slate-500'
                                    }`}
                                  >
                                    {skin.currency}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-2">
        {!isGlobalOnlyUser && (
          <NavBtn
            label="Dashboard"
            icon={LayoutDashboard}
            active={activeTabId === 'dashboard'}
            onClick={() => onOpenTab('dashboard', 'Dashboard', LayoutDashboard)}
          />
        )}

        {hasGlobalPermission('rrhh_menu_root') && (
          <div
            className="h-full flex items-center relative"
            onMouseEnter={() => setActiveMenu('rrhh')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeMenu === 'rrhh'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users size={16} /> RRHH{' '}
              <ChevronDown
                size={14}
                className={
                  activeMenu === 'rrhh'
                    ? 'rotate-180 transition-transform'
                    : 'transition-transform'
                }
              />
            </button>
            {activeMenu === 'rrhh' && (
              <div className="absolute top-full left-0 w-[550px] bg-[#111827] border border-slate-800 shadow-2xl z-50 rounded-b-xl grid grid-cols-2 gap-4 p-6 border-t border-t-slate-700 animate-in fade-in">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                    Gestión de Talentos
                  </h3>
                  <MegaLink
                    icon={FileText}
                    title="Listar Empleados"
                    desc="Ver directorio"
                    disabled={!hasGlobalPermission('emp_nav_list')}
                    onClick={() => {
                      onOpenTab('employee_list', 'Listar Empleados', FileText);
                      setActiveMenu(null);
                    }}
                  />
                  <MegaLink
                    icon={UserPlus}
                    title="Crear Empleado"
                    desc="Alta de nuevo usuario"
                    disabled={!hasGlobalPermission('emp_nav_create')}
                    onClick={() => {
                      onOpenTab('employee_create', 'Crear Empleado', UserPlus);
                      setActiveMenu(null);
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                    Estructura & Roles
                  </h3>
                  <MegaLink
                    icon={Briefcase}
                    title="Listar Cargos"
                    desc="Tabla de cargos"
                    disabled={!hasGlobalPermission('rol_nav_list')}
                    onClick={() => {
                      onOpenTab('role_list', 'Listar Cargos', Briefcase);
                      setActiveMenu(null);
                    }}
                  />
                  <MegaLink
                    icon={Shield}
                    title="Crear Cargo"
                    desc="Nuevo perfil"
                    disabled={!hasGlobalPermission('rol_nav_create')}
                    onClick={() => {
                      onOpenTab('role_create', 'Crear Cargo', Shield);
                      setActiveMenu(null);
                    }}
                  />
                  <MegaLink
                    icon={UserCog}
                    title="Asignar Cargos"
                    desc="Vincular cargos a empleados"
                    disabled={!hasGlobalPermission('assig_nav')}
                    onClick={() => {
                      onOpenTab('assign_role', 'Asignar Cargos', UserCog);
                      setActiveMenu(null);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {hasPermission(activeTabSkin?.id, 'net_menu_root') &&
          !isGlobalOnlyUser && (
            <div
              className="h-full flex items-center relative"
              onMouseEnter={() => setActiveMenu('network')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeMenu === 'network'
                    ? 'text-white bg-slate-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store size={16} /> Red de Negocios{' '}
                <ChevronDown
                  size={14}
                  className={
                    activeMenu === 'network'
                      ? 'rotate-180 transition-transform'
                      : 'transition-transform'
                  }
                />
              </button>
              {activeMenu === 'network' && (
                <div className="absolute top-full left-0 w-[300px] bg-[#111827] border border-slate-800 shadow-2xl z-50 rounded-b-xl p-6 border-t border-t-slate-700 animate-in fade-in">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                    Gestión Retail
                  </h3>
                  <div className="flex flex-col gap-2">
                    <MegaLink
                      icon={Database}
                      title="Listar Red"
                      desc="Directorio y Billeteras"
                      disabled={
                        !hasPermission(activeTabSkin?.id, 'net_nav_list')
                      }
                      onClick={() => {
                        onOpenTab('network_list', 'Listar Red', Database);
                        setActiveMenu(null);
                      }}
                    />
                    <MegaLink
                      icon={Plus}
                      title="Crear Red"
                      desc="Alta de nuevo punto retail"
                      disabled={
                        !hasPermission(activeTabSkin?.id, 'net_nav_create')
                      }
                      onClick={() => {
                        onOpenTab('network_create', 'Crear Red', Plus);
                        setActiveMenu(null);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        {isSuperAdmin && hasGlobalPermission('contract_view') && (
          <div
            className="h-full flex items-center relative"
            onMouseEnter={() => setActiveMenu('config')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeMenu === 'config'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings size={16} className="text-[#D10057]" /> Configuración{' '}
              <ChevronDown
                size={14}
                className={
                  activeMenu === 'config'
                    ? 'rotate-180 transition-transform'
                    : 'transition-transform'
                }
              />
            </button>
            {activeMenu === 'config' && (
              <div className="absolute top-full left-0 w-[300px] bg-[#111827] border border-slate-800 shadow-2xl z-50 rounded-b-xl p-6 border-t border-t-slate-700 animate-in fade-in">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                  Panel Administrativo Nivel 1
                </h3>
                <div className="flex flex-col gap-2">
                  <MegaLink
                    icon={Building2}
                    title="Contratos"
                    desc="Gestión de Clientes y Sites"
                    disabled={!hasGlobalPermission('contract_view')}
                    onClick={() => {
                      onOpenTab('contract_list', 'Contratos', Building2);
                      setActiveMenu(null);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end hidden md:flex">
          <span className="text-xs font-bold text-white">
            {currentUser.name}
          </span>
          <span className="text-[10px] text-[#D10057] uppercase tracking-wider font-bold">
            {currentUser.role}
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-white border border-slate-700 shadow-md">
          {currentUser.initials}
        </div>
        <button
          onClick={onLogout}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Cerrar Sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

const TabBar = ({ tabs, activeTabId, onSelectTab, onCloseTab }) => {
  const { sites, skins } = useData();

  const getSkinLogo = (skinId, fallbackSite) => {
    if (!skinId)
      return fallbackSite === 'XLIVE' ? '/logo-xlive.png' : '/ur-logo.png';
    const skinObj = skins.find((s) => s.id === skinId);
    if (skinObj && skinObj.siteId && sites) {
      const parentSite = sites.find((s) => s.id === skinObj.siteId);
      if (parentSite && parentSite.logo) return parentSite.logo;
    }
    return fallbackSite === 'XLIVE' ? '/logo-xlive.png' : '/ur-logo.png';
  };

  if (tabs.length === 0) return null;
  return (
    <div className="h-[40px] bg-[#0B1120] border-b border-slate-800 flex items-end px-2 overflow-x-auto gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTabId;
        const isGlobal = isGlobalTab(tab.id);

        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative h-[34px] px-4 min-w-[140px] max-w-[200px] flex items-center justify-between rounded-t-lg cursor-pointer text-[11px] font-medium transition-all select-none ${
              isActive ? THEME.tabActive : THEME.tabInactive
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {isGlobal ? (
                <Globe
                  size={12}
                  className={isActive ? 'text-[#D10057]' : 'text-slate-500'}
                />
              ) : (
                <img
                  src={getSkinLogo(tab.skin?.id, tab.skin?.site)}
                  alt="Skin"
                  className={`w-3 h-3 object-contain ${
                    isActive ? 'opacity-100' : 'opacity-50'
                  }`}
                />
              )}

              {Icon && !isGlobal && (
                <Icon
                  size={12}
                  className={isActive ? 'text-[#D10057]' : 'text-slate-500'}
                />
              )}
              <span className="truncate">{tab.title}</span>
            </div>
            {tab.id !== 'dashboard' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="p-0.5 rounded hover:bg-slate-700 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100"
              >
                <X size={10} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

const MainApp = ({ currentUser, onLogout }) => {
  const { hasPermission, hasGlobalPermission, skins, roles } = useData();

  const userRoleData = roles.find((r) => r.id === currentUser.roleId);
  const combinedAllowedSkinIds = [
    ...new Set([
      ...(currentUser.allowedSkins || []),
      ...(userRoleData?.skins || []),
    ]),
  ];
  const allowedSkinObjects = skins.filter((s) =>
    combinedAllowedSkinIds.includes(s.id)
  );

  // 👇 LA SOLUCIÓN MAESTRA: Identificamos si es un usuario global (CTO, Auditor, etc.)
  const isGlobalOnlyUser = allowedSkinObjects.length === 0;

  // 👇 El aterrizaje inteligente: Si no tiene skins, aterriza en RRHH. Si tiene, en el Dashboard.
  const initialTabId = isGlobalOnlyUser ? 'employee_list' : 'dashboard';
  const initialTabTitle = isGlobalOnlyUser ? 'Listar Empleados' : 'Dashboard';
  const initialTabIcon = isGlobalOnlyUser ? FileText : LayoutDashboard;

  const [tabs, setTabs] = useState([
    {
      id: initialTabId,
      title: initialTabTitle,
      icon: initialTabIcon,
      // Si es global, dejamos la skin en null (activa el badge "Permisos Globales").
      skin: isGlobalOnlyUser ? null : allowedSkinObjects[0] || skins[0],
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(initialTabId);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const isSuperAdmin = currentUser?.contractId === 'c-001';

  const handleOpenTab = (id, title, icon, payload = null) => {
    if (!tabs.find((t) => t.id === id))
      setTabs([...tabs, { id, title, icon, skin: activeTab.skin, payload }]);
    setActiveTabId(id);
  };

  const handleCloseTab = (id) => {
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);
    // Si cerramos una pestaña, lo devolvemos a su inicio natural (RRHH o Dashboard)
    if (activeTabId === id)
      setActiveTabId(
        newTabs[newTabs.length - 1]?.id ||
          (isGlobalOnlyUser ? 'employee_list' : 'dashboard')
      );
  };

  const canViewTab = (skinId, tabId) => {
    // 👇 PROTECCIÓN AÑADIDA: Si es un CTO sin skins, NO lo dejamos ver el Dashboard Local
    if (tabId === 'dashboard') return !isGlobalOnlyUser;

    // EVALUACIÓN DE MÓDULOS GLOBALES
    if (tabId === 'employee_list') return hasGlobalPermission('emp_list_read');
    if (tabId === 'employee_create')
      return hasGlobalPermission('emp_create_read');
    if (tabId === 'role_list') return hasGlobalPermission('rol_list_read');
    if (tabId === 'role_create') return hasGlobalPermission('rol_create_read');
    if (tabId === 'assign_role') return hasGlobalPermission('assig_list_read');
    if (tabId.startsWith('role_edit_'))
      return hasGlobalPermission('rol_edit_read');
    if (tabId.startsWith('role_manage_skins_'))
      return hasGlobalPermission('rol_skin_read');

    if (tabId === 'contract_list')
      return isSuperAdmin && hasGlobalPermission('contract_view');
    if (tabId === 'contract_create')
      return isSuperAdmin && hasGlobalPermission('contract_create');

    // EVALUACIÓN DE MÓDULOS LOCALES
    if (!skinId) return false;
    if (tabId === 'network_list') return hasPermission(skinId, 'net_list_read');
    if (tabId === 'network_create')
      return hasPermission(skinId, 'net_create_read');
    if (tabId.startsWith('network_profile_'))
      return hasPermission(skinId, 'net_list_read');

    return false;
  };

  return (
    <>
      <TopNavigation
        onOpenTab={handleOpenTab}
        activeTabId={activeTabId}
        activeTabSkin={activeTab.skin}
        onSkinChange={(newSkin) =>
          setTabs(
            tabs.map((t) =>
              t.id === activeTabId ? { ...t, skin: newSkin } : t
            )
          )
        }
        currentUser={currentUser}
        onLogout={onLogout}
      />
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
      />

      <main className="flex-1 w-full overflow-hidden relative bg-[#0B1120]">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const componentKey = `${tab.id}-${tab.skin?.id || 'default'}`;
          const isGlobal = isGlobalTab(tab.id);

          return (
            <div
              key={tab.id}
              className={`h-full w-full ${isActive ? 'block' : 'hidden'}`}
            >
              {(() => {
                if (
                  !canViewTab(tab.skin?.id, tab.id) ||
                  // 👇 Evitamos que salte la pantalla roja de "RestrictedView" si es el dashboard global
                  (!isGlobal && !tab.skin && tab.id !== 'dashboard')
                ) {
                  return <RestrictedView currentSkin={tab.skin} />;
                }

                if (tab.id.startsWith('role_edit_'))
                  return (
                    <RoleEditView
                      key={componentKey}
                      onNavigate={handleOpenTab}
                      onCloseTab={() => handleCloseTab(tab.id)}
                      currentSkin={tab.skin}
                      targetRole={tab.payload}
                    />
                  );
                if (tab.id.startsWith('role_manage_skins_'))
                  return (
                    <RoleSkinManageView
                      key={componentKey}
                      onNavigate={handleOpenTab}
                      onCloseTab={() => handleCloseTab(tab.id)}
                      currentSkin={tab.skin}
                      targetRole={tab.payload}
                    />
                  );
                if (tab.id.startsWith('network_profile_'))
                  return (
                    <NetworkProfileView
                      key={componentKey}
                      currentSkin={tab.skin}
                      targetNode={tab.payload}
                    />
                  );

                switch (tab.id) {
                  case 'dashboard':
                    return (
                      <DashboardView
                        key={componentKey}
                        currentSkin={tab.skin}
                      />
                    );
                  case 'employee_list':
                    return (
                      <EmployeeListView
                        key={componentKey}
                        onNavigate={handleOpenTab}
                        currentSkin={tab.skin}
                      />
                    );
                  case 'employee_create':
                    return (
                      <EmployeeCreateView
                        key={componentKey}
                        onNavigate={handleOpenTab}
                        onCloseTab={() => handleCloseTab(tab.id)}
                        currentSkin={tab.skin}
                      />
                    );
                  case 'role_list':
                    return (
                      <RoleListView
                        key={componentKey}
                        onNavigate={handleOpenTab}
                        currentSkin={tab.skin}
                      />
                    );
                  case 'role_create':
                    return (
                      <RoleCreateView
                        key={componentKey}
                        onNavigate={handleOpenTab}
                        onCloseTab={() => handleCloseTab(tab.id)}
                        currentSkin={tab.skin}
                      />
                    );
                  case 'assign_role':
                    return (
                      <AssignRoleView
                        key={componentKey}
                        currentSkin={tab.skin}
                      />
                    );
                  case 'network_create':
                    return (
                      <NetworkCreateView
                        key={componentKey}
                        currentSkin={tab.skin}
                      />
                    );
                  case 'network_list':
                    return (
                      <NetworkListView
                        key={componentKey}
                        currentSkin={tab.skin}
                        onNavigate={handleOpenTab}
                      />
                    );
                  case 'contract_list':
                    return (
                      <ContractListView
                        key={componentKey}
                        currentSkin={tab.skin}
                        onNavigate={handleOpenTab}
                      />
                    );
                  case 'contract_create':
                    return (
                      <ContractCreateView
                        key={componentKey}
                        currentSkin={tab.skin}
                        onNavigate={handleOpenTab}
                        onCloseTab={() => handleCloseTab(tab.id)}
                      />
                    );
                  default:
                    return null;
                }
              })()}
            </div>
          );
        })}
      </main>
    </>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState({
    user: 'cristian.sam',
    name: 'Cristian Sam',
    initials: 'CS',
    role: 'Gerente General',
    roleId: '00001',
    contractId: 'c-001',
    allowedSkins: [
      'ur_pe_pen',
      'ur_pe_usd',
      'ur_co_cop',
      'ur_mx_mxn',
      'ur_ec_usd',
      'ur_cl_clp',
      'ur_ar_ars',
      'xlive_pe_pen',
      'xlive_co_cop',
      'xlive_ec_usd',
      'xlive_mx_mxn',
    ],
  });

  if (!currentUser)
    return (
      <>
        <ScrollbarStyle />
        <LoginView onLogin={setCurrentUser} />
      </>
    );

  return (
    <DataProvider currentUser={currentUser}>
      <ScrollbarStyle />
      <div
        className={`h-screen w-full ${THEME.bg} font-sans flex flex-col overflow-hidden`}
      >
        <MainApp
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      </div>
    </DataProvider>
  );
}
