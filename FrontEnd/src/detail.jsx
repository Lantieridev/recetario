/* eslint-disable */
// Recipe detail — hero with cover, sticky ingredients panel, numbered steps

const DetailScreen = ({ titulo, user, initialData, onBack, onOpenRecipe }) => {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [isFav, setIsFav] = useState(false);
  const [related, setRelated] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState(new Set());
  const [checkedIngs, setCheckedIngs] = useState(new Set());
  const [servings, setServings] = useState(initialData ? (initialData.porciones || 4) : 4);
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
      // related from same category
      const list = await window.api.listarRecetas({ categoria: res.receta.categoria });
      if (alive) setRelated(list.recetas.filter(r => r.titulo !== titulo).slice(0, 3));
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

  if (loading || !data) {
    return (
      <div className="container" style={{ padding: '40px 32px' }}>
        <div className="skeleton" style={{ height: 480, marginBottom: 32 }}/>
        <div className="skeleton" style={{ height: 200 }}/>
      </div>
    );
  }

  const steps = data.pasos.split(/\d+\.\s/).map(s => s.trim()).filter(Boolean);

  return (
    <div data-screen-label="Recipe Detail" className="fade-in">
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
              <span className="text-faint" style={{ fontSize: 13 }}>por {data.creador}</span>
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
              <Button variant="ghost" icon="check" onClick={() => {
                setCheckedSteps(new Set());
                setCheckedIngs(new Set());
                toast('Lista reiniciada');
              }}>
                Empezar a cocinar
              </Button>
            </div>
          </div>

          <div style={{ position: 'sticky', top: 96 }}>
            <RecipeCover titulo={data.titulo} categoria={data.categoria} height={520} />
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

            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column',
              borderTop: '1px solid var(--rule)',
            }}>
              {data.ingredientes.map((ing, i) => {
                const checked = checkedIngs.has(i);
                return (
                  <li key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: '1px solid var(--rule-soft)',
                    cursor: 'pointer',
                  }}
                    onClick={() => {
                      setCheckedIngs(prev => {
                        const n = new Set(prev);
                        n.has(i) ? n.delete(i) : n.add(i);
                        return n;
                      });
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--ink-3)'}`,
                        background: checked ? 'var(--accent)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--paper)',
                        flexShrink: 0,
                        transition: 'all .15s',
                      }}>
                        {checked && <Icon name="check" size={11} stroke={2.4} />}
                      </span>
                      <span style={{
                        fontSize: 15,
                        textDecoration: checked ? 'line-through' : 'none',
                        color: checked ? 'var(--ink-3)' : 'var(--ink)',
                      }}>
                        {ing.nombre}
                      </span>
                    </div>
                    <span className="font-mono" style={{
                      fontSize: 12,
                      color: 'var(--ink-3)',
                      textDecoration: checked ? 'line-through' : 'none',
                    }}>
                      {scaleQty(ing.cantidad, servings, data.porciones || 4)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div style={{ marginTop: 20, padding: 14, background: 'var(--paper)', border: '1px dashed var(--rule)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="sparkle" size={12} />
                Las cantidades escalan según las porciones.
              </div>
            </div>
          </aside>

          {/* Steps */}
          <div>
            <h2 className="font-display" style={{ fontSize: 30, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              Preparación
            </h2>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {steps.map((step, i) => {
                const done = checkedSteps.has(i);
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
                      display: 'grid',
                      gridTemplateColumns: '64px 1fr',
                      gap: 24,
                      padding: '20px 0',
                      borderBottom: '1px solid var(--rule-soft)',
                      cursor: 'pointer',
                      alignItems: 'start',
                    }}
                  >
                    <div className="font-display" style={{
                      fontSize: 42,
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                      color: done ? 'var(--accent)' : 'var(--ink-3)',
                      transition: 'color .2s',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div style={{
                      fontSize: 17,
                      lineHeight: 1.55,
                      color: done ? 'var(--ink-3)' : 'var(--ink-2)',
                      textDecoration: done ? 'line-through' : 'none',
                      textDecorationColor: 'var(--ink-4)',
                      paddingTop: 6,
                      transition: 'color .2s',
                      whiteSpace: 'pre-line',
                    }}>
                      {step}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Related */}
            {related.length > 0 && (
              <section style={{ marginTop: 80 }}>
                <div className="eyebrow" style={{ marginBottom: 14 }}>Más recetas de {data.categoria}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  {related.map(r => (
                    <button
                      key={r.titulo}
                      onClick={() => onOpenRecipe(r.titulo)}
                      className="card card-hover focus-ring"
                      style={{ padding: 12, textAlign: 'left' }}
                    >
                      <RecipeCover titulo={r.titulo} categoria={r.categoria} height={120} compact />
                      <div className="font-display" style={{ fontSize: 18, marginTop: 12, letterSpacing: '-0.01em' }}>
                        {r.titulo}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                        {r.tiempo} · {r.dificultad}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>

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

// Naive ingredient quantity scaling. Only scales numeric leading values.
function scaleQty(qty, servings, base = 4) {
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
  const out = Number.isInteger(scaled) ? scaled : scaled.toFixed(scaled < 1 ? 2 : 1);
  return `${out} ${m[2]}`.trim();
}

Object.assign(window, { DetailScreen });
