/**
 * Cliente API conectado al backend Express/Neo4j.
 */
(() => {
  const delay = (ms = 150) => new Promise(r => setTimeout(r, ms));

  // Caché de categorías e ingredientes para listados síncronos del frontend
  let cachedCategorias = [];
  let cachedIngredientes = [];

  const updateCache = async () => {
    try {
      const [catRes, ingRes] = await Promise.all([
        fetch('/api/recetas/categorias').then(r => r.json()),
        fetch('/api/recetas/ingredientes').then(r => r.json())
      ]);
      if (catRes.categorias) cachedCategorias = catRes.categorias;
      if (ingRes.ingredientes) cachedIngredientes = ingRes.ingredientes;
    } catch (err) {
      console.error('Error al cargar caché de categorías e ingredientes:', err);
    }
  };

  // Cargar caché inicialmente al levantar la app
  updateCache();

  const handleResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;
    return data;
  };

  const api = {};

  api.crearUsuario = async ({ nombre, mail, contrasena }) => {
    await delay();
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, mail, contrasena })
    });
    return handleResponse(res);
  };

  api.login = async ({ nombre, contrasena }) => {
    await delay();
    const res = await fetch('/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, contrasena })
    });
    return handleResponse(res);
  };

  api.obtenerUsuario = async (nombre) => {
    await delay();
    const res = await fetch(`/api/usuarios/${encodeURIComponent(nombre)}`);
    return handleResponse(res);
  };

  api.toggleFavorito = async (nombre, recetaId) => {
    await delay();
    const res = await fetch(`/api/usuarios/${encodeURIComponent(nombre)}/favoritos/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recetaId })
    });
    return handleResponse(res);
  };

  api.recomendaciones = async (nombre) => {
    await delay();
    const res = await fetch(`/api/usuarios/${encodeURIComponent(nombre)}/recomendaciones`);
    return handleResponse(res);
  };

  api.crearReceta = async (data) => {
    await delay();
    const res = await fetch('/api/recetas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await handleResponse(res);
    updateCache(); // refrescar categorías
    return result;
  };

  api.agregarIngrediente = async (id, data) => {
    await delay(50);
    const res = await fetch(`/api/recetas/${encodeURIComponent(id)}/ingredientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await handleResponse(res);
    updateCache(); // refrescar ingredientes
    return result;
  };

  api.listarRecetas = async ({ categoria, dificultad, tiempo } = {}) => {
    await delay();
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (dificultad) params.append('dificultad', dificultad);
    if (tiempo) params.append('tiempo', tiempo);
    
    const qs = params.toString();
    const url = `/api/recetas${qs ? '?' + qs : ''}`;
    const res = await fetch(url);
    return handleResponse(res);
  };

  api.detalleReceta = async (id) => {
    await delay();
    const res = await fetch(`/api/recetas/${encodeURIComponent(id)}`);
    return handleResponse(res);
  };

  api.buscarPorIngredientes = async ({ tengo = [], noQuiero = [], categoria, dificultad, tiempo }) => {
    await delay();
    const params = new URLSearchParams();
    if (tengo.length > 0) params.append('tengo', tengo.join(','));
    if (noQuiero.length > 0) params.append('noQuiero', noQuiero.join(','));
    if (categoria) params.append('categoria', categoria);
    if (dificultad) params.append('dificultad', dificultad);
    if (tiempo) params.append('tiempo', tiempo);
    
    const res = await fetch(`/api/recetas/buscar?${params.toString()}`);
    return handleResponse(res);
  };

  api.recetaDelDia = async (fecha) => {
    await delay();
    const url = fecha ? `/api/recetas/del-dia?fecha=${encodeURIComponent(fecha)}` : '/api/recetas/del-dia';
    const res = await fetch(url);
    return handleResponse(res);
  };

  api.obtenerUsuarioStatus = async (nombre) => {
    await delay();
    const res = await fetch(`/api/usuarios/${encodeURIComponent(nombre)}/status`);
    return handleResponse(res);
  };

  api.registrarHistorial = async (nombre, recetaId) => {
    await delay();
    const res = await fetch(`/api/usuarios/${encodeURIComponent(nombre)}/historial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recetaId })
    });
    return handleResponse(res);
  };

  api.b2bBidding = async ({ apiKey, ingrediente, pesoAñadido }) => {
    await delay();
    const res = await fetch('/api/b2b/bidding', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-USER-EMAIL': apiKey,
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({ ingrediente, pesoAñadido: parseFloat(pesoAñadido) })
    });
    return handleResponse(res);
  };

  api.b2bStockClearance = async ({ apiKey, ingrediente, pesoAñadido }) => {
    await delay();
    const res = await fetch('/api/b2b/stock-clearance', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-USER-EMAIL': apiKey,
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({ ingrediente, pesoAñadido: parseFloat(pesoAñadido) })
    });
    return handleResponse(res);
  };

  api.b2bFlavorTrends = async ({ apiKey }) => {
    await delay();
    const res = await fetch('/api/b2b/analytics/flavor-trends', {
      headers: { 
        'X-USER-EMAIL': apiKey,
        'X-API-KEY': apiKey
      }
    });
    return handleResponse(res);
  };

  api.validarApiKey = async (apiKey) => {
    await delay();
    const res = await fetch('/api/b2b/validate', {
      headers: { 
        'X-USER-EMAIL': apiKey,
        'X-API-KEY': apiKey
      }
    });
    return handleResponse(res);
  };

  // ─────────────────────────────────────────────────────────────
  //  ADMIN ENDPOINTS
  // ─────────────────────────────────────────────────────────────
  const getAdminHeaders = (adminName = 'Admin') => ({
    'Content-Type': 'application/json',
    'X-USER-NAME': adminName
  });

  api.adminGetStats = async (adminName) => {
    await delay();
    const res = await fetch('/api/admin/stats', {
      headers: getAdminHeaders(adminName)
    });
    return handleResponse(res);
  };

  api.adminGetPartners = async (adminName) => {
    await delay();
    const res = await fetch('/api/admin/partners', {
      headers: getAdminHeaders(adminName)
    });
    return handleResponse(res);
  };

  api.adminCreatePartner = async (adminName, { nombre, tier, dominio }) => {
    await delay();
    const res = await fetch('/api/admin/partners', {
      method: 'POST',
      headers: getAdminHeaders(adminName),
      body: JSON.stringify({ nombre, tier, dominio })
    });
    return handleResponse(res);
  };

  api.adminConfirmUser = async (adminName, usuarioNombre) => {
    await delay();
    const res = await fetch('/api/admin/users/confirm', {
      method: 'POST',
      headers: getAdminHeaders(adminName),
      body: JSON.stringify({ usuarioNombre })
    });
    return handleResponse(res);
  };

  api.adminDeletePartner = async (adminName, nombre) => {
    await delay();
    const res = await fetch(`/api/admin/partners/${encodeURIComponent(nombre)}`, {
      method: 'DELETE',
      headers: getAdminHeaders(adminName)
    });
    return handleResponse(res);
  };

  api.adminGetUsers = async (adminName) => {
    await delay();
    const res = await fetch('/api/admin/users', {
      headers: getAdminHeaders(adminName)
    });
    return handleResponse(res);
  };

  api.adminAssociateUser = async (adminName, { usuarioNombre, partnerNombre }) => {
    await delay();
    const res = await fetch('/api/admin/users/associate', {
      method: 'POST',
      headers: getAdminHeaders(adminName),
      body: JSON.stringify({ usuarioNombre, partnerNombre })
    });
    return handleResponse(res);
  };

  api.adminDissociateUser = async (adminName, usuarioNombre) => {
    await delay();
    const res = await fetch('/api/admin/users/dissociate', {
      method: 'POST',
      headers: getAdminHeaders(adminName),
      body: JSON.stringify({ usuarioNombre })
    });
    return handleResponse(res);
  };

  api.obtenerEstadisticasPublicas = async () => {
    await delay();
    const res = await fetch('/api/recetas/estadisticas-publicas');
    return handleResponse(res);
  };

  // Exponer listados síncronos para los componentes React
  api.todosIngredientes = () => [...cachedIngredientes];
  api.categorias = () => [...cachedCategorias];

  window.api = api;
})();
