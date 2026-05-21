/* eslint-disable */
// App shell: top nav + route state + tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#B8401F",
  "theme": "light",
  "density": "comfortable"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  { value: '#B8401F', label: 'Terracota' },
  { value: '#5C6B3A', label: 'Olivo' },
  { value: '#6B4226', label: 'Cacao' },
  { value: '#2E4A6B', label: 'Tinta' },
];

// ─────────────────────────────────────────────────────────────
//  NAV
// ─────────────────────────────────────────────────────────────
const TopNav = ({ user, route, onRoute, onLogout }) => {
  const items = [
    { id: 'browse', label: 'Recetas', icon: 'book' },
    { id: 'search', label: 'Buscar', icon: 'search' },
    { id: 'profile', label: 'Mi cocina', icon: 'user' },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'color-mix(in oklab, var(--cream) 90%, transparent)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--rule)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        height: 64,
      }}>
        <button onClick={() => onRoute({ name: 'browse' })} className="focus-ring" style={{ color: 'var(--ink)' }}>
          <Logo size={26} />
        </button>

        <nav style={{ display: 'flex', gap: 4 }}>
          {items.map(it => {
            const active = route.name === it.id;
            return (
              <button
                key={it.id}
                onClick={() => onRoute({ name: it.id })}
                className="focus-ring"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '0 16px', height: 38,
                  borderRadius: 999,
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? 'var(--paper)' : 'var(--ink-2)',
                  fontSize: 14, fontWeight: 500,
                  transition: 'background-color .18s ease, color .18s ease',
                }}
              >
                <Icon name={it.icon} size={15} />
                <span className="nav-label">{it.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            variant="accent"
            size="sm"
            icon="plus"
            onClick={() => onRoute({ name: 'create' })}
          >
            Nueva
          </Button>
          <UserMenu user={user} onLogout={onLogout} onRoute={onRoute} />
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .nav-label { display: none; }
        }
      `}</style>
    </header>
  );
};

const UserMenu = ({ user, onLogout, onRoute }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="focus-ring"
        style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'var(--ink)', color: 'var(--paper)',
          fontSize: 14, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Menú de usuario"
      >
        {user.nombre[0].toUpperCase()}
      </button>
      {open && (
        <div className="fade-in" style={{
          position: 'absolute',
          right: 0, top: 'calc(100% + 8px)',
          minWidth: 220,
          background: 'var(--paper-2)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--radius)',
          padding: 6,
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--rule-soft)', marginBottom: 4 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{user.nombre}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>{user.mail}</div>
          </div>
          <MenuItem icon="user" onClick={() => { onRoute({ name: 'profile' }); setOpen(false); }}>
            Mi cocina
          </MenuItem>
          <MenuItem icon="plus" onClick={() => { onRoute({ name: 'create' }); setOpen(false); }}>
            Nueva receta
          </MenuItem>
          <div style={{ height: 1, background: 'var(--rule-soft)', margin: '4px 0' }}/>
          <MenuItem icon="logout" onClick={() => { onLogout(); setOpen(false); }}>
            Cerrar sesión
          </MenuItem>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px',
      borderRadius: 'var(--radius-sm)',
      fontSize: 14,
      color: 'var(--ink)',
      textAlign: 'left',
      transition: 'background-color .12s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rule-soft)'}
    onMouseLeave={(e) => e.currentTarget.style.background = ''}
  >
    <Icon name={icon} size={14} />
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────────────────────
const App = () => {
  const LS_AUTH = 'recetario:user:v1';
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_AUTH) || 'null'); } catch { return null; }
  });
  const [route, setRoute] = useState({ name: 'browse' });
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Persist auth
  useEffect(() => {
    if (user) localStorage.setItem(LS_AUTH, JSON.stringify(user));
    else localStorage.removeItem(LS_AUTH);
  }, [user]);

  // Apply tweaks to CSS
  useEffect(() => {
    document.documentElement.dataset.theme = t.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.style.setProperty('--accent', t.accent);
    // derive --accent-2 by lightening
    const lighten = (hex, amt = 0.25) => {
      const c = hex.replace('#', '');
      const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
      const lr = Math.round(r + (255 - r) * amt);
      const lg = Math.round(g + (255 - g) * amt);
      const lb = Math.round(b + (255 - b) * amt);
      return `rgb(${lr},${lg},${lb})`;
    };
    document.documentElement.style.setProperty('--accent-2', lighten(t.accent, 0.3));
  }, [t.theme, t.accent]);

  const handleLogout = () => {
    setUser(null);
    setRoute({ name: 'browse' });
  };

  if (!user) {
    return (
      <ToastProvider>
        <AuthScreen onAuth={setUser} />
        <TweaksPanel title="Tweaks">
          <TweakSection label="Apariencia" />
          <TweakColor
            label="Acento"
            value={t.accent}
            options={ACCENT_OPTIONS.map(o => o.value)}
            onChange={v => setTweak('accent', v)}
          />
          <TweakRadio
            label="Tema"
            value={t.theme}
            options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }]}
            onChange={v => setTweak('theme', v)}
          />
        </TweaksPanel>
      </ToastProvider>
    );
  }

  // route dispatch
  let screen;
  switch (route.name) {
    case 'detail':
      screen = (
        <DetailScreen
          titulo={route.titulo}
          user={user}
          initialData={route.initialData}
          onBack={() => setRoute({ name: route.from || 'browse' })}
          onOpenRecipe={(t) => setRoute({ name: 'detail', titulo: t, from: route.from || 'browse' })}
        />
      );
      break;
    case 'search':
      screen = (
        <SearchScreen
          user={user}
          onOpenRecipe={(t) => setRoute({ name: 'detail', titulo: t, from: 'search' })}
        />
      );
      break;
    case 'profile':
      screen = (
        <ProfileScreen
          user={user}
          onOpenRecipe={(t) => setRoute({ name: 'detail', titulo: t, from: 'profile' })}
          onCreateRecipe={() => setRoute({ name: 'create' })}
          onExploreRecipes={() => setRoute({ name: 'browse' })}
        />
      );
      break;
    case 'create':
      screen = (
        <CreateRecipeScreen
          user={user}
          onBack={() => setRoute({ name: 'browse' })}
          onCreated={(t, initialData) => setRoute({ name: 'detail', titulo: t, from: 'browse', initialData })}
        />
      );
      break;
    default:
      screen = (
        <BrowseScreen
          user={user}
          onOpenRecipe={(t) => setRoute({ name: 'detail', titulo: t, from: 'browse' })}
          onCreateRecipe={() => setRoute({ name: 'create' })}
        />
      );
  }

  return (
    <ToastProvider>
      <TopNav user={user} route={route} onRoute={setRoute} onLogout={handleLogout} />
      <main>{screen}</main>

      <footer style={{
        borderTop: '1px solid var(--rule)',
        padding: '32px 0',
        marginTop: 0,
        background: 'var(--paper)',
      }}>
        <div className="container" style={{ padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Logo size={20} />
          <div className="text-faint" style={{ fontSize: 12 }}>
            Una colección de cosas ricas · Conectado a Neo4j
          </div>
        </div>
      </footer>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Apariencia" />
        <TweakColor
          label="Acento"
          value={t.accent}
          options={ACCENT_OPTIONS.map(o => o.value)}
          onChange={v => setTweak('accent', v)}
        />
        <TweakRadio
          label="Tema"
          value={t.theme}
          options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }]}
          onChange={v => setTweak('theme', v)}
        />
        <TweakSection label="Datos" />
        <TweakButton label="Reiniciar al seed original" onClick={() => window.__resetSeed?.()} />
      </TweaksPanel>
    </ToastProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
