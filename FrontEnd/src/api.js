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

  api.toggleFavorito = async (nombre, tituloReceta) => {
    await delay();
    const res = await fetch(`/api/usuarios/${encodeURIComponent(nombre)}/favoritos/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tituloReceta })
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

  api.agregarIngrediente = async (titulo, data) => {
    await delay(50);
    const res = await fetch(`/api/recetas/${encodeURIComponent(titulo)}/ingredientes`, {
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

  api.detalleReceta = async (titulo) => {
    await delay();
    const res = await fetch(`/api/recetas/${encodeURIComponent(titulo)}`);
    return handleResponse(res);
  };

  api.buscarPorIngredientes = async ({ tengo = [], noQuiero = [] }) => {
    await delay();
    const params = new URLSearchParams();
    if (tengo.length > 0) params.append('tengo', tengo.join(','));
    if (noQuiero.length > 0) params.append('noQuiero', noQuiero.join(','));
    
    const res = await fetch(`/api/recetas/buscar?${params.toString()}`);
    return handleResponse(res);
  };

  // Exponer listados síncronos para los componentes React
  api.todosIngredientes = () => [...cachedIngredientes];
  api.categorias = () => [...cachedCategorias];

  window.api = api;
})();
