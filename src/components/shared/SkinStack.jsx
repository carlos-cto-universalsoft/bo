import React from 'react';
import { useData } from '../../context/DataContext';

export const SkinStack = ({ skins, allowedSkins }) => {
  const { skins: dbSkins, sites } = useData();

  if (!skins || skins.length === 0)
    return (
      <span className="text-slate-600 text-xs italic">-- Sin Skin --</span>
    );

  // 👇 EL FILTRO SEGURO ORIGINAL
  const displaySkins = allowedSkins
    ? skins.filter((s) => allowedSkins.includes(s))
    : skins;

  if (displaySkins.length === 0) {
    return (
      <span className="text-slate-600 text-[10px] uppercase font-bold tracking-widest opacity-50">
        Oculto
      </span>
    );
  }

  const visibleSkins = displaySkins.slice(0, 3);
  const overflowSkins = displaySkins.slice(3);

  const getSkinLogo = (skinObj) => {
    if (skinObj && skinObj.siteId && sites) {
      const parentSite = sites.find((s) => s.id === skinObj.siteId);
      if (parentSite && parentSite.logo) return parentSite.logo;
    }
    return skinObj?.site === 'XLIVE' ? '/logo-xlive.png' : '/ur-logo.png';
  };

  return (
    <div className="flex gap-4 justify-center items-center">
      {visibleSkins.map((s) => {
        const skinObj = dbSkins.find((sk) => sk.id === s);
        if (!skinObj) return null;

        const logoSrc = getSkinLogo(skinObj);

        return (
          <span
            key={s}
            title={skinObj.name}
            className="relative cursor-help hover:scale-110 transition-transform flex bg-slate-800/50 p-2 rounded-md border border-slate-700 hover:border-[#D10057]"
          >
            <img
              src={logoSrc}
              alt={skinObj.site}
              className="w-5 h-5 object-contain"
            />
            <span className="absolute -bottom-1.5 -right-1.5 bg-[#0B1120] text-slate-300 font-mono text-[9px] uppercase font-bold px-1 rounded border border-slate-600 shadow-sm z-10">
              {skinObj.code}
            </span>
          </span>
        );
      })}

      {overflowSkins.length > 0 && (
        <div className="relative group flex items-center justify-center">
          <span className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 group-hover:border-[#D10057] group-hover:text-white transition-colors">
            +{overflowSkins.length}
          </span>
          <div className="absolute top-full right-0 mt-2 w-56 bg-[#1F2937] border border-slate-700 rounded-xl shadow-2xl z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible p-3">
            <div className="flex justify-between border-b border-slate-700 pb-2 mb-2 text-[10px] font-bold text-slate-400">
              <span>SKINS ADICIONALES</span>
              <span className="text-[#D10057]">
                {displaySkins.length} Total
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
              {overflowSkins.map((s) => {
                const skinObj = dbSkins.find((sk) => sk.id === s);
                if (!skinObj) return null;

                const logoSrc = getSkinLogo(skinObj);

                return (
                  <div
                    key={s}
                    className="flex gap-2 items-center bg-slate-800/50 p-2 rounded"
                  >
                    <img
                      src={logoSrc}
                      className="w-4 h-4 object-contain"
                      alt={skinObj.site}
                    />{' '}
                    <span className="text-xs text-white">{skinObj.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
