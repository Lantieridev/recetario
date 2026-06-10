/* eslint-disable */
// Browse — listado de recetas con filtros (categoría, dificultad, tiempo) + búsqueda por texto

const RecipeCard = ({ receta, onOpen, isFav, onFav, layout = 'grid' }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen?.();
    }
  };

  if (layout === 'list') {
    return (
      <div
        onClick={onOpen}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        className="card card-hover focus-ring"
        style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr auto',
          gap: 24,
          padding: 16,
          textAlign: 'left',
          width: '100%',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{ width: 180, height: 110 }}>
          <CleanRecipeImage titulo={receta.titulo} categoria={receta.categoria} imagenUrl={receta.imagen} height={110} compact />
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
      </div>
    );
  }

  return (
    <div
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="card card-hover focus-ring"
      style={{
        padding: 0,
        overflow: 'hidden',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--paper)',
        height: '100%',
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative', padding: 12 }}>
        <CleanRecipeImage titulo={receta.titulo} categoria={receta.categoria} imagenUrl={receta.imagen} height={200} />
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
    </div>
  );
};

const obtenerEtiquetaDia = (offset) => {
  if (offset === 0) return 'Receta del día';
  if (offset === 1) return 'Destacada de ayer';
  return `Destacada hace ${offset} días`;
};

