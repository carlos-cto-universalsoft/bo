import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Eye,
  ArrowLeftRight,
  ListFilter,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

// -----------------------------------------------------------------------------
// 🛠️ HELPERS DE FORMATO
// -----------------------------------------------------------------------------
const formatMoney = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount || 0);
};

const formatDateTime = (isoString) => {
  const d = new Date(isoString);
  return d
    .toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    .toUpperCase();
};

// -----------------------------------------------------------------------------
// 📦 DATOS DE PRUEBA (MOCKUP ENTERPRISE)
// -----------------------------------------------------------------------------
const generateMockTransactions = () => {
  return [
    {
      id: 'TX-1004592',
      date: '2026-03-06T14:30:15Z',
      operation: 'APUESTA',
      vertical: 'HÍPICAS',
      flow: 'Sistema',
      operator: 'Sistema',
      wallet: 'BONO',
      amount: -50.0,
      currentBalance: 1500.0,
      balanceBonus: 0.0,
      status: 'COMPLETADO',
    },
    {
      id: 'TX-1004593',
      date: '2026-03-06T14:45:10Z',
      operation: 'GANANCIA',
      vertical: 'CRASH GAMES',
      flow: 'Sistema',
      operator: 'Sistema',
      wallet: 'REAL',
      amount: 200.0,
      currentBalance: 1700.0,
      balanceBonus: 0.0,
      status: 'COMPLETADO',
    },
    {
      id: 'TX-1004596',
      date: '2026-03-06T16:30:00Z',
      operation: 'AJUSTE (-)',
      vertical: '-',
      flow: 'Sistema',
      operator: 'admin.auditor (BO)',
      wallet: 'REAL',
      amount: -200.0,
      currentBalance: 2000.0,
      balanceBonus: 0.0,
      status: 'COMPLETADO',
    },
    {
      id: 'TX-1004598',
      date: '2026-03-06T17:15:30Z',
      operation: 'ANULACIÓN',
      vertical: 'SPORTSBOOK',
      flow: 'Sistema',
      operator: 'Sistema',
      wallet: 'REAL',
      amount: 100.0,
      currentBalance: 1100.0,
      balanceBonus: 0.0,
      status: 'COMPLETADO',
    },
  ];
};

