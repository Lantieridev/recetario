/* eslint-disable */
// B2B Portal — Brand & Retailer Dashboard (Fase 2B Premium UI)
const { useState, useEffect, useMemo } = React;

const B2BPortalScreen = ({ user, onNavigateToSearch }) => {
  const selectedApiKey = user?.apiKey || 'HELLMANNS-1234';
  const [ingrediente, setIngrediente] = useState('');
  const [peso, setPeso] = useState('10.0');
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Analytics State
  const [trends, setTrends] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Retail State
  const [retailTab, setRetailTab] = useState('conversion'); // 'conversion' | 'brands'
  const [retailStats, setRetailStats] = useState(null);
  const [retailStatsLoading, setRetailStatsLoading] = useState(false);
  const [retailBrands, setRetailBrands] = useState([]);
  const [retailBrandsLoading, setRetailBrandsLoading] = useState(false);

  const COMPANIES = {
    'HELLMANNS-1234': { nombre: 'Hellmann\'s', tier: 'BRAND', desc: 'Marca proveedora de alimentos. Acceso a subastas de ingredientes (Graph Bidding).' },
    'CARREFOUR-5678': { nombre: 'Carrefour', tier: 'RETAIL', desc: 'Comercio minorista / distribuidor de alimentos. Acceso a Liquidación de Stock (Stock Clearance).' },
    'NESTLE-9999': { nombre: 'Nestlé', tier: 'ENTERPRISE', desc: 'Socio global de alimentación. Acceso a Analytics Predictivo.' }
  };

  const TIER_DESCRIPTIONS = {
    'BRAND': 'Marca proveedora de alimentos. Acceso a subastas de ingredientes (Graph Bidding).',
    'RETAIL': 'Comercio minorista / distribuidor de alimentos. Acceso a Liquidación de Stock (Stock Clearance).',
    'ENTERPRISE': 'Socio global de alimentación. Acceso a Analytics Predictivo.'
  };

  const activeCompany = COMPANIES[selectedApiKey] || {
    nombre: user?.nombre || 'Socio B2B',
    tier: user?.tier || 'BRAND',
    desc: TIER_DESCRIPTIONS[user?.tier || 'BRAND'] || 'Acceso Corporativo seguro.'
  };

  const [allIngredients, setAllIngredients] = useState([]);
  const initializedRef = React.useRef(false);

  const suggestions = useMemo(() => {
    const q = ingrediente.trim().toLowerCase();
    if (!q) return [];
    if (allIngredients.includes(ingrediente.trim())) return [];
    return allIngredients.filter(i => i.toLowerCase().includes(q)).slice(0, 6);
  }, [ingrediente, allIngredients]);

  useEffect(() => {
    const ings = window.api.todosIngredientes();
    if (ings.length > 0) {
      setAllIngredients(ings);
    } else {
      fetch('/api/recetas/ingredientes')
        .then(r => r.json())
        .then(data => {
          if (data.ingredientes) {
            setAllIngredients(data.ingredientes);
          }
        })
        .catch(err => console.error('Error fetching ingredients in B2B portal:', err));
    }
  }, []);

  // Reset response when switching user/apiKey
  useEffect(() => {
    setResponseMsg(null);
    setErrorMsg(null);
    setTrends([]);
  }, [selectedApiKey]);

  // Set default ingredient once
  useEffect(() => {
    if (allIngredients.length > 0 && !initializedRef.current) {
      setIngrediente(allIngredients[0]);
      initializedRef.current = true;
    }
  }, [allIngredients]);

  // Fetch Retail Data
  useEffect(() => {
    if (activeCompany.tier === 'RETAIL') {
      if (retailTab === 'conversion') {
        setRetailStatsLoading(true);
        window.api.b2bRetailConversions({ apiKey: selectedApiKey })
          .then(res => {
            setRetailStats(res);
            setRetailStatsLoading(false);
          })
          .catch(err => {
            console.error('Error al cargar métricas de retail:', err);
            setRetailStatsLoading(false);
          });
      } else if (retailTab === 'brands') {
        setRetailBrandsLoading(true);
        window.api.b2bRetailBrands({ apiKey: selectedApiKey })
          .then(res => {
            setRetailBrands(res.brands || []);
            setRetailBrandsLoading(false);
          })
          .catch(err => {
            console.error('Error al cargar marcas de retail:', err);
            setRetailBrandsLoading(false);
          });
      }
    }
  }, [selectedApiKey, retailTab]);

  const handleToggleBrand = async (brandNombre) => {
    try {
      // Optimistic update
      setRetailBrands(prev => prev.map(b => b.nombre === brandNombre ? { ...b, distribuido: !b.distribuido } : b));
      await window.api.b2bRetailToggleBrand({ apiKey: selectedApiKey, brandNombre });
    } catch (err) {
      console.error('Error al toggle de marca:', err);
      // Revert
      window.api.b2bRetailBrands({ apiKey: selectedApiKey })
        .then(res => setRetailBrands(res.brands || []));
    }
  };

  const handleBidding = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg(null);
    setErrorMsg(null);

    const type = activeCompany.tier === 'RETAIL' ? 'clearance' : 'bidding';
    try {
      let res;
      if (type === 'clearance') {
        res = await window.api.b2bStockClearance({
          apiKey: selectedApiKey,
          ingrediente,
          pesoAñadido: parseFloat(peso)
        });
      } else {
        res = await window.api.b2bBidding({
          apiKey: selectedApiKey,
          ingrediente,
          pesoAñadido: parseFloat(peso)
        });
      }
      setResponseMsg(res);
    } catch (err) {
      setErrorMsg(err.error || 'Falla en la operación B2B');
    } finally {
      setLoading(false);
    }
  };

  const loadFlavorTrends = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await window.api.b2bFlavorTrends({ apiKey: selectedApiKey });
      setTrends(res.tendencias || []);
    } catch (err) {
      setAnalyticsError(err.error || 'Error al obtener tendencias');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  return (
    <div data-screen-label="B2B Portal" className="fade-in" style={{ background: 'var(--cream)', minHeight: '100vh', paddingBottom: 120 }}>
      {/* Header */}
      <section style={{ padding: '56px 0 36px', borderBottom: '1px solid var(--rule-soft)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ 
              background: 'var(--accent)', 
              color: 'var(--paper)', 
              fontSize: 10, 
              fontWeight: 600, 
              padding: '4px 10px', 
              borderRadius: 999,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Portal Corporativo B2B
            </span>
            <span className="text-faint" style={{ fontSize: 13 }}>Consola de Monetización Corporativa</span>
          </div>
          <h1 className="font-display" style={{
            fontSize: 'clamp(44px, 5.5vw, 68px)',
            margin: '0 0 16px',
            lineHeight: 1.0,
            letterSpacing: '-0.025em',
            textWrap: 'balance',
          }}>
            Optimización comercial <br/>y <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>pujas patrocinadas</em>
          </h1>
          <p className="text-muted" style={{ fontSize: 17, margin: 0, maxWidth: 620 }}>
            Panel exclusivo para partners comerciales. Configuración de pesos publicitarios de ingredientes
            y analíticas predictivas de tendencias en tiempo real.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container" style={{ padding: '32px 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 48, alignItems: 'start' }}>
          
          {/* Company Details Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
              <h3 className="font-mono" style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Partner Autenticado
              </h3>
              
              <div style={{
                padding: '24px 20px',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--accent)',
                background: 'var(--paper-2)',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {/* Decorative background initial */}
                <div style={{
                  position: 'absolute', right: -5, bottom: -15, fontSize: 90, fontWeight: 800,
                  color: 'color-mix(in oklab, var(--accent) 5%, transparent)', pointerEvents: 'none', userSelect: 'none',
                  lineHeight: 0.8
                }}>
                  {activeCompany.nombre[0]}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <strong style={{ fontSize: 20, color: 'var(--ink)', fontWeight: 600 }}>{activeCompany.nombre}</strong>
                  <span style={{ 
                    fontSize: 10, 
                    fontWeight: 700, 
                    color: 'var(--paper)', 
                    background: 'var(--accent)', 
                    padding: '2px 8px', 
                    borderRadius: 999,
                    letterSpacing: '0.05em'
                  }}>
                    {activeCompany.tier}
                  </span>
                </div>
                
                <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 20, lineHeight: 1.45, position: 'relative', zIndex: 1 }}>
                  {activeCompany.desc}
                </div>

              </div>
            </div>

            {activeCompany.tier === 'BRAND' && (
              <div style={{ background: 'rgba(184, 64, 31, 0.04)', border: '1px solid rgba(184, 64, 31, 0.15)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
                <h4 className="font-display" style={{ fontSize: 18, margin: '0 0 10px', color: 'var(--accent)' }}>¿Cómo verificar el impacto?</h4>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)', margin: '0 0 16px' }}>
                  1. Seleccioná un ingrediente a promocionar (ej. <strong>cebolla</strong>).<br/>
                  2. Subí una oferta de puja publicitaria (ej. peso <strong>30.0</strong>).<br/>
                  3. Hacé clic en "Enviar Oferta B2B".<br/>
                  4. Dirigite a la pestaña <strong>Buscar</strong> en el menú superior.<br/>
                  5. Ingresá el ingrediente en el buscador "Tengo" y realizá la búsqueda. Verás cómo las recetas patrocinadas suben en prioridad con la etiqueta <strong>★ Patrocinado</strong>.
                </p>
                <button 
                  onClick={onNavigateToSearch} 
                  className="btn btn-sm btn-ghost" 
                  style={{ width: '100%', border: '1px dashed var(--accent)', color: 'var(--accent)' }}
                >
                  Ir al Buscador Inteligente
                </button>
              </div>
            )}

            {activeCompany.tier === 'RETAIL' && (
              <div style={{ background: 'rgba(184, 64, 31, 0.04)', border: '1px solid rgba(184, 64, 31, 0.15)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
                <h4 className="font-display" style={{ fontSize: 18, margin: '0 0 10px', color: 'var(--accent)' }}>¿Cómo verificar las compras?</h4>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)', margin: '0 0 16px' }}>
                  1. Seleccioná qué marcas vende tu tienda en la pestaña <strong>Catálogo de Marcas</strong>.<br/>
                  2. Iniciá sesión como cocinero normal, abrí una receta y haz clic en <strong>🛒 Pedir ingredientes</strong>.<br/>
                  3. El sistema buscará sugerir productos de tus marcas distribuidas en lugar de genéricos.<br/>
                  4. Confirmá el checkout simulado y verás las analíticas de ventas actualizarse en esta consola.
                </p>
              </div>
            )}
          </div>

          {/* Form & Analytics Console */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, borderBottom: '1px solid var(--rule-soft)', paddingBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 999,
                background: 'var(--ink)', color: 'var(--paper)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 600
              }}>
                {activeCompany.nombre[0]}
              </div>
              <div>
                <h2 className="font-display" style={{ fontSize: 24, margin: 0 }}>Consola {activeCompany.nombre}</h2>
                <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>Credencial corporativa verificada y activa.</div>
              </div>
            </div>

            {/* If Brand, show Bidding Form */}
            {activeCompany.tier === 'BRAND' && (
              <form onSubmit={handleBidding} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                  <div className="field" style={{ position: 'relative' }}>
                    <label className="field-label">Ingrediente a Promocionar</label>
                    <input 
                      type="text"
                      className="input focus-ring"
                      style={{ width: '100%', height: 48 }}
                      placeholder="Busca o escribe un ingrediente..."
                      value={ingrediente} 
                      onChange={e => setIngrediente(e.target.value)}
                      required
                    />
                    {suggestions.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0, right: 0,
                        background: 'var(--paper-2)',
                        border: '1px solid var(--rule)',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow-md)',
                        zIndex: 10,
                        padding: 6,
                        display: 'flex', flexDirection: 'column',
                      }}>
                        {suggestions.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setIngrediente(s)}
                            style={{
                              textAlign: 'left',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 14,
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'background-color .12s',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--ink)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rule-soft)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = ''}
                          >
                            <span>{s}</span>
                            <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>↵ Seleccionar</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="field">
                    <label className="field-label">Peso de Pujas (Bid)</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      className="input" 
                      style={{ height: 48 }}
                      value={peso} 
                      onChange={e => setPeso(e.target.value)} 
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    loading={loading}
                    style={{ flex: 1, height: 48 }}
                  >
                    Enviar Oferta Bidding B2B
                  </Button>
                </div>

                {/* Response / Errors */}
                {responseMsg && (
                  <div className="fade-in" style={{
                    padding: 20,
                    background: 'var(--cream)',
                    border: '1px solid var(--rule)',
                    borderRadius: 'var(--radius)',
                    marginTop: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cat-veg)', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                      <Icon name="check" size={16} stroke={2.4}/> Operación Exitosa
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 12px' }}>
                      {responseMsg.message}
                    </p>
                    <div style={{ background: 'var(--paper)', border: '1px solid var(--rule-soft)', borderRadius: 4, padding: '10px 14px', fontSize: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '2px 0' }}>
                        <span>Partner:</span> <strong>{responseMsg.cliente}</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '2px 0' }}>
                        <span>Ingrediente:</span> <strong>{responseMsg.ingrediente}</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '2px 0' }}>
                        <span>Nuevo peso en grafo:</span> <strong>{responseMsg.nuevoPeso}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="fade-in" style={{
                    padding: 16,
                    background: 'rgba(184,64,31,.08)',
                    border: '1px solid rgba(184,64,31,.2)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--accent)',
                    fontSize: 14,
                    marginTop: 12
                  }}>
                    🚨 {errorMsg}
                  </div>
                )}
              </form>
            )}

            {/* If Retail, show Conversions & Brand Catalog */}
            {activeCompany.tier === 'RETAIL' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Tab switcher */}
                <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--cream)', border: '1px solid var(--rule)', borderRadius: 999, width: 'fit-content' }}>
                  <button
                    type="button"
                    style={{
                      borderRadius: 999, height: 32, fontSize: 13, fontWeight: 500, padding: '0 16px',
                      background: retailTab === 'conversion' ? 'var(--ink)' : 'transparent',
                      color: retailTab === 'conversion' ? 'var(--paper)' : 'var(--ink-2)',
                      transition: 'all .18s', border: 'none', cursor: 'pointer'
                    }}
                    onClick={() => setRetailTab('conversion')}
                  >
                    Métricas de Conversión
                  </button>
                  <button
                    type="button"
                    style={{
                      borderRadius: 999, height: 32, fontSize: 13, fontWeight: 500, padding: '0 16px',
                      background: retailTab === 'brands' ? 'var(--ink)' : 'transparent',
                      color: retailTab === 'brands' ? 'var(--paper)' : 'var(--ink-2)',
                      transition: 'all .18s', border: 'none', cursor: 'pointer'
                    }}
                    onClick={() => setRetailTab('brands')}
                  >
                    Catálogo de Marcas
                  </button>
                </div>

                {retailTab === 'conversion' ? (
                  retailStatsLoading ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-3)', fontStyle: 'italic' }}>
                      Cargando métricas de conversión...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                      {/* Grid KPIs */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ background: 'var(--cream)', border: '1px solid var(--rule)', borderRadius: 'var(--radius)', padding: 18 }}>
                          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Ventas Totales</div>
                          <div className="font-display" style={{ fontSize: 26, color: 'var(--cat-veg)' }}>${retailStats?.totalIngresos || 0}</div>
                        </div>
                        <div style={{ background: 'var(--cream)', border: '1px solid var(--rule)', borderRadius: 'var(--radius)', padding: 18 }}>
                          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Ticket Promedio</div>
                          <div className="font-display" style={{ fontSize: 26, color: 'var(--ink)' }}>${retailStats?.ticketPromedio || 0}</div>
                        </div>
                        <div style={{ background: 'var(--cream)', border: '1px solid var(--rule)', borderRadius: 'var(--radius)', padding: 18 }}>
                          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Pedidos Completados</div>
                          <div className="font-display" style={{ fontSize: 26, color: 'var(--ink)' }}>{retailStats?.totalCompras || 0}</div>
                        </div>
                        <div style={{ background: 'var(--cream)', border: '1px solid var(--rule)', borderRadius: 'var(--radius)', padding: 18 }}>
                          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Tasa de Conversión</div>
                          <div className="font-display" style={{ fontSize: 26, color: 'var(--accent)' }}>{retailStats?.tasaConversion || 0}%</div>
                        </div>
                      </div>

                      {/* Detail section */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                        {/* Pedidos */}
                        <div>
                          <h4 className="font-display" style={{ fontSize: 16, margin: '0 0 12px' }}>Historial de Pedidos</h4>
                          {!retailStats || retailStats.compras.length === 0 ? (
                            <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink-3)' }}>Aún no se registran compras.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                              {retailStats.compras.map(c => (
                                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--paper-2)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--rule-soft)' }}>
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.fecha}</div>
                                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{c.itemsCount} productos</div>
                                  </div>
                                  <div style={{ fontWeight: 600, fontSize: 14 }}>${c.monto}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Marcas más vendidas */}
                        <div>
                          <h4 className="font-display" style={{ fontSize: 16, margin: '0 0 12px' }}>Afinidad de Marcas</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {!retailStats || retailStats.marcasRanking.length === 0 ? (
                              <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink-3)' }}>Sin datos de marcas asociadas.</div>
                            ) : (
                              retailStats.marcasRanking.map(m => (
                                <div key={m.nombre} style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--paper-2)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--rule-soft)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <strong style={{ fontWeight: 600 }}>{m.nombre}</strong>
                                    <span style={{ color: 'var(--ink-3)' }}>{m.ventas} ventas</span>
                                  </div>
                                  <div style={{ width: '100%', height: 4, background: 'var(--rule)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(m.ventas / (retailStats.totalCompras || 1)) * 100}%`, background: 'var(--accent)' }} />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  retailBrandsLoading ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-3)', fontStyle: 'italic' }}>
                      Cargando catálogo de marcas...
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-display" style={{ fontSize: 16, margin: '0 0 8px' }}>Marcas Distribuidas</h4>
                      <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 16px' }}>
                        Seleccioná qué marcas comerciales vende tu tienda. Al activarlas, sugeriremos sus productos patrocinados en las canastas de los usuarios.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {retailBrands.map(brand => (
                          <label key={brand.nombre} style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                            background: 'var(--paper-2)', border: '1px solid var(--rule-soft)',
                            borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background-color .15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--rule-soft)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--paper-2)'}
                          >
                            <input
                              type="checkbox"
                              checked={!!brand.distribuido}
                              onChange={() => handleToggleBrand(brand.nombre)}
                              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent)' }}
                            />
                            <div>
                              <strong style={{ fontSize: 14, color: 'var(--ink)' }}>{brand.nombre}</strong>
                              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{brand.dominio}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* If Enterprise, show Predictive Analytics Console */}
            {activeCompany.tier === 'ENTERPRISE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
                  Como suscriptor Enterprise ({activeCompany.nombre}), tenés acceso al servicio <strong>Predictive Flavor Analytics (DaaS)</strong>. 
                  Esta consola consulta en tiempo real relaciones de co-ocurrencia en el grafo (ingredientes comunes que comparten recetas) 
                  para predecir combinaciones ideales de sabor para nuevos productos.
                </p>

                <Button 
                  variant="primary" 
                  onClick={loadFlavorTrends} 
                  loading={analyticsLoading}
                  style={{ height: 48 }}
                >
                  Consultar Tendencias de Co-ocurrencia
                </Button>

                {analyticsError && (
                  <div style={{
                    padding: 16,
                    background: 'rgba(184, 64, 31, 0.08)',
                    border: '1px solid rgba(184, 64, 31, 0.2)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--accent)',
                    fontSize: 14
                  }}>
                    🚨 {analyticsError}
                  </div>
                )}

                {trends.length > 0 && (
                  <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h4 className="font-display" style={{ fontSize: 18, margin: 0 }}>Pares de Sabor con Alta Co-ocurrencia</h4>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid var(--rule)',
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      background: 'var(--cream)'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        padding: '10px 16px',
                        background: 'var(--paper-2)',
                        borderBottom: '1px solid var(--rule)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <span>Par de Combinación</span>
                        <span style={{ textAlign: 'right' }}>Afinidad (Recetas comunes)</span>
                      </div>

                      {trends.map((t, idx) => {
                        const maxAfinidad = trends[0]?.scoreAfinidad || 1;
                        const ratio = t.scoreAfinidad / maxAfinidad;
                        return (
                          <div 
                            key={`${t.ingrediente1}-${t.ingrediente2}`} 
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 1fr',
                              padding: '14px 16px',
                              borderBottom: idx === trends.length - 1 ? 'none' : '1px solid var(--rule-soft)',
                              alignItems: 'center',
                              background: 'transparent'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                                {t.ingrediente1} + {t.ingrediente2}
                              </div>
                              <div style={{ width: '80%', height: 4, background: 'var(--rule)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${ratio * 100}%`, background: 'var(--accent)' }} />
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--ink-2)', fontSize: 15 }}>
                              {t.scoreAfinidad}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { B2BPortalScreen });