const RecetaDelDiaHero = ({ receta, onOpen, isFav, onFav, user, diaOffset, onPrevDay, onNextDay, loading }) => {
  if (!receta) return null;
  
  const labelText = obtenerEtiquetaDia(diaOffset);
  const formattedDate = new Date(Date.now() - diaOffset * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }} onClick={onOpen}>
        <CleanRecipeImage titulo={receta.titulo} categoria={receta.categoria} imagenUrl={receta.imagen} height="100%" />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(28,24,20,0.4) 0%, transparent 40%, rgba(28,24,20,0.9) 100%)', zIndex: 1 }} onClick={onOpen} />
      
      {/* Top Welcome Text overlaid on hero */}
      <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 56, color: 'var(--paper)', pointerEvents: 'none' }}>
        <div className="eyebrow" style={{ marginBottom: 14, color: 'rgba(255,255,255,0.8)' }}>
          Hola {user.nombre}
        </div>
        <h1 className="font-display" style={{
          fontSize: 'clamp(44px, 5.5vw, 68px)',
          margin: '0 0 16px',
          lineHeight: 1.0,
          letterSpacing: '-0.025em',
          textWrap: 'balance',
          color: 'var(--paper)'
        }}>
          ¿Qué cocinás <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>hoy</em>?
        </h1>
      </div>

      {/* Bottom Hero Info */}
      <div className="container" style={{ position: 'relative', zIndex: 2, paddingBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ color: 'var(--paper)', flex: 1, minWidth: 280 }} onClick={onOpen}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ padding: '6px 14px', background: 'var(--accent)', color: 'var(--paper)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', borderRadius: 999 }}>
                {labelText}
              </span>
              <span style={{ opacity: 0.9, fontSize: 13, background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 6 }}>{formattedDate}</span>
              <span style={{ opacity: 0.9, fontSize: 14 }}>por {receta.creador}</span>
            </div>
            {loading ? (
              <div style={{ height: 120, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>Cargando destacada...</span>
              </div>
            ) : (
              <>
                <h2 className="font-display" style={{ fontSize: 'clamp(40px, 6vw, 64px)', margin: '0 0 12px', lineHeight: 1.05, letterSpacing: '-0.015em', textWrap: 'balance', cursor: 'pointer' }}>
                  {receta.titulo}
                </h2>
                <p style={{ fontSize: 18, opacity: 0.85, margin: 0, maxWidth: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {receta.descripcion}
                </p>
              </>
            )}
          </div>
          
          {/* Controls side panel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
            {/* Weekly Navigation Arrows */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: 28, padding: 4, border: '1px solid rgba(255,255,255,0.15)' }}>
              <button 
                onClick={onPrevDay} 
                disabled={diaOffset >= 6} 
                className="btn btn-icon focus-ring" 
                style={{ width: 44, height: 44, borderRadius: 22, color: 'var(--paper)', border: 'none', opacity: diaOffset >= 6 ? 0.3 : 1, cursor: diaOffset >= 6 ? 'not-allowed' : 'pointer' }}
                title="Día anterior"
              >
                <Icon name="back" size={16} />
              </button>
              <button 
                onClick={onNextDay} 
                disabled={diaOffset <= 0} 
                className="btn btn-icon focus-ring" 
                style={{ width: 44, height: 44, borderRadius: 22, color: 'var(--paper)', border: 'none', opacity: diaOffset <= 0 ? 0.3 : 1, cursor: diaOffset <= 0 ? 'not-allowed' : 'pointer', transform: 'rotate(180deg)' }}
                title="Día siguiente"
              >
                <Icon name="back" size={16} />
              </button>
            </div>
            
            {/* Favorite button */}
            <button onClick={onFav} className="btn btn-icon focus-ring" style={{ width: 52, height: 52, borderRadius: 26, background: 'var(--accent)', color: 'var(--paper)', border: 'none', boxShadow: 'var(--shadow-md)' }}>
              <Icon name={isFav ? 'bookmarkFilled' : 'bookmark'} size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────

const TIME_RANGES = [
  { key: 'lt15',  label: '< 15 min',  max: 15 },
  { key: '15-30', label: '15–30 min', min: 15, max: 30 },
  { key: '30-60', label: '30–60 min', min: 30, max: 60 },
  { key: '1-2h',  label: '1–2 horas', min: 60, max: 120 },
  { key: 'gt2h',  label: '+2 horas',  min: 120 },
];

const parseMinutes = (str) => {
  if (!str) return null;
  let mins = 0;
  const h = str.match(/(\d+(?:\.\d+)?)\s*(?:hora|h)/i);
  const m = str.match(/(\d+)\s*(?:min|m)/i);
  if (h) mins += parseFloat(h[1]) * 60;
  if (m) mins += parseInt(m[1]);
  return mins > 0 ? mins : null;
};

const matchesTiempoRango = (tiempo, rango) => {
  if (!rango) return true;
  const mins = parseMinutes(tiempo);
  if (mins === null) return false;
  const r = TIME_RANGES.find(t => t.key === rango);
  if (!r) return true;
  if (r.min !== undefined && mins < r.min) return false;
  if (r.max !== undefined && mins >= r.max) return false;
  return true;
};

const BrowseScreen = ({ user, onOpenRecipe, onCreateRecipe }) => {
  const [filters, setFilters] = useState({ categoria: '', dificultad: '', tiempoRango: '' });
  const [sortBy, setSortBy] = useState('');
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState('grid');
  const [data, setData] = useState({ recetas: [], total: 0 });
  const [recetaDelDia, setRecetaDelDia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState(new Set());
  const [diaOffset, setDiaOffset] = useState(0);
  const [loadingDestacada, setLoadingDestacada] = useState(false);
  const toast = useToast();

  const isDefaultView = !query && !filters.categoria && !filters.dificultad && !filters.tiempoRango && sortBy === '';

  useEffect(() => {
    if (!isDefaultView) return;
    let alive = true;
    setLoadingDestacada(true);
    const targetFecha = new Date(Date.now() - diaOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    window.api.recetaDelDia(targetFecha).then(res => {
      if (alive) {
        setRecetaDelDia(res.receta);
        setLoadingDestacada(false);
      }
    }).catch(() => {
      if (alive) setLoadingDestacada(false);
    });
    return () => { alive = false; };
  }, [diaOffset, isDefaultView]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    window.api.listarRecetas({
      categoria: filters.categoria || undefined,
      dificultad: filters.dificultad || undefined,
    }).then(res => {
      if (alive) { setData(res); setLoading(false); }
    });
    return () => { alive = false; };
  }, [filters.categoria, filters.dificultad]);

  useEffect(() => {
    window.api.obtenerUsuario(user.nombre).then(r => {
      setFavs(new Set(r.usuario.recetasFavoritas));
    });
  }, [user]);

  const filtered = useMemo(() => {
    let list = data.recetas;
    if (filters.tiempoRango) {
      list = list.filter(r => matchesTiempoRango(r.tiempo, filters.tiempoRango));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(r =>
        r.titulo.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q) ||
        r.creador.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'asc') {
      list = [...list].sort((a, b) => {
        const tA = parseMinutes(a.tiempo) || 0;
        const tB = parseMinutes(b.tiempo) || 0;
        return tA - tB;
      });
    } else if (sortBy === 'desc') {
      list = [...list].sort((a, b) => {
        const tA = parseMinutes(a.tiempo) || 0;
        const tB = parseMinutes(b.tiempo) || 0;
        return tB - tA;
      });
    }
    return list;
  }, [data.recetas, query, filters.tiempoRango, sortBy]);

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
  const hasActiveFilters = Object.values(filters).some(Boolean) || sortBy !== '';
  const activeFilters = Object.values(filters).filter(Boolean).length;

  return (
    <div data-screen-label="Browse" className="fade-in">
      {/* Header Info */}
      {!isDefaultView || !recetaDelDia ? (
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
                  Explorando <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>recetas</em>
                </h1>
              </div>

              <Button variant="primary" icon="plus" onClick={onCreateRecipe}>
                Nueva receta
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section style={{ marginBottom: 0 }}>
          <RecetaDelDiaHero 
            receta={recetaDelDia} 
            onOpen={() => onOpenRecipe(recetaDelDia.titulo)} 
            isFav={favs.has(recetaDelDia.titulo)} 
            onFav={() => toggleFav(recetaDelDia.titulo)} 
            user={user}
            diaOffset={diaOffset}
            onPrevDay={() => setDiaOffset(o => Math.min(6, o + 1))}
            onNextDay={() => setDiaOffset(o => Math.max(0, o - 1))}
            loading={loadingDestacada}
          />
        </section>
      )}

      {/* Search + filters */}
      <section style={{ position: 'sticky', top: 64, zIndex: 5, background: 'var(--cream)', borderBottom: '1px solid var(--rule)' }}>
        <div className="container" style={{ padding: '16px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 240 }}>
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
              <CustomDropdown
                placeholder="Toda categoría"
                value={filters.categoria}
                options={[{ value: '', label: 'Toda categoría' }, ...cats.map(c => ({ value: c, label: c }))] }
                optionLabel={(o) => o.label}
                optionValue={(o) => o.value}
                onChange={(v) => setFilters(f => ({ ...f, categoria: v }))}
                width="150px"
              />
              <CustomDropdown
                placeholder="Toda dificultad"
                value={filters.dificultad}
                options={[
                  { value: '', label: 'Toda dificultad' },
                  { value: 'Baja', label: 'Baja' },
                  { value: 'Media', label: 'Media' },
                  { value: 'Alta', label: 'Alta' }
                ]}
                optionLabel={(o) => o.label}
                optionValue={(o) => o.value}
                onChange={(v) => setFilters(f => ({ ...f, dificultad: v }))}
                width="140px"
              />
              <CustomDropdown
                placeholder="Cualquier tiempo"
                value={filters.tiempoRango}
                options={[
                  { value: '', label: 'Cualquier tiempo' },
                  ...TIME_RANGES.map(r => ({ value: r.key, label: r.label }))
                ]}
                optionLabel={(o) => o.label}
                optionValue={(o) => o.value}
                onChange={(v) => setFilters(f => ({ ...f, tiempoRango: v }))}
                width="150px"
              />
              <CustomDropdown
                placeholder="Orden: Por defecto"
                value={sortBy}
                options={[
                  { value: '', label: 'Orden: Por defecto' },
                  { value: 'asc', label: 'Tiempo: Menor a Mayor' },
                  { value: 'desc', label: 'Tiempo: Mayor a Menor' }
                ]}
                optionLabel={(o) => o.label}
                optionValue={(o) => o.value}
                onChange={(v) => setSortBy(v)}
                width="170px"
              />
              {hasActiveFilters && (
                <button
                  onClick={() => { setFilters({ categoria: '', dificultad: '', tiempoRango: '' }); setSortBy(''); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 40,
                    padding: '0 14px',
                    borderRadius: '999px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--ink-2)',
                    border: '1px solid var(--rule)',
                    background: 'transparent',
                    transition: 'all 0.18s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--paper-2)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--rule)';
                    e.currentTarget.style.color = 'var(--ink-2)';
                  }}
                >
                  <Icon name="close" size={12} /> Limpiar
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
              <Button variant="ghost" onClick={() => { setFilters({ categoria: '', dificultad: '', tiempoRango: '' }); setSortBy(''); setQuery(''); }}>
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
