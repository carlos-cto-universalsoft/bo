import React, { useState } from 'react';
import {
  User,
  MapPin,
  CreditCard,
  Calendar,
  ShieldAlert,
  Edit3,
  Lock,
  Mail,
  Smartphone,
  Fingerprint,
  EyeOff,
  X,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const formatDate = (isoString) => {
  if (!isoString) return 'No registrado';
  const d = new Date(isoString);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// 🛡️ MAPEO ESTRICTO DE DOCUMENTOS LEGALES (Siempre con Extranjería y Pasaporte)
const getOfficialDocuments = (skinId) => {
  const countryCode = (skinId || '').split('_')[1]?.toUpperCase() || 'PE';

  const docMap = {
    PE: ['DNI', 'Carné de Extranjería (CE)', 'Pasaporte'],
    CO: [
      'Cédula de Ciudadanía (CC)',
      'Cédula de Extranjería (CE)',
      'Pasaporte',
    ],
    MX: ['INE / IFE', 'Documento Migratorio', 'Pasaporte'],
    CL: ['RUT / RUN', 'Carné de Extranjero', 'Pasaporte'],
    EC: ['Cédula de Identidad', 'Cédula de Extranjero', 'Pasaporte'],
    AR: ['DNI', 'DNI para Extranjeros', 'Pasaporte'],
    BR: ['CPF', 'RG', 'RNM (Extranjero)', 'Pasaporte'],
  };

  // Fallback seguro si se abre una nueva skin no mapeada
  return (
    docMap[countryCode] || [
      'Documento Nacional',
      'Documento de Extranjería',
      'Pasaporte',
    ]
  );
};

export const ProfileDetails = ({ userData, currentSkin }) => {
  // 👈 AGREGADO 'sites' PARA EL LOGO
  const { hasPermission, networks, editNetworkNode, sites } = useData();

  const freshUserData = networks.find((n) => n.id === userData.id) || userData;
  const availableDocs = getOfficialDocuments(currentSkin.id);

  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycForm, setKycForm] = useState({});

  const [isSysModalOpen, setIsSysModalOpen] = useState(false);
  const [sysForm, setSysForm] = useState({});

  const canEditKyc = hasPermission(currentSkin.id, 'net_ui_btn_edit_kyc');
  const canEditSys = hasPermission(currentSkin.id, 'net_ui_btn_edit_sys');
  const canReadKyc = hasPermission(currentSkin.id, 'net_kyc_read');
  const canReadSys = hasPermission(currentSkin.id, 'net_sys_read');

  const nombreCompleto =
    `${freshUserData?.firstName || ''} ${
      freshUserData?.lastName || ''
    }`.trim() || 'Sin Nombre Legal';
  const estado = freshUserData?.status || 'Activo';

  // 👈 LOGO DINÁMICO
  const currentSite = sites.find((s) => s.id === currentSkin.siteId);
  const logoSrc =
    currentSite?.logo ||
    (currentSkin.site === 'XLIVE' ? '/logo-xlive.png' : '/ur-logo.png');

  const handleOpenKyc = () => {
    setKycForm({
      firstName: freshUserData.firstName || '',
      lastName: freshUserData.lastName || '',
      // Pre-selecciona el doc oficial 1 del país si el usuario no tiene uno guardado válido
      documentType: availableDocs.includes(freshUserData.documentType)
        ? freshUserData.documentType
        : availableDocs[0],
      documentNumber: freshUserData.documentNumber || '',
      birthDate: freshUserData.birthDate
        ? freshUserData.birthDate.split('T')[0]
        : '',
      nationality: freshUserData.nationality || '',
      country: freshUserData.country || '',
      address: freshUserData.address || '',
    });
    setIsKycModalOpen(true);
  };

  const handleOpenSys = () => {
    setSysForm({
      username: freshUserData.username || '',
      email: freshUserData.email || '',
      phone: freshUserData.phone || '',
      status: freshUserData.status || 'Activo',
    });
    setIsSysModalOpen(true);
  };

  const handleSaveKyc = (e) => {
    e.preventDefault();
    if (!hasPermission(currentSkin.id, 'net_kyc_edit')) {
      return alert(
        'Acceso Denegado: No tienes permiso de ACCIÓN para modificar datos demográficos.'
      );
    }
    editNetworkNode({ ...freshUserData, ...kycForm });
    setIsKycModalOpen(false);
  };

  const handleSaveSys = (e) => {
    e.preventDefault();
    if (!hasPermission(currentSkin.id, 'net_sys_edit')) {
      return alert(
        'Acceso Denegado: No tienes permiso de ACCIÓN para modificar credenciales del sistema.'
      );
    }
    editNetworkNode({ ...freshUserData, ...sysForm });
    setIsSysModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in relative">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* =========================================
            🟢 TARJETA 1: RIESGO BÁSICO (KYC)
            ========================================= */}
        <div className="bg-[#111827] rounded-xl border border-slate-800 p-0 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-slate-800 bg-[#0f1522]">
            <User className="text-slate-400" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Perfil y Ubicación
            </h3>
          </div>

          {canReadKyc ? (
            <div className="p-6 flex flex-col flex-1">
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                    Nombre Legal Completo
                  </span>
                  <p className="text-sm font-medium text-slate-200">
                    {nombreCompleto}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                      Tipo Doc.
                    </span>
                    <p className="text-sm font-medium text-slate-200 uppercase">
                      {freshUserData?.documentType || 'No reg.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                      N° Documento
                    </span>
                    <p className="text-sm font-mono font-medium text-slate-200">
                      {freshUserData?.documentNumber || 'No reg.'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                      Fecha de Nacimiento
                    </span>
                    <p className="text-sm font-medium text-slate-200">
                      {formatDate(freshUserData?.birthDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                      Nacionalidad
                    </span>
                    <p className="text-sm font-medium text-slate-200">
                      {freshUserData?.nationality || 'No reg.'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800/50">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1 flex items-center gap-1">
                    <MapPin size={12} /> País y Dirección Física
                  </span>
                  <p className="text-sm font-medium text-slate-200">
                    {freshUserData?.country || 'No reg.'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {freshUserData?.address ||
                      'Sin dirección registrada en el sistema.'}
                  </p>
                </div>
              </div>

              {canEditKyc && (
                <div className="mt-auto pt-6 flex justify-end">
                  <button
                    onClick={handleOpenKyc}
                    title="Editar datos demográficos y de contacto básico"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700 text-xs font-bold"
                  >
                    <Edit3 size={14} /> Editar Perfil
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/20">
              <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mb-3 border border-slate-700">
                <EyeOff size={20} className="text-slate-500" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Ceguera Selectiva
              </span>
              <p className="text-[10px] text-slate-500 max-w-[200px]">
                Expediente demográfico bloqueado por matriz de permisos.
              </p>
            </div>
          )}
        </div>

        {/* =========================================
            🔴 TARJETA 2: ALTO IMPACTO (SISTEMA)
            ========================================= */}
        <div className="bg-[#111827] rounded-xl border border-rose-900/30 p-0 shadow-sm flex flex-col overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 to-pink-600"></div>
          <div className="flex items-center gap-2 p-4 border-b border-slate-800 bg-[#0f1522]">
            <ShieldAlert className="text-rose-500" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Credenciales & 2FA
            </h3>
          </div>

          {canReadSys ? (
            <div className="p-6 flex flex-col flex-1">
              <div className="space-y-5">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                    Usuario (Login ID)
                  </span>
                  <p className="text-base font-mono font-bold text-emerald-400">
                    {freshUserData?.username}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                      Correo Electrónico (Recuperación)
                    </span>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <p className="text-sm font-medium text-slate-200">
                        {freshUserData?.email || 'No registrado'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                      Teléfono Móvil (OTP / 2FA)
                    </span>
                    <div className="flex items-center gap-2">
                      <Smartphone size={14} className="text-slate-400" />
                      <p className="text-sm font-medium text-slate-200 font-mono">
                        {freshUserData?.phone || 'No registrado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-2">
                    Estado Operativo
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${
                      estado === 'Activo'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                  >
                    {estado}
                  </span>
                </div>
              </div>

              {canEditSys && (
                <div className="mt-auto pt-6 flex justify-end">
                  <button
                    onClick={handleOpenSys}
                    title="Modificar credenciales, 2FA o Estado de Cuenta"
                    className="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors border border-rose-500/20 hover:border-rose-500 text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <Fingerprint size={14} /> Gestionar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-rose-950/5">
              <div className="w-12 h-12 bg-rose-500/5 rounded-full flex items-center justify-center mb-3 border border-rose-500/20">
                <Lock size={20} className="text-rose-500/50" />
              </div>
              <span className="text-xs font-bold text-rose-500/70 uppercase tracking-widest mb-1">
                Vectores Ocultos
              </span>
              <p className="text-[10px] text-slate-500 max-w-[200px]">
                Credenciales y seguridad restringidos por nivel de riesgo.
              </p>
            </div>
          )}
        </div>

        {/* =========================================
            🔒 TARJETA 3: INMUTABLES (HORMIGÓN ARMADO)
            ========================================= */}
        <div className="bg-[#111827] rounded-xl border border-slate-800 p-0 shadow-sm flex flex-col overflow-hidden opacity-90">
          <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-[#0f1522]/50">
            <div className="flex items-center gap-2">
              <CreditCard className="text-slate-500" size={18} />
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Estructura de Red
              </h3>
            </div>
            <Lock
              size={14}
              className="text-slate-600"
              title="Datos Inmutables del Sistema"
            />
          </div>

          <div className="p-6 space-y-5 flex-1 bg-slate-900/20">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1 mb-1">
                ID de Nodo <Lock size={10} className="text-slate-600" />
              </span>
              <p className="text-sm font-mono font-medium text-slate-400">
                {freshUserData?.id}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1 mb-1">
                Jerarquía (Tipo de Red){' '}
                <Lock size={10} className="text-slate-600" />
              </span>
              <p className="text-sm font-bold text-slate-200">
                {freshUserData?.type || 'No definido'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1 mb-1">
                Matriz Financiera (Skin){' '}
                <Lock size={10} className="text-slate-600" />
              </span>
              <div className="flex items-center gap-2 mt-1">
                {/* 👈 LOGO REPARADO (Dinámico y Estricto) */}
                <img
                  src={logoSrc}
                  alt="Skin"
                  className="w-4 h-4 object-contain opacity-70"
                />
                <p className="text-sm font-medium text-slate-300">
                  {currentSkin.name}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800/50">
              <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1 mb-1">
                Fecha de Alta <Lock size={10} className="text-slate-600" />
              </span>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-500" />
                <p className="text-sm font-medium text-slate-300">
                  {formatDate(freshUserData?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: EDICIÓN KYC (DATOS DEMOGRÁFICOS)
          ========================================================================= */}
      {isKycModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0f1522]">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <User className="text-slate-400" /> Actualizar Perfil KYC
              </h3>
              <button
                onClick={() => setIsKycModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveKyc} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                    Nombres
                  </label>
                  <input
                    autoFocus
                    value={kycForm.firstName}
                    onChange={(e) =>
                      setKycForm({ ...kycForm, firstName: e.target.value })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 text-white p-2.5 rounded-lg text-sm focus:border-[#D10057] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                    Apellidos
                  </label>
                  <input
                    value={kycForm.lastName}
                    onChange={(e) =>
                      setKycForm({ ...kycForm, lastName: e.target.value })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 text-white p-2.5 rounded-lg text-sm focus:border-[#D10057] outline-none"
                  />
                </div>

                {/* SELECTOR DINÁMICO E STRICTO BASADO EN LA SKIN */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                    Tipo de Documento
                  </label>
                  <select
                    value={kycForm.documentType}
                    onChange={(e) =>
                      setKycForm({ ...kycForm, documentType: e.target.value })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 text-white p-2.5 rounded-lg text-sm focus:border-[#D10057] outline-none"
                  >
                    {availableDocs.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                    N° Documento
                  </label>
                  <input
                    value={kycForm.documentNumber}
                    onChange={(e) =>
                      setKycForm({ ...kycForm, documentNumber: e.target.value })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 text-white p-2.5 rounded-lg text-sm font-mono focus:border-[#D10057] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={kycForm.birthDate}
                    onChange={(e) =>
                      setKycForm({ ...kycForm, birthDate: e.target.value })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 text-white p-2.5 rounded-lg text-sm [color-scheme:dark] focus:border-[#D10057] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                    Nacionalidad
                  </label>
                  <input
                    value={kycForm.nationality}
                    onChange={(e) =>
                      setKycForm({ ...kycForm, nationality: e.target.value })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 text-white p-2.5 rounded-lg text-sm focus:border-[#D10057] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                    País de Residencia
                  </label>
                  <input
                    value={kycForm.country}
                    onChange={(e) =>
                      setKycForm({ ...kycForm, country: e.target.value })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 text-white p-2.5 rounded-lg text-sm focus:border-[#D10057] outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                    Dirección Física
                  </label>
                  <input
                    value={kycForm.address}
                    onChange={(e) =>
                      setKycForm({ ...kycForm, address: e.target.value })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 text-white p-2.5 rounded-lg text-sm focus:border-[#D10057] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsKycModalOpen(false)}
                  className="px-6 py-2.5 text-slate-400 border border-slate-700 rounded-lg hover:text-white hover:bg-slate-800 transition-colors text-sm font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-200 text-slate-900 rounded-lg hover:bg-white transition-colors text-sm font-bold flex items-center gap-2"
                >
                  <Save size={16} /> Guardar Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: GESTIÓN DE SISTEMA (CREDENCIALES Y 2FA)
          ========================================================================= */}
      {isSysModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in">
          <div className="bg-[#111827] border border-rose-500/30 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(225,29,72,0.1)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 to-pink-600"></div>
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0f1522]">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <ShieldAlert className="text-rose-500" /> Credenciales de Alto
                Impacto
              </h3>
              <button
                onClick={() => setIsSysModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSys} className="p-6 space-y-6">
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-rose-400 text-xs flex items-start gap-3">
                <AlertTriangle size={24} className="flex-shrink-0" />
                <p>
                  Estás editando vectores de secuestro de cuenta. Alterar estos
                  datos cambiará dónde recibe el usuario sus accesos y códigos
                  de verificación.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                    Usuario (Login ID)
                  </label>
                  <input
                    value={sysForm.username}
                    onChange={(e) =>
                      setSysForm({ ...sysForm, username: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold p-2.5 rounded-lg text-sm focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                    Correo Electrónico (Recuperación)
                  </label>
                  <input
                    type="email"
                    value={sysForm.email}
                    onChange={(e) =>
                      setSysForm({ ...sysForm, email: e.target.value })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 text-white p-2.5 rounded-lg text-sm focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                    Teléfono Móvil (Recepción 2FA SMS)
                  </label>
                  <input
                    value={sysForm.phone}
                    onChange={(e) =>
                      setSysForm({ ...sysForm, phone: e.target.value })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 text-white p-2.5 rounded-lg text-sm font-mono focus:border-rose-500 outline-none"
                  />
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-[10px] font-bold text-slate-500 mb-2 block uppercase">
                    Estado Operativo de la Cuenta
                  </label>
                  <select
                    value={sysForm.status}
                    onChange={(e) =>
                      setSysForm({ ...sysForm, status: e.target.value })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 text-white p-3 rounded-lg text-sm font-bold focus:border-rose-500 outline-none"
                  >
                    <option value="Activo">🟢 ACTIVO (Operación Normal)</option>
                    <option value="Suspendido">
                      🟡 SUSPENDIDO (Pausa temporal)
                    </option>
                    <option value="Bloqueado">
                      🔴 BLOQUEADO (Acceso Denegado)
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSysModalOpen(false)}
                  className="px-6 py-2.5 text-slate-400 border border-slate-700 rounded-lg hover:text-white hover:bg-slate-800 transition-colors text-sm font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-colors text-sm font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20"
                >
                  <ShieldAlert size={16} /> Aplicar Cambios Críticos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
