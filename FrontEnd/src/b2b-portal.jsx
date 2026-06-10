/* eslint-disable */
// B2B Portal — Brand & Retailer Dashboard (Fase 2B Premium UI)
const { useState, useEffect } = React;

const B2BPortalScreen = ({ onNavigateToSearch }) => {
  const LS_B2B_KEY = 'recetario:b2b:apiKey';
  const [selectedApiKey, setSelectedApiKey] = useState(() => {
    try {
      return localStorage.getItem(LS_B2B_KEY) || 'HELLMANNS-1234';
    } catch (e) {
      return 'HELLMANNS-1234';
    }
  });
  const [ingrediente, setIngrediente] = useState('');
  const [peso, setPeso] = useState('10.0');
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Analytics State
  const [trends, setTrends] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const COMPANIES = {
    'HELLMANNS-1234': { nombre: 'Hellmann\'s', tier: 'BRAND', desc: 'Marca de consumo masivo. Acceso a subastas de ingredientes (Graph Bidding).' },
    'CARREFOUR-5678': { nombre: 'Carrefour', tier: 'RETAIL', desc: 'Cadena de supermercados. Acceso a Liquidación de Stock (Stock Clearance).' },
    'NESTLE-9999': { nombre: 'Nestlé', tier: 'ENTERPRISE', desc: 'Socio global de alimentación. Acceso a Analytics Predictivo DaaS.' }
  };

  const activeCompany = COMPANIES[selectedApiKey];
  const allIngredients = window.api.todosIngredientes();

  // Reset response when switching company
  useEffect(() => {
    try {
      localStorage.setItem(LS_B2B_KEY, selectedApiKey);
    } catch (e) {}
    setResponseMsg(null);
    setErrorMsg(null);
    setTrends([]);
  }, [selectedApiKey]);

  // Set default ingredient
  useEffect(() => {
    if (allIngredients.length > 0 && !ingrediente) {
      setIngrediente(allIngredients[0]);
    }
  }, [allIngredients]);

  const handleBidding = async (e, type = 'bidding') => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg(null);
    setErrorMsg(null);

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
            <span className="text-faint" style={{ fontSize: 13 }}>Graph Monetization Console</span>
          </div>
          <h1 className="font-display" style={{
            fontSize: 'clamp(44px, 5.5vw, 68px)',
            margin: '0 0 16px',
            lineHeight: 1.0,
            letterSpacing: '-0.025em',
            textWrap: 'balance',
          }}>
            Optimización algorítmica <br/>y <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>subastas del grafo</em>
          </h1>
          <p className="text-muted" style={{ fontSize: 17, margin: 0, maxWidth: 620 }}>
            Simulá el rol de un partner comercial de Recetario. Configurá pesos publicitarios y
            consultá analíticas avanzadas directamente de Neo4j.
          </p>
        </div>
      </section>

      {/* Select Company */}
      <section className="container" style={{ padding: '32px 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 48, alignItems: 'start' }}>
          
          {/* Company Details Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
              <h3 className="font-mono" style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Seleccionar Partner
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.keys(COMPANIES).map(key => {
                  const active = selectedApiKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedApiKey(key)}
                      style={{
                        padding: 16,
                        borderRadius: 'var(--radius)',
                        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--rule)'}`,
                        background: active ? 'var(--paper-2)' : 'transparent',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ fontSize: 16, color: 'var(--ink)' }}>{COMPANIES[key].nombre}</strong>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', background: 'var(--cream)', padding: '2px 6px', borderRadius: 4 }}>
                          {COMPANIES[key].tier}
                        </span>
                      </div>
                      <div className="text-muted" style={{ fontSize: 12, lineHeight: 1.4 }}>
                        API Key: <code className="font-mono" style={{ background: 'var(--cream)', padding: '1px 4px', borderRadius: 2 }}>{key}</code>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick explanation of effect */}
            <div style={{ background: 'rgba(184, 64, 31, 0.04)', border: '1px solid rgba(184, 64, 31, 0.15)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
              <h4 className="font-display" style={{ fontSize: 18, margin: '0 0 10px', color: 'var(--accent)' }}>¿Cómo verificar el impacto?</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)', margin: '0 0 16px' }}>
                1. Elegí un ingrediente como <strong>Mayonesa</strong> o <strong>Pollo</strong>.<br/>
                2. Sponsorealo agregando un peso (ej. <strong>20.0</strong>).<br/>
                3. Hacé clic en "Enviar Oferta B2B".<br/>
                4. Entrá al Buscador Inteligente, ingresá el ingrediente en "Tengo" y realizá la búsqueda. Verás cómo las recetas que lo contienen suben en prioridad y llevan la etiqueta <strong>★ Patrocinado</strong>.
              </p>
              <button 
                onClick={onNavigateToSearch} 
                className="btn btn-sm btn-ghost" 
                style={{ width: '100%', border: '1px dashed var(--accent)', color: 'var(--accent)' }}
              >
                Ir al Buscador Inteligente
              </button>
            </div>
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
                <h2 className="font-display" style={{ fontSize: 24, margin: 0 }}>{activeCompany.nombre}</h2>
                <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{activeCompany.desc}</div>
              </div>
            </div>

            {/* If Brand or Retailer, show Bidding / Clearance Form */}
            {(activeCompany.tier === 'BRAND' || activeCompany.tier === 'RETAIL') && (
              <form onSubmit={handleBidding} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                  <div className="field">
                    <label className="field-label">Seleccionar Ingrediente a Promocionar</label>
                    <select 
                      className="select" 
                      style={{ width: '100%', height: 48 }}
                      value={ingrediente} 
                      onChange={e => setIngrediente(e.target.value)}
                    >
                      {allIngredients.map(ing => (
                        <option key={ing} value={ing}>{ing}</option>
                      ))}
                    </select>
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
                    Enviar Oferta B2B ({activeCompany.tier === 'BRAND' ? 'Bidding' : 'Stock Clearance'})
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
                      <Icon name="check" size={16} stroke={2.4}/> Operación Exitosa en Neo4j
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

            {/* If Enterprise, show Predictive Analytics Console */}
            {activeCompany.tier === 'ENTERPRISE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
                  Como suscriptor Enterprise (Nestlé), tenés acceso al servicio <strong>Predictive Flavor Analytics (DaaS)</strong>. 
                  Esta consola consulta en tiempo real relaciones de co-ocurrencia en el grafo (ingredientes comunes que comparten recetas) 
                  para predecir combinaciones ideales de sabor para nuevos productos.
                </p>

                <Button 
                  variant="primary" 
                  onClick={loadFlavorTrends} 
                  loading={analyticsLoading}
                  style={{ height: 48 }}
                >
                  Consultar Tendencias de Co-ocurrencia (Neo4j DaaS)
                </Button>

                {analyticsError && (
                  <div style={{
                    padding: 16,
                    background: 'rgba(184,64,31,.08)',
                    border: '1px solid rgba(184,64,31,.2)',
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
                      <span className="text-faint" style={{ fontSize: 11 }}>Neo4j Graph Inference</span>
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
};

Object.assign(window, { B2BPortalScreen });
