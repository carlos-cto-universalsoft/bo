import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  X,
  Shield,
  User,
  Phone,
  FileClock,
} from 'lucide-react';
import { THEME } from '../../config/constants';
import { useData } from '../../context/DataContext';

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

const NEXT_LEVEL = {
  root: ['Distribuidor'],
  Distribuidor: ['Sub Distribuidor'],
  'Sub Distribuidor': ['Operador'],
  Operador: ['Tienda'],
  Tienda: ['Cajero'],
  Cajero: ['Apostador WEB', 'Apostador Terminal', 'Apostador Retail'],
  'Apostador WEB': null,
  'Apostador Terminal': null,
  'Apostador Retail': null,
};

const TreeNode = ({
  node,
  allNodes,
  depth,
  onAddClick,
  openMenuId,
  setOpenMenuId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const children = allNodes.filter((n) => n.parentId === node.id);
  const icon = NODE_ICONS[node.type] || '▪️';
  const hasAddOption = NEXT_LEVEL[node.type] !== null;
  const hasChildren = children.length > 0;

  return (
    <div className="w-full">
      <div
        className="group relative flex items-center justify-between text-sm text-slate-300 py-1.5 px-2 hover:bg-slate-800/50 rounded transition-colors border-l border-transparent hover:border-slate-700"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
      >
        <div
          className="flex items-center gap-2 truncate cursor-pointer flex-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-4 flex justify-center text-slate-500 hover:text-white">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )
            ) : (
              <div className="w-3.5" />
            )}
          </div>
          <span className="text-base grayscale opacity-80">{icon}</span>
          <span className="truncate">{node.username}</span>
        </div>

        {hasAddOption && (
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === node.id ? null : node.id);
              }}
              className={`p-1 rounded-md transition-colors ${
                openMenuId === node.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MoreVertical size={14} />
            </button>
            {openMenuId === node.id && (
              <div className="absolute top-full right-0 mt-1 w-32 bg-[#1F2937] border border-slate-700 rounded shadow-xl z-[100] animate-in fade-in py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddClick(node.id, node.type, node.username);
                    setOpenMenuId(null);
                    setIsExpanded(true);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <Plus size={12} /> Añadir
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {isExpanded &&
        children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            allNodes={allNodes}
            depth={depth + 1}
            onAddClick={onAddClick}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
        ))}
    </div>
  );
};

export const NetworkCreateView = ({ currentSkin }) => {
  const { networks, addNetworkNode, hasPermission, sites } = useData();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [rootExpanded, setRootExpanded] = useState(true);

  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [selectedOwnerName, setSelectedOwnerName] = useState('');
  const [selectedOwnerType, setSelectedOwnerType] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const initialFormState = {
    username: '',
    password: '',
    repeatPassword: '',
    active2FA: false,
    firstName: '',
    lastName: '',
    gender: '',
    docType: '',
    docNum: '',
    birthDate: '',
    email: '',
    phone: '',
    landline: '',
    address: '',
    city: '',
    zipCode: '',
    notes: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const skinNetworks = networks.filter((n) => n.skinId === currentSkin.id);
  const isNetworkEmpty = skinNetworks.length === 0;

  const currentSite = sites.find((s) => s.id === currentSkin.siteId);

  // 👈 LÓGICA DINÁMICA CORREGIDA: Resuelve el nombre correcto del Site
  let baseSiteName = 'universalsoft';
  if (currentSite && currentSite.name) {
    baseSiteName = currentSite.name;
  } else if (currentSkin.site) {
    if (currentSkin.site === 'UR') baseSiteName = 'universalsoft';
    else if (currentSkin.site === 'XLIVE') baseSiteName = 'xlive';
    else baseSiteName = currentSkin.site;
  }

  const sitePrefix = baseSiteName.toLowerCase().replace(/\s+/g, '');
  const rootNodeName = `${sitePrefix}.${(
    currentSkin.code || 'xx'
  ).toLowerCase()}.${(currentSkin.currency || 'xxx').toLowerCase()}`;

  const displaySkinContext = currentSkin.name;

  const logoSrc =
    currentSite?.logo ||
    (currentSkin.site === 'XLIVE' ? '/logo-xlive.png' : '/ur-logo.png');

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const handleNodeAdd = (ownerId, ownerType, ownerUsername) => {
    setSelectedOwnerId(ownerId);
    setSelectedOwnerName(ownerUsername);
    setSelectedOwnerType(ownerType);

    const possibleNext = NEXT_LEVEL[ownerType];
    if (possibleNext && possibleNext.length === 1) {
      setSelectedType(possibleNext[0]);
    } else {
      setSelectedType('');
    }
  };

  const possibleNextTypes = selectedOwnerType
    ? NEXT_LEVEL[selectedOwnerType]
    : null;

  const handleOpenDrawer = () => {
    if (!selectedType || !selectedOwnerId) return;
    setIsDrawerOpen(true);
  };

  const handleSaveNetworkUser = () => {
    if (!hasPermission(currentSkin.id, 'net_create_act'))
      return alert(
        'Acceso Denegado: No tienes permiso de ACCIÓN para registrar usuarios en la red.'
      );

    if (!formData.username.trim() || !formData.password || !formData.birthDate)
      return alert(
        'Error: Debes completar Usuario, Contraseña y Fecha de Nacimiento.'
      );
    if (formData.password !== formData.repeatPassword)
      return alert('Error: Las contraseñas no coinciden.');

    const today = new Date();
    const birthDate = new Date(formData.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18)
      return alert(
        'Acceso denegado: El usuario debe ser mayor de edad (+18) para ser registrado en la red.'
      );

    addNetworkNode({
      skinId: currentSkin.id,
      parentId: selectedOwnerId,
      type: selectedType,
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      city: formData.city,
      email: formData.email,
      phone: formData.phone,
    });
    setFormData(initialFormState);
    setIsDrawerOpen(false);
    setSelectedOwnerId('');
    setSelectedOwnerName('');
    setSelectedOwnerType('');
    setSelectedType('');
  };

  const formUpdate = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex h-full relative overflow-hidden bg-[#0B1120] text-slate-200 animate-in fade-in">
      <div className="w-80 bg-[#111827] border-r border-slate-800 flex flex-col flex-shrink-0 z-20">
        <div className="p-5 border-b border-slate-800">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Store size={18} className="text-[#D10057]" /> Constructor de Red
          </h3>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              placeholder="Buscar red..."
              className="w-full bg-[#1F2937] border border-slate-700 text-xs text-white p-2 pl-8 rounded outline-none focus:border-[#D10057]"
            />
          </div>
        </div>
        <div className="p-2 flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="group relative flex items-center justify-between text-sm text-[#D10057] font-bold py-2 px-2 hover:bg-slate-800/50 rounded transition-colors">
            <div
              className="flex items-center gap-2 cursor-pointer flex-1"
              onClick={() => setRootExpanded(!rootExpanded)}
            >
              {rootExpanded ? (
                <ChevronDown size={14} className="text-slate-500" />
              ) : (
                <ChevronRight size={14} className="text-slate-500" />
              )}
              <span className="text-base">👑</span> {rootNodeName}
            </div>
            <div className="relative flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === 'root' ? null : 'root');
                }}
                className={`p-1 rounded-md transition-colors ${
                  openMenuId === 'root'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MoreVertical size={16} />
              </button>
              {openMenuId === 'root' && (
                <div className="absolute top-full right-0 mt-1 w-32 bg-[#1F2937] border border-slate-700 rounded shadow-xl z-[100] animate-in fade-in py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeAdd('root', 'root', rootNodeName);
                      setOpenMenuId(null);
                      setRootExpanded(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <Plus size={12} /> Añadir
                  </button>
                </div>
              )}
            </div>
          </div>
          {rootExpanded &&
            (isNetworkEmpty ? (
              <div className="pl-8 pt-2 text-xs text-slate-600 italic">
                (Red vacía. Usa los tres puntos para comenzar)
              </div>
            ) : (
              <div className="mt-1">
                {skinNetworks
                  .filter((n) => n.parentId === 'root')
                  .map((rootChild) => (
                    <TreeNode
                      key={rootChild.id}
                      node={rootChild}
                      allNodes={skinNetworks}
                      depth={0.5}
                      onAddClick={handleNodeAdd}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                    />
                  ))}
              </div>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center pt-24 px-8 relative overflow-y-auto z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Crecimiento de Red
          </h2>
          <p className="text-slate-400">
            Selecciona un nodo del árbol izquierdo para crear un usuario
            inferior.
          </p>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-4xl p-10 shadow-2xl relative">
          <h3 className="text-center text-lg font-bold text-white mb-8 border-b border-slate-800 pb-4">
            Validación de Custodia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-widest">
                Skin
              </label>
              <div className="flex items-center gap-2 bg-[#1F2937] border border-slate-700 p-3 rounded-lg opacity-80 cursor-not-allowed">
                <img
                  src={logoSrc}
                  alt={currentSkin.site}
                  className="w-4 h-4 object-contain"
                />
                <span className="text-sm font-bold text-slate-300">
                  {displaySkinContext}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-widest">
                Propietario
              </label>
              <input
                disabled
                value={selectedOwnerName || 'Seleccione del Árbol'}
                className={`w-full ${
                  THEME.input
                } p-3 text-sm rounded-lg font-bold ${
                  selectedOwnerId
                    ? 'text-[#D10057] bg-[#D10057]/5 border-[#D10057]/30 shadow-inner'
                    : 'text-slate-500 bg-slate-900 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-widest">
                Tipo de Red
              </label>
              {!possibleNextTypes ? (
                <input
                  disabled
                  value="Esperando Propietario..."
                  className={`w-full ${THEME.input} p-3 text-sm rounded-lg font-bold text-slate-500 bg-slate-900 cursor-not-allowed`}
                />
              ) : possibleNextTypes.length === 1 ? (
                <input
                  disabled
                  value={possibleNextTypes[0]}
                  className={`w-full ${THEME.input} p-3 text-sm rounded-lg font-bold text-white bg-[#1F2937] opacity-80 cursor-not-allowed`}
                />
              ) : (
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={`w-full ${THEME.select} p-3 text-sm rounded-lg font-bold bg-[#1F2937] text-white border border-[#D10057] shadow-inner`}
                >
                  <option value="">-- Seleccione una opción --</option>
                  {possibleNextTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-12 border-t border-slate-800 pt-6">
            <button
              onClick={handleOpenDrawer}
              disabled={!selectedType || !selectedOwnerId}
              className={`bg-[#D10057] text-white font-bold py-3 px-10 rounded-lg shadow-lg shadow-[#D10057]/20 transition-all ${
                !selectedType || !selectedOwnerId
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:-translate-y-0.5 hover:bg-[#b00049]'
              }`}
            >
              Continuar al Formulario KYC
            </button>
          </div>
        </div>
      </div>

      <div
        onClick={() => setIsDrawerOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      ></div>
      <div
        className={`fixed inset-y-0 right-0 w-[550px] bg-[#111827] border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0f1522]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Crear {selectedType}
            </h2>
            <span className="text-[10px] text-[#D10057] uppercase tracking-widest font-bold">
              Dependencia: {selectedOwnerName}
            </span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="text-slate-500 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          <section>
            <h4 className="text-sm font-bold text-[#D10057] mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Shield size={16} /> Credenciales de Acceso
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Usuario (Login) *
                </label>
                <input
                  value={formData.username}
                  onChange={(e) => formUpdate('username', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => formUpdate('password', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Repetir *
                </label>
                <input
                  type="password"
                  value={formData.repeatPassword}
                  onChange={(e) => formUpdate('repeatPassword', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div className="col-span-2 mt-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">
                    Autenticación de 2 Pasos (2FA)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Exigir token al iniciar sesión.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => formUpdate('active2FA', !formData.active2FA)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    formData.active2FA ? 'bg-[#D10057]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData.active2FA ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-bold text-[#D10057] mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <User size={16} /> Información Personal (KYC)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Nombres
                </label>
                <input
                  value={formData.firstName}
                  onChange={(e) => formUpdate('firstName', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Apellidos
                </label>
                <input
                  value={formData.lastName}
                  onChange={(e) => formUpdate('lastName', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Sexo
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => formUpdate('gender', e.target.value)}
                  className={`${THEME.select} w-full p-2.5 rounded-lg text-sm`}
                >
                  <option value="">Seleccione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Tipo documento
                </label>
                <select
                  value={formData.docType}
                  onChange={(e) => formUpdate('docType', e.target.value)}
                  className={`${THEME.select} w-full p-2.5 rounded-lg text-sm`}
                >
                  <option value="">Seleccione</option>
                  <option value="DNI">DNI</option>
                  <option value="CEDULA">Cédula</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Número de Doc.
                </label>
                <input
                  value={formData.docNum}
                  onChange={(e) => formUpdate('docNum', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-[#D10057] mb-1 block uppercase flex items-center gap-2">
                  <FileClock size={12} /> Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => formUpdate('birthDate', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm [color-scheme:dark]`}
                />
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-bold text-[#D10057] mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Phone size={16} /> Contacto y Operación
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => formUpdate('email', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Celular Móvil
                </label>
                <input
                  value={formData.phone}
                  onChange={(e) => formUpdate('phone', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Teléfono Fijo
                </label>
                <input
                  value={formData.landline}
                  onChange={(e) => formUpdate('landline', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Dirección Operativa
                </label>
                <input
                  value={formData.address}
                  onChange={(e) => formUpdate('address', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Ciudad
                </label>
                <input
                  value={formData.city}
                  onChange={(e) => formUpdate('city', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Código Postal
                </label>
                <input
                  value={formData.zipCode}
                  onChange={(e) => formUpdate('zipCode', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm`}
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                  Notas de Auditoría
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => formUpdate('notes', e.target.value)}
                  className={`${THEME.input} w-full p-2.5 rounded-lg text-sm h-20 resize-none`}
                  placeholder="Información adicional sobre el registro..."
                />
              </div>
            </div>
          </section>
        </div>
        <div className="p-4 border-t border-slate-800 flex justify-between gap-4 bg-[#0B1120]">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 py-3 text-sm font-bold text-slate-400 border border-slate-700 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveNetworkUser}
            className="flex-1 py-3 text-sm font-bold text-white bg-[#D10057] rounded-lg hover:bg-[#b00049] transition-colors shadow-lg"
          >
            Finalizar y Crear
          </button>
        </div>
      </div>
    </div>
  );
};
