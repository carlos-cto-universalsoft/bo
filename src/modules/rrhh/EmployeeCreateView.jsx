import React, { useState } from 'react';
import {
  UserPlus,
  User,
  Shield,
  Database,
  Mail,
  FileText,
  Building2,
} from 'lucide-react';
import { THEME } from '../../config/constants';
import { useData } from '../../context/DataContext';
import { ViewHeader } from '../../components/shared/ViewHeader';

export const EmployeeCreateView = ({ onNavigate, onCloseTab, currentSkin }) => {
  const { addEmployee, roles, currentUser, hasGlobalPermission, contracts } =
    useData(); // 👈 INYECCIÓN: Usamos el poder Global

  const isSuperAdmin = currentUser?.contractId === 'c-001';

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    user: '',
    status: 'active',
    roleId: '',
    contractId: isSuperAdmin ? '' : currentUser.contractId,
    language: 'es',
    timezone: 'UTC-5',
    comments: '',
  });

  const userRoleData = roles.find((r) => r.id === currentUser.roleId);
  const combinedAllowedSkins = [
    ...new Set([...currentUser.allowedSkins, ...(userRoleData?.skins || [])]),
  ];

  const visibleRoles = roles.filter((r) => {
    if (r.id === '00001' && !isSuperAdmin) {
      return false;
    }
    return (
      (r.skins || []).length === 0 ||
      (r.skins || []).some((s) => combinedAllowedSkins.includes(s))
    );
  });

  const handleSave = () => {
    // 👇 CORRECCIÓN: Evalúa permiso a nivel Empresa (Global)
    if (!hasGlobalPermission('emp_create_act'))
      return alert(
        'Acceso Denegado: No tienes permiso de ACCIÓN para registrar empleados.'
      );

    if (!form.firstName || !form.email || !form.user)
      return alert('Complete los campos obligatorios (*)');

    if (isSuperAdmin && !form.contractId) {
      return alert('Debe asignar una Empresa (Contrato) a este empleado.');
    }

    addEmployee({
      ...form,
      baseSkin: currentSkin?.id || null, // Por si no hay skin seleccionada
    });

    onNavigate('employee_list', 'Listar Empleados', FileText);
    if (onCloseTab) onCloseTab();
  };

  return (
    // 👇 Ajuste de pb-20 a pb-24 para respetar la barra fija
    <div className="p-8 pb-24 w-full h-full mx-auto animate-in fade-in overflow-y-auto text-slate-200 custom-scrollbar flex flex-col">
      <ViewHeader
        title="Alta de Nuevo Empleado"
        icon={UserPlus}
        currentSkin={currentSkin}
      />

      <div
        className={`${THEME.panel} p-6 rounded-xl border ${THEME.border} shadow-xl mb-6 flex items-center gap-6 shrink-0`}
      >
        <div className="w-20 h-20 rounded-full bg-pink-100 border-4 border-[#D10057] flex items-center justify-center text-3xl shadow-lg relative text-[#D10057] shrink-0">
          {form.firstName ? (
            form.firstName.charAt(0).toUpperCase()
          ) : (
            <User size={32} />
          )}
        </div>
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Perfil del Colaborador
          </h3>
          <div className="text-2xl font-bold text-white">
            {form.firstName || 'Nuevo'}{' '}
            <span className="text-slate-500">{form.lastName || 'Usuario'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start flex-1 pb-4">
        {/* ======================================================== */}
        {/* TARJETA 1: Información Personal */}
        {/* ======================================================== */}
        <div
          className={`${THEME.panel} p-6 rounded-xl border ${THEME.border} shadow-xl flex flex-col h-full`}
        >
          <h4 className="text-[#D10057] font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <User size={18} /> Información Personal
          </h4>
          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Nombre *
              </label>
              <input
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className={`w-full ${THEME.input} p-3 rounded-lg`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Apellido
              </label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className={`w-full ${THEME.input} p-3 rounded-lg`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full ${THEME.input} p-3 rounded-lg`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Teléfono
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`w-full ${THEME.input} p-3 rounded-lg`}
                placeholder="+51..."
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TARJETA 2: Seguridad y Acceso */}
        {/* ======================================================== */}
        <div
          className={`${THEME.panel} p-6 rounded-xl border ${THEME.border} shadow-xl flex flex-col h-full`}
        >
          <h4 className="text-[#D10057] font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Shield size={18} /> Seguridad y Acceso
          </h4>
          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Usuario del Sistema *
              </label>
              <input
                value={form.user}
                onChange={(e) => setForm({ ...form, user: e.target.value })}
                className={`w-full ${THEME.input} p-3 rounded-lg`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Estado Operativo
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={`w-full ${THEME.select} p-3 rounded-lg`}
              >
                <option value="active">Activo</option>
                <option value="blocked">Bloqueado</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Contraseña Inicial
              </label>
              <div className="p-4 bg-slate-900/50 border border-dashed border-slate-700 rounded-lg flex flex-col xl:flex-row justify-between xl:items-center gap-3">
                <span className="text-xs text-slate-400 italic">
                  El usuario recibirá un correo para su contraseña.
                </span>
                <button className="text-xs bg-[#D10057]/10 text-[#D10057] border border-[#D10057]/30 px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-[#D10057] hover:text-white transition-colors font-bold whitespace-nowrap shrink-0">
                  <Mail size={14} /> Enviar Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TARJETA 3: Configuración General */}
        {/* ======================================================== */}
        <div
          className={`${THEME.panel} p-6 rounded-xl border ${THEME.border} shadow-xl flex flex-col h-full`}
        >
          <h4 className="text-[#D10057] font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Database size={18} /> Configuración General
          </h4>

          <div className="space-y-4 flex-1 flex flex-col">
            {isSuperAdmin && (
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                <label className="text-xs font-bold text-[#D10057] mb-2 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={14} /> Empresa Asignada *
                </label>
                <select
                  value={form.contractId}
                  onChange={(e) =>
                    setForm({ ...form, contractId: e.target.value })
                  }
                  className={`w-full ${THEME.select} p-3 rounded-lg font-bold text-sm border-[#D10057]/30 focus:border-[#D10057]`}
                >
                  <option value="">-- Seleccionar Empresa --</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contractNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Cargo (Plantilla de Permisos)
              </label>
              <select
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                className={`w-full ${THEME.select} p-3 rounded-lg`}
              >
                <option value="">-- Sin Cargo / Limbo --</option>
                {visibleRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  Idioma
                </label>
                <select
                  value={form.language}
                  onChange={(e) =>
                    setForm({ ...form, language: e.target.value })
                  }
                  className={`w-full ${THEME.select} p-3 rounded-lg`}
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  Zona Horaria
                </label>
                <select
                  value={form.timezone}
                  onChange={(e) =>
                    setForm({ ...form, timezone: e.target.value })
                  }
                  className={`w-full ${THEME.select} p-3 rounded-lg`}
                >
                  <option value="UTC-5">UTC-5 (PE/CO)</option>
                  <option value="UTC-6">UTC-6 (MX)</option>
                </select>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Comentarios Internos
              </label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                className={`w-full ${THEME.input} p-3 rounded-lg flex-1 min-h-[100px] resize-none`}
                placeholder="Notas exclusivas..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 👇 BARRA INFERIOR FIJA ESTANDARIZADA */}
      <div className="fixed bottom-0 left-0 w-full bg-[#111827] border-t border-slate-800 p-4 flex justify-end gap-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => onCloseTab()}
          className="px-6 py-2.5 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors border border-transparent hover:border-slate-700 rounded-lg"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="bg-[#D10057] px-10 py-2.5 rounded-lg text-white font-bold text-xs shadow-lg shadow-[#D10057]/20 uppercase tracking-widest hover:bg-[#b00049] transition-colors"
        >
          Guardar Empleado
        </button>
      </div>
    </div>
  );
};
