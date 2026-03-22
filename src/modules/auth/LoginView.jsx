import React, { useState } from 'react';
import { User, Lock, AlertCircle } from 'lucide-react';
import { THEME } from '../../config/constants';

export const LoginView = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputUser = user.trim().toLowerCase();
    const dbEmployees = JSON.parse(localStorage.getItem('db_employees')) || [];
    const dbRoles = JSON.parse(localStorage.getItem('db_roles')) || [];
    const foundUser = dbEmployees.find(
      (emp) => emp.user.toLowerCase() === inputUser
    );

    if (foundUser && pass === 'Test123*') {
      if (foundUser.status === 'blocked') {
        setError('Acceso bloqueado.');
        return;
      }

      const userRole = dbRoles.find((r) => r.id === foundUser.roleId);

      if (!userRole) {
        setError('Rol de usuario no encontrado.');
        return;
      }

      // 👇 NUEVA LÓGICA DE GATEKEEPER B2B2C (Segura para Objetos y Arrays)
      const hasSkins = userRole.skins && userRole.skins.length > 0;

      // Evaluamos si el objeto globalPermissions tiene al menos una llave adentro
      const hasGlobalPerms =
        userRole.globalPermissions &&
        Object.keys(userRole.globalPermissions).length > 0;

      // Siempre dejamos pasar al usuario matriz (Modo Dios)
      const isSuperAdmin =
        foundUser.contractId === 'c-001' && foundUser.roleId === '00001';

      if (!hasSkins && !hasGlobalPerms && !isSuperAdmin) {
        setError('Sin entornos ni permisos asignados.');
        return;
      }

      // Si pasa la validación, inyectamos su ADN al sistema
      onLogin({
        user: foundUser.user,
        name: foundUser.name,
        initials:
          foundUser.firstName.charAt(0).toUpperCase() +
          (foundUser.lastName
            ? foundUser.lastName.charAt(0).toUpperCase()
            : ''),
        role: userRole.name,
        roleId: foundUser.roleId,
        allowedSkins: userRole.skins || [], // 👈 Aseguramos array vacío para globales
        contractId: foundUser.contractId,
      });
    } else {
      setError('Usuario o contraseña incorrectos. (Usa: Test123*)');
    }
  };

  return (
    <div
      className={`h-screen w-full ${THEME.bg} flex items-center justify-center p-4 relative overflow-hidden font-sans`}
    >
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#D10057]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div
        className={`${THEME.panel} p-10 rounded-2xl border ${THEME.border} shadow-2xl w-full max-w-[420px] relative z-10 animate-in fade-in`}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#D10057] rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-lg shadow-[#D10057]/30">
            U
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">
            UNIVERSAL<span className="text-[#D10057]">SOFT</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 uppercase font-bold text-[10px]">
            Secure Back Office
          </p>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
              Usuario Empleado
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                autoFocus
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className={`w-full ${THEME.input} py-3 pl-10 pr-4 rounded-xl text-sm`}
                placeholder="ej. cristian.sam"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className={`w-full ${THEME.input} py-3 pl-10 pr-4 rounded-xl text-sm`}
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            className={`w-full mt-2 ${THEME.primary} ${THEME.primaryHover} text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-sm`}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};
