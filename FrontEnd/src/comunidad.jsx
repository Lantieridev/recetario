/* eslint-disable */
// Comunidad: Feed Social (Masonry), Creadores Destacados, Desafíos Premium

const CreadorAvatar = ({ name, role, color, onClick }) => (
  <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', minWidth: 80 }}>
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      background: color || 'var(--ink)', color: 'var(--paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 32, fontWeight: 500, fontFamily: 'var(--font-display)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s',
    }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      {name[0].toUpperCase()}
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{role}</div>
    </div>
  </div>
);

const ComunidadScreen = ({ user, onOpenRecipe, onNavigateProfile }) => {
  const [tab, setTab] = useState('feed');
  const [data, setData] = useState({ recetas: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.api.listarRecetas().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const desafios = [
    { title: "Semana Sin Carne", desc: "Creá una receta 100% vegetariana y compartila para ganar el badge.", participants: 142, color: 'var(--cat-veg)', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80' },
    { title: "Especial Pastas Caseras", desc: "Mostranos cómo hacés tus pastas desde cero y ganá la sartén de oro.", participants: 85, color: 'var(--cat-prin)', img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80' }
  ];

  return (
    <div data-screen-label="Comunidad" className="fade-in">
      {/* Header & Creadores Destacados */}
      <section style={{ padding: '56px 0 32px', background: 'var(--cream)', borderBottom: '1px solid var(--rule)' }}>
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 14 }}>Tu red culinaria</div>
          <h1 className="font-display" style={{ fontSize: 'clamp(44px, 5.5vw, 68px)', margin: '0 0 40px', lineHeight: 1.0, letterSpacing: '-0.025em' }}>
            Inspirate con la <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>comunidad</em>
          </h1>
          
          <div className="eyebrow" style={{ marginBottom: 16 }}>Creadores Destacados</div>
          <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
            <CreadorAvatar name="Ornella" role="Chef Pastelera" color="#E57373" onClick={() => onNavigateProfile?.('Ornella')} />
            <CreadorAvatar name="Juan" role="Asador" color="#81C784" onClick={() => onNavigateProfile?.('Juan')} />
            <CreadorAvatar name="Ana" role="Vegana" color="#64B5F6" onClick={() => onNavigateProfile?.('Ana')} />
            <CreadorAvatar name="Martín" role="Panadero" color="#FFB74D" onClick={() => onNavigateProfile?.('Martín')} />
            <CreadorAvatar name="Sofía" role="Bartender" color="#BA68C8" onClick={() => onNavigateProfile?.('Sofía')} />
            <CreadorAvatar name="Carlos" role="Gourmet" color="#4DB6AC" onClick={() => onNavigateProfile?.('Carlos')} />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container" style={{ padding: '24px 32px 0' }}>
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--rule)', marginBottom: 32, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <ProfileTab active={tab === 'feed'} onClick={() => setTab('feed')} count={data.recetas.length}>
            Feed Social
          </ProfileTab>
          <ProfileTab active={tab === 'tendencia'} onClick={() => setTab('tendencia')} count={0}>
            Tendencia
          </ProfileTab>
          <ProfileTab active={tab === 'desafios'} onClick={() => setTab('desafios')} count={desafios.length}>
            Desafíos
          </ProfileTab>
        </div>
      </section>

      {/* Content */}
      <section className="container" style={{ padding: '0 32px 96px' }}>
        {tab === 'feed' ? (
          loading ? (
            <div style={{ columnCount: 2, columnGap: 24 }}>
              {[0,1,2,3].map(i => <div key={i} style={{ breakInside: 'avoid', marginBottom: 24 }}><SkeletonCard /></div>)}
            </div>
          ) : (
            <div style={{ columnCount: window.innerWidth < 768 ? 1 : 2, columnGap: 24 }}>
              {data.recetas.map((r, i) => (
                <div key={r.titulo} className="fade-in" style={{ breakInside: 'avoid', marginBottom: 24, animationDelay: `${i * 28}ms`, background: 'var(--paper)', borderRadius: 'var(--radius)', border: '1px solid var(--rule)' }}>
                  <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--rule-soft)' }}>
                    <div 
                      onClick={() => onNavigateProfile?.(r.creador)}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      {r.creador[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14 }}>
                        <strong 
                          onClick={() => onNavigateProfile?.(r.creador)}
                          style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {r.creador}
                        </strong> preparó esta receta
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Hace {Math.floor(Math.random() * 20) + 1} horas</div>
                    </div>
                  </div>
                  <div style={{ border: 'none' }}>
                    <RecipeCard receta={r} onOpen={() => onOpenRecipe(r.id)} isFav={false} />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'tendencia' ? (
          <EmptyState
            icon="star"
            title="Estamos procesando las tendencias"
            action={<Button variant="primary" onClick={() => setTab('feed')}>Volver al feed</Button>}
          >
            Vuelve pronto para ver cuáles son las recetas más cocinadas de esta semana.
          </EmptyState>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
            {desafios.map((d, i) => (
              <div key={i} className="card-hover" style={{
                position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-xl)', height: 280, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 24
              }}>
                <img src={d.img} alt={d.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(28,24,20,0.9), transparent)` }} />
                <div style={{ position: 'relative', zIndex: 2, color: 'var(--paper)' }}>
                  <span style={{ padding: '4px 10px', background: d.color, color: 'var(--paper)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', borderRadius: 16, marginBottom: 12, display: 'inline-block' }}>
                    Desafío Semanal
                  </span>
                  <h3 className="font-display" style={{ fontSize: 32, margin: '0 0 8px', lineHeight: 1.1 }}>{d.title}</h3>
                  <p style={{ margin: '0 0 16px', fontSize: 14, opacity: 0.9 }}>{d.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>{d.participants} cocineros unidos</span>
                    <Button variant="accent" style={{ height: 36, padding: '0 16px' }}>Unirme</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const ProfileTabLocal = ({ active, count, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: '14px 0', marginRight: 28, borderBottom: `2px solid ${active ? 'var(--ink)' : 'transparent'}`,
      marginBottom: -1, color: active ? 'var(--ink)' : 'var(--ink-3)', fontSize: 15, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'color .18s, border-color .18s',
    }}
  >
    {children}
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 999,
      background: active ? 'var(--ink)' : 'var(--rule)', color: active ? 'var(--paper)' : 'var(--ink-3)',
    }}>
      {count}
    </span>
  </button>
);

const ProfileTab = ProfileTabLocal;

Object.assign(window, { ComunidadScreen });
