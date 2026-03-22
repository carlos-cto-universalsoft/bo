import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Banknote,
  Activity,
  X,
  ArrowRightLeft,
  Wallet,
  Calendar,
  Plus,
  ListFilter,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { THEME } from '../../config/constants';
import { useData } from '../../context/DataContext';
import { ViewHeader } from '../../components/shared/ViewHeader';
import { SkinStack } from '../../components/shared/SkinStack';

const NODE_ICONS = {
  Distribuidor: '🏢',
  'Sub Distribuidor': '🏬',
  Operador: '👨‍💻',
  Tienda: '🏪',
  Cajero: '💰',
  'Apostador WEB': '🌐',
  'Apostador Terminal': '🖥️',
  'Apostador Retail': '🎲',
};

const formatMoney = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount || 0);
};

const formatDate = (isoString) => {
  if (!isoString) return 'Sin fecha';
  const d = new Date(isoString);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const DateFilterDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (type) => {
    if (type !== 'custom') {
      onChange({ type, start: '', end: '' });
      setIsOpen(false);
    } else {
      onChange({ ...value, type });
    }
  };

  const getLabel = () => {
    switch (value.type) {
      case 'all':
        return 'Todas las fechas';
      case 'today':
        return 'Hoy';
      case 'week':
        return 'Últimos 7 días';
      case '30days':
        return 'Últimos 30 días';
      case 'lastMonth':
        return 'Mes Anterior';
      case 'custom':
        return 'Rango Personalizado';
      default:
        return 'Fechas';
    }
  };

  return (
    <div className="relative w-full" ref={dropRef}>
      <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
        Fecha de Creación
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2 bg-[#1F2937] border rounded-lg text-sm transition-colors ${
          isOpen || value.type !== 'all'
            ? 'border-[#D10057] text-white shadow-inner'
            : 'border-slate-700 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar
            size={16}
            className={
              value.type !== 'all' ? 'text-[#D10057]' : 'text-slate-500'
            }
          />{' '}
          <span className="truncate">{getLabel()}</span>
        </div>
        <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[#1F2937] border border-slate-700 rounded-xl shadow-2xl z-[100] p-2 animate-in fade-in">
          <div className="flex flex-col gap-1">
            {['all', 'today', 'week', '30days', 'lastMonth', 'custom'].map(
              (t) => (
                <button
                  key={t}
                  onClick={() => handleSelect(t)}
                  className={`text-left px-3 py-2 rounded text-xs font-bold ${
                    value.type === t
                      ? 'bg-[#D10057]/10 text-[#D10057]'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t === 'all' && 'Todas las fechas'}
                  {t === 'today' && 'Hoy'}
                  {t === 'week' && 'Últimos 7 días'}
                  {t === '30days' && 'Últimos 30 días'}
                  {t === 'lastMonth' && 'Mes Anterior'}
                  {t === 'custom' && 'Personalizado...'}
                </button>
              )
            )}
          </div>
          {value.type === 'custom' && (
            <div className="mt-3 pt-3 border-t border-slate-700 flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={value.start}
                  onChange={(e) =>
                    onChange({ ...value, start: e.target.value })
                  }
                  className="w-full bg-[#0B1120] border border-slate-700 text-white text-xs p-2 rounded-lg [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={value.end}
                  onChange={(e) => onChange({ ...value, end: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 text-white text-xs p-2 rounded-lg [color-scheme:dark]"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const NetworkListView = ({ currentSkin, onNavigate }) => {
  // 👈 MOTOR APLICADO: 'sites' para el nombre de la red
  const { networks, skinBalances, transferFunds, hasPermission, sites } =
    useData();

  const canCreateFab = hasPermission(currentSkin.id, 'net_ui_fab_add');
  const canTransfer = hasPermission(currentSkin.id, 'net_ui_btn_transfer');
  const canViewProfile = hasPermission(currentSkin.id, 'net_ui_btn_view');

  const [filterInputs, setFilterInputs] = useState({
    id: '',
    search: '',
    owner: '',
    type: '',
    status: '',
    activity: '',
    date: { type: 'all', start: '', end: '' },
  });
  const [appliedFilters, setAppliedFilters] = useState(filterInputs);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const [txModal, setTxModal] = useState(null);

  const skinNets = networks.filter((n) => n.skinId === currentSkin.id);
  const totalEnCalle = skinNets.reduce(
    (acc, curr) => acc + (curr.balance || 0),
    0
  );

  const getParentName = (parentId) => {
    if (parentId === 'root') {
      // 👈 LÓGICA DINÁMICA CORREGIDA: Resuelve el nombre correcto del Site
      const currentSite = sites.find((s) => s.id === currentSkin.siteId);

      let baseSiteName = 'universalsoft';
      if (currentSite && currentSite.name) {
        baseSiteName = currentSite.name;
      } else if (currentSkin.site) {
        if (currentSkin.site === 'UR') baseSiteName = 'universalsoft';
        else if (currentSkin.site === 'XLIVE') baseSiteName = 'xlive';
        else baseSiteName = currentSkin.site;
      }

      const sitePrefix = baseSiteName.toLowerCase().replace(/\s+/g, '');
      return `👑 ${sitePrefix}.${(currentSkin.code || 'xx').toLowerCase()}.${(
        currentSkin.currency || 'xxx'
      ).toLowerCase()}`;
    }
    const p = networks.find((n) => n.id === parentId);
    return p ? p.username : 'Desconocido';
  };

  const checkDateMatch = (isoDate, dateFilt) => {
    if (dateFilt.type === 'all' || !isoDate) return true;
    const nodeTime = new Date(isoDate).getTime();
    const now = new Date();

    if (dateFilt.type === 'today') {
      const start = new Date(now.setHours(0, 0, 0, 0)).getTime();
      return nodeTime >= start;
    }
    if (dateFilt.type === 'week') {
      const start = new Date(now.setDate(now.getDate() - 7)).getTime();
      return nodeTime >= start;
    }
    if (dateFilt.type === '30days') {
      const start = new Date(now.setDate(now.getDate() - 30)).getTime();
      return nodeTime >= start;
    }
    if (dateFilt.type === 'lastMonth') {
      const today = new Date();
      const firstDay = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      ).getTime();
      const lastDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        0,
        23,
        59,
        59
      ).getTime();
      return nodeTime >= firstDay && nodeTime <= lastDay;
    }
    if (dateFilt.type === 'custom') {
      const start = dateFilt.start
        ? new Date(`${dateFilt.start}T00:00:00`).getTime()
        : 0;
      const end = dateFilt.end
        ? new Date(`${dateFilt.end}T23:59:59`).getTime()
        : Infinity;
      return nodeTime >= start && nodeTime <= end;
    }
    return true;
  };

  const filteredNets = skinNets.filter((n) => {
    const matchId = n.id
      .toLowerCase()
      .includes(appliedFilters.id.toLowerCase());
    const fullName = `${n.firstName || ''} ${n.lastName || ''}`.toLowerCase();
    const searchLower = appliedFilters.search.toLowerCase();
    const matchUser =
      n.username.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower);
    const parentName = getParentName(n.parentId).toLowerCase();
    const matchOwner = parentName.includes(appliedFilters.owner.toLowerCase());
    const matchType =
      appliedFilters.type === '' || n.type === appliedFilters.type;
    const matchStatus =
      appliedFilters.status === '' ||
      (n.status || 'Activo') === appliedFilters.status;
    const matchActivity =
      appliedFilters.activity === '' ||
      (n.activity || 'OffLine') === appliedFilters.activity;
    const matchDate = checkDateMatch(n.createdAt, appliedFilters.date);

    return (
      matchId &&
      matchUser &&
      matchOwner &&
      matchType &&
      matchStatus &&
      matchActivity &&
      matchDate
    );
  });

  const handleSearch = () => {
    setAppliedFilters(filterInputs);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!hasPermission(currentSkin.id, 'net_transfer_act'))
      return alert(
        'Acceso Denegado: No tienes permiso de ACCIÓN para ejecutar transferencias.'
      );
    transferFunds(
      currentSkin.id,
      txModal.node.id,
      txModal.amount,
      txModal.type
    );
    setTxModal(null);
  };

  // 👇 FUNCIONES DE EXPORTACIÓN 👇
  const downloadCSV = () => {
    if (filteredNets.length === 0) return alert('No hay datos para exportar.');

    const headers = [
      'ID',
      'Fecha Creación',
      'Usuario de Red',
      'Nombre Legal',
      'Propietario',
      'Tipo de Red',
      'Estado',
      'Actividad',
      'Saldo',
    ];

    const rows = filteredNets.map((node) => [
      node.id,
      formatDate(node.createdAt),
      node.username,
      `${node.firstName || ''} ${node.lastName || ''}`.trim() ||
        'Sin Nombre Legal',
      getParentName(node.parentId),
      node.type,
      node.status || 'Activo',
      node.activity || 'OffLine',
      node.balance || 0,
    ]);

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
      `Red_${currentSkin.code}_${new Date().getTime()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    if (filteredNets.length === 0) return alert('No hay datos para exportar.');

    const headers = [
      'ID',
      'Fecha Creación',
      'Usuario de Red',
      'Nombre Legal',
      'Propietario',
      'Tipo de Red',
      'Estado',
      'Actividad',
      'Saldo',
    ];

    const rows = filteredNets.map((node) => [
      node.id,
      formatDate(node.createdAt),
      node.username,
      `${node.firstName || ''} ${node.lastName || ''}`.trim() ||
        'Sin Nombre Legal',
      getParentName(node.parentId),
      node.type,
      node.status || 'Activo',
      node.activity || 'OffLine',
      node.balance || 0,
    ]);

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
      `Red_${currentSkin.code}_${new Date().getTime()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 animate-in fade-in h-full flex flex-col relative text-slate-200">
      {/* ENCABEZADO Y BOTÓN LATERAL */}
      <div className="relative w-full z-20">
        <ViewHeader
          title="Red de Negocios"
          icon={Database}
          currentSkin={currentSkin}
        />

        {/* CONTENEDOR FLEX CON ORDEN: 1. FILTROS, 2. EXCEL, 3. CSV */}
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
            {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}{' '}
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

      {/* CONTENEDOR DE FILTROS ANIMADO */}
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
            Filtrar Red
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                ID
              </label>
              <input
                value={filterInputs.id}
                onChange={(e) =>
                  setFilterInputs({ ...filterInputs, id: e.target.value })
                }
                placeholder="NET-..."
                className={`w-full ${THEME.input} p-2 rounded-lg text-sm font-mono uppercase font-bold text-white`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                Usuario de Red
              </label>
              <input
                value={filterInputs.search}
                onChange={(e) =>
                  setFilterInputs({ ...filterInputs, search: e.target.value })
                }
                placeholder="Nombre o login..."
                className={`w-full ${THEME.input} p-2 rounded-lg text-sm`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                Propietario
              </label>
              <input
                value={filterInputs.owner}
                onChange={(e) =>
                  setFilterInputs({ ...filterInputs, owner: e.target.value })
                }
                placeholder="Nombre del jefe..."
                className={`w-full ${THEME.input} p-2 rounded-lg text-sm`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                Tipo de Red
              </label>
              <select
                value={filterInputs.type}
                onChange={(e) =>
                  setFilterInputs({ ...filterInputs, type: e.target.value })
                }
                className={`w-full ${THEME.select} p-2 rounded-lg text-sm`}
              >
                <option value="">Todos los niveles</option>
                {Object.keys(NODE_ICONS).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                Estado
              </label>
              <select
                value={filterInputs.status}
                onChange={(e) =>
                  setFilterInputs({ ...filterInputs, status: e.target.value })
                }
                className={`w-full ${THEME.select} p-2 rounded-lg text-sm`}
              >
                <option value="">Cualquier estado</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                Actividad
              </label>
              <select
                value={filterInputs.activity}
                onChange={(e) =>
                  setFilterInputs({
                    ...filterInputs,
                    activity: e.target.value,
                  })
                }
                className={`w-full ${THEME.select} p-2 rounded-lg text-sm`}
              >
                <option value="">Todas</option>
                <option value="OnLine">OnLine (Conectado)</option>
                <option value="OffLine">OffLine (Desconectado)</option>
              </select>
            </div>
            <div>
              <DateFilterDropdown
                value={filterInputs.date}
                onChange={(newDate) =>
                  setFilterInputs({ ...filterInputs, date: newDate })
                }
              />
            </div>

            <div className="flex justify-end lg:col-span-4">
              <button
                onClick={handleSearch}
                className={`w-full xl:w-[140px] ${THEME.primary} ${THEME.primaryHover} text-white font-bold p-2 rounded-lg transition-colors shadow-lg shadow-[#D10057]/20 text-sm flex items-center justify-center gap-2`}
              >
                <Search size={16} /> Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${THEME.panel} rounded-xl border ${THEME.border} overflow-x-auto overflow-y-auto shadow-xl flex-1 relative custom-scrollbar z-10`}
      >
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0f1522] text-xs uppercase text-slate-500 font-bold sticky top-0 z-10 shadow-sm border-b border-slate-800 tracking-wider">
            <tr>
              <th className="p-4 whitespace-nowrap">ID</th>
              <th className="p-4 whitespace-nowrap">Usuario de Red</th>
              <th className="p-4 whitespace-nowrap">Propietario</th>
              <th className="p-4 whitespace-nowrap">Tipo de Red</th>
              <th className="p-4 text-center whitespace-nowrap">Skin</th>
              <th className="p-4 text-center whitespace-nowrap">Estado</th>
              <th className="p-4 text-center whitespace-nowrap">Actividad</th>
              <th className="p-4 text-right whitespace-nowrap">Saldo</th>
              <th className="p-4 text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredNets.map((node) => {
              const nombreCompleto =
                `${node.firstName || ''} ${node.lastName || ''}`.trim() ||
                'Sin Nombre Legal';
              const estado = node.status || 'Activo';
              const actividad = node.activity || 'OffLine';

              return (
                <tr
                  key={node.id}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4 align-middle whitespace-nowrap">
                    <span className="font-mono text-white font-bold">
                      {node.id}
                    </span>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                      <Calendar size={10} /> {formatDate(node.createdAt)}
                    </div>
                  </td>

                  <td className="p-4 align-middle whitespace-nowrap">
                    <div className="font-bold text-white truncate max-w-[200px] font-mono">
                      {node.username}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {nombreCompleto}
                    </div>
                  </td>

                  <td className="p-4 align-middle whitespace-nowrap">
                    <div className="text-xs font-bold text-slate-400">
                      {getParentName(node.parentId)}
                    </div>
                  </td>

                  <td className="p-4 align-middle whitespace-nowrap">
                    <div className="font-bold text-slate-300 flex items-center gap-2 text-xs uppercase tracking-widest">
                      <span className="text-base grayscale opacity-80">
                        {NODE_ICONS[node.type]}
                      </span>{' '}
                      {node.type}
                    </div>
                  </td>

                  <td className="p-4 text-center align-middle whitespace-nowrap">
                    <SkinStack skins={[currentSkin.id]} />
                  </td>

                  <td className="p-4 text-center align-middle whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        estado === 'Activo'
                          ? 'text-green-400 bg-green-500/10 border-green-500/20'
                          : 'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      {estado}
                    </span>
                  </td>

                  <td className="p-4 text-center align-middle whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        actividad === 'OnLine'
                          ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                          : 'text-slate-400 bg-slate-800 border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          actividad === 'OnLine'
                            ? 'bg-cyan-400 animate-pulse'
                            : 'bg-slate-500'
                        }`}
                      ></div>
                      {actividad}
                    </span>
                  </td>

                  <td className="p-4 text-right align-middle whitespace-nowrap">
                    <div className="font-mono font-bold text-lg text-[#D10057]">
                      {formatMoney(node.balance, currentSkin.currency)}
                    </div>
                  </td>

                  <td className="p-4 text-center align-middle whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {canViewProfile && (
                        <button
                          onClick={() => {
                            onNavigate(
                              `network_profile_${node.id}`,
                              `Perfil: ${node.username}`,
                              Eye,
                              node
                            );
                          }}
                          title="Ver Perfil de Red"
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      )}

                      {canTransfer && (
                        <button
                          onClick={() =>
                            setTxModal({ node, type: 'DEPOSIT', amount: '' })
                          }
                          title="Gestión de Finanzas (Depositar/Retirar)"
                          className="p-2 text-green-500 hover:bg-green-500/10 bg-green-500/5 border border-green-500/20 rounded-lg transition-colors shadow-sm"
                        >
                          <Banknote size={16} />
                        </button>
                      )}
                      <button
                        disabled
                        title="Dashboard de Red (Próximamente)"
                        className="p-2 text-slate-600 bg-slate-800/50 border border-slate-700 rounded-lg cursor-not-allowed opacity-50"
                      >
                        <Activity size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredNets.length === 0 && (
              <tr>
                <td
                  colSpan="9"
                  className="p-10 text-center text-slate-500 italic"
                >
                  <Search size={32} className="mx-auto mb-3 opacity-20" /> No se
                  encontraron usuarios en la red que coincidan con los filtros
                  aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {canCreateFab && (
        <button
          onClick={() => onNavigate('network_create', 'Crear Red', Plus)}
          className="absolute bottom-8 right-8 w-14 h-14 bg-[#D10057] text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-20"
          title="Crear Nueva Red"
        >
          <Plus size={32} />
        </button>
      )}

      {/* MODAL DE TRANSFERENCIAS */}
      {txModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0f1522]">
              <div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <ArrowRightLeft size={18} className="text-[#D10057]" />{' '}
                  Gestión de Finanzas
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
                  Operando sobre:{' '}
                  <span className="text-white font-bold">
                    {txModal.node.username}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setTxModal(null)}
                className="text-slate-500 hover:text-white p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-slate-800 text-xs font-bold uppercase tracking-widest text-center">
              <button
                type="button"
                onClick={() => setTxModal({ ...txModal, type: 'DEPOSIT' })}
                className={`flex-1 py-4 transition-colors ${
                  txModal.type === 'DEPOSIT'
                    ? 'bg-green-500/10 text-green-500 border-b-2 border-green-500'
                    : 'text-slate-500 hover:bg-slate-800'
                }`}
              >
                ⬇️ Depositar a Usuario
              </button>
              <button
                type="button"
                onClick={() => setTxModal({ ...txModal, type: 'WITHDRAW' })}
                className={`flex-1 py-4 transition-colors ${
                  txModal.type === 'WITHDRAW'
                    ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500'
                    : 'text-slate-500 hover:bg-slate-800'
                }`}
              >
                ⬆️ Retirar a Skin
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-6">
              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg border border-slate-800">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Saldo Actual del Usuario
                  </p>
                  <p className="text-xl font-mono font-bold text-white mt-1">
                    {formatMoney(txModal.node.balance, currentSkin.currency)}
                  </p>
                </div>
                <Wallet size={24} className="text-slate-700" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-widest">
                  Monto de la Operación
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold text-lg">
                    {currentSkin.currency === 'USD'
                      ? '$'
                      : currentSkin.currency}
                  </span>
                  <input
                    autoFocus
                    type="number"
                    step="0.01"
                    value={txModal.amount}
                    onChange={(e) =>
                      setTxModal({ ...txModal, amount: e.target.value })
                    }
                    className={`w-full bg-[#1F2937] border ${
                      txModal.type === 'DEPOSIT'
                        ? 'border-green-500/50 focus:border-green-500'
                        : 'border-amber-500/50 focus:border-amber-500'
                    } text-white text-xl font-mono py-4 pl-14 pr-4 rounded-xl outline-none shadow-inner`}
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-right">
                  {txModal.type === 'DEPOSIT'
                    ? `Se debitará de la Skin Matriz (${
                        currentSkin.name
                      }: ${formatMoney(
                        skinBalances[currentSkin.id],
                        currentSkin.currency
                      )})`
                    : `Los fondos volverán a la Skin Matriz (${currentSkin.name}).`}
                </p>
              </div>

              <button
                type="submit"
                disabled={!txModal.amount || txModal.amount <= 0}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  txModal.type === 'DEPOSIT'
                    ? 'bg-green-600 hover:bg-green-500 shadow-green-500/20'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
                }`}
              >
                Confirmar {txModal.type === 'DEPOSIT' ? 'Depósito' : 'Retiro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
