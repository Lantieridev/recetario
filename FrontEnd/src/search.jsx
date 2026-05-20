/* eslint-disable */
// Búsqueda inteligente: "tengo" vs "no quiero" → coincidencias + faltantes
// Uses GET /api/recetas/buscar

const SearchScreen = ({ user, onOpenRecipe }) => {
  const [tengo, setTengo] = useState([]);
  const [noQuiero, setNoQuiero] = useState([]);
  const [input, setInput] = useState('');
  const [active, setActive] = useState('tengo');     // which list the input adds to
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allIngs, setAllIngs] = useState([]);
  const [favs, setFavs] = useState(new Set());
  const toast = useToast();

  useEffect(() => {
    setAllIngs(window.api.todosIngredientes());
    window.api.obtenerUsuario(user.nombre).then(r => setFavs(new Set(r.usuario.recetasFavoritas)));
  }, [user]);

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    const taken = new Set([...tengo, ...noQuiero]);
    return allIngs.filter(i => i.toLowerCase().includes(q) && !taken.has(i)).slice(0, 6);
  }, [input, tengo, noQuiero, allIngs]);

  const add = (ing) => {
    const v = (ing ?? input).trim();
    if (!v) return;
    const target = active === 'tengo' ? tengo : noQuiero;
    const setter = active === 'tengo' ? setTengo : setNoQuiero;
    if (target.includes(v)) return;
    setter([...target, v]);
    setInput('');
  };

  const remove = (list, val) => {
    if (list === 'tengo') setTengo(tengo.filter(t => t !== val));
    else setNoQuiero(noQuiero.filter(t => t !== val));
  };

  const buscar = async () => {
    if (tengo.length === 0) {
      toast('Agregá al menos un ingrediente que tengas');
      return;
    }
    setLoading(true);
    try {
      const res = await window.api.buscarPorIngredientes({ tengo, noQuiero });
      setResults(res);
    } catch (err) {
      toast(err.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setTengo([]); setNoQuiero([]); setResults(null); setInput('');
  };

  const toggleFav = async (titulo) => {
    const res = await window.api.toggleFavorito(user.nombre, titulo);
    setFavs(prev => {
      const n = new Set(prev);
      if (res.added) n.add(titulo); else n.delete(titulo);
      return n;
    });
    toast(res.added ? 'Guardado en favoritos' : 'Quitado', { icon: res.added ? 'bookmarkFilled' : 'check' });
  };

  return (
    <div data-screen-label="Search" className="fade-in">
      {/* Header */}
      <section style={{ padding: '56px 0 36px' }}>
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 14 }}>Buscador inteligente</div>
          <h1 className="font-display" style={{
            fontSize: 'clamp(44px, 5.5vw, 68px)',
            margin: '0 0 16px',
            lineHeight: 1.0,
            letterSpacing: '-0.025em',
            textWrap: 'balance',
          }}>
            ¿Qué tenés <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>en la heladera</em>?
          </h1>
          <p className="text-muted" style={{ fontSize: 17, margin: 0, maxWidth: 620 }}>
            Decinos qué ingredientes tenés y cuáles querés evitar.
            Te mostramos las recetas que más se ajustan y qué te falta para cada una.
          </p>
        </div>
      </section>

      {/* Composer */}
      <section className="container" style={{ padding: '0 32px 48px' }}>
        <div style={{
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--radius-xl)',
          padding: 28,
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: 4, background: 'var(--cream)', border: '1px solid var(--rule)', borderRadius: 999, width: 'fit-content' }}>
            <TabButton active={active === 'tengo'} onClick={() => setActive('tengo')}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--cat-veg)' }}/>
              Tengo ({tengo.length})
            </TabButton>
            <TabButton active={active === 'noQuiero'} onClick={() => setActive('noQuiero')}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--accent)' }}/>
              No quiero ({noQuiero.length})
            </TabButton>
          </div>

          {/* Input with autocomplete */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              className="input"
              style={{ height: 56, fontSize: 17, paddingLeft: 20, paddingRight: 130 }}
              placeholder={active === 'tengo' ? 'Ej: pollo, harina, cebolla…' : 'Ej: maní, gluten, lácteos…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            />
            <Button
              size="sm"
              variant="primary"
              icon="plus"
              onClick={() => add()}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
            >
              Agregar
            </Button>

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
                    onClick={() => add(s)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'background-color .12s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rule-soft)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = ''}
                  >
                    <span>{s}</span>
                    <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>↵ Enter</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Two lists side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="search-lists">
            <IngredientList
              title="Tengo"
              accentColor="var(--cat-veg)"
              icon="check"
              items={tengo}
              onAdd={() => setActive('tengo')}
              onRemove={(v) => remove('tengo', v)}
              emptyText="Agregá los ingredientes que tenés a mano"
              isActive={active === 'tengo'}
            />
            <IngredientList
              title="No quiero"
              accentColor="var(--accent)"
              icon="close"
              items={noQuiero}
              onAdd={() => setActive('noQuiero')}
              onRemove={(v) => remove('noQuiero', v)}
              emptyText="(Opcional) Excluí ingredientes"
              isActive={active === 'noQuiero'}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--rule)' }}>
            <button
              className="btn-link"
              onClick={clearAll}
              disabled={tengo.length === 0 && noQuiero.length === 0}
              style={{ fontSize: 13, color: 'var(--ink-3)' }}
            >
              Limpiar todo
            </button>
            <Button variant="accent" icon="sparkle" onClick={buscar} disabled={loading || tengo.length === 0}>
              {loading ? 'Buscando…' : `Buscar recetas (${tengo.length})`}
            </Button>
          </div>
        </div>
      </section>

      {/* Results */}
      {results && (
        <section className="container fade-in" style={{ padding: '0 32px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 28 }}>
            <h2 className="font-display" style={{ fontSize: 36, margin: 0, letterSpacing: '-0.02em' }}>
              {results.totalResultados} {results.totalResultados === 1 ? 'receta' : 'recetas'}
            </h2>
            <span className="text-muted" style={{ fontSize: 15 }}>
              ordenadas por coincidencias
            </span>
          </div>

          {results.totalResultados === 0 ? (
            <EmptyState
              icon="pot"
              title="No encontramos coincidencias"
              action={<Button variant="ghost" onClick={clearAll}>Empezar de nuevo</Button>}
            >
              Probá ampliando tu lista de ingredientes o quitando alguno de la lista de exclusión.
            </EmptyState>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {results.resultados.map((r, i) => (
                <SearchResultCard
                  key={r.receta}
                  result={r}
                  onOpen={() => onOpenRecipe(r.receta)}
                  isFav={favs.has(r.receta)}
                  onFav={() => toggleFav(r.receta)}
                  rank={i + 1}
                  topMatch={results.resultados[0]?.coincidencias}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <style>{`
        @media (max-width: 720px) {
          .search-lists { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '0 16px', height: 32,
      borderRadius: 999,
      background: active ? 'var(--ink)' : 'transparent',
      color: active ? 'var(--paper)' : 'var(--ink-2)',
      fontSize: 13, fontWeight: 500,
      transition: 'background-color .18s',
    }}
  >
    {children}
  </button>
);

const IngredientList = ({ title, accentColor, icon, items, onAdd, onRemove, emptyText, isActive }) => (
  <div
    onClick={onAdd}
    style={{
      padding: 18,
      background: 'var(--cream)',
      border: `1px solid ${isActive ? accentColor : 'var(--rule)'}`,
      borderRadius: 'var(--radius)',
      minHeight: 140,
      cursor: 'pointer',
      transition: 'border-color .18s, background-color .18s',
      position: 'relative',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{
        width: 22, height: 22, borderRadius: 999,
        background: accentColor, color: 'var(--paper)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={12} stroke={2.4}/>
      </span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
      <span className="text-faint" style={{ fontSize: 12, marginLeft: 'auto' }}>{items.length}</span>
    </div>

    {items.length === 0 ? (
      <div className="text-faint" style={{ fontSize: 13, fontStyle: 'italic' }}>{emptyText}</div>
    ) : (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {items.map(item => (
          <Chip key={item} removable onRemove={() => onRemove(item)}>
            {item}
          </Chip>
        ))}
      </div>
    )}
  </div>
);

const SearchResultCard = ({ result, onOpen, isFav, onFav, rank, topMatch }) => {
  const pct = topMatch ? (result.coincidencias / topMatch) : 1;
  return (
    <div
      onClick={onOpen}
      className="card card-hover focus-ring"
      style={{
        display: 'grid',
        gridTemplateColumns: '60px 200px 1fr auto',
        gap: 24,
        padding: 16,
        alignItems: 'center',
        cursor: 'pointer',
      }}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
    >
      <div className="font-display" style={{ fontSize: 38, color: 'var(--ink-3)', letterSpacing: '-0.03em', textAlign: 'center' }}>
        {String(rank).padStart(2, '0')}
      </div>

      <div style={{ width: 200, height: 110 }}>
        <RecipeCover titulo={result.receta} categoria={result.categoria} height={110} compact />
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <CategoryBadge name={result.categoria} size="sm" />
          <Tiempo value={result.tiempo} />
          <Dificultad value={result.dificultad} />
        </div>
        <div className="font-display" style={{ fontSize: 22, lineHeight: 1.2, marginBottom: 8, letterSpacing: '-0.015em' }}>
          {result.receta}
        </div>

        {/* match bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1, maxWidth: 240, height: 4, background: 'var(--rule)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct * 100}%`,
              background: 'var(--cat-veg)',
              transition: 'width .4s ease',
            }}/>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-2)' }}>
            {result.coincidencias} / {result.totalIngredientes} ingredientes
          </span>
        </div>

        {result.queTeFalta.length > 0 ? (
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            <span style={{ color: 'var(--ink-4)' }}>Te falta: </span>
            {result.queTeFalta.slice(0, 5).join(', ')}
            {result.queTeFalta.length > 5 && ` y ${result.queTeFalta.length - 5} más`}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--cat-veg)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="check" size={13} stroke={2.4}/> Tenés todo lo necesario
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onFav(); }}
          className="btn btn-icon btn-ghost btn-sm"
          aria-label="Guardar"
          style={{ color: isFav ? 'var(--accent)' : 'var(--ink-3)' }}
        >
          <Icon name={isFav ? 'bookmarkFilled' : 'bookmark'} size={15}/>
        </button>
        <Icon name="arrow" size={16} stroke={1.4} />
      </div>
    </div>
  );
};

Object.assign(window, { SearchScreen });
