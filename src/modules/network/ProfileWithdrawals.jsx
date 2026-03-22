import React, { useState } from 'react';
import {
  ArrowUpToLine,
  ShieldAlert,
  CheckCircle2,
  Info,
  Lock,
  History,
  Wallet,
  Building2,
  Search,
  Calendar,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const formatMoney = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount || 0);
};

export const ProfileWithdrawals = ({ userData, currentSkin }) => {
  // Extraemos la DB Global de Transacciones
  const {
    hasPermission,
    skinBalances,
    transferFunds,
    currentUser,
    transactions,
    addTransaction,
  } = useData();

  // 🛡️ PILARES DE SEGURIDAD (Matriz de Permisos para Retiros)
  const canReadGrid = hasPermission(currentSkin.id, 'net_withdraw_read'); // Fila 3
  const canWriteWithdraw = hasPermission(currentSkin.id, 'net_withdraw_write'); // Fila 4

  // Liquidez de la Bóveda Central (Skin)
  const vaultBalance = skinBalances?.[currentSkin.id] || 0;

  // Estados del Formulario de Recaudo/Retiro
  const [amount, setAmount] = useState('');
  const [walletType, setWalletType] = useState('REAL');
  const [auditNote, setAuditNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [searchOperator, setSearchOperator] = useState('');

  // Extracción pura de transacciones solo para ESTE usuario, ESTA Skin y de TIPO Retiro
  const recentWithdrawals = (transactions || []).filter(
    (tx) =>
      tx.type === 'WITHDRAW' &&
      tx.nodeId === userData.id &&
      tx.skinId === currentSkin.id
  );

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validación 1: Permisos Fila 4
    if (!canWriteWithdraw) return;

    // Validación 2: Liquidez del Nodo (El usuario no puede quedar en negativo)
    const numAmount = parseFloat(amount);
    if (numAmount > (userData.balance || 0)) {
      setErrorMsg(
        `El usuario ${userData.username} no posee saldo suficiente para este retiro.`
      );
      return;
    }

    setIsSubmitting(true);

    // 1. Ejecutar impacto de saldo global y capturar el nuevo saldo exacto
    const postBalance = transferFunds(
      currentSkin.id,
      userData.id,
      numAmount,
      'WITHDRAW'
    );

    // Validación extra de seguridad (Si falló transferFunds, abortamos)
    if (postBalance === null) {
      setIsSubmitting(false);
      return;
    }

    // 2. Grabar en el Libro Mayor Global (Persistente)
    setTimeout(() => {
      const newTransaction = {
        id: `WD-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'WITHDRAW',
        nodeId: userData.id,
        skinId: currentSkin.id,
        date: new Date().toISOString(),
        amount: numAmount,
        currentBalance: postBalance, // 👈 Se guarda el saldo congelado
        wallet: walletType,
        operator: currentUser?.user || 'BO_Operator', // Firma inmutable del empleado logueado
        note: auditNote,
      };

      addTransaction(newTransaction); // Guardado global

      setIsSubmitting(false);
      setAmount('');
      setAuditNote('');
      alert(
        `✅ Retiro exitoso. Se recaudaron ${formatMoney(
          numAmount,
          currentSkin.currency
        )} de ${userData.username}`
      );
    }, 500);
  };

  const filteredWithdrawals = recentWithdrawals.filter((dep) =>
    dep.operator.toLowerCase().includes(searchOperator.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in text-slate-200">
      {/* =========================================================
          BLOQUE 1: HEADER DUAL DE LIQUIDEZ (Bóveda vs Nodo)
          ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 p-3 bg-[#0B1120] rounded-lg border border-slate-800/50">
          <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Bóveda Central ({currentSkin.name})
            </p>
            <p className="text-xl font-mono font-bold text-white mt-0.5">
              {formatMoney(vaultBalance, currentSkin.currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 bg-[#0B1120] rounded-lg border border-slate-800/50">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Saldo Actual ({userData.username})
            </p>
            <p className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
              {formatMoney(userData.balance, currentSkin.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* =========================================================
            BLOQUE 2: FORMULARIO DE EJECUCIÓN (Protegido Fila 4)
            ========================================================= */}
        <div className="xl:w-[400px] flex-shrink-0 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-1">
            <ArrowUpToLine className="text-amber-500" size={18} />
            <h2 className="text-base font-bold text-white tracking-tight">
              Ejecutar Retiro / Recaudo
            </h2>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
            {/* Ceguera Selectiva - Fila 4 */}
            {!canWriteWithdraw && (
              <div className="absolute inset-0 z-10 bg-[#111827]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center border border-slate-800/50 rounded-xl">
                <Lock className="w-10 h-10 text-slate-500 mb-3" />
                <h3 className="text-white font-bold text-sm mb-1">
                  Escritura Bloqueada
                </h3>
                <p className="text-[11px] text-slate-400 max-w-[250px]">
                  No tienes el permiso{' '}
                  <span className="text-amber-500 font-mono">
                    net_withdraw_write
                  </span>
                  .
                </p>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                  Monto a Retirar
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold text-sm">
                    {currentSkin.currency === 'USD'
                      ? '$'
                      : currentSkin.currency}
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    disabled={!canWriteWithdraw || isSubmitting}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full bg-[#1F2937] border ${
                      errorMsg ? 'border-red-500' : 'border-slate-700'
                    } text-white text-base py-2 pl-12 pr-3 rounded-lg outline-none focus:border-amber-500 transition-colors font-mono font-bold disabled:opacity-50`}
                    placeholder="0.00"
                  />
                </div>
                {errorMsg && (
                  <p className="text-[10px] text-red-400 mt-1 font-bold">
                    {errorMsg}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                  Billetera Origen
                </label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value)}
                  disabled={!canWriteWithdraw || isSubmitting}
                  className="w-full bg-[#1F2937] border border-slate-700 text-slate-200 text-sm py-2 px-3 rounded-lg outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
                >
                  <option value="REAL">Saldo Real (Acredita en Bóveda)</option>
                  <option value="BONO">Saldo Promocional (Ajuste)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    Nota de Auditoría{' '}
                    <Info size={12} className="text-amber-500" />
                  </span>
                  <span className="text-slate-600 text-[9px]">
                    {auditNote.length}/150
                  </span>
                </label>
                <textarea
                  required
                  maxLength={150}
                  disabled={!canWriteWithdraw || isSubmitting}
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  rows={3}
                  placeholder="Justifique el recaudo manual..."
                  className="w-full bg-[#1F2937] border border-slate-700 text-white text-sm py-2 px-3 rounded-lg outline-none focus:border-amber-500 transition-colors resize-none disabled:opacity-50 custom-scrollbar"
                />
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <ShieldAlert
                  className="text-red-500 mt-0.5 flex-shrink-0"
                  size={14}
                />
                <p className="text-[10px] text-red-400/90 leading-relaxed">
                  Operación Inmutable. Quedarás registrado como el Operador
                  Autorizador de este recaudo.
                </p>
              </div>

              <button
                type="submit"
                disabled={
                  !canWriteWithdraw || isSubmitting || !amount || !auditNote
                }
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  'Procesando...'
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Confirmar Retiro
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* =========================================================
            BLOQUE 3: GRILLA FORENSE (Protegido Fila 3)
            ========================================================= */}
        <div className="flex-1 flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <History className="text-slate-500" size={18} />
              <h2 className="text-base font-bold text-white tracking-tight">
                Historial de Recaudos (BO)
              </h2>
            </div>

            {canReadGrid && (
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-1.5 text-slate-500"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Buscar Operador..."
                  value={searchOperator}
                  onChange={(e) => setSearchOperator(e.target.value)}
                  className="bg-[#111827] border border-slate-800 text-xs text-white py-1.5 pl-8 pr-3 rounded-md outline-none focus:border-slate-600 w-48 transition-colors"
                />
              </div>
            )}
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-[350px] relative">
            {/* Ceguera Selectiva - Fila 3 */}
            {!canReadGrid ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                <ShieldAlert className="w-12 h-12 text-slate-600 mb-3 opacity-50" />
                <h3 className="text-slate-400 font-bold text-sm mb-1">
                  Lectura Restringida
                </h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  No tienes permiso para auditar el historial de retiros.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-[#0f1522] text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 pl-6">ID Transacción</th>
                      <th className="px-4 py-3">Operador BO</th>
                      <th className="px-4 py-3">Nota de Auditoría</th>
                      <th className="px-4 py-3 text-right">Monto Recaudado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredWithdrawals.length > 0 ? (
                      filteredWithdrawals.map((dep) => {
                        const dateObj = new Date(dep.date);
                        return (
                          <tr
                            key={dep.id}
                            className="hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="px-4 py-3 pl-6">
                              <div className="font-mono font-bold text-slate-300">
                                {dep.id}
                              </div>
                              <div className="text-[9px] flex items-center gap-1 text-slate-500 mt-0.5">
                                <Calendar size={9} />
                                {dateObj.toLocaleDateString()}{' '}
                                {dateObj.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-white">
                                {dep.operator}
                              </div>
                              <span
                                className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
                                  dep.wallet === 'REAL'
                                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                }`}
                              >
                                {dep.wallet}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div
                                className="max-w-[200px] truncate text-[10px] text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50"
                                title={dep.note}
                              >
                                {dep.note}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="font-mono font-bold text-amber-500 text-sm">
                                -{formatMoney(dep.amount, currentSkin.currency)}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-12 text-center text-slate-500 italic text-xs"
                        >
                          No se encontraron registros de recaudo administrativo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
