/* eslint-disable */
// Browse — listado de recetas con filtros (categoría, dificultad, tiempo) + búsqueda por texto

const RecipeCard = ({ receta, onOpen, isFav, onFav, layout = 'grid' }) => {
  if (layout === 'list') {
    return (
      <button
        onClick={onOpen}
        className="card card-hover focus-ring"
        style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr auto',
          gap: 24,
          padding: 16,
          textAlign: 'left',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <div style={{ width: 180, height: 110 }}>
          <RecipeCover titulo={receta.titulo} categoria={receta.categoria} height={110} compact />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
            <CategoryBadge name={receta.categoria} size="sm" />
            <span className="text-faint" style={{ fontSize: 12 }}>por {receta.creador}</span>
          </div>
          <div className="font-display" style={{ fontSize: 24, lineHeight: 1.15, marginBottom: 6, letterSpacing: '-0.015em' }}>
            {receta.titulo}
          </div>
          <div className="text-muted" style={{ fontSize: 14, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
            {receta.descripcion}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onFav?.(); }}
            className="btn btn-icon btn-ghost btn-sm focus-ring"
            aria-label={isFav ? 'Quitar de favoritos' : 'Guardar'}
            style={{ color: isFav ? 'var(--accent)' : 'var(--ink-3)' }}
          >
            <Icon name={isFav ? 'bookmarkFilled' : 'bookmark'} size={15} />
          </button>
          <Tiempo value={receta.tiempo} />
          <Dificultad value={receta.dificultad} />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="card card-hover focus-ring"
      style={{
        padding: 0,
        overflow: 'hidden',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--paper)',
      }}
    >
      <div style={{ position: 'relative', padding: 12 }}>
        <RecipeCover titulo={receta.titulo} categoria={receta.categoria} height={200} />
        {onFav && (
          <button
            onClick={(e) => { e.stopPropagation(); onFav(); }}
            aria-label={isFav ? 'Quitar de favoritos' : 'Guardar'}
            style={{
              position: 'absolute', top: 22, right: 22,
              width: 36, height: 36, borderRadius: 999,
              background: 'rgba(28,24,20,.5)',
              backdropFilter: 'blur(8px)',
              color: 'var(--paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color .15s ease, transform .15s ease',
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={(e) => e.currentTarget.style.transform = ''}
          >
            <Icon name={isFav ? 'bookmarkFilled' : 'bookmark'} size={15} />
          </button>
        )}
      </div>
      <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CategoryBadge name={receta.categoria} size="sm" />
          <span className="text-faint" style={{ fontSize: 12 }}>· {receta.creador}</span>
        </div>
        <div className="font-display" style={{ fontSize: 22, lineHeight: 1.15, letterSpacing: '-0.015em', textWrap: 'balance' }}>
          {receta.titulo}
        </div>
        <p className="text-muted" style={{
          margin: 0, fontSize: 13, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          flex: 1,
        }}>
          {receta.descripcion}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          paddingTop: 10,
          marginTop: 'auto',
          borderTop: '1px solid var(--rule-soft)',
        }}>
          <Tiempo value={receta.tiempo} />
          <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--ink-4)' }}/>
          <Dificultad value={receta.dificultad} />
        </div>
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────

const BrowseScreen = ({ user, onOpenRecipe, onCreateRecipe }) => {
  const [filters, setFilters] = useState({ categoria: '', dificultad: '', tiempo: '' });
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState('grid');
  const [data, setData] = useState({ recetas: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState(new Set());
  const toast = useToast();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    window.api.listarRecetas({
      categoria: filters.categoria || undefined,
      dificultad: filters.dificultad || undefined,
      tiempo: filters.tiempo || undefined,
    }).then(res => {
      if (alive) { setData(res); setLoading(false); }
    });
    return () => { alive = false; };
  }, [filters]);

  useEffect(() => {
    window.api.obtenerUsuario(user.nombre).then(r => {
      setFavs(new Set(r.usuario.recetasFavoritas));
    });
  }, [user]);

  const filtered = useMemo(() => {
    if (!query.trim()) return data.recetas;
    const q = query.toLowerCase();
    return data.recetas.filter(r =>
      r.titulo.toLowerCase().includes(q) ||
      r.descripcion.toLowerCase().includes(q) ||
      r.creador.toLowerCase().includes(q)
    );
  }, [data.recetas, query]);

  const toggleFav = async (titulo) => {
    const res = await window.api.toggleFavorito(user.nombre, titulo);
    setFavs(prev => {
      const n = new Set(prev);
      if (res.added) n.add(titulo); else n.delete(titulo);
      return n;
    });
    toast(res.added ? 'Guardado en favoritos' : 'Quitado de favoritos', { icon: res.added ? 'bookmarkFilled' : 'check' });
  };

  const cats = window.api.categorias();
  const activeFilters = Object.values(filters).filter(Boolean).length;

  return (
    <div data-screen-label="Browse" className="fade-in">
      {/* Hero */}
      <section style={{ padding: '56px 0 36px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 720 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                Hola {user.nombre} · {data.total} recetas en tu cocina
              </div>
              <h1 className="font-display" style={{
                fontSize: 'clamp(44px, 5.5vw, 68px)',
                margin: '0 0 16px',
                lineHeight: 1.0,
                letterSpacing: '-0.025em',
                textWrap: 'balance',
              }}>
                ¿Qué cocinás <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>hoy</em>?
              </h1>
              <p className="text-muted" style={{ fontSize: 17, margin: 0, maxWidth: 540 }}>
                Explorá la colección completa o filtrá por categoría, tiempo y dificultad.
              </p>
            </div>

            <Button variant="primary" icon="plus" onClick={onCreateRecipe}>
              Nueva receta
            </Button>
          </div>
        </div>
      </section>

      {/* Search + filters */}
      <section style={{ position: 'sticky', top: 64, zIndex: 5, background: 'var(--cream)', borderBottom: '1px solid var(--rule)' }}>
        <div className="container" style={{ padding: '16px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 240 }}>
              <Icon name="search" size={16} />
              <input
                className="input"
                placeholder="Buscar por nombre, descripción o autor…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: 42 }}
              />
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }}>
                <Icon name="search" size={16} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <select className="select" value={filters.categoria} onChange={(e) => setFilters(f => ({ ...f, categoria: e.target.value }))}>
                <option value="">Toda categoría</option>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="select" value={filters.dificultad} onChange={(e) => setFilters(f => ({ ...f, dificultad: e.target.value }))}>
                <option value="">Toda dificultad</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
              <select className="select" value={filters.tiempo} onChange={(e) => setFilters(f => ({ ...f, tiempo: e.target.value }))}>
                <option value="">Cualquier tiempo</option>
                {[...new Set(data.recetas.map(r => r.tiempo))].sort().map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {activeFilters > 0 && (
                <button className="btn btn-link" onClick={() => setFilters({ categoria: '', dificultad: '', tiempo: '' })}>
                  Limpiar
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', padding: 4, background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 999 }}>
              {['grid', 'list'].map(l => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className="btn btn-sm"
                  style={{
                    background: layout === l ? 'var(--ink)' : 'transparent',
                    color: layout === l ? 'var(--paper)' : 'var(--ink-2)',
                    padding: '0 12px',
                    height: 28,
                    fontSize: 12,
                  }}
                >
                  {l === 'grid' ? 'Grid' : 'Lista'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categoría chips (quick filter) */}
      <section className="container" style={{ padding: '28px 32px 0' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', overflowX: 'auto' }}>
          <Chip active={!filters.categoria} onClick={() => setFilters(f => ({ ...f, categoria: '' }))}>
            Todas
          </Chip>
          {cats.map(c => (
            <Chip
              key={c}
              active={filters.categoria === c}
              onClick={() => setFilters(f => ({ ...f, categoria: f.categoria === c ? '' : c }))}
            >
              <span style={{ width: 7, height: 7, borderRadius: 999, background: CAT_COLORS[c] || 'var(--ink)' }}/>
              {c}
            </Chip>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="container" style={{ padding: '24px 32px 80px' }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {[0,1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title="Sin resultados"
            action={
              <Button variant="ghost" onClick={() => { setFilters({ categoria: '', dificultad: '', tiempo: '' }); setQuery(''); }}>
                Limpiar todos los filtros
              </Button>
            }
          >
            No encontramos recetas con esos filtros. Probá quitando alguno o creando la tuya.
          </EmptyState>
        ) : layout === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {filtered.map((r, i) => (
              <div key={r.titulo} className="fade-in" style={{ animationDelay: `${i * 28}ms` }}>
                <RecipeCard
                  receta={r}
                  onOpen={() => onOpenRecipe(r.titulo)}
                  isFav={favs.has(r.titulo)}
                  onFav={() => toggleFav(r.titulo)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((r, i) => (
              <div key={r.titulo} className="fade-in" style={{ animationDelay: `${i * 28}ms` }}>
                <RecipeCard
                  receta={r}
                  onOpen={() => onOpenRecipe(r.titulo)}
                  isFav={favs.has(r.titulo)}
                  onFav={() => toggleFav(r.titulo)}
                  layout="list"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

Object.assign(window, { BrowseScreen, RecipeCard });
