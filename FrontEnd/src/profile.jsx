/* eslint-disable */
// Profile: perfil + recetas creadas + favoritas + recomendaciones colaborativas

const ProfileScreen = ({ user, targetUsername, onOpenRecipe, onCreateRecipe, onExploreRecipes, onNavigateProfile, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [meProfile, setMeProfile] = useState(null);
  const [recetasMap, setRecetasMap] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [feedSeguidos, setFeedSeguidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeListModal, setActiveListModal] = useState(null); // 'seguidores' | 'seguidos' | null
  
  const isSelf = targetUsername === user.nombre;
  const [tab, setTab] = useState(isSelf ? 'favoritos' : 'creadas');
  const toast = useToast();

  const refresh = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (isSelf) {
        const [{ usuario }, recs, { recetas }, feed] = await Promise.all([
          window.api.obtenerUsuario(targetUsername),
          window.api.recomendaciones(targetUsername),
          window.api.listarRecetas(),
          window.api.feedSeguidos(targetUsername)
        ]);
        setProfile(usuario);
        setMeProfile(usuario);
        setRecommendations(recs.recomendaciones || []);
        setFeedSeguidos(feed.recetas || []);
        const map = Object.fromEntries(recetas.map(r => [r.id, r]));
        setRecetasMap(map);
        setIsFollowing(false);
      } else {
        const [{ usuario }, { recetas }, meRes] = await Promise.all([
          window.api.obtenerUsuario(targetUsername),
          window.api.listarRecetas(),
          window.api.obtenerUsuario(user.nombre)
        ]);
        setProfile(usuario);
        setMeProfile(meRes.usuario);
        setRecommendations([]);
        setFeedSeguidos([]);
        const map = Object.fromEntries(recetas.map(r => [r.id, r]));
        setRecetasMap(map);
        setIsFollowing(usuario.seguidores?.includes(user.nombre) || false);
      }
    } catch (e) {
      console.error('Error al cargar perfil:', e);
      toast('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTab(targetUsername === user.nombre ? 'favoritos' : 'creadas');
    refresh();
  }, [user, targetUsername]);

  const toggleFav = async (id) => {
    // Actualización optimista de meProfile (nuestro perfil)
    setMeProfile(prev => {
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

  const toggleFollow = async () => {
    try {
      if (isFollowing) {
        await window.api.dejarDeSeguirUsuario(targetUsername, user.nombre);
        setIsFollowing(false);
        toast(`Dejaste de seguir a ${targetUsername}`);
      } else {
        await window.api.seguirUsuario(targetUsername, user.nombre);
        setIsFollowing(true);
        toast(`Ahora sigues a ${targetUsername}`, { icon: 'check' });
      }
      refresh(true);
    } catch (e) {
      toast('Error al actualizar seguimiento');
    }
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

  const myRecs = profile?.recetasCreadas?.map(id => recetasMap[id]).filter(Boolean) || [];
  const favRecs = profile?.recetasFavoritas?.map(id => recetasMap[id]).filter(Boolean) || [];
  const terminadasRecs = profile?.recetasTerminadas?.map(id => recetasMap[id]).filter(Boolean) || [];

  return (
    <div data-screen-label="Profile" className="fade-in">
      {/* Back bar */}
      {!isSelf && onBack && (
        <div className="container" style={{ padding: '20px 32px 0' }}>
          <button onClick={onBack} className="btn btn-ghost btn-sm focus-ring">
            <Icon name="back" size={14} /> Volver
          </button>
        </div>
      )}

      {/* Header */}
      <section style={{ padding: isSelf ? '56px 0 32px' : '36px 0 32px' }}>
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
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                {isSelf ? 'Tu cocina' : 'Perfil de Cocinero'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <h1 className="font-display" style={{
                  fontSize: 'clamp(40px, 5vw, 60px)',
                  margin: '0 0 8px',
                  lineHeight: 1.0,
                  letterSpacing: '-0.025em',
                }}>
                  {profile.nombre}
                </h1>
                {!isSelf && (
                  <button
                    onClick={toggleFollow}
                    className="btn btn-sm focus-ring"
                    style={{
                      padding: '6px 16px',
                      fontSize: 13,
                      borderRadius: 999,
                      background: isFollowing ? 'var(--paper-2)' : 'var(--ink)',
                      color: isFollowing ? 'var(--ink-2)' : 'var(--paper)',
                      border: isFollowing ? '1px solid var(--rule)' : 'none',
                      height: 36,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </button>
                )}
              </div>
              <div className="text-muted" style={{ fontSize: 14 }}>
                {profile.mail}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <Stat label="Seguidores" value={profile.seguidores?.length || 0} onClick={() => setActiveListModal('seguidores')} />
              <Stat label="Seguidos" value={profile.seguidos?.length || 0} onClick={() => setActiveListModal('seguidos')} />
              <Stat label="Creadas" value={profile.recetasCreadas?.length || 0} />
              {isSelf && <Stat label="Favoritas" value={profile.recetasFavoritas?.length || 0} />}
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations — featured row (only self) */}
      {isSelf && recommendations.length > 0 && (
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
                  <RecommendationCard key={r.id} rec={r} isFav={meProfile?.recetasFavoritas?.includes(r.id)} onOpen={() => onOpenRecipe(r.id)} onFav={() => toggleFav(r.id)} />
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

      {/* Tabs / Section Title */}
      <section className="container" style={{ padding: '0 32px' }}>
        {isSelf ? (
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
            <ProfileTab active={tab === 'terminadas'} onClick={() => setTab('terminadas')} count={terminadasRecs.length}>
              Terminadas
            </ProfileTab>
          </div>
        ) : (
          <div style={{ borderBottom: '1px solid var(--rule)', marginBottom: 28, paddingBottom: 12 }}>
            <h2 className="font-display" style={{ fontSize: 28, margin: 0, color: 'var(--ink)' }}>
              Recetas de {profile.nombre}
            </h2>
          </div>
        )}
      </section>

      {/* Recipe Grid Content */}
      <section className="container" style={{ padding: '0 32px 96px' }}>
        {!isSelf ? (
          myRecs.length === 0 ? (
            <EmptyState
              icon="chef"
              title="Aún no tiene recetas"
            >
              Este cocinero todavía no compartió ninguna receta con la comunidad.
            </EmptyState>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {myRecs.map(r => (
                <RecipeCard
                  key={r.id}
                  receta={r}
                  onOpen={() => onOpenRecipe(r.id)}
                  isFav={meProfile?.recetasFavoritas?.includes(r.id) || false}
                  onFav={() => toggleFav(r.id)}
                />
              ))}
            </div>
          )
        ) : tab === 'favoritos' ? (
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
                  isFav={meProfile?.recetasFavoritas?.includes(r.id)}
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
                  isFav={meProfile?.recetasFavoritas?.includes(r.id)}
                  onFav={() => toggleFav(r.id)}
                />
              ))}
            </div>
          )
        ) : tab === 'terminadas' ? (
          terminadasRecs.length === 0 ? (
            <EmptyState
              icon="check"
              title="Aún no completaste ninguna receta"
              action={<Button variant="primary" onClick={() => location.hash = '#browse'}>Encontrar algo para cocinar</Button>}
            >
              Usá el Modo Cocina para preparar recetas y van a aparecer acá como completadas.
            </EmptyState>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {terminadasRecs.map(r => (
                <RecipeCard
                  key={r.id}
                  receta={r}
                  onOpen={() => onOpenRecipe(r.id)}
                  isFav={meProfile?.recetasFavoritas?.includes(r.id)}
                  onFav={() => toggleFav(r.id)}
                />
              ))}
            </div>
          )
        ) : null}
      </section>

      {/* Followers / Following List Modal */}
      {activeListModal && (
        <UserListModal
          title={activeListModal === 'seguidores' ? `Seguidores de ${profile.nombre}` : `A quiénes sigue ${profile.nombre}`}
          users={activeListModal === 'seguidores' ? profile.seguidores : profile.seguidos}
          onClose={() => setActiveListModal(null)}
          onNavigateProfile={onNavigateProfile}
        />
      )}
    </div>
  );
};

const Stat = ({ label, value, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <div 
      onClick={onClick} 
      onMouseEnter={() => onClick && setHover(true)}
      onMouseLeave={() => onClick && setHover(false)}
      style={{ 
        minWidth: 80, 
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'transform 0.15s'
      }}
    >
      <div 
        className="font-display" 
        style={{ 
          fontSize: 38, 
          lineHeight: 1, 
          letterSpacing: '-0.02em',
          color: hover ? 'var(--accent)' : 'var(--ink)',
          textDecoration: hover ? 'underline' : 'none',
          transition: 'color 0.15s'
        }}
      >
        {value}
      </div>
      <div className="eyebrow" style={{ marginTop: 6, fontSize: 10, color: hover ? 'var(--accent)' : 'var(--ink-3)' }}>{label}</div>
    </div>
  );
};

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
      <div style={{ position: 'relative', height: 160, margin: '-16px -16px 0 -16px', overflow: 'hidden', borderRadius: 'calc(var(--radius) - 1px) calc(var(--radius) - 1px) 0 0' }}>
        <CleanRecipeImage titulo={rec.receta} categoria={rec.categoria} imagenUrl={rec.imagen} height={160} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifySpace: 'space-between', justifyContent: 'space-between' }}>
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
            background: 'transparent',
            border: 'none',
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

// Modal Component for Followers/Following List
const UserListModal = ({ title, users, onClose, onNavigateProfile }) => {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div 
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: 400,
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '70vh',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--rule-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="font-display" style={{ fontSize: 22, margin: 0, letterSpacing: '-0.01em' }}>
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="btn btn-icon btn-ghost btn-sm"
            aria-label="Cerrar modal"
            style={{ width: 32, height: 32 }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {users.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
              Nadie por aquí todavía.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {users.map(username => (
                <button
                  key={username}
                  onClick={() => {
                    onClose();
                    onNavigateProfile(username);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background-color 0.12s',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: 'none',
                  }}
                  className="card-hover-bg"
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: 'var(--rule)',
                    color: 'var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                  }}>
                    {username[0].toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 15, color: 'var(--ink)' }}>
                    {username}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .card-hover-bg:hover {
          background-color: var(--rule-soft) !important;
        }
      `}</style>
    </div>,
    document.body
  );
};

Object.assign(window, { ProfileScreen });
