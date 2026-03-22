import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Save,
  Globe,
  Briefcase,
  Link as LinkIcon,
  MapPin,
  Banknote,
  Fingerprint,
  ShieldAlert,
  FileText,
  X,
  Lock,
} from 'lucide-react';
import { THEME } from '../../config/constants';
import { useData } from '../../context/DataContext';

export const ContractCreateView = ({ currentSkin, onNavigate, onCloseTab }) => {
  // 👇 CORRECCIÓN APLICADA: Extraemos hasGlobalPermission en lugar de hasPermission
  const {
    contracts,
    sites,
    skins,
    addContract,
    addSite,
    addSkin,
    hasGlobalPermission,
    currentUser,
  } = useData();
  const isSuperAdmin = currentUser?.contractId === 'c-001';

  // 1. LEER EL CONTEXTO DESDE LA MEMORIA (Bypass de Props)
  const [creationContext] = useState(() => {
    try {
      const stored = sessionStorage.getItem('ContractCreateContext');
      return stored
        ? JSON.parse(stored)
        : { modo: 'CONTRACT', contractId: null, siteId: null };
    } catch (e) {
      return { modo: 'CONTRACT', contractId: null, siteId: null };
    }
  });

  const modoActual = creationContext.modo;
  const targetContractId = creationContext.contractId;
  const targetSiteId = creationContext.siteId;

  const TITULOS = {
    CONTRACT: 'Nuevo Contrato (SaaS)',
    SITE: 'Nueva Marca Comercial',
    SKIN: 'Nuevo Entorno Operativo',
  };

  const [formData, setFormData] = useState({
    contractNumber: '',
    companyName: '',
    siteName: '',
    siteUrl: '',
    color: '#D10057',
    countryCode: 'PE',
    currency: 'PEN',
  });

  const [logoBase64, setLogoBase64] = useState(null);
  const [contractFile, setContractFile] = useState(null);
  const [autoUsername, setAutoUsername] = useState('');
  const fileInputRef = useRef(null);
  const contractInputRef = useRef(null);

  const americanCurrencies = [
    { code: 'USD', name: 'Dólar Estadounidense' },
    { code: 'PEN', name: 'Sol Peruano' },
    { code: 'COP', name: 'Peso Colombiano' },
    { code: 'MXN', name: 'Peso Mexicano' },
    { code: 'BRL', name: 'Real Brasileño' },
    { code: 'ARS', name: 'Peso Argentino' },
    { code: 'CLP', name: 'Peso Chileno' },
    { code: 'UYU', name: 'Peso Uruguayo' },
    { code: 'PYG', name: 'Guaraní Paraguayo' },
    { code: 'BOB', name: 'Boliviano' },
    { code: 'CRC', name: 'Colón Costarricense' },
    { code: 'GTQ', name: 'Quetzal Guatemalteco' },
    { code: 'HNL', name: 'Lempira Hondureño' },
    { code: 'NIO', name: 'Córdoba Nicaragüense' },
    { code: 'DOP', name: 'Peso Dominicano' },
    { code: 'VES', name: 'Bolívar Soberano' },
    { code: 'CAD', name: 'Dólar Canadiense' },
  ];

  const americanCountries = [
    { code: 'AG', name: 'Antigua y Barbuda', flag: '🇦🇬' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
    { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
    { code: 'BZ', name: 'Belice', flag: '🇧🇿' },
    { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
    { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
    { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
    { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
    { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
    { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
    { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'GD', name: 'Granada', flag: '🇬🇩' },
    { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
    { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
    { code: 'HT', name: 'Haití', flag: '🇭🇹' },
    { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
    { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
    { code: 'MX', name: 'México', flag: '🇲🇽' },
    { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
    { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
    { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
    { code: 'PE', name: 'Perú', flag: '🇵🇪' },
    { code: 'DO', name: 'República Dominicana', flag: '🇩🇴' },
    { code: 'KN', name: 'San Cristóbal y Nieves', flag: '🇰🇳' },
    { code: 'VC', name: 'San Vicente y las Granadinas', flag: '🇻🇨' },
    { code: 'LC', name: 'Santa Lucía', flag: '🇱🇨' },
    { code: 'SR', name: 'Surinam', flag: '🇸🇷' },
    { code: 'TT', name: 'Trinidad y Tobago', flag: '🇹🇹' },
    { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  ];

  const sanitizeString = (str) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  // 2. AUTOCOMPLETADO INTELIGENTE
  useEffect(() => {
    if (modoActual !== 'CONTRACT' && targetContractId) {
      const contract = contracts.find((c) => c.id === targetContractId);
      if (contract) {
        setFormData((prev) => ({
          ...prev,
          contractNumber: contract.contractNumber,
          companyName: contract.companyName,
        }));
        if (contract.contractFile)
          setContractFile({
            name: contract.contractFile,
            size: 'Documento en bóveda',
          });
      }
    }

    if (modoActual === 'SKIN' && targetSiteId) {
      const site = sites.find((s) => s.id === targetSiteId);
      if (site) {
        setFormData((prev) => ({
          ...prev,
          siteName: site.name,
          siteUrl: site.url,
          color: site.colors?.primary || '#D10057',
        }));
        setLogoBase64(site.logo);
      }
    }
  }, [modoActual, targetContractId, targetSiteId, contracts, sites]);

  // Actualización visual del ID Operativo (Solo para UI)
  useEffect(() => {
    if (formData.siteName && formData.countryCode && formData.currency) {
      const cleanSite = sanitizeString(formData.siteName);
      const cleanCountry = formData.countryCode.toLowerCase();
      const cleanCurrency = formData.currency.toLowerCase();
      setAutoUsername(`${cleanSite}.${cleanCountry}.${cleanCurrency}`);
    } else {
      setAutoUsername('');
    }
  }, [formData.siteName, formData.countryCode, formData.currency]);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/'))
        return alert('Sube una imagen válida.');
      const reader = new FileReader();
      reader.onloadend = () => setLogoBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleContractUpload = (e) => {
    const file = e.target.files[0];
    if (file)
      setContractFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      });
  };

  // 4. GUARDADO INTELIGENTE Y SÍNCRONO
  const handleSave = () => {
    // 👇 CORRECCIÓN APLICADA: Ahora evalúa el poder Global para crear contratos
    if (!hasGlobalPermission('contract_create'))
      return alert('Acceso Denegado.');

    if (!formData.siteName || !formData.countryCode || !formData.currency)
      return alert('Completa los datos del entorno.');

    const timestamp = Date.now();
    const cleanSite = sanitizeString(formData.siteName);
    const newSkinId = `sk-${timestamp}`;

    // 🚀 VARIABLES SÍNCRONAS: Las calculamos aquí mismo para ignorar estados desfasados
    const currentCode = formData.countryCode.toUpperCase();
    const currentCurrency = formData.currency.toUpperCase();
    const currentOperativeId = `${cleanSite}.${currentCode.toLowerCase()}.${currentCurrency.toLowerCase()}`;
    const expectedName = `${formData.siteName.trim()} ${currentCode} (${currentCurrency})`;

    // 👇 VALIDACIÓN BLINDADA (3 CAPAS DE SEGURIDAD)
    const skinExists = skins.some((skin) => {
      // Capa 1: Coincidencia del ID Operativo
      const isSameOperativeId = skin.username === currentOperativeId;

      // Capa 2: Coincidencia del Nombre Visual (Útil si en pruebas anteriores se guardaron con username vacío)
      const isSameName =
        skin.name?.toLowerCase() === expectedName.toLowerCase();

      // Capa 3: Coincidencia Estructural (Mismo SiteId + Pais + Moneda)
      const isSameStructure =
        modoActual === 'SKIN' &&
        skin.siteId === targetSiteId &&
        skin.code === currentCode &&
        skin.currency === currentCurrency;

      return isSameOperativeId || isSameName || isSameStructure;
    });

    if (skinExists) {
      return alert(
        `🚨 ACCIÓN DENEGADA\n\nEl entorno "${expectedName}" (ID: ${currentOperativeId}) ya existe en la base de datos.\n\nEl sistema ha bloqueado la duplicidad para proteger la información.`
      );
    }

    if (modoActual === 'CONTRACT') {
      if (!formData.contractNumber || !formData.companyName || !logoBase64)
        return alert('Completa los campos obligatorios y logo.');
      const newContractId = `c-${timestamp}`;
      const newSiteId = `s-${timestamp}`;

      addContract({
        id: newContractId,
        contractNumber: formData.contractNumber,
        companyName: formData.companyName,
        contractFile: contractFile?.name || null,
        createdAt: new Date().toISOString(),
      });
      addSite({
        id: newSiteId,
        contractId: newContractId,
        name: formData.siteName,
        url: formData.siteUrl,
        logo: logoBase64,
        colors: { primary: formData.color },
      });
      addSkin({
        id: newSkinId,
        name: expectedName,
        siteId: newSiteId,
        site: cleanSite.toUpperCase(),
        code: currentCode,
        currency: currentCurrency,
        flag: currentCode,
        username: currentOperativeId, // Guardado con la variable síncrona
      });
    }

    if (modoActual === 'SITE') {
      if (!logoBase64) return alert('Sube un logo para la nueva marca.');
      const newSiteId = `s-${timestamp}`;
      addSite({
        id: newSiteId,
        contractId: targetContractId,
        name: formData.siteName,
        url: formData.siteUrl,
        logo: logoBase64,
        colors: { primary: formData.color },
      });
      addSkin({
        id: newSkinId,
        name: expectedName,
        siteId: newSiteId,
        site: cleanSite.toUpperCase(),
        code: currentCode,
        currency: currentCurrency,
        flag: currentCode,
        username: currentOperativeId, // Guardado con la variable síncrona
      });
    }

    if (modoActual === 'SKIN') {
      addSkin({
        id: newSkinId,
        name: expectedName,
        siteId: targetSiteId,
        site: cleanSite.toUpperCase(),
        code: currentCode,
        currency: currentCurrency,
        flag: currentCode,
        username: currentOperativeId, // Guardado con la variable síncrona
      });
    }

    alert('¡Operación realizada con éxito!');
    onNavigate('contract_list', 'Contratos', Building2);
    if (onCloseTab) onCloseTab();
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">
          Inmunidad de Sistema
        </h2>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`${THEME.primary} px-8 py-3 rounded-xl text-white font-bold`}
        >
          Retornar a Área Segura
        </button>
      </div>
    );
  }

  const ReadOnlyField = ({ label, value }) => (
    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 relative overflow-hidden">
      <div className="absolute top-2 right-2 text-slate-700">
        <Lock size={12} />
      </div>
      <label className="text-slate-500 text-[9px] font-bold mb-1 block uppercase tracking-widest">
        {label}
      </label>
      <div className="text-slate-300 font-bold text-sm">{value || '---'}</div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col relative text-slate-200 bg-[#0B1120] animate-in fade-in">
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar pb-12">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/50">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="text-slate-400" size={28} />{' '}
            {TITULOS[modoActual]}
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* COLUMNA 1 */}
          <div
            className={`${
              modoActual !== 'CONTRACT'
                ? 'bg-slate-900/30 opacity-90'
                : THEME.panel
            } p-6 rounded-xl border ${
              THEME.border
            } shadow-xl flex flex-col transition-all`}
          >
            <h3 className="text-[#D10057] font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
              <Briefcase size={16} /> 1. Datos Legales{' '}
              {modoActual !== 'CONTRACT' && (
                <Lock size={14} className="ml-auto text-slate-600" />
              )}
            </h3>
            <div className="space-y-6 flex-1">
              {modoActual === 'CONTRACT' ? (
                <>
                  <div>
                    <label className="text-slate-500 text-[10px] font-bold mb-1 block uppercase">
                      Número de Contrato *
                    </label>
                    <input
                      value={formData.contractNumber}
                      onChange={(e) =>
                        handleInputChange('contractNumber', e.target.value)
                      }
                      className={`${THEME.input} w-full p-3 rounded-lg font-mono text-sm`}
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px] font-bold mb-1 block uppercase">
                      Nombre de la Empresa *
                    </label>
                    <input
                      value={formData.companyName}
                      onChange={(e) =>
                        handleInputChange('companyName', e.target.value)
                      }
                      className={`${THEME.input} w-full p-3 rounded-lg font-bold`}
                    />
                  </div>
                  <div className="pt-2">
                    <label className="text-slate-500 text-[10px] font-bold mb-2 block uppercase text-[#D10057]">
                      Soporte Legal
                    </label>
                    {!contractFile ? (
                      <button
                        onClick={() => contractInputRef.current.click()}
                        className="w-full border-2 border-dashed border-slate-700 hover:border-[#D10057]/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2"
                      >
                        <FileText className="text-slate-600" size={24} />
                        <span className="text-[11px] font-bold text-slate-400">
                          Adjuntar Firmado
                        </span>
                      </button>
                    ) : (
                      <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText
                            className="text-emerald-500 shrink-0"
                            size={20}
                          />
                          <div className="text-[11px] font-bold text-emerald-500 truncate">
                            {contractFile.name}
                          </div>
                        </div>
                        <button
                          onClick={() => setContractFile(null)}
                          className="text-emerald-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={contractInputRef}
                      onChange={handleContractUpload}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4 pt-2">
                  <ReadOnlyField
                    label="Número de Contrato"
                    value={formData.contractNumber}
                  />
                  <ReadOnlyField
                    label="Empresa Contratante"
                    value={formData.companyName}
                  />
                  <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
                    <FileText size={16} className="text-slate-600" />
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase">
                        Soporte Legal
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {contractFile?.name || 'Sin documento'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA 2 */}
          <div
            className={`${
              modoActual === 'SKIN' ? 'bg-slate-900/30 opacity-90' : THEME.panel
            } p-6 rounded-xl border ${
              THEME.border
            } shadow-xl flex flex-col transition-all`}
          >
            <h3 className="text-[#D10057] font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
              <Globe size={16} /> 2. Frente Comercial{' '}
              {modoActual === 'SKIN' && (
                <Lock size={14} className="ml-auto text-slate-600" />
              )}
            </h3>
            <div className="space-y-6 flex-1">
              {modoActual !== 'SKIN' ? (
                <>
                  <div>
                    <label className="text-slate-500 text-[10px] font-bold mb-1 block uppercase">
                      Nombre Site *
                    </label>
                    <input
                      value={formData.siteName}
                      onChange={(e) =>
                        handleInputChange('siteName', e.target.value)
                      }
                      className={`${THEME.input} w-full p-3 rounded-lg font-bold text-lg`}
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px] font-bold mb-1 block uppercase">
                      URL Site
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <LinkIcon size={14} />
                      </span>
                      <input
                        value={formData.siteUrl}
                        onChange={(e) =>
                          handleInputChange('siteUrl', e.target.value)
                        }
                        className={`${THEME.input} w-full p-3 pl-9 rounded-lg text-sm`}
                      />
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-slate-500 text-[10px] font-bold mb-2 uppercase">
                        Logo *
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-[#111827] border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                          {logoBase64 ? (
                            <img
                              src={logoBase64}
                              className="max-w-full max-h-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-[9px] text-slate-600">
                              Sin Logo
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current.click()}
                          className="flex-1 bg-slate-800 text-white py-2 rounded text-[10px] font-bold h-12"
                        >
                          Subir
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col border-l border-slate-800/50 pl-4">
                      <label className="text-slate-500 text-[10px] font-bold mb-2 uppercase">
                        Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) =>
                            handleInputChange('color', e.target.value)
                          }
                          className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                        />
                        <div className="flex-1 overflow-hidden">
                          <div className="text-[11px] font-mono text-slate-300 truncate">
                            {formData.color.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-lg relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-slate-700">
                      <Lock size={12} />
                    </div>
                    <div className="w-16 h-16 bg-[#111827] border border-slate-700 rounded-lg flex items-center justify-center p-1">
                      {logoBase64 ? (
                        <img
                          src={logoBase64}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Globe size={24} className="text-slate-700" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">
                        {formData.siteName}
                      </h4>
                      <span className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                        <LinkIcon size={10} /> {formData.siteUrl || 'Sin URL'}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: formData.color }}
                        ></div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase">
                          {formData.color}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA 3 */}
          <div
            className={`${THEME.panel} p-6 rounded-xl border ${THEME.border} shadow-xl flex flex-col`}
          >
            <h3 className="text-[#D10057] font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
              <MapPin size={16} /> 3. Entorno{' '}
              {modoActual === 'SKIN' ? 'Adicional' : 'Inicial'}
            </h3>
            <div className="space-y-6 flex-1">
              <div>
                <label className="text-slate-500 text-[10px] font-bold mb-1 block uppercase">
                  País de Operación
                </label>
                <select
                  value={formData.countryCode}
                  onChange={(e) =>
                    handleInputChange('countryCode', e.target.value)
                  }
                  className={`${THEME.select} w-full p-3 rounded-lg text-sm font-bold`}
                >
                  {americanCountries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name} ({country.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-[10px] font-bold mb-1 block uppercase">
                  Divisa
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Banknote size={14} />
                  </span>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      handleInputChange('currency', e.target.value)
                    }
                    className={`${THEME.select} w-full p-3 pl-9 rounded-lg text-sm font-bold`}
                  >
                    {americanCurrencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col justify-center relative overflow-hidden mt-4">
                <div className="absolute -right-4 -top-4 opacity-5">
                  <Fingerprint size={80} />
                </div>
                <label className="text-emerald-500 text-[10px] font-bold mb-1 block uppercase tracking-widest z-10">
                  ID Operativo
                </label>
                <div className="text-white font-mono font-bold truncate z-10 text-sm">
                  {autoUsername || '---'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-[#111827] border-t border-slate-800 p-4 flex justify-end gap-3 z-50">
        <button
          onClick={() => {
            if (onCloseTab) onCloseTab();
            onNavigate('contract_list');
          }}
          className="px-6 py-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest border border-transparent hover:border-slate-700 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="bg-[#D10057] px-8 py-2.5 rounded-lg text-white font-bold text-xs shadow-lg uppercase tracking-widest hover:bg-[#b00049] transition-colors flex items-center gap-2"
        >
          <Save size={16} />{' '}
          {modoActual === 'CONTRACT'
            ? 'Crear Contrato'
            : modoActual === 'SITE'
            ? 'Añadir Marca'
            : 'Añadir Entorno'}
        </button>
      </div>
    </div>
  );
};
