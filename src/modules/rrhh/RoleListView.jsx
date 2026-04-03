import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Edit3,
  Globe,
  Copy,
  Plus,
  AlertCircle,
  Shield,
  ListFilter,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { THEME } from '../../config/constants';
import { useData } from '../../context/DataContext';
import { ViewHeader } from '../../components/shared/ViewHeader';
import { SkinStack } from '../../components/shared/SkinStack';

export const RoleListView = ({ onNavigate, currentSkin }) => {
  const {
    roles,
    employees,
    cloneRole,
    hasGlobalPermission,
    currentUser,
    skins,
    contracts,
  } = useData();

  const canCreate = hasGlobalPermission('rol_ui_fab_add');
  const canEdit = hasGlobalPermission('rol_ui_btn_edit');
  const canManageSkins = hasGlobalPermission('rol_ui_btn_skin');
  const canClone = hasGlobalPermission('rol_ui_btn_copy');

  const userRoleData = roles.find((r) => r.id === currentUser.roleId);
  const combinedAllowedSkins = [
    ...new Set([
      ...(currentUser.allowedSkins || []),
      ...(userRoleData?.skins || []),
    ]),
  ];

  // Esto mantiene la visibilidad (Los de c-001 ven todo)
  const isSuperAdmin = currentUser?.contractId === 'c-001';
  const isGlobalOnlyUser = combinedAllowedSkins.length === 0;

  // 👇 MOTOR DE LINAJE
  const isDescendantCreator = (creatorId, visited = new Set()) => {
    if (!creatorId || creatorId === 'SYSTEM') return false;
    if (creatorId === currentUser.id) return true;
    if (visited.has(creatorId)) return false;
    visited.add(creatorId);
    const creatorEmp = employees.find((e) => e.id === creatorId);
    if (!creatorEmp) return false;
    return isDescendantCreator(creatorEmp.createdBy, visited);
  };

  const baseRoles = roles.filter((role) => {
    if (!isSuperAdmin) {
      if (role.id !== '00001' && role.contractId !== currentUser.contractId) {
        return false;
      }
    }
    if (role.origin === 'Predefinido') return true;
    if (isGlobalOnlyUser) return true;

    const s = role.skins || [];
    if (s.length === 0) {
      return role.baseSkin
        ? combinedAllowedSkins.includes(role.baseSkin)
        : false;
    }
    return s.some((skin) => combinedAllowedSkins.includes(skin));
  });

  const visibleSkinsForFilter = (() => {
    if (isSuperAdmin) return skins;

    const activeSkinIds = new Set();
    baseRoles.forEach((role) => {
      if (role.id !== '00001') {
        const s = role.skins || [];
        s.forEach((id) => activeSkinIds.add(id));
      }
    });

    if (isGlobalOnlyUser) {
      return skins.filter((s) => activeSkinIds.has(s.id));
    }

    return skins.filter(
      (s) => activeSkinIds.has(s.id) && combinedAllowedSkins.includes(s.id)
    );
  })();

  const [filters, setFilters] = useState({
    id: '',
    roleId: '',
    origin: '',
    skin: '',
  });

  const [filteredList, setFilteredList] = useState(baseRoles);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  useEffect(() => {
    setFilteredList(baseRoles);
  }, [roles]);

  const handleSearch = () => {
    const result = baseRoles.filter((role) => {
      const matchId = role.id.toLowerCase().includes(filters.id.toLowerCase());
      const matchCargo = filters.roleId === '' || role.id === filters.roleId;
      const matchOrigin =
        filters.origin === '' || role.origin === filters.origin;
      const matchSkin =
        filters.skin === '' ||
        (role.skins && role.skins.includes(filters.skin));
      return matchId && matchCargo && matchOrigin && matchSkin;
    });
    setFilteredList(result);
  };

  const downloadCSV = () => {
    if (filteredList.length === 0) return alert('No hay datos para exportar.');
    const headers = ['ID', 'Cargo', 'Empresa', 'Origen', 'Skins', 'Empleados'];
    const rows = filteredList.map((role) => {
      const empCount = employees.filter((e) => e.roleId === role.id).length;
      const roleContractId = role.id === '00001' ? 'c-001' : role.contractId;
      const roleContract = contracts.find((c) => c.id === roleContractId);

      return [
        role.id,
        role.name,
        roleContract?.companyName || 'UniversalSoft Internal',
        role.origin,
        (role.skins || []).join(' '),
        empCount,
      ];
    });
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Cargos_${currentSkin?.code || 'GLOBAL'}_${new Date().getTime()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    if (filteredList.length === 0) return alert('No hay datos para exportar.');
    const headers = ['ID', 'Cargo', 'Empresa', 'Origen', 'Skins', 'Empleados'];
    const rows = filteredList.map((role) => {
      const empCount = employees.filter((e) => e.roleId === role.id).length;
      const roleContractId = role.id === '00001' ? 'c-001' : role.contractId;
      const roleContract = contracts.find((c) => c.id === roleContractId);

      return [
        role.id,
        role.name,
        roleContract?.companyName || 'UniversalSoft Internal',
        role.origin,
        (role.skins || []).join(' '),
        empCount,
      ];
    });
    const csvContent = [
      headers.join(';'),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(';')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Cargos_${currentSkin?.code || 'GLOBAL'}_${new Date().getTime()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 h-full flex flex-col relative text-slate-200">
      <div className="relative w-full z-20">
        <ViewHeader
          title="Estructura de Cargos"
          icon={Briefcase}
          currentSkin={currentSkin}
        />

        <div className="absolute right-0 top-0 hidden sm:flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm ${
              isFilterOpen
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-[#111827] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <ListFilter size={14} />
            {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors border border-emerald-500/20 text-xs font-bold shadow-sm"
          >
            <FileSpreadsheet size={14} /> Excel
          </button>

          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700 text-xs font-bold shadow-sm"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out flex-shrink-0 z-20 ${
          isFilterOpen
            ? 'max-h-[500px] opacity-100 overflow-visible mb-6'
            : 'max-h-0 opacity-0 overflow-hidden pointer-events-none mb-0'
        }`}
      >
        <div
          className={`relative ${THEME.panel} rounded-xl border ${THEME.border} p-6 shadow-lg`}
        >
          <h3 className="text-white font-bold text-base mb-4 border-b border-slate-800 pb-2">
            Filtrar Cargos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                ID
              </label>
              <input
                value={filters.id}
                onChange={(e) => setFilters({ ...filters, id: e.target.value })}
                placeholder="Escribe Aquí"
                className={`w-full ${THEME.input} p-2 rounded-lg text-sm`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Cargo
              </label>
              <select
                value={filters.roleId}
                onChange={(e) =>
                  setFilters({ ...filters, roleId: e.target.value })
                }
                className={`w-full ${THEME.select} p-2 rounded-lg text-sm`}
              >
                <option value="">Seleccione</option>
                {baseRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Origen
              </label>
              <select
                value={filters.origin}
                onChange={(e) =>
                  setFilters({ ...filters, origin: e.target.value })
                }
                className={`w-full ${THEME.select} p-2 rounded-lg text-sm`}
              >
                <option value="">Seleccione</option>
                <option value="Predefinido">Predefinido</option>
                <option value="Personalizado">Personalizado</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Skin
              </label>
              <select
                value={filters.skin}
                onChange={(e) =>
                  setFilters({ ...filters, skin: e.target.value })
                }
                className={`w-full ${THEME.select} p-2 rounded-lg text-sm`}
              >
                <option value="">Seleccione</option>
                {visibleSkinsForFilter.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSearch}
                className={`w-[140px] ${THEME.primary} ${THEME.primaryHover} text-white font-bold p-2 rounded-lg transition-colors shadow-lg`}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${THEME.panel} rounded-xl border ${THEME.border} overflow-x-auto overflow-y-auto shadow-xl flex-1 relative custom-scrollbar z-10`}
      >
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0f1522] text-xs uppercase text-slate-500 font-bold tracking-wider sticky top-0 z-10 shadow-sm border-b border-slate-800">
            <tr>
              <th className="p-4 whitespace-nowrap">ID</th>
              <th className="p-4 text-left whitespace-nowrap">Cargo</th>
              <th className="p-4 whitespace-nowrap">Empresa</th>
              <th className="p-4 whitespace-nowrap">Origen</th>
              <th className="p-4 text-center whitespace-nowrap">Skins</th>
              <th className="p-4 text-center whitespace-nowrap">Empleados</th>
              <th className="p-4 text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredList.map((role) => {
              const empCount = employees.filter(
                (e) => e.roleId === role.id
              ).length;
              const roleContractId =
                role.id === '00001' ? 'c-001' : role.contractId;
              const roleContract = contracts.find(
                (c) => c.id === roleContractId
              );

              // 👇 LA LEY SUPREMA: PODER ABSOLUTO EXTERNO, JERARQUÍA ESTRICTA INTERNA
              const isPredefined = role.id === '00001';
              const isMyRole = role.id === currentUser.roleId; 
              
              const isRootGod = currentUser?.roleId === '00001';
              const isMatrixStaff = currentUser?.contractId === 'c-001';
              const isExternalTarget = roleContractId !== currentUser.contractId;

              const hasLineageAccess = 
                isRootGod || 
                (isMatrixStaff && isExternalTarget) || 
                isDescendantCreator(role.createdBy);

              const isReadOnly = (isExternalTarget && !isMatrixStaff) || isPredefined || isMyRole || !hasLineageAccess;

              let displaySkins = [];
              let allowedSkinsForStack = combinedAllowedSkins;

              if (isSuperAdmin) {
                displaySkins = role.skins || [];
                allowedSkinsForStack = null;
              } else if (isGlobalOnlyUser) {
                if (isPredefined) {
                  displaySkins = [];
                } else {
                  displaySkins = role.skins || [];
                  allowedSkinsForStack = null;
                }
              } else {
                displaySkins = role.skins || [];
                allowedSkinsForStack = combinedAllowedSkins;
              }

              return (
                <tr
                  key={role.id}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {role.id}
                  </td>
                  <td className="p-4 font-bold text-white whitespace-nowrap">
                    {role.name}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        {roleContract?.companyName || 'UniversalSoft Internal'}
                        {(isPredefined || (isExternalTarget && !isMatrixStaff)) && (
                          <Shield
                            size={12}
                            className="text-[#D10057]"
                            title="Plantilla Global"
                          />
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {roleContract?.contractNumber || roleContractId}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-xs tracking-tight uppercase opacity-60 font-medium whitespace-nowrap">
                    {role.origin}
                  </td>
                  <td className="p-4 text-center align-middle whitespace-nowrap">
                    <SkinStack
                      skins={displaySkins}
                      allowedSkins={allowedSkinsForStack}
                    />
                  </td>
                  <td className="p-4 text-center font-bold text-[#D10057] whitespace-nowrap">
                    {empCount}
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    {isReadOnly ? (
                      <div className="flex justify-center">
                        <span 
                          className="text-[10px] text-slate-400 italic bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 cursor-help flex items-center gap-1.5"
                          title={
                            isExternalTarget && !isMatrixStaff ? "Aislamiento B2B: Cargo pertenece a otra empresa." :
                            isPredefined ? "Inmunidad: Plantilla Global del Sistema." :
                            isMyRole ? "Inmutabilidad de Sesión: No puedes auto-editar tu cargo." :
                            "Jerarquía de Linaje: Este cargo fue creado por un superior o fuera de tu descendencia."
                          }
                        >
                          <Shield size={10} className="text-slate-500" /> Solo Lectura
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {canEdit ? (
                          <button
                            onClick={() =>
                              onNavigate(
                                `role_edit_${role.id}`,
                                `Editar: ${role.name}`,
                                Edit3,
                                role
                              )
                            }
                            className="p-2 text-slate-400 hover:text-[#D10057] hover:bg-[#D10057]/10 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                        ) : (
                          <div
                            className="p-2 text-slate-700 opacity-50"
                            title="Sin Permiso de Edición"
                          >
                            <Edit3 size={16} />
                          </div>
                        )}
                        {canManageSkins ? (
                          <button
                            onClick={() =>
                              onNavigate(
                                `role_manage_skins_${role.id}`,
                                `Gestionar Skins: ${role.name}`,
                                Globe,
                                role
                              )
                            }
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <Globe size={16} />
                          </button>
                        ) : (
                          <div
                            className="p-2 text-slate-700 opacity-50"
                            title="Sin Permiso de Skins"
                          >
                            <Globe size={16} />
                          </div>
                        )}
                        {canClone ? (
                          <button
                            onClick={() => {
                              if (!hasGlobalPermission('rol_clone_act'))
                                return alert(
                                  'Acceso Denegado: No tienes permiso de ACCIÓN para clonar cargos.'
                                );
                              cloneRole(role.id);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                        ) : (
                          <div
                            className="p-2 text-slate-700 opacity-50"
                            title="Sin Permiso de Clonación"
                          >
                            <Copy size={16} />
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredList.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  No se encontraron cargos en su jurisdicción.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {canCreate && (
        <button
          onClick={() => onNavigate('role_create', 'Crear Cargo', Shield)}
          className="absolute bottom-8 right-8 w-14 h-14 bg-[#D10057] text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-20"
        >
          <Plus size={32} />
        </button>
      )}
    </div>
  );
};