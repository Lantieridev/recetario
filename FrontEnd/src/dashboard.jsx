/* eslint-disable */
// Dashboard Empresa: Métricas, Lista de Recetas, y Desafíos

const DashboardMetric = ({ label, value, trend, trendDir = 'up' }) => (
  <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div className="eyebrow" style={{ color: 'var(--ink-2)', fontSize: 11 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
      <div className="font-display" style={{ fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: trendDir === 'up' ? 'var(--cat-veg)' : 'var(--cat-postre)' }}>
          <Icon name={trendDir === 'up' ? 'arrow' : 'arrow'} size={12} style={{ transform: trendDir === 'up' ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
          {trend}
        </div>
      )}
    </div>
  </div>
);

const DashboardScreen = ({ user, onOpenRecipe }) => {
  const [data, setData] = useState({ recetas: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.api.listarRecetas().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const totalViews = data.recetas.length * 1542; // mock
  const totalSaves = data.recetas.length * 312; // mock

  return (
    <div data-screen-label="Dashboard" className="fade-in" style={{ background: 'var(--cream)', minHeight: '100vh', paddingBottom: 120 }}>
      {/* Header */}
      <section style={{ padding: '56px 0 36px' }}>
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Panel de control
          </div>
          <h1 className="font-display" style={{
            fontSize: 'clamp(44px, 5.5vw, 68px)',
            margin: '0 0 16px',
            lineHeight: 1.0,
            letterSpacing: '-0.025em',
            textWrap: 'balance',
          }}>
            Métricas de la <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>empresa</em>
          </h1>
          <p className="text-muted" style={{ fontSize: 17, margin: 0, maxWidth: 540 }}>
            Hola {user.nombre}, acá podés ver el impacto de tus recetas y desafíos en la comunidad.
          </p>
        </div>
      </section>

      {/* Métricas */}
      <section className="container" style={{ padding: '0 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          <DashboardMetric label="Recetas publicadas" value={data.recetas.length} trend="+2 esta semana" trendDir="up" />
          <DashboardMetric label="Visualizaciones" value={(totalViews).toLocaleString()} trend="+14% mes a mes" trendDir="up" />
          <DashboardMetric label="Guardadas" value={(totalSaves).toLocaleString()} trend="-2% mes a mes" trendDir="down" />
          <DashboardMetric label="Participantes en desafíos" value="227" trend="+45 esta semana" trendDir="up" />
        </div>
      </section>

      {/* Contenido principal */}
      <section className="container" style={{ padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48, alignItems: 'start' }}>
          
          {/* Listado de recetas propias */}
          <div>
            <h2 className="font-display" style={{ fontSize: 24, margin: '0 0 24px', letterSpacing: '-0.01em' }}>Tus recetas más populares</h2>
            {loading ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {[1,2,3].map(i => <SkeletonCard key={i} />)}
               </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.recetas.slice(0, 5).map((r, i) => (
                  <div key={r.titulo} onClick={() => onOpenRecipe(r.titulo)} className="card card-hover focus-ring" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 16, cursor: 'pointer' }}>
                    <div style={{ width: 80, height: 80, flexShrink: 0 }}>
                      <RecipeCover titulo={r.titulo} categoria={r.categoria} height={80} compact />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="font-display" style={{ fontSize: 18, marginBottom: 4 }}>{r.titulo}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>{r.categoria} · {r.dificultad}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>{(Math.floor(Math.random() * 2000) + 100).toLocaleString()}</div>
                      <div className="text-faint" style={{ fontSize: 11 }}>vistas</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" style={{ marginTop: 24 }}>Ver todas las recetas</Button>
          </div>

          {/* Gestión de desafíos */}
          <aside style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
            <h2 className="font-display" style={{ fontSize: 24, margin: '0 0 24px', letterSpacing: '-0.01em' }}>Desafíos activos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 500, fontSize: 15 }}>Semana Sin Carne</div>
                  <span style={{ padding: '2px 8px', background: 'var(--cat-veg)', color: 'white', fontSize: 10, borderRadius: 12 }}>ACTIVO</span>
                </div>
                <div className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>Termina en 3 días</div>
                <div style={{ width: '100%', height: 6, background: 'var(--rule)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: 'var(--cat-veg)' }} />
                </div>
                <div className="text-muted" style={{ fontSize: 11, marginTop: 6, textAlign: 'right' }}>142 / 200 meta</div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 500, fontSize: 15 }}>Especial Pastas Caseras</div>
                  <span style={{ padding: '2px 8px', background: 'var(--cat-veg)', color: 'white', fontSize: 10, borderRadius: 12 }}>ACTIVO</span>
                </div>
                <div className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>Termina en 10 días</div>
                <div style={{ width: '100%', height: 6, background: 'var(--rule)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '30%', height: '100%', background: 'var(--cat-veg)' }} />
                </div>
                <div className="text-muted" style={{ fontSize: 11, marginTop: 6, textAlign: 'right' }}>85 / 300 meta</div>
              </div>
            </div>
            
            <Button variant="primary" icon="plus" style={{ width: '100%', marginTop: 32 }}>
              Crear nuevo desafío
            </Button>
          </aside>
          
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .container > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

Object.assign(window, { DashboardScreen });