export const ProfileTransactions = ({ userData, currentSkin }) => {
  const { hasPermission, transactions: globalTransactions } = useData();
  const canReadTx = hasPermission(currentSkin.id, 'net_tx_read');

  const allTransactions = useMemo(() => {
    const realTx = (globalTransactions || [])
      .filter((tx) => tx.nodeId === userData.id && tx.skinId === currentSkin.id)
      .map((tx) => {
        const isDep = tx.type === 'DEPOSIT';
        return {
          id: tx.id,
          date: tx.date,
          operation: isDep ? 'DEPÓSITO RED' : 'RETIRO RED',
          vertical: 'CAJA BO',
          flow: isDep ? '← Skin Matriz' : '→ Skin Matriz',
          operator: tx.operator,
          wallet: tx.wallet || 'REAL',
          amount: isDep ? Math.abs(tx.amount) : -Math.abs(tx.amount),
          // 👈 CORRECCIÓN: Lee el saldo congelado (o el actual si es data vieja)
          currentBalance:
            tx.currentBalance !== undefined
              ? tx.currentBalance
              : userData.balance || 0,
          balanceBonus: 0,
          status: 'COMPLETADO',
        };
      });

    const combined = [...realTx, ...generateMockTransactions()];
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [globalTransactions, userData.id, currentSkin.id, userData.balance]);

  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOperation, setFilterOperation] = useState('TODAS');
  const [filterWallet, setFilterWallet] = useState('TODAS');
  const [dateRange, setDateRange] = useState('');

  const filteredData = useMemo(() => {
    return allTransactions.filter((tx) => {
      const matchSearch =
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.operator.toLowerCase().includes(searchTerm.toLowerCase());

      const matchOp =
        filterOperation === 'TODAS' || tx.operation.includes(filterOperation);

      const matchWallet =
        filterWallet === 'TODAS' || tx.wallet === filterWallet;

      const matchDate = !dateRange || tx.date.startsWith(dateRange);

      return matchSearch && matchOp && matchWallet && matchDate;
    });
  }, [allTransactions, searchTerm, filterOperation, filterWallet, dateRange]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!canReadTx) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 bg-[#111827] rounded-3xl border border-slate-800 shadow-sm animate-in fade-in">
        <div className="p-6 bg-red-500/10 rounded-full mb-6 ring-1 ring-red-500/30">
          <Lock className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
          Lectura de Libro Mayor Bloqueada
        </h2>
        <p className="text-slate-400 max-w-md text-center text-sm leading-relaxed">
          Tu nivel de acceso actual no autoriza la auditoría de transacciones,
          apuestas o saldos históricos de{' '}
          <span className="font-bold text-white">{userData.username}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <ArrowLeftRight className="text-blue-500" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Libro Mayor (Transacciones)
            </h2>
            <p className="text-xs text-slate-400">
              Auditoría financiera de {userData.username}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              isFiltersOpen
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-[#111827] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <ListFilter size={14} />
            {isFiltersOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            {isFiltersOpen ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors border border-emerald-500/20 text-xs font-bold shadow-sm">
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700 text-xs font-bold shadow-sm">
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${
          isFiltersOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
        }`}
      >
        <div className="bg-[#111827] p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                Buscar ID o Contraparte
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-2.5 text-slate-500"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Ej: TX-1004592..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#1F2937] border border-slate-700 text-white text-sm py-2 pl-9 pr-3 rounded-lg outline-none focus:border-[#D10057] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                Operación
              </label>
              <select
                value={filterOperation}
                onChange={(e) => {
                  setFilterOperation(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#1F2937] border border-slate-700 text-white text-sm py-2 px-3 rounded-lg outline-none focus:border-[#D10057] transition-colors"
              >
                <option value="TODAS">Todas</option>
                <option value="APUESTA">Apuestas</option>
                <option value="GANANCIA">Ganancias / Premios</option>
                <option value="DEPÓSITO">Depósitos / Fondeos</option>
                <option value="RETIRO">Retiros / Recaudos</option>
                <option value="AJUSTE">Ajustes BO</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                Billetera
              </label>
              <select
                value={filterWallet}
                onChange={(e) => {
                  setFilterWallet(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#1F2937] border border-slate-700 text-white text-sm py-2 px-3 rounded-lg outline-none focus:border-[#D10057] transition-colors"
              >
                <option value="TODAS">Real + Bono</option>
                <option value="REAL">Solo Saldo Real</option>
                <option value="BONO">Solo Saldo Bono</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                Rango de Fechas
              </label>
              <input
                type="date"
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#1F2937] border border-slate-700 text-white text-sm py-2 px-3 rounded-lg outline-none focus:border-[#D10057] transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl border border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#0f1522] text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 pl-6">ID Transacción</th>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3">Operación</th>
                <th className="px-4 py-3">Vertical</th>
                <th className="px-4 py-3">Flujo (Origen/Destino)</th>
                <th className="px-4 py-3">Operador</th>
                <th className="px-4 py-3 text-center">Wallet</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-right">Saldo Actual</th>
                <th className="px-4 py-3 text-right">Saldo Bono</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 pr-6 text-center">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/50">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan="12"
                    className="px-6 py-12 text-center text-slate-500 font-medium"
                  >
                    No se encontraron transacciones con los filtros actuales.
                  </td>
                </tr>
              ) : (
                paginatedData.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-4 py-2.5 pl-6 font-mono font-bold text-slate-300">
                      {tx.id}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {formatDateTime(tx.date)}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-200">
                      {tx.operation}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {tx.vertical}
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">{tx.flow}</td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {tx.operator}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          tx.wallet === 'REAL'
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}
                      >
                        {tx.wallet}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-mono font-bold ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}
                      {formatMoney(tx.amount, currentSkin.currency)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-white">
                      {formatMoney(tx.currentBalance, currentSkin.currency)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                      {formatMoney(tx.balanceBonus, currentSkin.currency)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          tx.status === 'COMPLETADO'
                            ? 'text-emerald-500'
                            : tx.status === 'PENDIENTE'
                            ? 'text-amber-500'
                            : 'text-rose-500'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 pr-6 text-center">
                      <button
                        title="Ver Detalles"
                        className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded transition-colors inline-flex items-center justify-center"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#0f1522] border-t border-slate-800 p-3 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
          <div className="text-xs text-slate-400">
            Mostrando{' '}
            <span className="font-bold text-white">
              {filteredData.length === 0
                ? 0
                : (currentPage - 1) * rowsPerPage + 1}
            </span>{' '}
            a{' '}
            <span className="font-bold text-white">
              {Math.min(currentPage * rowsPerPage, filteredData.length)}
            </span>{' '}
            de{' '}
            <span className="font-bold text-white">{filteredData.length}</span>{' '}
            transacciones
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Filas:
              </span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#1F2937] border border-slate-700 text-white text-xs py-1 px-2 rounded outline-none focus:border-[#D10057]"
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-[#1F2937] border border-slate-700 text-slate-400 rounded hover:bg-slate-700 hover:text-white transition-colors text-xs font-bold disabled:opacity-50"
              >
                Ant
              </button>

              <span className="px-3 py-1 bg-[#1F2937] border border-slate-700 text-slate-300 rounded text-xs font-bold">
                Pág {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-[#1F2937] border border-slate-700 text-slate-400 rounded hover:bg-slate-700 hover:text-white transition-colors text-xs font-bold disabled:opacity-50"
              >
                Sig
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
