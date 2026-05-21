/* eslint-disable */
const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

// ============================================================
//  Icons — inline strokes, no library, all 1.6 stroke
// ============================================================
const Icon = ({ name, size = 18, stroke = 1.6 }) => {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  const paths = {
    home:    <><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></>,
    search:  <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    book:    <><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Z"/><path d="M4 17a3 3 0 0 1 3-3h11"/></>,
    heart:   <><path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z"/></>,
    heartFilled: <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" fill="currentColor" stroke="currentColor"/>,
    plus:    <><path d="M12 5v14M5 12h14"/></>,
    user:    <><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></>,
    arrow:   <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    back:    <><path d="M19 12H5M11 19l-7-7 7-7"/></>,
    close:   <><path d="M18 6 6 18M6 6l12 12"/></>,
    clock:   <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    flame:   <><path d="M12 2s4 3.5 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3-1 2-3 3-3 6a6 6 0 1 0 12 0c0-5-3-8-6-11Z"/></>,
    chef:    <><path d="M8 13c-2 0-3.5-1.5-3.5-3.5 0-1.7 1.3-3.2 3-3.4C8 4.3 9.8 3 12 3s4 1.3 4.5 3.1c1.7.2 3 1.7 3 3.4 0 2-1.5 3.5-3.5 3.5"/><path d="M7 13h10v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6Z"/></>,
    bookmark:<><path d="M6 4h12v17l-6-4-6 4V4Z"/></>,
    bookmarkFilled: <path d="M6 4h12v17l-6-4-6 4V4Z" fill="currentColor" stroke="currentColor"/>,
    leaf:    <><path d="M21 3s-9-1-14 4-3 13-3 13 8 1 13-4 4-13 4-13Z"/><path d="M4 20 14 10"/></>,
    sliders: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></>,
    check:   <><path d="m5 12 5 5L20 7"/></>,
    sparkle: <><path d="M12 3 13.5 9 19 10.5 13.5 12 12 18 10.5 12 5 10.5 10.5 9 12 3Z"/><path d="M19 16v4M17 18h4"/></>,
    pot:     <><path d="M5 9h14l-1 11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 9Z"/><path d="M3 9h18"/><path d="M9 5v2M15 5v2"/></>,
    logout:  <><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></>,
    trash:   <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>,
    moon:    <><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></>,
  };
  return <svg {...props}>{paths[name] || null}</svg>;
};

// ============================================================
//  Logo
// ============================================================
const Logo = ({ size = 28 }) => (
  <div className="flex items-center gap-2" aria-label="recetario">
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10 20 C 10 12, 22 12, 22 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="1.6" fill="currentColor"/>
      <path d="M16 8 L 16 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
    <span className="font-display" style={{ fontSize: size * 0.78, lineHeight: 1, letterSpacing: '-0.02em' }}>recetario</span>
  </div>
);

