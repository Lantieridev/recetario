/* eslint-disable */
// Recipe detail — Fase 2B Redesign

const CookMode = ({ steps, onClose, onFinish }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [timerOpen, setTimerOpen] = useState(false);
  
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setActiveIdx(i => Math.min(steps.length - 1, i + 1));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIdx(i => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [steps.length, onClose]);

  const step = steps[activeIdx];

  // Extraer el tiempo del texto (ej. [⏱ 30min])
  const timerMatch = step.match(/\[⏱\s*(.+?)\]/);
  const durationStr = timerMatch ? timerMatch[1] : null;
  const cleanStep = step.replace(/\[⏱\s*(.+?)\]/, '').trim().replace(/^\d+\.\s*/, '');

  const isLast = activeIdx === steps.length - 1;

  let totalSeconds = 0;
  if (durationStr) {
    const hs = durationStr.match(/(\d+)h/) ? parseInt(durationStr.match(/(\d+)h/)[1]) : 0;
    const min = durationStr.match(/(\d+)min/) ? parseInt(durationStr.match(/(\d+)min/)[1]) : 0;
    totalSeconds = hs * 3600 + min * 60;
  }

  const handleNext = () => {
    if (isLast) {
      onClose();
      onFinish();
    } else {
      setActiveIdx(activeIdx + 1);
    }
  };

  const handlePrev = () => {
    if (activeIdx > 0) setActiveIdx(activeIdx - 1);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Immersive Tap Zones */}
      <div 
        style={{ position: 'absolute', top: 80, left: 0, bottom: 100, width: '30%', zIndex: 10, cursor: 'w-resize' }} 
        onClick={handlePrev}
      />
      <div 
        style={{ position: 'absolute', top: 80, right: 0, bottom: 100, width: '70%', zIndex: 10, cursor: 'e-resize' }} 
        onClick={handleNext}
      />

      {/* Top bar */}
      <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 20 }}>
        <div className="font-mono" style={{ fontSize: 24, color: 'var(--ink-2)' }}>
          {activeIdx + 1} / {steps.length}
        </div>
        <div style={{ flex: 1, margin: '0 32px', height: 4, background: 'var(--rule)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--ink)', width: `${((activeIdx + 1) / steps.length) * 100}%`, transition: 'width .3s' }} />
        </div>
        <Button variant="ghost" onClick={onClose} icon="close">Salir</Button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8vw', overflowY: 'auto', position: 'relative', zIndex: 5 }}>
        <div className="font-display" style={{ 
          fontSize: 'clamp(36px, 6vw, 72px)', 
          lineHeight: 1.1, 
          maxWidth: '20ch', 
          textAlign: 'center', 
          color: 'var(--ink)',
          textWrap: 'balance'
        }}>
          {cleanStep}
        </div>
      </div>

      {/* Timer / Action floating section */}
      <div style={{ position: 'relative', zIndex: 20, display: 'flex', justifyContent: 'center', padding: '24px', minHeight: 100 }}>
        {totalSeconds > 0 && !timerOpen && (
          <Button variant="primary" icon="clock" onClick={() => setTimerOpen(true)} style={{ fontSize: 20, height: 64, padding: '0 32px', borderRadius: 32, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>
            Iniciar Timer ({durationStr})
          </Button>
        )}
        {isLast && (
          <Button variant="primary" style={{ background: 'var(--cat-veg)', borderColor: 'var(--cat-veg)', fontSize: 20, height: 64, padding: '0 32px', borderRadius: 32 }} iconRight="check" onClick={() => { onClose(); onFinish(); }}>
            Terminar receta
          </Button>
        )}
      </div>

      {/* Sutiles indicadores laterales */}
      <div style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', opacity: 0.15, pointerEvents: 'none' }}>
        <Icon name="arrow" size={32} style={{ transform: 'rotate(180deg)' }} />
      </div>
      <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', opacity: 0.15, pointerEvents: 'none' }}>
        <Icon name="arrow" size={32} />
      </div>

      {timerOpen && <TimerModal duration={totalSeconds} onCancel={() => setTimerOpen(false)} onComplete={() => setTimerOpen(false)} inline={true} />}
    </div>
  );
};

