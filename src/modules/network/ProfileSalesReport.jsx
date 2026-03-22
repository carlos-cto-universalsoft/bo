import React, { useState } from 'react';
import {
  Search,
  Download,
  Calculator,
  AlertCircle,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const formatMoney = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount || 0);
};

const ENDPOINT_NODES = [
  'Apostador WEB',
  'Apostador Terminal',
  'Apostador Retail',
];
const PLAYABLE_NODES = [...ENDPOINT_NODES, 'Cajero'];

// Generador de data base (Rendimiento INDIVIDUAL de un nodo)
const getSelfStats = (node) => {
  const seed = node.id.length + (node.balance || 1000);
  const apostados = seed * 15.5;
  const pagados = apostados * 0.7;
  const anulados = apostados * 0.05;
  const ggr = apostados - pagados - anulados;

  // Verificación estricta: Si es un terminal, NO puede tener depósitos ni retiros.
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

export const ProfileSalesReport = ({ userData, currentSkin }) => {
  const { networks } = useData();
  const freshUser = networks.find((n) => n.id === userData.id) || userData;
  const isEndpoint = ENDPOINT_NODES.includes(freshUser.type);

  // Estados
  const [dateFrom, setDateFrom] = useState('2026-03-01');
  const [dateTo, setDateTo] = useState('2026-03-05');
  const [expandedNodes, setExpandedNodes] = useState({});

  // Funciones Recursivas
  const getAllDescendants = (parentId, allNodes) => {
    let descendants = [];
    const children = allNodes.filter((n) => n.parentId === parentId);
    for (let child of children) {
      descendants.push(child);
      descendants = descendants.concat(getAllDescendants(child.id, allNodes));
    }
    return descendants;
  };

  // MATEMÁTICA CONSOLIDADA (Corregida según tu regla de negocio)
  const getTreeStats = (nodeId) => {
    const node = networks.find((n) => n.id === nodeId);
    const descendants = getAllDescendants(nodeId, networks);
    const nodesToSum = [node, ...descendants].filter(Boolean);

    let total = {
      depositos: 0,
      retiros: 0,
      apostados: 0,
      pagados: 0,
      anulados: 0,
      ggr: 0,
      totalNodos: descendants.length,
    };

    nodesToSum.forEach((n) => {
      // 1. Sumar volumen de juego solo de los que apuestan
      if (PLAYABLE_NODES.includes(n.type)) {
        const s = getSelfStats(n);
        total.apostados += s.apostados;
        total.pagados += s.pagados;
        total.anulados += s.anulados;
        total.ggr += s.ggr;
      }
      // 2. Sumar depósitos/retiros solo del nodo principal consultado (para no duplicar caja)
      if (n.id === nodeId) {
        const s = getSelfStats(n);
        total.depositos += s.depositos;
        total.retiros += s.retiros;
      }
    });

    return total;
  };

  const directChildren = networks.filter((n) => n.parentId === freshUser.id);
  const myTreeStats = getTreeStats(freshUser.id);

  // Toggle para expandir/colapsar ramas en la tabla
  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Renderizador Recursivo de Filas (Tree-Table)
  const renderRowTree = (node, depth = 0) => {
    const children = networks.filter((n) => n.parentId === node.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedNodes[node.id];
    const isPlayable = PLAYABLE_NODES.includes(node.type);
    const nodeStats = getTreeStats(node.id);

    let rows = [
      <tr
        key={`row-${node.id}`}
        className="hover:bg-slate-800/30 transition-colors group border-b border-slate-800/50"
      >
        <td className="p-4" style={{ paddingLeft: `${1.5 + depth * 2}rem` }}>
          <div className="flex items-center gap-1.5">
            {hasChildren ? (
              <button
                onClick={() => toggleNode(node.id)}
                className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-white transition-colors flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            ) : (
              <div className="w-6 flex-shrink-0 text-slate-700 font-bold text-center">
                -
              </div>
            )}
            <span className="font-bold text-slate-200 group-hover:text-[#D10057] transition-colors">
              {node.username}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 ml-7">
            ID: {node.id.split('-')[1]}{' '}
            {hasChildren && `• ${nodeStats.totalNodos} sub-nodos`}
          </div>
        </td>
        <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
          {node.type}
        </td>
        <td className="p-4 text-right font-mono text-slate-300">
          {formatMoney(nodeStats.depositos, currentSkin.currency)}
        </td>
        <td className="p-4 text-right font-mono text-slate-300">
          {formatMoney(nodeStats.retiros, currentSkin.currency)}
        </td>
        <td className="p-4 text-right font-mono text-blue-400 bg-blue-500/5">
          {formatMoney(nodeStats.apostados, currentSkin.currency)}
        </td>
        <td className="p-4 text-right font-mono text-slate-500">
          {formatMoney(nodeStats.anulados, currentSkin.currency)}
        </td>
        <td className="p-4 text-right font-mono text-slate-300">
          {formatMoney(nodeStats.pagados, currentSkin.currency)}
        </td>
        <td className="p-4 text-right font-mono font-bold text-emerald-400 pr-6 bg-emerald-500/5">
          {formatMoney(nodeStats.ggr, currentSkin.currency)}
        </td>
      </tr>,
    ];

    if (isExpanded && hasChildren) {
      // FILA FANTASMA (El Doble Cajero)
      if (isPlayable) {
        const selfStats = getSelfStats(node);
        rows.push(
          <tr
            key={`row-self-${node.id}`}
            className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/30 bg-[#111827]"
          >
            <td
              className="p-4"
              style={{ paddingLeft: `${1.5 + (depth + 1) * 2}rem` }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-6 flex-shrink-0 text-slate-700 font-bold text-center">
                  -
                </div>
                <span className="font-bold text-slate-400">
                  {node.username}{' '}
                  <span className="text-[10px] font-normal">(Caja Propia)</span>
                </span>
              </div>
            </td>
            <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              {node.type}
            </td>
            <td className="p-4 text-right font-mono text-slate-500">$0.00</td>
            <td className="p-4 text-right font-mono text-slate-500">$0.00</td>
            <td className="p-4 text-right font-mono text-slate-400">
              {formatMoney(selfStats.apostados, currentSkin.currency)}
            </td>
            <td className="p-4 text-right font-mono text-slate-600">
              {formatMoney(selfStats.anulados, currentSkin.currency)}
            </td>
            <td className="p-4 text-right font-mono text-slate-500">
              {formatMoney(selfStats.pagados, currentSkin.currency)}
            </td>
            <td className="p-4 text-right font-mono font-bold text-emerald-500/70 pr-6">
              {formatMoney(selfStats.ggr, currentSkin.currency)}
            </td>
          </tr>
        );
      }
      children.forEach((child) => {
        rows = rows.concat(renderRowTree(child, depth + 1));
      });
    }

    return rows;
  };

  if (isEndpoint) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20 animate-in fade-in">
        <Calculator size={48} className="text-slate-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          Punto de Consumo Final
        </h3>
        <p className="text-sm text-center max-w-md">
          Este usuario ({freshUser.type}) no posee una red a su cargo. Los
          reportes de ventas consolidados solo están disponibles para nodos
          gerenciales.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] animate-in fade-in">
      {/* CABECERA Y FILTROS */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 shadow-sm mb-6 p-5 flex-shrink-0">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Calculator className="text-[#D10057]" size={20} /> Estado de Caja
          (Desglose de Red)
        </h3>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">
              Desde:
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-[#1F2937] border border-slate-700 text-white text-xs font-bold py-2.5 pl-3 pr-8 rounded-lg outline-none focus:border-[#D10057] transition-colors w-40 [color-scheme:dark]"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">
              Hasta:
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-[#1F2937] border border-slate-700 text-white text-xs font-bold py-2.5 pl-3 pr-8 rounded-lg outline-none focus:border-[#D10057] transition-colors w-40 [color-scheme:dark]"
              />
            </div>
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 border border-slate-700">
            <Search size={14} /> Aplicar Filtros
          </button>

          <button className="ml-auto bg-[#D10057] hover:bg-pink-600 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-[#D10057]/20">
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* TABLA DE REPORTE (TREE-TABLE) */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 relative">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f1522] text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 sticky top-0 z-20">
              <tr>
                <th className="p-4 pl-6">Usuario de Red</th>
                <th className="p-4">Jerarquía</th>
                <th className="p-4 text-right">Depósitos</th>
                <th className="p-4 text-right">Retiros</th>
                <th className="p-4 text-right text-blue-400">Apostado</th>
                <th className="p-4 text-right">Anulado</th>
                <th className="p-4 text-right">Pagado</th>
                <th className="p-4 text-right pr-6 text-emerald-400">
                  GGR Neto
                </th>
              </tr>
            </thead>

            <tbody className="bg-[#111827]">
              {directChildren.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">
                    <AlertCircle
                      size={32}
                      className="mx-auto mb-3 opacity-30"
                    />
                    <p className="font-bold">No hay transacciones</p>
                    <p className="text-xs mt-1">
                      Este usuario no ha generado dependientes operativos en
                      este rango de fechas.
                    </p>
                  </td>
                </tr>
              ) : (
                directChildren.flatMap((child) => renderRowTree(child, 0))
              )}
            </tbody>

            {/* FILA FIJA DE TOTALES AL FONDO */}
            {directChildren.length > 0 && (
              <tfoot className="bg-[#0f1522] sticky bottom-0 z-20 border-t-2 border-[#D10057]/50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <tr>
                  <td
                    className="p-4 pl-6 text-right uppercase text-[10px] font-bold tracking-widest text-slate-400"
                    colSpan="2"
                  >
                    Totales Consolidados de la Red
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-white">
                    {formatMoney(myTreeStats.depositos, currentSkin.currency)}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-white">
                    {formatMoney(myTreeStats.retiros, currentSkin.currency)}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-blue-400">
                    {formatMoney(myTreeStats.apostados, currentSkin.currency)}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-slate-400">
                    {formatMoney(myTreeStats.anulados, currentSkin.currency)}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-white">
                    {formatMoney(myTreeStats.pagados, currentSkin.currency)}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-emerald-400 pr-6">
                    {formatMoney(myTreeStats.ggr, currentSkin.currency)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
