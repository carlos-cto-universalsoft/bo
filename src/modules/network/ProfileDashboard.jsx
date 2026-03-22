import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  Gamepad2,
  AlertTriangle,
  Trophy,
  Activity,
  BellRing,
  Server,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const formatMoney = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount || 0);
};

const formatPercent = (value) => {
  if (isNaN(value) || !isFinite(value)) return '0.00%';
  return `${value.toFixed(2)}%`;
};

const ENDPOINT_NODES = [
  'Apostador WEB',
  'Apostador Terminal',
  'Apostador Retail',
];
const PLAYABLE_NODES = [...ENDPOINT_NODES, 'Cajero'];

// 🛡️ MOTOR MATEMÁTICO (Con reglas estrictas de caja y simulación de fraude)
const getSelfStats = (node) => {
  const seed = node.id.length + (node.balance || 1000);
  const apostados = seed * 15.5;
  const pagados = apostados * 0.7;

  // Simulamos que los nodos con ID par tienen 12% de anulaciones (para ver el radar púrpura)
  const esSospechoso = seed % 2 === 0;
  const porcentajeAnulacion = esSospechoso ? 0.12 : 0.05;

  const anulados = apostados * porcentajeAnulacion;
  const ggr = apostados - pagados - anulados;

  const canHandleCash = !ENDPOINT_NODES.includes(node.type);

  return {
    depositos: canHandleCash ? seed * 2.1 : 0,
    retiros: canHandleCash ? seed * 0.8 : 0,
    apostados,
    pagados,
    anulados,
    ggr,
  };
};

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

