import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  // 👇 IMPORTS ACTUALIZADOS A LA ARQUITECTURA DUAL
  FULL_GLOBAL_MATRIX,
  FULL_LOCAL_MATRIX,
  DB_VERSION,
  INITIAL_CONTRACTS,
  INITIAL_SITES,
  INITIAL_SKINS,
} from '../config/constants';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children, currentUser }) => {
  // ==========================================
  // CONFIGURACIÓN INICIAL ACTUALIZADA: SKIN = SITE + PAÍS + DIVISA
  // ==========================================
  const initialRoles = [
    {
      id: '00001',
      name: 'Gerente General',
      description: 'Acceso total y configuración raíz.',
      origin: 'Predefinido',
      status: 'active',
      contractId: 'c-001', // 👈 ¡ADN DE PROPIEDAD SINCRONIZADO AL DÍA 0!
      skins: [
        // UNIVERSAL RACE
        'ur_pe_pen',
        'ur_pe_usd',
        'ur_co_cop',
        'ur_mx_mxn',
        'ur_ec_usd',
        'ur_cl_clp',
        'ur_ar_ars',
        // XLIVE 365
        'xlive_pe_pen',
        'xlive_co_cop',
        'xlive_ec_usd',
        'xlive_mx_mxn',
      ],
      // 👇 PODER GLOBAL AISLADO (Contratos y RRHH)
      globalPermissions: { ...FULL_GLOBAL_MATRIX },
      // 👇 PODER LOCAL AISLADO (Red de Negocios por Skin)
      skinPermissions: {
        // UNIVERSAL RACE
        ur_pe_pen: { ...FULL_LOCAL_MATRIX },
        ur_pe_usd: { ...FULL_LOCAL_MATRIX },
        ur_co_cop: { ...FULL_LOCAL_MATRIX },
        ur_mx_mxn: { ...FULL_LOCAL_MATRIX },
        ur_ec_usd: { ...FULL_LOCAL_MATRIX },
        ur_cl_clp: { ...FULL_LOCAL_MATRIX },
        ur_ar_ars: { ...FULL_LOCAL_MATRIX },
        // XLIVE 365
        xlive_pe_pen: { ...FULL_LOCAL_MATRIX },
        xlive_co_cop: { ...FULL_LOCAL_MATRIX },
        xlive_ec_usd: { ...FULL_LOCAL_MATRIX },
        xlive_mx_mxn: { ...FULL_LOCAL_MATRIX },
      },
    },
  ];

  const initialEmployees = [
    {
      id: 'E001',
      user: 'cristian.sam',
      firstName: 'Cristian',
      lastName: 'Sam',
      name: 'Cristian Sam',
      email: 'cristian.sam@universal.com',
      roleId: '00001',
      status: 'active',
      contractId: 'c-001', // 👈 ¡ADN CORPORATIVO SINCRONIZADO AL DÍA 0!
      skins: [
        // UNIVERSAL RACE
        'ur_pe_pen',
        'ur_pe_usd',
        'ur_co_cop',
        'ur_mx_mxn',
        'ur_ec_usd',
        'ur_cl_clp',
        'ur_ar_ars',
        // XLIVE 365
        'xlive_pe_pen',
        'xlive_co_cop',
        'xlive_ec_usd',
        'xlive_mx_mxn',
      ],
    },
  ];

  const initialSkinBalances = {
    // UNIVERSAL RACE
    ur_pe_pen: 1000000,
    ur_pe_usd: 500000, // Saldo inicial para bóveda en Dólares (Perú)
    ur_co_cop: 1000000,
    ur_mx_mxn: 1000000,
    ur_ec_usd: 1000000,
    ur_cl_clp: 1000000,
    ur_ar_ars: 1000000,
    // XLIVE 365
    xlive_pe_pen: 1000000,
    xlive_co_cop: 1000000,
    xlive_ec_usd: 1000000,
    xlive_mx_mxn: 1000000,
  };

  // NUEVO: Arreglo inicial de transacciones (Libro Mayor)
  const initialTransactions = [];

  // 👇 NUEVOS ESTADOS BASE: CONTRATOS, SITES Y SKINS
  const [contracts, setContracts] = useState(() => {
    const ver = localStorage.getItem('db_version');
    if (ver !== DB_VERSION) return INITIAL_CONTRACTS;
    return (
      JSON.parse(localStorage.getItem('db_contracts')) || INITIAL_CONTRACTS
    );
  });

  const [sites, setSites] = useState(() => {
    const ver = localStorage.getItem('db_version');
    if (ver !== DB_VERSION) return INITIAL_SITES;
    return JSON.parse(localStorage.getItem('db_sites')) || INITIAL_SITES;
  });

  const [skins, setSkins] = useState(() => {
    const ver = localStorage.getItem('db_version');
    if (ver !== DB_VERSION) return INITIAL_SKINS;
    return JSON.parse(localStorage.getItem('db_skins')) || INITIAL_SKINS;
  });
  // 👆 FIN NUEVOS ESTADOS

  const [roles, setRoles] = useState(() => {
    const ver = localStorage.getItem('db_version');
    if (ver !== DB_VERSION) return initialRoles;
    return JSON.parse(localStorage.getItem('db_roles')) || initialRoles;
  });

  const [employees, setEmployees] = useState(() => {
    const ver = localStorage.getItem('db_version');
    if (ver !== DB_VERSION) return initialEmployees;
    return JSON.parse(localStorage.getItem('db_employees')) || initialEmployees;
  });

  const [networks, setNetworks] = useState(() => {
    const ver = localStorage.getItem('db_version');
    if (ver !== DB_VERSION) return [];
    return JSON.parse(localStorage.getItem('db_networks')) || [];
  });

  const [skinBalances, setSkinBalances] = useState(() => {
    const ver = localStorage.getItem('db_version');
    if (ver !== DB_VERSION) return initialSkinBalances;
    return (
      JSON.parse(localStorage.getItem('db_skin_balances')) ||
      initialSkinBalances
    );
  });

  // NUEVO: Estado global persistente de Transacciones
  const [transactions, setTransactions] = useState(() => {
    const ver = localStorage.getItem('db_version');
    const saved = localStorage.getItem('db_transactions');
    if (ver !== DB_VERSION || !saved) return initialTransactions;
    return JSON.parse(saved);
  });

  useEffect(() => {
    if (localStorage.getItem('db_version') !== DB_VERSION) {
      localStorage.setItem('db_version', DB_VERSION);
      localStorage.setItem('db_roles', JSON.stringify(initialRoles));
      localStorage.setItem('db_employees', JSON.stringify(initialEmployees));
      const existingNets =
        JSON.parse(localStorage.getItem('db_networks')) || [];
      localStorage.setItem('db_networks', JSON.stringify(existingNets));
      localStorage.setItem(
        'db_skin_balances',
        JSON.stringify(initialSkinBalances)
      );

      // NUEVO: Inyección en base de datos inicial
      const existingTxs =
        JSON.parse(localStorage.getItem('db_transactions')) || [];
      localStorage.setItem('db_transactions', JSON.stringify(existingTxs));

      // 👇 INICIALIZAR NUEVOS ESTADOS
      localStorage.setItem('db_contracts', JSON.stringify(INITIAL_CONTRACTS));
      localStorage.setItem('db_sites', JSON.stringify(INITIAL_SITES));
      localStorage.setItem('db_skins', JSON.stringify(INITIAL_SKINS));
    }
  }, []);

  // 👇 NUEVOS EFFECTS PARA PERSISTENCIA
  useEffect(() => {
    localStorage.setItem('db_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('db_sites', JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem('db_skins', JSON.stringify(skins));
  }, [skins]);
  // 👆 FIN NUEVOS EFFECTS

  useEffect(() => {
    localStorage.setItem('db_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('db_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('db_networks', JSON.stringify(networks));
  }, [networks]);

  useEffect(() => {
    localStorage.setItem('db_skin_balances', JSON.stringify(skinBalances));
  }, [skinBalances]);

  // NUEVO: Efecto para guardar transacciones en tiempo real
  useEffect(() => {
    localStorage.setItem('db_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // 👇 NUEVAS FUNCIONES SAAS (CRUD Básico)
  const addContract = (newContract) => {
    setContracts((prev) => [...prev, newContract]);
  };

  const addSite = (newSite) => {
    setSites((prev) => [...prev, newSite]);
  };

  const addSkin = (newSkin) => {
    setSkins((prev) => [...prev, newSkin]);

    // Auto-asignar la nueva skin al Gerente General (00001) y darle Full Permisos Locales
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === '00001') {
          return {
            ...role,
            skins: [...role.skins, newSkin.id],
            skinPermissions: {
              // 👈 AJUSTADO PARA ARQUITECTURA DUAL
              ...role.skinPermissions,
              [newSkin.id]: { ...FULL_LOCAL_MATRIX },
            },
          };
        }
        return role;
      })
    );

    // Inicializar balance en 0 para la nueva skin
    setSkinBalances((prev) => ({
      ...prev,
      [newSkin.id]: 0,
    }));
  };
  // 👆 FIN NUEVAS FUNCIONES SAAS

  // 🛡️ MOTOR DE AUTORIZACIÓN: PODER GLOBAL (Contratos, RRHH)
  const hasGlobalPermission = (permId) => {
    if (!currentUser || !currentUser.roleId) return false;
    const userRole = roles.find((r) => r.id === currentUser.roleId);
    if (!userRole || !userRole.globalPermissions) return false;
    return userRole.globalPermissions[permId] === true;
  };

  // 🛡️ MOTOR DE AUTORIZACIÓN: PODER LOCAL (Red Retail)
  const hasPermission = (skinId, permId) => {
    if (!currentUser || !currentUser.roleId) return false;
    const userRole = roles.find((r) => r.id === currentUser.roleId);
    if (
      !userRole ||
      !userRole.skinPermissions ||
      !userRole.skinPermissions[skinId]
    )
      return false;
    return userRole.skinPermissions[skinId][permId] === true;
  };

  // 👇 MODIFICACIÓN APLICADA: Inyección estricta de Empresa (contractId) y Skins
  const addRole = (newRole) => {
    const roleToSave = {
      id: `R${Date.now().toString().slice(-4)}`,
      name: newRole.name,
      description: newRole.description,
      origin: 'Personalizado',
      status: 'active',
      skins: newRole.skins || [], // 👈 Ahora respeta el arreglo exacto de skins enviado desde la vista
      globalPermissions: newRole.globalPermissions || {}, // 👈 ARQUITECTURA DUAL
      skinPermissions: newRole.skinPermissions || {}, // 👈 ARQUITECTURA DUAL
      baseSkin: newRole.baseSkin,
      contractId: newRole.contractId, // 👈 SOLUCIÓN CRÍTICA: Ahora sí guarda la Empresa dueña
    };
    setRoles((prev) => [...prev, roleToSave]);
  };

  const editRole = (updatedRole) =>
    setRoles((prev) =>
      prev.map((r) => (r.id === updatedRole.id ? updatedRole : r))
    );

  // 👇 MODIFICACIÓN APLICADA: Clones heredan estrictamente la empresa original
  const cloneRole = (roleId) => {
    const original = roles.find((r) => r.id === roleId);
    if (!original) return;
    setRoles((prev) => [
      ...prev,
      {
        ...original,
        id: `R${Date.now().toString().slice(-4)}`,
        name: `${original.name} (Copia)`,
        origin: 'Personalizado',
        contractId: original.contractId, // 👈 PROTECCIÓN: El clon pertenece a la misma empresa
        baseSkin:
          original.baseSkin ||
          (original.skins && original.skins.length > 0
            ? original.skins[0]
            : null),
      },
    ]);
  };

  const toggleRoleStatus = (roleId) =>
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? { ...r, status: r.status === 'active' ? 'disabled' : 'active' }
          : r
      )
    );

  const deleteRole = (roleId) =>
    setRoles((prev) => prev.filter((r) => r.id !== roleId));

  const addEmployee = (newEmp) => {
    const fullName = `${newEmp.firstName} ${newEmp.lastName}`;
    const empWithId = {
      ...newEmp,
      name: fullName,
      id: `E${Date.now().toString().slice(-4)}`,
      skins: [],
    };
    setEmployees((prev) => [...prev, empWithId]);
  };

  const assignRoleToEmployee = (employeeId, roleId) => {
    const role = roles.find((r) => r.id === roleId);
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              roleId: roleId || null,
              skins: role ? role.skins || [] : [],
            }
          : emp
      )
    );
  };

  const toggleEmployeeStatus = (id) =>
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id
          ? { ...emp, status: emp.status === 'active' ? 'blocked' : 'active' }
          : emp
      )
    );

  const addNetworkNode = (newNode) => {
    const nodeToSave = {
      id: `NET-${Date.now().toString().slice(-5)}`,
      ...newNode,
      balance: 0,
      status: 'Activo',
      activity: 'OffLine',
      createdAt: new Date().toISOString(),
    };
    setNetworks((prev) => [...prev, nodeToSave]);
  };

  // NUEVA FUNCIÓN: Agrega un registro inmutable al Libro Mayor
  const addTransaction = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  // 👈 CORRECCIÓN APLICADA: Ahora retorna el postBalance (newBalance)
  const transferFunds = (skinId, nodeId, amount, direction) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('El monto ingresado es inválido.');
      return null;
    }

    const node = networks.find((n) => n.id === nodeId);
    if (!node) return null;

    let newBalance = node.balance || 0;

    if (direction === 'DEPOSIT') {
      if (skinBalances[skinId] < numAmount) {
        alert(
          'Fondos insuficientes en la Matriz de la Skin para realizar el depósito.'
        );
        return null;
      }

      newBalance += numAmount;

      setSkinBalances((prev) => ({
        ...prev,
        [skinId]: prev[skinId] - numAmount,
      }));
      setNetworks((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, balance: newBalance } : n))
      );

      return newBalance; // Retorna el saldo congelado
    } else if (direction === 'WITHDRAW') {
      if (newBalance < numAmount) {
        alert('El usuario no tiene fondos suficientes para este retiro.');
        return null;
      }

      newBalance -= numAmount;

      setNetworks((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, balance: newBalance } : n))
      );
      setSkinBalances((prev) => ({
        ...prev,
        [skinId]: prev[skinId] + numAmount,
      }));

      return newBalance; // Retorna el saldo congelado
    }
    return null;
  };

  const editNetworkNode = (updatedNode) => {
    setNetworks((prev) =>
      prev.map((n) => (n.id === updatedNode.id ? updatedNode : n))
    );
  };

  return (
    <DataContext.Provider
      value={{
        // 👇 ESTADOS Y FUNCIONES NUEVAS EXPORTADAS
        contracts,
        sites,
        skins,
        addContract,
        addSite,
        addSkin,
        // 👆 FIN ESTADOS NUEVOS
        roles,
        employees,
        networks,
        skinBalances,
        transactions,
        addRole,
        editRole,
        deleteRole,
        cloneRole,
        toggleRoleStatus,
        addEmployee,
        assignRoleToEmployee,
        toggleEmployeeStatus,
        hasPermission,
        hasGlobalPermission, // 👈 FUNCIÓN GLOBAL EXPUESTA
        addNetworkNode,
        transferFunds,
        addTransaction,
        editNetworkNode,
        currentUser,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