// ============================================================
//  Buttons
// ============================================================
const Button = ({ variant = 'primary', size, icon, iconRight, children, className = '', ...rest }) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button className={`btn btn-${variant} ${sizeClass} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={16} />}
    </button>
  );
};

const IconButton = ({ name, size = 'md', label, className = '', ...rest }) => (
  <button
    aria-label={label}
    title={label}
    className={`btn btn-ghost btn-icon ${size === 'sm' ? 'btn-sm' : ''} ${className}`}
    {...rest}
  >
    <Icon name={name} size={size === 'sm' ? 14 : 18} />
  </button>
);

// ============================================================
//  Badges, chips, dividers
// ============================================================
const CAT_COLORS = {
  'SIN TACC':    'var(--cat-sintacc)',
  'Vegetariano': 'var(--cat-veg)',
  'Vegano':      'var(--cat-vegano)',
  'Pastas':      'var(--cat-pastas)',
  'Postre':      'var(--cat-postre)',
};

const CategoryBadge = ({ name, size = 'md' }) => {
  const color = CAT_COLORS[name] || 'var(--ink-3)';
  return (
    <span
      className="badge"
      style={{
        color,
        background: 'transparent',
        borderColor: 'currentColor',
        height: size === 'sm' ? 22 : 26,
        fontSize: size === 'sm' ? 11 : 12,
      }}
    >
      <span className="badge-dot" />
      {name}
    </span>
  );
};

const Dificultad = ({ value }) => {
  const filled = { Baja: 1, Media: 2, Alta: 3 }[value] || 0;
  return (
    <span className="flex items-center gap-2" title={`Dificultad ${value}`}>
      <span className="flex gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: 6, height: 6, borderRadius: 999,
              background: i < filled ? 'var(--ink)' : 'var(--rule)',
            }}
          />
        ))}
      </span>
      <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{value}</span>
    </span>
  );
};

const Tiempo = ({ value }) => (
  <span className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
    <Icon name="clock" size={13} />
    {value}
  </span>
);

const Chip = ({ active, onClick, removable, onRemove, children }) => (
  <button
    onClick={onClick}
    className={`chip ${active ? 'chip-active' : ''} ${removable ? 'chip-removable' : ''}`}
    type="button"
  >
    {children}
    {removable && (
      <button type="button" onClick={(e) => { e.stopPropagation(); onRemove?.(); }} aria-label="quitar">
        <Icon name="close" size={11} />
      </button>
    )}
  </button>
);

// ============================================================
//  Visual recipe cover — typographic, no real photos.
//  Deterministic gradient + serif title overlay per recipe.
// ============================================================
const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

const RecipeCover = ({ titulo, categoria, height = 220, compact = false }) => {
  const base = CAT_COLORS[categoria] || 'var(--ink)';
  const seed = hash(titulo);
  const rot = seed % 360;
  const angle = (seed % 4) * 12 + 124;
  // Build a soft duo-tone wash from category color + paper
  return (
    <div
      className="relative"
      style={{
        height,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: `linear-gradient(${angle}deg, ${base} 0%, color-mix(in oklab, ${base} 70%, var(--paper)) 60%, var(--paper-2) 110%)`,
        boxShadow: 'inset 0 0 0 1px rgba(28,24,20,.06)',
      }}
    >
      {/* paper texture via radial dots */}
      <svg
        style={{ position: 'absolute', inset: 0, opacity: 0.08, mixBlendMode: 'multiply' }}
        width="100%" height="100%"
      >
        <defs>
          <pattern id={`p-${seed}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform={`rotate(${rot})`}>
            <circle cx="3" cy="3" r="0.8" fill="rgba(28,24,20,.6)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p-${seed})`}/>
      </svg>



      {/* title */}
      <div
        className="font-display"
        style={{
          position: 'absolute',
          left: compact ? 14 : 20,
          right: compact ? 14 : 20,
          bottom: compact ? 12 : 18,
          color: 'var(--paper)',
          fontSize: compact ? 22 : Math.min(34, 220 / Math.max(8, titulo.length / 2)),
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          textWrap: 'balance',
          textShadow: '0 1px 24px rgba(0,0,0,.18)',
        }}
      >
        {titulo}
      </div>
    </div>
  );
};

// ============================================================
//  Toast
// ============================================================
const ToastCtx = createContext(null);
const useToast = () => useContext(ToastCtx);

const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, opts = {}) => {
    setToast({ msg, icon: opts.icon || 'check' });
    setTimeout(() => setToast(null), opts.duration || 2200);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <Icon name={toast.icon} size={16} />
          {toast.msg}
        </div>
      )}
    </ToastCtx.Provider>
  );
};

// ============================================================
//  Skeletons
// ============================================================
const SkeletonCard = () => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    <div className="skeleton" style={{ height: 220, borderRadius: 0 }}/>
    <div style={{ padding: 18 }}>
      <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 10 }}/>
      <div className="skeleton" style={{ height: 12, width: '85%' }}/>
    </div>
  </div>
);

// ============================================================
//  Empty state
// ============================================================
const EmptyState = ({ icon = 'pot', title, children, action }) => (
  <div className="flex flex-col items-center text-center" style={{ padding: '64px 24px', gap: 16 }}>
    <div style={{
      width: 56, height: 56, borderRadius: 999,
      background: 'var(--paper)',
      border: '1px solid var(--rule)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--ink-3)',
    }}>
      <Icon name={icon} size={22} />
    </div>
    <div>
      <div className="font-display" style={{ fontSize: 26, marginBottom: 4 }}>{title}</div>
      <div className="text-muted" style={{ maxWidth: 360 }}>{children}</div>
    </div>
    {action}
  </div>
);

// expose to window
Object.assign(window, {
  Icon, Logo, Button, IconButton, CategoryBadge, Dificultad, Tiempo, Chip,
  RecipeCover, CAT_COLORS, ToastProvider, useToast, SkeletonCard, EmptyState,
});