export const ProfileDashboard = ({ userData, currentSkin }) => {
  const { networks } = useData();
  const freshUser = networks.find((n) => n.id === userData.id) || userData;
  const isEndpoint = ENDPOINT_NODES.includes(freshUser.type);

  const [expandedGroups, setExpandedGroups] = useState({});

  const getAllDescendants = (parentId, allNodes) => {
    let descendants = [];
    const children = allNodes.filter((n) => n.parentId === parentId);
    for (let child of children) {
      descendants.push(child);
      descendants = descendants.concat(getAllDescendants(child.id, allNodes));
    }
    return descendants;
  };

  const getTreeStats = (nodeId) => {
    const node = networks.find((n) => n.id === nodeId);
    const descendants = getAllDescendants(nodeId, networks);
    const nodesToSum = [node, ...descendants].filter(Boolean);

    let total = {
      apostados: 0,
      pagados: 0,
      anulados: 0,
      ggr: 0,
      totalNodos: descendants.length,
    };

    nodesToSum.forEach((n) => {
      if (PLAYABLE_NODES.includes(n.type)) {
        const s = getSelfStats(n);
        total.apostados += s.apostados;
        total.pagados += s.pagados;
        total.anulados += s.anulados;
        total.ggr += s.ggr;
      }
    });

    return total;
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // =========================================================================
  // VISTA 1: ENDPOINT (Terminal de Consumo)
  // =========================================================================
  if (isEndpoint) {
    const myStats = getSelfStats(freshUser);
    const rtp = (myStats.pagados / myStats.apostados) * 100 || 0;

    return (
      <div className="flex flex-col gap-6 animate-in fade-in">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
          <Gamepad2 className="text-blue-400 mt-0.5" size={20} />
          <div>
            <h4 className="text-blue-400 font-bold text-sm">
              Terminal de Consumo (Endpoint)
            </h4>
            <p className="text-xs text-blue-400/70 mt-1">
              Este usuario es <strong>{freshUser.type}</strong>. Su función
              exclusiva es generar volumen de juego.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Saldo Asignado
              </h3>
              <Wallet className="text-slate-500" size={20} />
            </div>
            <p className="text-3xl font-mono font-bold text-white mb-1">
              {formatMoney(freshUser.balance, currentSkin.currency)}
            </p>
          </div>
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Volumen Apostado
              </h3>
              <Activity className="text-blue-400" size={20} />
            </div>
            <p className="text-3xl font-mono font-bold text-white mb-1">
              {formatMoney(myStats.apostados, currentSkin.currency)}
            </p>
            <p className="text-xs text-slate-500">
              RTP Histórico:{' '}
              <strong className="text-blue-400">{formatPercent(rtp)}</strong>
            </p>
          </div>
          <div className="bg-[#111827] rounded-xl border border-[#D10057]/30 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#D10057] uppercase tracking-widest">
                GGR Generado
              </h3>
              <TrendingUp className="text-[#D10057]" size={20} />
            </div>
            <p className="text-3xl font-mono font-bold text-emerald-400 mb-1">
              {formatMoney(myStats.ggr, currentSkin.currency)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: MANAGEMENT DASHBOARD
  // =========================================================================
  const directChildren = networks.filter((n) => n.parentId === freshUser.id);
  const allDescendants = getAllDescendants(freshUser.id, networks);
  const myTreeStats = getTreeStats(freshUser.id);

  const globalRTP = (myTreeStats.pagados / myTreeStats.apostados) * 100 || 0;
  const globalMargin = (myTreeStats.ggr / myTreeStats.apostados) * 100 || 0;

  // 🚨 RECOLECCIÓN DE ALERTAS (Radar de Operaciones)
  const criticalAlerts = [];
  const warningAlerts = [];
  const fraudAlerts = [];

  allDescendants.forEach((node) => {
    // 1. Evaluación de Saldos
    if ((node.balance || 0) <= 0) {
      criticalAlerts.push(node);
    } else if ((node.balance || 0) < 500) {
      warningAlerts.push(node);
    }

    // 2. Evaluación de Fraude (Tasa de Anulaciones > 8%)
    if (PLAYABLE_NODES.includes(node.type)) {
      const stats = getSelfStats(node);
      if (stats.apostados > 0) {
        const tasaAnulacion = (stats.anulados / stats.apostados) * 100;
        if (tasaAnulacion > 8) {
          fraudAlerts.push({ ...node, tasaAnulacion });
        }
      }
    }
  });

  const totalAlertsCount =
    criticalAlerts.length + warningAlerts.length + fraudAlerts.length;
  const ALERT_THRESHOLD = 5;
  const isGroupedView = totalAlertsCount > ALERT_THRESHOLD;

  // Motor de Agrupación Dinámica (Modo Macro) con Corrección de Matriz
  let groupedAlerts = [];
  if (isGroupedView) {
    const groupMap = {};

    const traceAncestor = (nodeId) => {
      // CORRECCIÓN: Si estamos en la base, generamos el nombre comercial de la Skin
      if (nodeId === 'root') {
        const skinCode =
          currentSkin.code || currentSkin.id.split('_')[1] || 'xx';
        return {
          id: 'root',
          username: `universalrace.${skinCode.toLowerCase()}.${currentSkin.currency.toLowerCase()}`,
          type: 'Matriz',
        };
      }

      let curr = networks.find((n) => n.id === nodeId);
      let safeCounter = 0;
      while (
        curr &&
        curr.parentId &&
        curr.parentId !== freshUser.id &&
        curr.parentId !== 'root' &&
        safeCounter < 50
      ) {
        curr = networks.find((n) => n.id === curr.parentId);
        safeCounter++;
      }

      // Si todo falla o llegó a root como parent, devolvemos curr o un nodo Matriz limpio
      if (!curr) {
        const skinCode =
          currentSkin.code || currentSkin.id.split('_')[1] || 'xx';
        return {
          id: 'root',
          username: `universalrace.${skinCode.toLowerCase()}.${currentSkin.currency.toLowerCase()}`,
          type: 'Matriz',
        };
      }
      return curr;
    };

    const processAlert = (alertNode, type) => {
      const ancestor = traceAncestor(alertNode.id);
      if (ancestor) {
        if (!groupMap[ancestor.id]) {
          groupMap[ancestor.id] = {
            ancestor,
            criticalNodes: [],
            warningNodes: [],
            fraudNodes: [],
          };
        }
        if (type === 'critical')
          groupMap[ancestor.id].criticalNodes.push(alertNode);
        if (type === 'warning')
          groupMap[ancestor.id].warningNodes.push(alertNode);
        if (type === 'fraud') groupMap[ancestor.id].fraudNodes.push(alertNode);
      }
    };

    criticalAlerts.forEach((n) => processAlert(n, 'critical'));
    warningAlerts.forEach((n) => processAlert(n, 'warning'));
    fraudAlerts.forEach((n) => processAlert(n, 'fraud'));

    groupedAlerts = Object.values(groupMap).sort(
      (a, b) =>
        b.criticalNodes.length +
        b.warningNodes.length +
        b.fraudNodes.length -
        (a.criticalNodes.length + a.warningNodes.length + a.fraudNodes.length)
    );
  }

  // Ranking Top 5
  const rankedChildren = directChildren
    .map((c) => ({
      ...c,
      stats: getTreeStats(c.id),
    }))
    .sort((a, b) => b.stats.ggr - a.stats.ggr)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in text-slate-200">
      {/* 1. KPIs SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 flex-shrink-0">
            <Wallet className="text-slate-300" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Saldo Asignado
            </p>
            <h4 className="text-xl font-mono font-bold text-white">
              {formatMoney(freshUser.balance, currentSkin.currency)}
            </h4>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl border border-[#D10057]/20 p-5 flex items-center gap-4 shadow-[0_0_15px_rgba(209,0,87,0.05)] relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-[#D10057]/10 flex items-center justify-center border border-[#D10057]/20 flex-shrink-0 relative z-10">
            <TrendingUp className="text-[#D10057]" size={20} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#D10057] uppercase tracking-widest">
              GGR Consolidado
            </p>
            <h4 className="text-xl font-mono font-bold text-emerald-400">
              {formatMoney(myTreeStats.ggr, currentSkin.currency)}
            </h4>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 flex-shrink-0">
            <Activity className="text-blue-400" size={20} />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Margen GGR
              </span>
              <span className="text-xs font-bold text-white">
                {formatPercent(globalMargin)}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1.5">
              <div
                className="bg-blue-400 h-1.5 rounded-full"
                style={{ width: `${Math.min(globalMargin, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400">
              RTP Red:{' '}
              <strong
                className={
                  globalRTP > 90 ? 'text-rose-400' : 'text-emerald-400'
                }
              >
                {formatPercent(globalRTP)}
              </strong>
            </p>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl border border-rose-500/20 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/30 flex-shrink-0 relative">
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
            )}
            <BellRing className="text-rose-500" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-500/70 uppercase tracking-widest">
              Nodos en Riesgo
            </p>
            <h4 className="text-xl font-bold text-rose-400">
              {totalAlertsCount}{' '}
              <span className="text-xs text-slate-500 font-normal">
                Alertas
              </span>
            </h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ==========================================================
            2. RADAR DE OPERACIONES
            ========================================================== */}
        <div className="xl:col-span-2 bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0f1522]">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest">
              <AlertTriangle
                className={
                  totalAlertsCount > 0 ? 'text-rose-500' : 'text-amber-500'
                }
                size={16}
              />
              Radar de Operaciones
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-bold">
              {totalAlertsCount} ALARMAS ACTIVAS
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar min-h-[300px] bg-slate-900/50">
            {totalAlertsCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10">
                <Activity size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-bold">
                  Red operando en parámetros óptimos
                </p>
                <p className="text-xs">
                  No hay nodos sin saldo o en riesgo crítico.
                </p>
              </div>
            ) : isGroupedView ? (
              /* ----------------- MODO MACRO (AGRUPADO) ----------------- */
              <div className="space-y-3">
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-400 mb-4 flex items-start gap-2 shadow-inner">
                  <Server size={16} className="mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Modo Macro Activado:</strong> Da clic en una rama
                    para desplegar el detalle de las alertas anidadas.
                  </p>
                </div>

                {groupedAlerts.map((group) => {
                  const isExpanded = expandedGroups[group.ancestor.id];
                  return (
                    <div
                      key={group.ancestor.id}
                      className="rounded-lg bg-[#1F2937] border-l-4 border-l-purple-500 border border-slate-800 flex flex-col overflow-hidden"
                    >
                      {/* Cabecera de la Rama */}
                      <div
                        onClick={() => toggleGroup(group.ancestor.id)}
                        className="flex items-center justify-between p-3 hover:bg-slate-800 cursor-pointer transition-colors select-none"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown size={18} className="text-slate-400" />
                          ) : (
                            <ChevronRight
                              size={18}
                              className="text-slate-400"
                            />
                          )}
                          <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center text-xl shadow-inner border border-slate-800">
                            <span className="grayscale opacity-80">
                              {NODE_ICONS[group.ancestor.type] || '▪️'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              Rama: {group.ancestor.username}
                            </h4>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                              RESPONSABLE: {group.ancestor.type}
                            </p>
                          </div>
                        </div>

                        {/* Contadores */}
                        <div className="flex gap-2 text-right">
                          {group.fraudNodes.length > 0 && (
                            <div className="flex flex-col items-center justify-center bg-purple-500/10 border border-purple-500/20 rounded px-3 py-1">
                              <span className="text-sm font-bold text-purple-500">
                                {group.fraudNodes.length}
                              </span>
                              <span className="text-[8px] text-purple-400 uppercase font-bold tracking-widest">
                                Fraudes
                              </span>
                            </div>
                          )}
                          {group.criticalNodes.length > 0 && (
                            <div className="flex flex-col items-center justify-center bg-rose-500/10 border border-rose-500/20 rounded px-3 py-1">
                              <span className="text-sm font-bold text-rose-500">
                                {group.criticalNodes.length}
                              </span>
                              <span className="text-[8px] text-rose-400 uppercase font-bold tracking-widest">
                                Críticos
                              </span>
                            </div>
                          )}
                          {group.warningNodes.length > 0 && (
                            <div className="flex flex-col items-center justify-center bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1">
                              <span className="text-sm font-bold text-amber-500">
                                {group.warningNodes.length}
                              </span>
                              <span className="text-[8px] text-amber-400 uppercase font-bold tracking-widest">
                                Riesgos
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detalles Desplegados */}
                      {isExpanded && (
                        <div className="bg-[#111827] p-3 border-t border-slate-800 space-y-2">
                          {/* Fraudes */}
                          {group.fraudNodes.map((node) => (
                            <div
                              key={`f-${node.id}`}
                              className="flex items-center justify-between p-2.5 rounded bg-purple-500/5 border border-purple-500/10 ml-10"
                            >
                              <div className="flex items-center gap-2">
                                <ShieldAlert
                                  size={12}
                                  className="text-purple-500 animate-pulse"
                                />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-200">
                                    {node.username}
                                  </h4>
                                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                                    {node.type}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded uppercase">
                                ANULACIONES: {formatPercent(node.tasaAnulacion)}
                              </span>
                            </div>
                          ))}

                          {/* Críticos */}
                          {group.criticalNodes.map((node) => (
                            <div
                              key={`c-${node.id}`}
                              className="flex items-center justify-between p-2.5 rounded bg-rose-500/5 border border-rose-500/10 ml-10"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-200">
                                    {node.username}
                                  </h4>
                                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                                    {node.type}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded uppercase">
                                Sin Saldo
                              </span>
                            </div>
                          ))}

                          {/* Advertencias */}
                          {group.warningNodes.map((node) => (
                            <div
                              key={`warn-${node.id}`}
                              className="flex items-center justify-between p-2.5 rounded bg-amber-500/5 border border-amber-500/10 ml-10"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-200">
                                    {node.username}
                                  </h4>
                                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                                    {node.type}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded uppercase">
                                Saldo:{' '}
                                {formatMoney(
                                  node.balance,
                                  currentSkin.currency
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ----------------- MODO MICRO (VISTA PLANA INDIVIDUAL) ----------------- */
              <div className="space-y-3">
                {fraudAlerts.map((node) => (
                  <div
                    key={`fraud-${node.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1F2937] border-l-4 border-l-purple-500 border border-slate-800 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert
                        size={18}
                        className="text-purple-500 animate-pulse"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {node.username}
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                          {node.type}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded uppercase">
                      ANULACIONES: {formatPercent(node.tasaAnulacion)}
                    </span>
                  </div>
                ))}

                {criticalAlerts.map((node) => (
                  <div
                    key={`crit-${node.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1F2937] border-l-4 border-l-rose-500 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {node.username}
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                          {node.type}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded uppercase">
                      Sin Saldo
                    </span>
                  </div>
                ))}

                {warningAlerts.map((node) => (
                  <div
                    key={`warn-${node.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1F2937] border-l-4 border-l-amber-500 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {node.username}
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                          {node.type}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded uppercase">
                      Saldo: {formatMoney(node.balance, currentSkin.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. RANKING DE RED */}
        <div className="bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0f1522]">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest">
              <Trophy className="text-amber-400" size={16} /> Top Nodos Directos
            </h3>
            <span className="text-[10px] text-slate-500 uppercase">
              Por GGR
            </span>
          </div>
          <div className="p-0 flex-1 overflow-y-auto custom-scrollbar min-h-[300px]">
            {rankedChildren.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                <AlertCircle size={24} className="mb-2 opacity-50" />
                No hay dependientes directos para evaluar.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {rankedChildren.map((node, index) => {
                  const nodeMargin =
                    (node.stats.ggr / node.stats.apostados) * 100 || 0;
                  return (
                    <div
                      key={node.id}
                      className="p-4 flex items-center gap-4 hover:bg-[#1F2937] transition-colors group"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          index === 0
                            ? 'bg-amber-400 text-amber-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : index === 1
                            ? 'bg-slate-300 text-slate-900'
                            : index === 2
                            ? 'bg-amber-700 text-amber-100'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-[#D10057] transition-colors">
                          {node.username}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                            {node.type}
                          </p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            MRG: {formatPercent(nodeMargin)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-mono font-bold text-emerald-400">
                          {formatMoney(node.stats.ggr, currentSkin.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