const DetailScreen = ({ titulo, user, initialData, onBack, onOpenRecipe }) => {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [isFav, setIsFav] = useState(false);
  const [related, setRelated] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState(new Set());
  const [checkedIngs, setCheckedIngs] = useState(new Set());
  const [servings, setServings] = useState(initialData ? (initialData.porciones || 4) : 4);
  const [cookMode, setCookMode] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let alive = true;
    if (!data) setLoading(true);
    setCheckedSteps(new Set());
    setCheckedIngs(new Set());
    window.api.detalleReceta(titulo).then(async (res) => {
      if (!alive) return;
      setData(res.receta);
      setServings(res.receta.porciones || 4);
      setLoading(false);
      const list = await window.api.listarRecetas({ categoria: res.receta.categoria });
      if (alive) setRelated(list.recetas.filter(r => r.titulo !== titulo).slice(0, 6));
    });
    window.api.obtenerUsuario(user.nombre).then(r => {
      if (alive) setIsFav(new Set(r.usuario.recetasFavoritas).has(titulo));
    });
    return () => { alive = false; };
  }, [titulo, user]);

  const toggleFav = async () => {
    const res = await window.api.toggleFavorito(user.nombre, titulo);
    setIsFav(res.added);
    toast(res.added ? 'Guardada en tu colección' : 'Quitada de favoritos', { icon: res.added ? 'bookmarkFilled' : 'check' });
  };

  const handleFinishCookMode = async () => {
    try {
      await window.api.registrarHistorial(user.nombre, titulo);
      toast('¡Receta terminada! Guardada en tu historial.', { icon: 'sparkle' });
    } catch (e) {
      toast('Error al registrar historial.');
    }
  };

  if (loading || !data) {
    return (
      <div className="container" style={{ padding: '40px 32px' }}>
        <div className="skeleton" style={{ height: 480, marginBottom: 32 }}/>
        <div className="skeleton" style={{ height: 200 }}/>
      </div>
    );
  }

  const steps = (() => {
    const byNewline = data.pasos.split('\n').map(s => s.trim()).filter(Boolean);
    // If there's only one "line" the steps were stored as "1. X 2. Y 3. Z …"
    if (byNewline.length <= 1) {
      // Split on patterns like "1. " / "2. " etc. and strip the leading number
      return data.pasos
        .split(/\d+\.\s+/)
        .map(s => s.trim())
        .filter(Boolean);
    }
    // Already multi-line — strip any leading "N. " prefix just in case
    return byNewline.map(s => s.replace(/^\d+\.\s*/, ''));
  })();
  
  // Simulando que el último 20% de ingredientes son opcionales para la demo
  const ingPrincipales = data.ingredientes.filter((_, i) => i < data.ingredientes.length * 0.8);
  const ingOpcionales = data.ingredientes.filter((_, i) => i >= data.ingredientes.length * 0.8);

  return (
    <div data-screen-label="Recipe Detail" className="fade-in">
      {cookMode && <CookMode steps={steps} onClose={() => setCookMode(false)} onFinish={handleFinishCookMode} />}

      {/* Back bar */}
      <div className="container" style={{ padding: '20px 32px 0' }}>
        <button onClick={onBack} className="btn btn-ghost btn-sm focus-ring">
          <Icon name="back" size={14} /> Volver
        </button>
      </div>

      {/* Hero */}
      <section className="container" style={{ padding: '32px 32px 56px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: 56,
          alignItems: 'start',
        }} className="detail-hero">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <CategoryBadge name={data.categoria} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
                <span style={{ fontSize: 13 }}>por {data.creador}</span>
                {data.creador && <span style={{ color: 'var(--accent)', background: 'var(--accent-soft)', padding: 2, borderRadius: '50%', display: 'flex' }}><Icon name="check" size={10} stroke={3} /></span>}
              </div>
            </div>
            <h1 className="font-display" style={{
              fontSize: 'clamp(46px, 6vw, 78px)',
              margin: '0 0 20px',
              lineHeight: 0.98,
              letterSpacing: '-0.025em',
              textWrap: 'balance',
            }}>
              {data.titulo}
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.5, color: 'var(--ink-2)', margin: '0 0 32px', maxWidth: 540 }}>
              {data.descripcion}
            </p>

            <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
              <Metric icon="clock" label="Tiempo" value={data.tiempo} />
              <Metric icon="flame" label="Dificultad" value={data.dificultad} />
              <Metric icon="pot" label="Ingredientes" value={String(data.ingredientes.length)} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant={isFav ? 'accent' : 'primary'} icon={isFav ? 'bookmarkFilled' : 'bookmark'} onClick={toggleFav}>
                {isFav ? 'Guardada' : 'Guardar receta'}
              </Button>
            </div>
          </div>

          <div style={{ position: 'sticky', top: 96 }}>
            <CleanRecipeImage titulo={data.titulo} categoria={data.categoria} imagenUrl={data.imagen} height={520} />
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container" style={{ padding: '0 32px 96px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 360px) minmax(0, 1fr)',
          gap: 64,
          alignItems: 'start',
        }} className="detail-body">

          {/* Ingredients (sticky) */}
          <aside style={{ position: 'sticky', top: 96 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 className="font-display" style={{ fontSize: 30, margin: 0, letterSpacing: '-0.02em' }}>Ingredientes</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="btn btn-icon btn-ghost btn-sm"
                  aria-label="Menos porciones"
                >−</button>
                <span style={{ fontSize: 14, fontWeight: 500, minWidth: 64, textAlign: 'center' }}>
                  {servings} porc.
                </span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="btn btn-icon btn-ghost btn-sm"
                  aria-label="Más porciones"
                >+</button>
              </div>
            </div>

            <div className="eyebrow" style={{ fontSize: 11, marginBottom: 12 }}>Principales</div>
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column',
              borderTop: '1px solid var(--rule)',
            }}>
              {ingPrincipales.map((ing, i) => {
                const checked = checkedIngs.has(`p-${i}`);
                return (
                  <li key={`p-${i}`} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 0', borderBottom: '1px solid var(--rule-soft)', cursor: 'pointer',
                  }} onClick={() => setCheckedIngs(prev => { const n = new Set(prev); n.has(`p-${i}`) ? n.delete(`p-${i}`) : n.add(`p-${i}`); return n; })}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--ink-3)'}`,
                        background: checked ? 'var(--accent)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--paper)', flexShrink: 0, transition: 'all .15s',
                      }}>
                        {checked && <Icon name="check" size={11} stroke={2.4} />}
                      </span>
                      <span style={{ fontSize: 15, textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--ink-3)' : 'var(--ink)' }}>
                        {ing.nombre}
                        {ing.recomendado && (
                          <span style={{
                            marginLeft: 8,
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--accent)',
                            background: 'rgba(184, 64, 31, 0.08)',
                            padding: '2px 8px',
                            borderRadius: 4,
                            border: '1px solid rgba(184, 64, 31, 0.15)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3
                          }}>
                            ★ Recomendado: {ing.recomendado}
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="font-mono" style={{ fontSize: 12, color: 'var(--ink-3)', textDecoration: checked ? 'line-through' : 'none' }}>
                      {scaleQty(ing.cantidad, servings, data.porciones || 4)}
                    </span>
                  </li>
                );
              })}
            </ul>
 
            {ingOpcionales.length > 0 && (
              <>
                <div className="eyebrow" style={{ fontSize: 11, marginTop: 32, marginBottom: 12 }}>Opcionales y aderezos</div>
                <ul style={{
                  listStyle: 'none', padding: 0, margin: 0,
                  display: 'flex', flexDirection: 'column',
                  borderTop: '1px solid var(--rule-soft)',
                }}>
                  {ingOpcionales.map((ing, i) => {
                    const checked = checkedIngs.has(`o-${i}`);
                    return (
                      <li key={`o-${i}`} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 0', borderBottom: '1px solid var(--rule-soft)', cursor: 'pointer', opacity: checked ? 0.6 : 0.8
                      }} onClick={() => setCheckedIngs(prev => { const n = new Set(prev); n.has(`o-${i}`) ? n.delete(`o-${i}`) : n.add(`o-${i}`); return n; })}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                          <span style={{ fontSize: 14, textDecoration: checked ? 'line-through' : 'none', color: 'var(--ink-2)' }}>
                            {ing.nombre}
                            {ing.recomendado && (
                              <span style={{
                                marginLeft: 8,
                                fontSize: 11,
                                fontWeight: 600,
                                color: 'var(--accent)',
                                background: 'rgba(184, 64, 31, 0.08)',
                                padding: '2px 8px',
                                borderRadius: 4,
                                border: '1px solid rgba(184, 64, 31, 0.15)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3
                              }}>
                                ★ Recomendado: {ing.recomendado}
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="font-mono" style={{ fontSize: 12, color: 'var(--ink-3)', textDecoration: checked ? 'line-through' : 'none' }}>
                          {scaleQty(ing.cantidad, servings, data.porciones || 4)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </aside>

          {/* Steps */}
          <div>
            <h2 className="font-display" style={{ fontSize: 30, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              Preparación
            </h2>
            <div style={{ padding: '16px 20px', background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 'var(--radius)', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, color: 'var(--ink-2)' }}>Recomendado para una mejor experiencia</span>
              <Button variant="accent" icon="check" onClick={() => setCookMode(true)}>
                Modo Cocina
              </Button>
            </div>

            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {steps.map((step, i) => {
                const done = checkedSteps.has(i);
                const timerMatch = step.match(/\[⏱\s*(.+?)\]/);
                const durationStr = timerMatch ? timerMatch[1] : null;
                const cleanStep = step.replace(/\[⏱\s*(.+?)\]/, '').trim();

                return (
                  <li
                    key={i}
                    onClick={() => {
                      setCheckedSteps(prev => {
                        const n = new Set(prev);
                        n.has(i) ? n.delete(i) : n.add(i);
                        return n;
                      });
                    }}
                    style={{
                      display: 'grid', gridTemplateColumns: '64px 1fr', gap: 24, padding: '20px 0',
                      borderBottom: '1px solid var(--rule)', cursor: 'pointer', alignItems: 'start',
                      background: done ? 'var(--paper)' : 'transparent',
                      margin: '0 -20px', paddingLeft: 20, paddingRight: 20, borderRadius: 'var(--radius)'
                    }}
                    className="card-hover"
                  >
                    <div className="font-display" style={{ fontSize: 42, lineHeight: 1, letterSpacing: '-0.03em', color: done ? 'var(--accent)' : 'var(--ink-3)', transition: 'color .2s' }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 17, lineHeight: 1.55, color: done ? 'var(--ink-3)' : 'var(--ink)',
                        textDecoration: done ? 'line-through' : 'none', textDecorationColor: 'var(--ink-4)',
                        paddingTop: 6, transition: 'color .2s', whiteSpace: 'pre-line'
                      }}>
                        {cleanStep.replace(/^\d+\.\s*/, '')}
                      </div>
                      {durationStr && (
                        <div style={{ marginTop: 12 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 16, fontSize: 12, color: 'var(--ink-2)', textDecoration: 'none' }}>
                            <Icon name="clock" size={12} /> {durationStr}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            
            <div style={{ position: 'sticky', bottom: 32, display: 'flex', justifyContent: 'center', marginTop: 40 }}>
              <Button variant="primary" icon="check" size="lg" onClick={() => setCookMode(true)} style={{ boxShadow: '0 8px 32px rgba(0,0,0,.15)' }}>
                ▶ Modo Cocina
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Recipes Carousel */}
      {related.length > 0 && (
        <section style={{ borderTop: '1px solid var(--rule)', padding: '64px 0 80px', background: 'var(--paper)' }}>
          <div className="container">
            <div className="eyebrow" style={{ marginBottom: 24, paddingLeft: 32 }}>Más recetas similares</div>
            <RecipeCarousel recipes={related} onOpenRecipe={onOpenRecipe} />
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 920px) {
          .detail-hero { grid-template-columns: 1fr !important; gap: 32px !important; }
          .detail-body { grid-template-columns: 1fr !important; gap: 40px !important; }
          .detail-hero > div:nth-child(2), .detail-body > aside { position: relative !important; top: 0 !important; }
        }
      `}</style>
    </div>
  );
};

const Metric = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{
      width: 38, height: 38, borderRadius: 999,
      background: 'var(--paper)',
      border: '1px solid var(--rule)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--ink-2)',
    }}>
      <Icon name={icon} size={16} />
    </div>
    <div>
      <div className="eyebrow" style={{ fontSize: 10 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 500 }}>{value}</div>
    </div>
  </div>
);

// Ojo Culinario: scaling con fracciones humanas y redondeo inteligente
function scaleQty(qty, servings, base = 4) {
  if (!qty) return '';
  const factor = servings / base;
  if (factor === 1) return qty;
  
  const m = qty.match(/^(\d+(?:[\.,/]\d+)?)\s*(.*)$/);
  if (!m) return qty;
  
  let num = m[1].replace(',', '.');
  if (num.includes('/')) {
    const [a, b] = num.split('/').map(Number);
    num = a / b;
  } else {
    num = Number(num);
  }
  
  const scaled = num * factor;
  const unit = m[2].trim().toLowerCase();
  
  // Si son gramos o ml, redondear a múltiplos de 5
  if (unit === 'g' || unit === 'gr' || unit === 'ml' || unit === 'cc' || unit === 'gramos') {
    const rounded = Math.round(scaled / 5) * 5;
    return `${rounded > 0 ? rounded : 5} ${m[2]}`.trim();
  }
  
  // Fracciones culinarias para unidades pequeñas/piezas
  const intPart = Math.floor(scaled);
  const fracPart = scaled - intPart;
  let fracStr = '';
  
  if (fracPart > 0.05 && fracPart < 0.95) {
    if (fracPart <= 0.28) fracStr = '1/4';
    else if (fracPart <= 0.4) fracStr = '1/3';
    else if (fracPart <= 0.6) fracStr = '1/2';
    else if (fracPart <= 0.8) fracStr = '3/4';
    else fracStr = '1'; // rounds up to next int
  } else if (fracPart >= 0.95) {
    fracStr = '1';
  }
  
  let out = '';
  if (intPart > 0) {
    if (fracStr === '1') {
      out = `${intPart + 1}`;
    } else if (fracStr) {
      out = `${intPart} y ${fracStr}`;
    } else {
      out = `${intPart}`;
    }
  } else {
    out = fracStr || '1/4'; // fallback for very small amounts
  }
  
  return `${out} ${m[2]}`.trim();
}

Object.assign(window, { DetailScreen });
