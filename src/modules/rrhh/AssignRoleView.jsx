import React, { useState, useEffect } from 'react';
import {
  UserCog,
  AlertTriangle,
  Shield,
  ListFilter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ViewHeader } from '../../components/shared/ViewHeader';
import { THEME } from '../../config/constants';

export const AssignRoleView = ({ currentSkin }) => {
  const {
    employees,
    roles,
    assignRoleToEmployee,
    hasGlobalPermission, 
    currentUser,
    skins,
    contracts,
  } = useData();

  const canSelect = hasGlobalPermission('assig_ui_select');

  const userRoleData = roles.find((r) => r.id === currentUser.roleId);
  const combinedAllowedSkins = [
    ...new Set([...(currentUser.allowedSkins || []), ...(userRoleData?.skins || [])]),
  ];

  const isSuperAdmin = currentUser?.contractId === 'c-001';

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

  const visibleEmployees = employees.filter((emp) => {
    const isMyEmployee = emp.contractId === currentUser.contractId;
    const isProviderGuest = emp.contractId === 'c-001';

    if (!isSuperAdmin && !isMyEmployee && !isProviderGuest) {
      return false;
    }

    if (emp.roleId === '00001' && !isSuperAdmin) {
      return false;
    }

    if (isSuperAdmin || combinedAllowedSkins.length === 0) {
      return true;
    }

    const empRole = roles.find((r) => r.id === emp.roleId);
    const s = empRole ? empRole.skins || [] : [];

    if (s.length === 0) {
      if (!emp.baseSkin) return true;
      return combinedAllowedSkins.includes(emp.baseSkin);
    }

    return s.some((skin) => combinedAllowedSkins.includes(skin));
  });

  const visibleRoles = roles.filter((role) => {
    const roleSkinObj = skins.find((s) => s.id === role.baseSkin);
    const roleContractId =
      role.contractId ||
      (role.id === '00001'
        ? 'c-001'
        : roleSkinObj?.contractId || currentUser.contractId);

    const isMyRole = roleContractId === currentUser.contractId;
    const isProviderRole = roleContractId === 'c-001';

    if (!isSuperAdmin && !isMyRole && !isProviderRole) {
      return false;
    }

    if (role.id === '00001' && !isSuperAdmin) {
      return false;
    }

    if (role.origin === 'Predefinido') return true;

    return (
      (role.skins || []).length === 0 ||
      (role.skins || []).some((s) => combinedAllowedSkins.includes(s))
    );
  });

  const availableContractsForFilter = [
    ...new Set(visibleEmployees.map((emp) => emp.contractId)),
  ]
    .map((contractId) => contracts.find((c) => c.id === contractId))
    .filter(Boolean);

  const [filters, setFilters] = useState({
    id: '',
    name: '',
    contractId: '',
    roleId: '',
  });

  const [filteredList, setFilteredList] = useState(visibleEmployees);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  useEffect(() => {
    setFilteredList(visibleEmployees);
  }, [employees, roles]);

  const handleSearch = () => {
    const result = visibleEmployees.filter((emp) => {
      const matchId = emp.id.toLowerCase().includes(filters.id.toLowerCase());
      const matchName =
        emp.name.toLowerCase().includes(filters.name.toLowerCase()) ||
        emp.user.toLowerCase().includes(filters.name.toLowerCase());
      const matchContract =
        filters.contractId === '' || emp.contractId === filters.contractId;
      const matchRole =
        filters.roleId === '' || (emp.roleId || 'sin-cargo') === filters.roleId;

      return matchId && matchName && matchContract && matchRole;
    });
    setFilteredList(result);
  };

  return (
    <div className="p-8 h-full flex flex-col text-slate-200 animate-in fade-in">
      <div className="relative w-full z-20">
        <ViewHeader
          title="Vincular Roles a Empleados"
          icon={UserCog}
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
            Filtrar Asignaciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                ID Empleado
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
                Nombre / Usuario
              </label>
              <input
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
                placeholder="Buscar empleado"
                className={`w-full ${THEME.input} p-2 rounded-lg text-sm`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Empresa del Empleado
              </label>
              <select
                value={filters.contractId}
                onChange={(e) =>
                  setFilters({ ...filters, contractId: e.target.value })
                }
                className={`w-full ${THEME.select} p-2 rounded-lg text-sm`}
                disabled={!isSuperAdmin}
              >
                <option value="">Todas</option>
                {availableContractsForFilter.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Cargo Actual
              </label>
              <select
                value={filters.roleId}
                onChange={(e) =>
                  setFilters({ ...filters, roleId: e.target.value })
                }
                className={`w-full ${THEME.select} p-2 rounded-lg text-sm`}
              >
                <option value="">Todos</option>
                <option value="sin-cargo">-- Sin Cargo --</option>
                {visibleRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end w-full">
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
        className={`${THEME.panel} rounded-xl border ${THEME.border} overflow-hidden shadow-2xl flex-1 flex flex-col`}
      >
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 relative">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0f1522] text-xs uppercase text-slate-500 font-bold sticky top-0 z-10 shadow-sm border-b border-slate-800">
              <tr>
                <th className="p-4 whitespace-nowrap">ID Empleado</th>
                <th className="p-4 whitespace-nowrap">Empleado</th>
                {isSuperAdmin && (
                  <th className="p-4 whitespace-nowrap">
                    Empresa del Empleado
                  </th>
                )}
                <th className="p-4 whitespace-nowrap">Cargo Actual</th>
                {isSuperAdmin && (
                  <th className="p-4 whitespace-nowrap">Empresa del Cargo</th>
                )}
                <th className="p-4 text-center whitespace-nowrap">
                  Asignar Nuevo Cargo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredList.map((emp) => {
                const currentEmpRole = roles.find((r) => r.id === emp.roleId);
                const isLimboRole =
                  currentEmpRole && (currentEmpRole.skins || []).length === 0;
                const empContract = contracts.find(
                  (c) => c.id === emp.contractId
                );

                let roleContract = null;
                if (currentEmpRole) {
                  const roleSkinObj = skins.find(
                    (s) => s.id === currentEmpRole.baseSkin
                  );
                  const currentRoleContractId =
                    currentEmpRole.contractId ||
                    (currentEmpRole.id === '00001'
                      ? 'c-001'
                      : roleSkinObj?.contractId);
                  roleContract = contracts.find(
                    (c) => c.id === currentRoleContractId
                  );
                }

                const availableRolesForEmp = visibleRoles.filter((r) => {
                  const roleSkinObj = skins.find((s) => s.id === r.baseSkin);
                  const roleContractId =
                    r.contractId ||
                    (r.id === '00001'
                      ? 'c-001'
                      : roleSkinObj?.contractId || currentUser.contractId);

                  return roleContractId === emp.contractId;
                });

                // 👇 LA LEY SUPREMA: PODER ABSOLUTO EXTERNO, JERARQUÍA ESTRICTA INTERNA
                const isMyProfile = emp.id === currentUser.id;
                
                const isRootGod = currentUser?.roleId === '00001';
                const isMatrixStaff = currentUser?.contractId === 'c-001';
                const isExternalTarget = emp.contractId !== currentUser.contractId;

                const hasLineageAccess = 
                  isRootGod || 
                  (isMatrixStaff && isExternalTarget) || 
                  isDescendantCreator(emp.createdBy);

                const isReadOnly = (isExternalTarget && !isMatrixStaff) || isMyProfile || !hasLineageAccess;

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {emp.id}
                    </td>
                    <td className="p-4 font-bold text-white whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{emp.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {emp.user}
                        </span>
                      </div>
                    </td>

                    {isSuperAdmin && (
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            {empContract?.companyName || 'Desconocido'}
                            {emp.contractId === 'c-001' && (
                              <Shield
                                size={12}
                                className="text-[#D10057]"
                                title="Personal de Matriz"
                              />
                            )}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {empContract?.contractNumber || emp.contractId}
                          </span>
                        </div>
                      </td>
                    )}

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <span className="italic text-slate-400">
                          {currentEmpRole?.name ? (
                            <span className="text-white font-medium">
                              {currentEmpRole.name}
                            </span>
                          ) : (
                            <span className="text-amber-500">Sin Cargo</span>
                          )}
                        </span>
                        {isLimboRole && (
                          <span
                            title="Este usuario no podrá iniciar sesión hasta que asignes una Skin al cargo."
                            className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded w-fit cursor-help"
                          >
                            <AlertTriangle size={12} /> Cargo en Limbo
                          </span>
                        )}
                      </div>
                    </td>

                    {isSuperAdmin && (
                      <td className="p-4 whitespace-nowrap">
                        {roleContract ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              {roleContract.companyName}
                              {roleContract.id === 'c-001' && (
                                <Shield
                                  size={12}
                                  className="text-slate-500"
                                  title="Cargo Global"
                                />
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {roleContract.contractNumber || roleContract.id}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic text-xs">
                            --
                          </span>
                        )}
                      </td>
                    )}

                    <td className="p-4 text-center whitespace-nowrap">
                      {(!canSelect || isReadOnly) ? (
                        <div className="flex justify-center">
                          <span 
                            className="text-[10px] text-slate-400 italic bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 cursor-help flex items-center gap-1.5"
                            title={
                              !canSelect ? "Sin Permiso: No tienes la acción de asignar roles." :
                              isExternalTarget && !isMatrixStaff ? "Aislamiento B2B: Empleado pertenece a otra empresa." :
                              isMyProfile ? "Inmutabilidad de Sesión: No puedes auto-asignarte un cargo." :
                              "Jerarquía de Linaje: Este empleado es un superior o fuera de tu descendencia."
                            }
                          >
                            <Shield size={10} className="text-slate-500" /> Solo Lectura
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <select
                            className={`w-[250px] ${THEME.select} p-2 rounded-lg text-sm`}
                            value={emp.roleId || ''}
                            onChange={(e) => {
                              if (!hasGlobalPermission('assig_upd_act')) {
                                alert(
                                  'Acceso Denegado: No tienes permiso de ACCIÓN para reasignar cargos.'
                                );
                                e.target.value = emp.roleId || '';
                                return;
                              }
                              assignRoleToEmployee(emp.id, e.target.value);
                            }}
                          >
                            <option value="">-- Desvincular --</option>
                            {availableRolesForEmp.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredList.length === 0 && (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 6 : 4}
                    className="p-8 text-center text-slate-500"
                  >
                    No hay empleados que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};