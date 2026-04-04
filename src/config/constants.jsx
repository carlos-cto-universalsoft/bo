export const THEME = {
  bg: 'bg-[#0B1120]',
  panel: 'bg-[#111827]',
  card: 'bg-[#1F2937]',
  border: 'border-slate-800',
  input:
    'bg-[#1F2937] border-slate-700 focus:border-[#D10057] text-white placeholder-slate-500 outline-none transition-colors disabled:opacity-50 disabled:bg-slate-900',
  select:
    'bg-[#1F2937] border-slate-700 focus:border-[#D10057] text-white outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  primary: 'bg-[#D10057]',
  primaryHover: 'hover:bg-[#b00049]',
  tabActive:
    'bg-[#111827] text-white border-t-2 border-t-[#D10057] border-x border-x-slate-800',
  tabInactive:
    'bg-[#0f1522] text-slate-500 hover:bg-[#111827] hover:text-slate-300 border-t-2 border-t-transparent border-x border-x-transparent border-b border-b-slate-800',
};

// ==========================================
// 📦 NIVEL 1: CONTRATOS (Empresas)
// ==========================================
export const INITIAL_CONTRACTS = [
  {
    id: 'c-001',
    contractNumber: 'CTR-00001',
    companyName: 'UniversalSoft',
    createdAt: new Date().toISOString(),
  },
];

// ==========================================
// 📦 NIVEL 2: SITES (Marcas Comerciales)
// ==========================================
export const INITIAL_SITES = [
  {
    id: 's-ur',
    contractId: 'c-001',
    name: 'UniversalRace',
    url: 'www.universalrace.com',
    logo: '/ur-logo.png',
    colors: { primary: '#D10057' },
  },
  {
    id: 's-xlive',
    contractId: 'c-001',
    name: 'Xlive365',
    url: 'www.xlive365.com',
    logo: '/logo-xlive.png',
    colors: { primary: '#00A3FF' },
  },
];

// ==========================================
// 📦 NIVEL 3: SKINS (Bóvedas operativas)
// ==========================================
export const INITIAL_SKINS = [
  {
    id: 'ur_pe_pen',
    name: 'UniversalRace PE (PEN)',
    siteId: 's-ur',
    site: 'UR',
    code: 'PE',
    currency: 'PEN',
    flag: '🇵🇪',
    username: 'universalrace.pe.pen',
  },
  {
    id: 'ur_pe_usd',
    name: 'UniversalRace PE (USD)',
    siteId: 's-ur',
    site: 'UR',
    code: 'PE',
    currency: 'USD',
    flag: '🇵🇪',
    username: 'universalrace.pe.usd',
  },
  {
    id: 'ur_co_cop',
    name: 'UniversalRace CO (COP)',
    siteId: 's-ur',
    site: 'UR',
    code: 'CO',
    currency: 'COP',
    flag: '🇨🇴',
    username: 'universalrace.co.cop',
  },
  {
    id: 'ur_mx_mxn',
    name: 'UniversalRace MX (MXN)',
    siteId: 's-ur',
    site: 'UR',
    code: 'MX',
    currency: 'MXN',
    flag: '🇲🇽',
    username: 'universalrace.mx.mxn',
  },
  {
    id: 'ur_ec_usd',
    name: 'UniversalRace EC (USD)',
    siteId: 's-ur',
    site: 'UR',
    code: 'EC',
    currency: 'USD',
    flag: '🇪🇨',
    username: 'universalrace.ec.usd',
  },
  {
    id: 'ur_cl_clp',
    name: 'UniversalRace CL (CLP)',
    siteId: 's-ur',
    site: 'UR',
    code: 'CL',
    currency: 'CLP',
    flag: '🇨🇱',
    username: 'universalrace.cl.clp',
  },
  {
    id: 'ur_ar_ars',
    name: 'UniversalRace AR (ARS)',
    siteId: 's-ur',
    site: 'UR',
    code: 'AR',
    currency: 'ARS',
    flag: '🇦🇷',
    username: 'universalrace.ar.ars',
  },
  {
    id: 'xlive_pe_pen',
    name: 'Xlive365 PE (PEN)',
    siteId: 's-xlive',
    site: 'XLIVE',
    code: 'PE',
    currency: 'PEN',
    flag: '🇵🇪',
    username: 'xlive.pe.pen',
  },
  {
    id: 'xlive_co_cop',
    name: 'Xlive365 CO (COP)',
    siteId: 's-xlive',
    site: 'XLIVE',
    code: 'CO',
    currency: 'COP',
    flag: '🇨🇴',
    username: 'xlive.co.cop',
  },
  {
    id: 'xlive_ec_usd',
    name: 'Xlive365 EC (USD)',
    siteId: 's-xlive',
    site: 'XLIVE',
    code: 'EC',
    currency: 'USD',
    flag: '🇪🇨',
    username: 'xlive.ec.usd',
  },
  {
    id: 'xlive_mx_mxn',
    name: 'Xlive365 MX (MXN)',
    siteId: 's-xlive',
    site: 'XLIVE',
    code: 'MX',
    currency: 'MXN',
    flag: '🇲🇽',
    username: 'xlive.mx.mxn',
  },
];

export const AVAILABLE_SKINS = INITIAL_SKINS;

// ==========================================
// 🌍 CATÁLOGO GLOBAL (Nivel Empresa / Sistema)
// No dependen de una Skin específica.
// ==========================================
export const GLOBAL_CATALOG = [
  {
    id: 'mod_contracts',
    title: 'Configuración (Nivel 1)',
    isAdminOnly: true, // 🛡️ EL CANDADO DE DATA
    permissions: [
      {
        id: 'contract_view',
        label: 'Vista: Lista de Contratos y Sites',
        type: 'LECTURA',
        desc: 'Permite ver el directorio de Contratos.',
        risk: 'Alto',
      },
      {
        id: 'contract_create',
        label: 'Crear Nuevo Contrato/Site',
        type: 'ACCIÓN',
        desc: 'Permite registrar un nuevo cliente SaaS.',
        risk: 'Crítico',
      },
      {
        id: 'contract_edit',
        label: 'Editar Contrato / Activar Skins',
        type: 'ACCIÓN',
        desc: 'Modificar datos o habilitar nuevas regiones operativas.',
        risk: 'Crítico',
      },
    ],
  },
  {
    id: 'mod_rrhh',
    title: 'Módulo: Gestión de Empleados',
    permissions: [
      {
        id: 'rrhh_menu_root',
        label: 'Menú Principal: Gestión de Empleados',
        type: 'MENU',
        desc: 'Muestra el Menú: Gestión de Empleados.',
        risk: 'Bajo',
      },
      {
        id: 'emp_nav_list',
        label: 'Menú Secundario: Listar Empleados',
        type: 'MENU',
        desc: 'Muestra el Sub-Menú: Listar Empleados.',
        risk: 'Bajo',
      },
      {
        id: 'emp_nav_create',
        label: 'Menú Secundario: Crear Empleado',
        type: 'MENU',
        desc: 'Muestra el Sub-Menú: Crear Empleado.',
        risk: 'Bajo',
      },
      {
        id: 'rol_nav_list',
        label: 'Menú Secundario: Listar Cargos',
        type: 'MENU',
        desc: 'Muestra el Sub-Menú: Listar Cargos.',
        risk: 'Bajo',
      },
      {
        id: 'rol_nav_create',
        label: 'Menú Secundario: Crear Cargo',
        type: 'MENU',
        desc: 'Muestra el Sub-Menú: Crear Cargo.',
        risk: 'Bajo',
      },
      {
        id: 'assig_nav',
        label: 'Menú Secundario: Asignar Cargos',
        type: 'MENU',
        desc: 'Muestra el Sub-Menú: Asignar Cargos.',
        risk: 'Bajo',
      },
      {
        id: 'emp_ui_fab_add',
        label: 'Botón Crear Empleado',
        type: 'ELEMENTO',
        desc: 'En Listar Empleados, muestra un Botón flotante para Crear Empleados.',
        risk: 'Medio',
      },
      {
        id: 'emp_ui_btn_view',
        label: 'Botón Ver Detalle',
        type: 'ELEMENTO',
        desc: 'Ícono del ojo en la tabla empleados.',
        risk: 'Bajo',
      },
      {
        id: 'emp_ui_btn_lock',
        label: 'Botón Bloquear/Desbloquear',
        type: 'ELEMENTO',
        desc: 'Ícono del candado en la tabla.',
        risk: 'Alto',
      },
      {
        id: 'emp_ui_btn_log',
        label: 'Botón Historial de Logs',
        type: 'ELEMENTO',
        desc: 'Ícono del reloj en la tabla.',
        risk: 'Bajo',
      },
      {
        id: 'rol_ui_fab_add',
        label: 'Botón Crear Cargo',
        type: 'ELEMENTO',
        desc: 'En Listar Cargo, muestra un Botón flotante para Crear Cargos.',
        risk: 'Alto',
      },
      {
        id: 'rol_ui_btn_edit',
        label: 'Botón Editar Cargo',
        type: 'ELEMENTO',
        desc: 'Ícono del lápiz en cargos.',
        risk: 'Crítico',
      },
      {
        id: 'rol_ui_btn_skin',
        label: 'Botón Gestionar Skins',
        type: 'ELEMENTO',
        desc: 'Ícono del mundo en cargos.',
        risk: 'Crítico',
      },
      {
        id: 'rol_ui_btn_copy',
        label: 'Botón Clonar Cargo',
        type: 'ELEMENTO',
        desc: 'Ícono de copiar en cargos.',
        risk: 'Alto',
      },
      {
        id: 'assig_ui_select',
        label: 'Selector de Asignación',
        type: 'ELEMENTO',
        desc: 'Menú desplegable para elegir roles.',
        risk: 'Crítico',
      },
      {
        id: 'emp_list_read',
        label: 'Vista: Tabla de Empleados',
        type: 'LECTURA',
        desc: 'Autoriza obtener la lista general.',
        risk: 'Bajo',
      },
      {
        id: 'emp_create_read',
        label: 'Vista: Formulario Nuevo Empleado',
        type: 'LECTURA',
        desc: 'Autoriza cargar vista de creación.',
        risk: 'Bajo',
      },
      {
        id: 'emp_detail_read',
        label: 'Vista: Perfil del Empleado',
        type: 'LECTURA',
        desc: 'Consultar información detallada.',
        risk: 'Medio',
      },
      {
        id: 'emp_log_read',
        label: 'Vista: Registro de Auditoría',
        type: 'LECTURA',
        desc: 'Extraer el log de auditoría.',
        risk: 'Medio',
      },
      {
        id: 'rol_list_read',
        label: 'Vista: Tabla de Cargos',
        type: 'LECTURA',
        desc: 'Extraer la lista de roles de la BD.',
        risk: 'Bajo',
      },
      {
        id: 'rol_create_read',
        label: 'Vista: Formulario Nuevo Cargo',
        type: 'LECTURA',
        desc: 'Cargar interfaz de creación de rol.',
        risk: 'Bajo',
      },
      {
        id: 'rol_edit_read',
        label: 'Vista: Gestión de Cargo',
        type: 'LECTURA',
        desc: 'Extraer configuración para editar.',
        risk: 'Alto',
      },
      {
        id: 'rol_skin_read',
        label: 'Vista: Cobertura de SKIN',
        type: 'LECTURA',
        desc: 'Extraer países habilitados.',
        risk: 'Alto',
      },
      {
        id: 'assig_list_read',
        label: 'Vista: Vinculación de Cargos',
        type: 'LECTURA',
        desc: 'Consultar tabla cruzada emp/cargos.',
        risk: 'Bajo',
      },
      {
        id: 'emp_create_act',
        label: 'Crear Empleado',
        type: 'ACCIÓN',
        desc: 'Registro (POST) del nuevo empleado.',
        risk: 'Medio',
      },
      {
        id: 'emp_lock_act',
        label: 'Bloquear Empleado',
        type: 'ACCIÓN',
        desc: 'Cambio de estado (PUT).',
        risk: 'Alto',
      },
      {
        id: 'rol_create_act',
        label: 'Crear Cargo',
        type: 'ACCIÓN',
        desc: 'Registro del nuevo rol.',
        risk: 'Alto',
      },
      {
        id: 'rol_edit_act',
        label: 'Editar Permisos',
        type: 'ACCIÓN',
        desc: 'Actualizar (PUT) matriz de seguridad.',
        risk: 'Crítico',
      },
      {
        id: 'rol_skin_act',
        label: 'Asignar Skins',
        type: 'ACCIÓN',
        desc: 'Asignar/retirar países a un cargo.',
        risk: 'Crítico',
      },
      {
        id: 'rol_clone_act',
        label: 'Clonar Cargo',
        type: 'ACCIÓN',
        desc: 'Duplicar permisos de un rol.',
        risk: 'Alto',
      },
      {
        id: 'assig_upd_act',
        label: 'Vincular Cargo',
        type: 'ACCIÓN',
        desc: 'Cambio de rol al empleado.',
        risk: 'Crítico',
      },
    ],
  },
];

// ==========================================
// 🏬 CATÁLOGO LOCAL (Operativa del Negocio)
// Dependen estrictamente de la Skin seleccionada.
// ==========================================
export const LOCAL_CATALOG = [
  {
    id: 'mod_network',
    title: 'Módulo: Red de Negocios (Retail)',
    permissions: [
      {
        id: 'net_menu_root',
        label: 'Menú Principal: Red de Negocios',
        type: 'MENU',
        desc: 'Muestra el Menú: Red de Negocios.',
        risk: 'Bajo',
      },
      {
        id: 'net_nav_list',
        label: 'Menú Secundario: Listar Red',
        type: 'MENU',
        desc: 'Muestra el Sub-Menú: Listar Red.',
        risk: 'Bajo',
      },
      {
        id: 'net_nav_create',
        label: 'Menú Secundario: Crear Red',
        type: 'MENU',
        desc: 'Muestra el Sub-Menú: Crear Red.',
        risk: 'Bajo',
      },
      {
        id: 'net_ui_fab_add',
        label: 'Botón Crear Red',
        type: 'ELEMENTO',
        desc: 'En Listar Red, muestra un Botón flotante para Crear Red.',
        risk: 'Bajo',
      },
      {
        id: 'net_ui_btn_view',
        label: 'Botón Ver Perfil de Red',
        type: 'ELEMENTO',
        desc: 'Muestra el ícono del ojo en la tabla del directorio.',
        risk: 'Bajo',
      },
      {
        id: 'net_ui_btn_transfer',
        label: 'Botón Transferir Saldo',
        type: 'ELEMENTO',
        desc: 'Muestra ícono de billete en la tabla.',
        risk: 'Alto',
      },
      {
        id: 'net_ui_btn_dash',
        label: 'Botón Dashboard de Red',
        type: 'ELEMENTO',
        desc: 'Muestra ícono de panel en la tabla.',
        risk: 'Bajo',
      },
      {
        id: 'net_deposit_read',
        label: 'Vista: Pestaña Depósitos',
        type: 'LECTURA',
        desc: 'Ver historial de fondeos y el indicador de bóveda.',
        risk: 'Medio',
      },
      {
        id: 'net_deposit_write',
        label: 'Ejecutar Depósitos',
        type: 'ACCIÓN',
        desc: 'Inyectar liquidez desde la Skin Matriz hacia el nodo.',
        risk: 'Alto',
      },
      {
        id: 'net_withdraw_read',
        label: 'Vista: Pestaña Retiros',
        type: 'LECTURA',
        desc: 'Ver historial de recaudos o ajustes negativos.',
        risk: 'Medio',
      },
      {
        id: 'net_withdraw_write',
        label: 'Ejecutar Retiros',
        type: 'ACCIÓN',
        desc: 'Retirar saldo de un nodo para devolverlo a la Skin Matriz.',
        risk: 'Crítico',
      },
      {
        id: 'net_ui_btn_edit_kyc',
        label: 'Botón Editar Perfil KYC',
        type: 'ELEMENTO',
        desc: 'Muestra ícono de lápiz en datos demográficos.',
        risk: 'Medio',
      },
      {
        id: 'net_ui_btn_edit_sys',
        label: 'Botón Gestionar Credenciales',
        type: 'ELEMENTO',
        desc: 'Muestra botón de gestionar en tarjeta 2FA/Sistema.',
        risk: 'Crítico',
      },
      {
        id: 'net_list_read',
        label: 'Vista: Directorio Transaccional',
        type: 'LECTURA',
        desc: 'Ver tabla de la red y saldos.',
        risk: 'Medio',
      },
      {
        id: 'net_create_read',
        label: 'Vista: Constructor de Red',
        type: 'LECTURA',
        desc: 'Cargar el árbol de creación.',
        risk: 'Medio',
      },
      {
        id: 'net_profile_read',
        label: 'Vista: Perfil de Usuario de Red',
        type: 'LECTURA',
        desc: 'Permite abrir el perfil desde el botón del ojo en la tabla.',
        risk: 'Medio',
      },
      {
        id: 'net_kyc_read',
        label: 'Vista: Tarjeta Demográfica (KYC)',
        type: 'LECTURA',
        desc: 'Ver datos personales y de ubicación del usuario de red.',
        risk: 'Medio',
      },
      {
        id: 'net_sys_read',
        label: 'Vista: Tarjeta de Seguridad (2FA)',
        type: 'LECTURA',
        desc: 'Ver username, email, teléfono y estado de la cuenta.',
        risk: 'Alto',
      },
      {
        id: 'net_create_act',
        label: 'Registrar Nodo',
        type: 'ACCIÓN',
        desc: 'Crear usuario de red en BD.',
        risk: 'Medio',
      },
      {
        id: 'net_transfer_act',
        label: 'Ejecutar Transferencia',
        type: 'ACCIÓN',
        desc: 'Mover fondos entre Skin y nodo.',
        risk: 'Crítico',
      },
      {
        id: 'net_kyc_edit',
        label: 'Editar Expediente KYC',
        type: 'ACCIÓN',
        desc: 'Guardar cambios en nombre, documento y dirección.',
        risk: 'Medio',
      },
      {
        id: 'net_sys_edit',
        label: 'Editar Sistema y Credenciales',
        type: 'ACCIÓN',
        desc: 'Modificar Login, 2FA o Estado operativo (Suspender/Bloquear).',
        risk: 'Crítico',
      },
      {
        id: 'net_tx_read',
        label: 'Vista: Pestaña Transacciones',
        type: 'LECTURA',
        desc: 'Ver el Libro Mayor (Historial general de apuestas, ganancias, depósitos, retiros).',
        risk: 'Alto',
      },
    ],
  },
];

// Generadores de matrices completas divididas
export const FULL_GLOBAL_MATRIX = GLOBAL_CATALOG.reduce((acc, mod) => {
  mod.permissions.forEach((p) => (acc[p.id] = true));
  return acc;
}, {});

export const FULL_LOCAL_MATRIX = LOCAL_CATALOG.reduce((acc, mod) => {
  mod.permissions.forEach((p) => (acc[p.id] = true));
  return acc;
}, {});

// 👇 INYECCIÓN DE VERSIÓN APLICADA: Gatillo para reinicio seguro a Arquitectura Dual
export const DB_VERSION = 'V.4.0.7-Arquitectura';
