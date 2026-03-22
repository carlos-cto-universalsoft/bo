import React from 'react';
import { Check } from 'lucide-react';

export const TYPE_COLORS = {
  MENU: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ELEMENTO: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  LECTURA: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  ACCIÓN: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export const PermissionGrid = ({
  module,
  rolePermissions,
  selectedSkinId,
  togglePermission,
}) => {
  const categories = ['MENU', 'ELEMENTO', 'LECTURA', 'ACCIÓN'];

  return (
    <div className="p-4 bg-[#0B1120] border-t border-slate-800 overflow-x-auto custom-scrollbar">
      <div className="flex flex-col gap-5 min-w-max pb-2">
        {categories.map((type) => {
          const permsInCategory = module.permissions.filter(
            (p) => p.type === type
          );
          if (permsInCategory.length === 0) return null;

          return (
            <div key={type} className="flex gap-4">
              {permsInCategory.map((perm) => {
                const isActive = (rolePermissions[selectedSkinId] || {})[
                  perm.id
                ];
                const badgeColor =
                  TYPE_COLORS[perm.type] ||
                  'bg-slate-500/20 text-slate-400 border-slate-500/30';

                let riskBadge = null;
                if (perm.risk === 'Alto')
                  riskBadge = (
                    <span className="text-[9px] px-2 py-0.5 rounded-full uppercase font-bold border bg-orange-500/10 text-orange-400 border-orange-500/20 tracking-wider">
                      Alto
                    </span>
                  );
                else if (perm.risk === 'Crítico')
                  riskBadge = (
                    <span className="text-[9px] px-2 py-0.5 rounded-full uppercase font-bold border bg-red-500/10 text-red-400 border-red-500/20 tracking-wider">
                      Crítico
                    </span>
                  );

                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(selectedSkinId, perm.id)}
                    className={`flex-shrink-0 w-[280px] p-4 rounded-xl border cursor-pointer transition-all relative select-none flex flex-col ${
                      isActive
                        ? 'bg-[#D10057]/5 border-[#D10057] shadow-md shadow-[#D10057]/5'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3 h-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                            isActive
                              ? 'bg-[#D10057] border-[#D10057]'
                              : 'bg-slate-950 border-slate-700'
                          }`}
                        >
                          {isActive && (
                            <Check
                              size={14}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold border tracking-wider ${badgeColor}`}
                        >
                          {perm.type}
                        </span>
                      </div>
                      {riskBadge}
                    </div>
                    <h5
                      className={`font-bold text-sm mb-1 ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {perm.label}
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic flex-1">
                      {perm.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
