import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertCircle,
  Eye,
  Lock,
  FileClock,
  Plus,
  UserPlus,
  ListFilter,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Download,
  Building2,
  Shield,
} from 'lucide-react';
import { THEME } from '../../config/constants';
import { useData } from '../../context/DataContext';
import { ViewHeader } from '../../components/shared/ViewHeader';
import { SkinStack } from '../../components/shared/SkinStack';

export const EmployeeListView = ({ onNavigate, currentSkin }) => {
  const {
    employees,
    roles,
    toggleEmployeeStatus,
    hasGlobalPermission, 
    currentUser,
    skins,
    contracts,
  } = useData();

  const canCreate = hasGlobalPermission('emp_ui_fab_add');
  const canViewDetail = hasGlobalPermission('emp_ui_btn_view');
  const canLock = hasGlobalPermission('emp_ui_btn_lock');
  const canViewLog = hasGlobalPermission('emp_ui_btn_log');

  const userRoleData = roles.find((r) => r.id === currentUser.roleId);
  const combinedAllowedSkins = [
    ...new Set([...(currentUser.allowedSkins || []), ...(userRoleData?.skins || [])]),
  ];

  const allowedSkinObjects = skins.filter((s) =>
    combinedAllowedSkins.includes(s.id)
  );

  const isSuperAdmin = currentUser?.contractId === 'c-001';

  // 👇 INYECCIÓN FALTANTE: MOTOR DE LINAJE 
  const isDescendantCreator = (creatorId, visited = new Set()) => {
    if (!creatorId || creatorId === 'SYSTEM') return false;
    if (creatorId === currentUser.id) return true;
    if (visited.has(creatorId)) return false;
    visited.add(creatorId);
    const creatorEmp = employees.find((e) => e.id === creatorId);
    if (!creatorEmp) return false;
    return isDescendantCreator(creatorEmp.createdBy, visited);
  };

  const baseEmployees = employees.filter((emp) => {
    if (isSuperAdmin) return true;
    if (emp.contractId === currentUser.contractId) return true;

    if (emp.contractId === 'c-001') {
      const empRole = roles.find((r) => r.id === emp.roleId);
      const empSkins = empRole ? empRole.skins || [] : emp.skins || [];
      return empSkins.includes(currentSkin?.id);
    }
    return false;
  });

  const visibleRoles = (() => {
    if (isSuperAdmin) return roles;

    const myRoles = roles.filter(
      (r) => r.contractId === currentUser.contractId
    );

    const externalVisibleRoleIds = baseEmployees
      .filter((emp) => emp.contractId !== currentUser.contractId)
      .map((emp) => emp.roleId);

    const externalRoles = roles.filter((r) =>
      externalVisibleRoleIds.includes(r.id)
    );

    const combined = [...myRoles, ...externalRoles];
    return Array.from(new Map(combined.map((r) => [r.id, r])).values());
  })();

  const availableContractsForFilter = [
    ...new Set(baseEmployees.map((emp) => emp.contractId)),
  ]
    .map((contractId) => contracts.find((c) => c.id === contractId))
    .filter(Boolean);

  const [filters, setFilters] = useState({
    id: '',
    user: '',
    name: '',
    contractId: '',
    roleId: '',
    skin: '',
    status: '',
  });

  const [filteredList, setFilteredList] = useState(baseEmployees);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  useEffect(() => {
    setFilteredList(baseEmployees);
  }, [employees, roles, currentSkin]);

  const handleSearch = () => {
    const result = baseEmployees.filter((emp) => {
      const matchId = emp.id.toLowerCase().includes(filters.id.toLowerCase());
      const matchUser = emp.user
        .toLowerCase()
        .includes(filters.user.toLowerCase());
      const matchName = emp.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const matchContract =
        filters.contractId === '' || emp.contractId === filters.contractId;
      const matchRole = filters.roleId === '' || emp.roleId === filters.roleId;
      const matchStatus =
        filters.status === '' || emp.status === filters.status;

      const empRole = roles.find((r) => r.id === emp.roleId);
      const currentSkins = empRole ? empRole.skins || [] : emp.skins || [];
      const matchSkin =
        filters.skin === '' || currentSkins.includes(filters.skin);

      return (
        matchId &&
        matchUser &&
        matchName &&
        matchContract &&
        matchRole &&
        matchSkin &&
        matchStatus
      );
    });
    setFilteredList(result);
  };

  const downloadCSV = () => {
    if (filteredList.length === 0) return alert('No hay datos para exportar.');
    const headers = [
      'ID',
      'Usuario',
      'Nombre Completo',
      'Empresa',
      'Cargo',
      'Skins Visibles',
      'Estado',
    ];
    const rows = filteredList.map((emp) => {
      const empRole = roles.find((r) => r.id === emp.roleId);
      const empContract = contracts.find((c) => c.id === emp.contractId);
      const currentSkins = empRole ? empRole.skins || [] : emp.skins || [];

      const displaySkins = isSuperAdmin
        ? currentSkins
        : currentSkins.filter((s) => combinedAllowedSkins.includes(s));

      const statusText = emp.status === 'active' ? 'Activo' : 'Bloqueado';

      return [
        emp.id,
        emp.user,
        emp.name,
        empContract?.companyName || 'Desconocido',
        empRole?.name || 'Sin Cargo',
        displaySkins.join(' '),
        statusText,
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
      `Empleados_${currentSkin?.code || 'GLOBAL'}_${new Date().getTime()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    if (filteredList.length === 0) return alert('No hay datos para exportar.');
    const headers = [
      'ID',
      'Usuario',
      'Nombre Completo',
      'Empresa',
      'Cargo',
      'Skins Visibles',
      'Estado',
    ];
    const rows = filteredList.map((emp) => {
      const empRole = roles.find((r) => r.id === emp.roleId);
      const empContract = contracts.find((c) => c.id === emp.contractId);
      const currentSkins = empRole ? empRole.skins || [] : emp.skins || [];

      const displaySkins = isSuperAdmin
        ? currentSkins
        : currentSkins.filter((s) => combinedAllowedSkins.includes(s));

      const statusText = emp.status === 'active' ? 'Activo' : 'Bloqueado';

      return [
        emp.id,
        emp.user,
        emp.name,
        empContract?.companyName || 'Desconocido',
        empRole?.name || 'Sin Cargo',
        displaySkins.join(' '),
        statusText,
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
      `Empleados_${currentSkin?.code || 'GLOBAL'}_${new Date().getTime()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 animate-in fade-in h-full flex flex-col relative text-slate-200">
      <div className="relative w-full z-20">
        <ViewHeader
          title="Directorio de Empleados"
          icon={FileText}
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
            <ListFilter size={14} />{' '}
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
            Filtrar Empleados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                ID
              </label>
              <input
                value={filters.id}
                onChange={(e) => setFilters({ ...filters, id: e.target.value })}
                placeholder="Ej: E001"
                className={`w-full ${THEME.input} p-2 rounded-lg text-sm`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Usuario Empleado
              </label>
              <input
                value={filters.user}
                onChange={(e) =>
                  setFilters({ ...filters, user: e.target.value })
                }
                placeholder="Usuario"
                className={`w-full ${THEME.input} p-2 rounded-lg text-sm`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Nombre Completo
              </label>
              <input
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
                placeholder="Nombres"
                className={`w-full ${THEME.input} p-2 rounded-lg text-sm`}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Empresa
              </label>
              <select
                value={filters.contractId}
                onChange={(e) =>
                  setFilters({ ...filters, contractId: e.target.value })
                }
                className={`w-full ${THEME.select} p-2 rounded-lg text-sm`}
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
                Cargo
              </label>
              <select
                value={filters.roleId}
                onChange={(e) =>
                  setFilters({ ...filters, roleId: e.target.value })
                }
                className={`w-full ${THEME.select} p-2 rounded-lg text-sm`}
              >
                <option value="">Todos</option>
                {visibleRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
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
                <option value="">Todas</option>
                {allowedSkinObjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className={`w-full ${THEME.select} p-2 rounded-lg text-sm`}
              >
                <option value="">Todos</option>
                <option value="active">Activo</option>
                <option value="blocked">Bloqueado</option>
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
        className={`${THEME.panel} rounded-xl border ${THEME.border} overflow-x-auto overflow-y-auto shadow-xl flex-1 relative custom-scrollbar z-10`}
      >
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0f1522] text-xs uppercase text-slate-500 font-bold sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 whitespace-nowrap">ID</th>
              <th className="p-4 whitespace-nowrap">Usuario Empleado</th>
              <th className="p-4 whitespace-nowrap">Nombre Completo</th>
              <th className="p-4 whitespace-nowrap">Empresa</th>
              <th className="p-4 whitespace-nowrap text-center">Cargo</th>
              <th className="p-4 text-center whitespace-nowrap">Skin</th>
              <th className="p-4 text-center whitespace-nowrap">Estado</th>
              <th className="p-4 text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredList.map((emp) => {
              const empRole = roles.find((r) => r.id === emp.roleId);
              const currentSkins = empRole
                ? empRole.skins || []
                : emp.skins || [];
              const empContract = contracts.find(
                (c) => c.id === emp.contractId
              );

              const displaySkins = isSuperAdmin
                ? currentSkins
                : currentSkins.filter((s) => combinedAllowedSkins.includes(s));

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
                  <td className="p-4 text-slate-300 whitespace-nowrap">
                    {emp.user}
                  </td>
                  <td className="p-4 font-bold text-white whitespace-nowrap">
                    {emp.name}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        {empContract?.companyName || 'Desconocido'}
                        {(isExternalTarget && !isMatrixStaff) && (
                          <Shield
                            size={12}
                            className="text-[#D10057]"
                            title="Soporte Externo"
                          />
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {empContract?.contractNumber || emp.contractId}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 italic text-slate-400 whitespace-nowrap text-center">
                    {empRole?.name || (
                      <span className="text-amber-500 flex items-center justify-center gap-1 text-[10px]">
                        <AlertCircle size={10} /> Sin Cargo
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center align-middle whitespace-nowrap">
                    <SkinStack
                      skins={displaySkins}
                      allowedSkins={combinedAllowedSkins}
                    />
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        emp.status === 'active'
                          ? 'text-green-400 bg-green-500/10 border-green-500/20'
                          : 'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      {emp.status === 'active' ? 'Activo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="p-4 text-center whitespace-nowrap min-w-[120px]">
                    {!isReadOnly ? (
                      <div className="flex items-center justify-center gap-2">
                        {canViewDetail && (
                          <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                            <Eye size={18} />
                          </button>
                        )}
                        {canLock && (
                          <button
                            onClick={() => {
                              if (!hasGlobalPermission('emp_lock_act'))
                                return alert(
                                  'Acceso Denegado: No tienes permiso de ACCIÓN para bloquear empleados.'
                                );
                              toggleEmployeeStatus(emp.id);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              emp.status === 'active'
                                ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                                : 'text-red-400 bg-red-500/10'
                            }`}
                          >
                            <Lock size={18} />
                          </button>
                        )}
                        {canViewLog && (
                          <button className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                            <FileClock size={18} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <span 
                          className="text-[10px] text-slate-500 italic bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700 cursor-help"
                          title={
                            isExternalTarget && !isMatrixStaff ? "Aislamiento B2B: Empleado pertenece a otra empresa." :
                            isMyProfile ? "Inmutabilidad de Sesión: No puedes suspenderte a ti mismo." :
                            "Jerarquía de Linaje: Este empleado es un superior o fuera de tu descendencia."
                          }
                        >
                          <Shield size={10} className="inline mr-1" /> Solo Lectura
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredList.length === 0 && (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-500">
                  No se encontraron empleados en su jurisdicción.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {canCreate && (
        <button
          onClick={() =>
            onNavigate('employee_create', 'Crear Empleado', UserPlus)
          }
          className="absolute bottom-8 right-8 w-14 h-14 bg-[#D10057] text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-20"
        >
          <Plus size={32} />
        </button>
      )}
    </div>
  );
};