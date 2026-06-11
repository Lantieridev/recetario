/* eslint-disable */
// Profile: perfil + recetas creadas + favoritas + recomendaciones colaborativas

const ProfileScreen = ({ user, onOpenRecipe, onCreateRecipe, onExploreRecipes }) => {
  const [profile, setProfile] = useState(null);
  const [recetasMap, setRecetasMap] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [feedSeguidos, setFeedSeguidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('favoritos');
  const toast = useToast();

  const refresh = async (silent = false) => {
    if (!silent) setLoading(true);
    const [{ usuario }, recs, { recetas }, feed] = await Promise.all([
      window.api.obtenerUsuario(user.nombre),
      window.api.recomendaciones(user.nombre),
      window.api.listarRecetas(),
      window.api.feedSeguidos(user.nombre)
    ]);
    setProfile(usuario);
    setRecommendations(recs.recomendaciones);
    setFeedSeguidos(feed.recetas);
    const map = Object.fromEntries(recetas.map(r => [r.id, r]));
    setRecetasMap(map);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [user]);

  const toggleFav = async (id) => {
    // Actualización optimista del estado local para respuesta instantánea en la UI
    setProfile(prev => {
      if (!prev) return prev;
      const isFavorited = prev.recetasFavoritas.includes(id);
      const recetasFavoritas = isFavorited
        ? prev.recetasFavoritas.filter(t => t !== id)
        : [...prev.recetasFavoritas, id];
      return { ...prev, recetasFavoritas };
    });

    const res = await window.api.toggleFavorito(user.nombre, id);
    toast(res.added ? 'Guardada' : 'Quitada de favoritos', { icon: res.added ? 'bookmarkFilled' : 'check' });
    refresh(true); // Refresco silencioso en segundo plano
  };

  if (loading || !profile) {
    return (
      <div className="container fade-in" style={{ padding: '80px 32px' }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginBottom: 64 }}>
          <div className="skeleton" style={{ width: 96, height: 96, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: 120, height: 20, marginBottom: 16 }} />
            <div className="skeleton" style={{ width: 300, height: 48, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 200, height: 16 }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const favRecs = profile.recetasFavoritas.map(t => recetasMap[t]).filter(Boolean);
  const myRecs = profile.recetasCreadas.map(t => recetasMap[t]).filter(Boolean);

  return (
    <div data-screen-label="Profile" className="fade-in">
      {/* Header */}
      <section style={{ padding: '56px 0 32px' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: 96, height: 96, borderRadius: 999,
              background: 'var(--ink)',
              color: 'var(--paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38, fontWeight: 500,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              flexShrink: 0,
            }}>
              {profile.nombre[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Tu cocina</div>
              <h1 className="font-display" style={{
                fontSize: 'clamp(40px, 5vw, 60px)',
                margin: '0 0 8px',
                lineHeight: 1.0,
                letterSpacing: '-0.025em',
              }}>
                {profile.nombre}
              </h1>
              <div className="text-muted" style={{ fontSize: 14 }}>
                {profile.mail}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <Stat label="Seguidores" value={profile.seguidores?.length || 0} />
              <Stat label="Seguidos" value={profile.seguidos?.length || 0} />
              <Stat label="Creadas" value={profile.recetasCreadas.length} />
              <Stat label="Favoritas" value={profile.recetasFavoritas.length} />
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations — featured row */}
      {recommendations.length > 0 && (
        <section className="container" style={{ padding: '24px 32px 48px' }}>
          <div style={{
            background: 'var(--cream)',
            border: '1px solid var(--rule)',
            color: 'var(--ink)',
            borderRadius: 'var(--radius-xl)',
            padding: 36,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>
                <Icon name="sparkle" size={11} /> {recommendations[0]?.tipo === 'popular' ? 'Tendencia en la comunidad' : 'Recomendaciones para vos'}
              </div>
              <h2 className="font-display" style={{
                fontSize: 36,
                margin: '0 0 6px',
                color: 'var(--ink)',
                letterSpacing: '-0.02em',
              }}>
                {recommendations[0]?.tipo === 'popular' ? 'Las más populares que todavía no probaste' : 'Otros con tus gustos también guardaron…'}
              </h2>
              <p className="text-muted" style={{ margin: '0 0 28px', fontSize: 14, maxWidth: 540 }}>
                {recommendations[0]?.tipo === 'popular'
                  ? 'Guardá más recetas para recibir sugerencias personalizadas según tus gustos.'
                  : 'Calculado con filtro colaborativo sobre los favoritos de toda la comunidad.'}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 16,
              }}>
                {recommendations.map(r => (
                  <RecommendationCard key={r.id} rec={r} isFav={profile.recetasFavoritas.includes(r.id)} onOpen={() => onOpenRecipe(r.id)} onFav={() => toggleFav(r.id)} />
                ))}
              </div>
            </div>

            <div className="font-display" style={{
              position: 'absolute',
              right: -30, bottom: -90,
              fontSize: 320,
              lineHeight: 1,
              color: 'var(--rule)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              ✦
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className="container" style={{ padding: '0 32px' }}>
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--rule)', marginBottom: 28, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <ProfileTab active={tab === 'favoritos'} onClick={() => setTab('favoritos')} count={favRecs.length}>
            Favoritas
          </ProfileTab>
          <ProfileTab active={tab === 'seguidos'} onClick={() => setTab('seguidos')} count={feedSeguidos.length}>
            Feed de Seguidos
          </ProfileTab>
          <ProfileTab active={tab === 'creadas'} onClick={() => setTab('creadas')} count={myRecs.length}>
            Creadas por mí
          </ProfileTab>
          <ProfileTab active={tab === 'terminadas'} onClick={() => setTab('terminadas')} count={0}>
            Terminadas
          </ProfileTab>
        </div>
      </section>

      <section className="container" style={{ padding: '0 32px 96px' }}>
        {tab === 'favoritos' ? (
          favRecs.length === 0 ? (
            <EmptyState
              icon="bookmark"
              title="Sin favoritos aún"
              action={<Button variant="primary" onClick={onExploreRecipes}>Explorar recetas</Button>}
            >
              Cuando guardes una receta, va a aparecer acá lista para volver a ella.
            </EmptyState>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {favRecs.map(r => (
                <RecipeCard
                  key={r.id}
                  receta={r}
                  onOpen={() => onOpenRecipe(r.id)}
                  isFav={true}
                  onFav={() => toggleFav(r.id)}
                />
              ))}
            </div>
          )
        ) : tab === 'seguidos' ? (
          feedSeguidos.length === 0 ? (
            <EmptyState
              icon="user"
              title="Aún no hay actividad"
              action={<Button variant="primary" onClick={onExploreRecipes}>Descubrir chefs</Button>}
            >
              Seguí a otros creadores para ver sus nuevas recetas acá.
            </EmptyState>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {feedSeguidos.map(r => (
                <RecipeCard
                  key={r.id}
                  receta={r}
                  onOpen={() => onOpenRecipe(r.id)}
                  isFav={favRecs.some(f => f.id === r.id)}
                  onFav={() => toggleFav(r.id)}
                />
              ))}
            </div>
          )
        ) : tab === 'creadas' ? (
          myRecs.length === 0 ? (
            <EmptyState
              icon="chef"
              title="Todavía no creaste recetas"
              action={<Button variant="primary" icon="plus" onClick={onCreateRecipe}>Crear mi primera receta</Button>}
            >
              Compartí lo que sabés cocinar con el resto de la comunidad.
            </EmptyState>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {myRecs.map(r => (
                <RecipeCard
                  key={r.id}
                  receta={r}
                  onOpen={() => onOpenRecipe(r.id)}
                  isFav={favRecs.some(f => f.id === r.id)}
                  onFav={() => toggleFav(r.id)}
                />
              ))}
            </div>
          )
        ) : (
          <EmptyState
            icon="check"
            title="Aún no completaste ninguna receta"
            action={<Button variant="primary" onClick={() => location.hash = '#browse'}>Encontrar algo para cocinar</Button>}
          >
            Usá el Modo Cocina para preparar recetas y van a aparecer acá como completadas.
          </EmptyState>
        )}
      </section>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div style={{ minWidth: 80 }}>
    <div className="font-display" style={{ fontSize: 38, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
    <div className="eyebrow" style={{ marginTop: 6, fontSize: 10 }}>{label}</div>
  </div>
);

const ProfileTab = ({ active, count, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: '14px 0',
      marginRight: 28,
      borderBottom: `2px solid ${active ? 'var(--ink)' : 'transparent'}`,
      marginBottom: -1,
      color: active ? 'var(--ink)' : 'var(--ink-3)',
      fontSize: 15,
      fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      transition: 'color .18s, border-color .18s',
    }}
  >
    {children}
    <span style={{
      fontSize: 11,
      padding: '2px 8px',
      borderRadius: 999,
      background: active ? 'var(--ink)' : 'var(--rule)',
      color: active ? 'var(--paper)' : 'var(--ink-3)',
    }}>
      {count}
    </span>
  </button>
);

const RecommendationCard = ({ rec, isFav, onOpen, onFav }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen?.();
    }
  };

  return (
    <div
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      style={{
        textAlign: 'left',
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--radius)',
        padding: 16,
        color: 'var(--ink)',
        transition: 'background-color .2s, transform .2s',
        display: 'flex', flexDirection: 'column', gap: 12,
        height: '100%',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--paper-2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--paper)'; e.currentTarget.style.transform = ''; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11,
          padding: '4px 10px',
          borderRadius: 999,
          background: 'var(--accent)',
          color: 'var(--paper)',
          fontWeight: 500,
        }}>
          <Icon name="sparkle" size={10} stroke={2}/>
          {rec.nivelDeMatch} {rec.nivelDeMatch === 1 ? 'match' : 'matches'}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onFav(); }}
          aria-label={isFav ? 'Quitar de favoritos' : 'Guardar'}
          style={{
            width: 28, height: 28, borderRadius: 999,
            color: isFav ? 'var(--accent)' : 'var(--ink-3)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color .15s',
          }}
        >
          <Icon name={isFav ? 'bookmarkFilled' : 'bookmark'} size={14}/>
        </button>
      </div>
      <div className="font-display" style={{ fontSize: 24, lineHeight: 1.15, color: 'var(--ink)', letterSpacing: '-0.015em', textWrap: 'balance' }}>
        {rec.receta}
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {rec.descripcion}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 'auto', fontSize: 12, color: 'var(--ink-3)' }}>
        <span>{rec.tiempo}</span>
        <span>·</span>
        <span>{rec.dificultad}</span>
        <span>·</span>
        <span>{rec.categoria}</span>
      </div>
    </div>
  );
};

Object.assign(window, { ProfileScreen });
