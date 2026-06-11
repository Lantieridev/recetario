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
const Button = ({ variant = 'primary', size, icon, iconRight, loading, children, className = '', ...rest }) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button 
      className={`btn btn-${variant} ${sizeClass} ${className}`} 
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <span style={{ 
          display: 'inline-block', 
          width: 14, 
          height: 14, 
          border: '2px solid currentColor', 
          borderTopColor: 'transparent', 
          borderRadius: '50%', 
          animation: 'btn-spin 0.8s linear infinite', 
          marginRight: 8,
          verticalAlign: 'middle'
        }} />
      )}
      {!loading && icon && <Icon name={icon} size={16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={16} />}
      <style>{`
        @keyframes btn-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
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
  'SIN TACC':      'var(--cat-sintacc)',
  'Vegetariano':   'var(--cat-veg)',
  'Vegano':        'var(--cat-vegano)',
  'Pastas':        'var(--cat-pastas)',
  'Postre':        'var(--cat-postre)',
  'Comida rápida': 'var(--cat-fastfood)',
  'Bebidas':       'var(--cat-bebidas)',
  'Carnes':        'var(--cat-carnes)',
  'Minutas':       'var(--cat-minutas)',
  'Panadería':     'var(--cat-panaderia)',
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

// ============================================================
//  Fase 2A: New Reusable Components
// ============================================================

const HoursMinutesInput = ({ value = { hs: '', min: '' }, onChange }) => {
  const blockInvalidChars = (e) => {
    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ flex: 1 }}>
        <input
          type="number"
          className="input"
          min="0"
          placeholder="0"
          value={value.hs}
          onChange={(e) => onChange({ ...value, hs: e.target.value })}
          onKeyDown={blockInvalidChars}
          style={{ textAlign: 'center', padding: '8px 4px' }}
        />
        <div className="font-mono text-muted" style={{ fontSize: 10, textAlign: 'center', marginTop: 4 }}>hs</div>
      </div>
      <div style={{ paddingTop: 8, color: 'var(--ink-3)' }}>:</div>
      <div style={{ flex: 1 }}>
        <input
          type="number"
          className="input"
          min="0"
          max="59"
          placeholder="0"
          value={value.min}
          onChange={(e) => onChange({ ...value, min: e.target.value })}
          onKeyDown={blockInvalidChars}
          style={{ textAlign: 'center', padding: '8px 4px' }}
        />
        <div className="font-mono text-muted" style={{ fontSize: 10, textAlign: 'center', marginTop: 4 }}>min</div>
      </div>
    </div>
  );
};

const COOKING_METHODS = [
  'Horno', 'Airfryer', 'Microondas', 'Hornalla',
  'Olla a presión', 'Parrilla', 'Plancha', 'Sin Cocción'
];

const CookingMethodChips = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {COOKING_METHODS.map(m => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className="chip focus-ring"
          style={{
            background: value === m ? 'var(--ink)' : 'var(--paper)',
            color: value === m ? 'var(--paper)' : 'var(--ink)',
            borderColor: value === m ? 'var(--ink)' : 'var(--rule)',
            padding: '6px 12px',
            fontSize: 13
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
};

const ImageSuggestionStrip = ({ query, onSelect }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  useEffect(() => {
    if (!query || query.length < 3) {
      setImages([]);
      return;
    }
    setLoading(true);
    // Simular fetch a la API
    const timer = setTimeout(() => {
      setImages([
        `/api/placeholder/400/300?text=${encodeURIComponent(query)}+1`,
        `/api/placeholder/400/300?text=${encodeURIComponent(query)}+2`,
        `/api/placeholder/400/300?text=${encodeURIComponent(query)}+3`,
        `/api/placeholder/400/300?text=${encodeURIComponent(query)}+4`
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [query]);

  if (!query || query.length < 3) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div className="eyebrow" style={{ marginBottom: 8, fontSize: 11 }}>Sugerencias para "{query}"</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius)' }} />)
        ) : (
          images.map((src, i) => (
            <div
              key={i}
              onClick={() => { setSelectedIdx(i); onSelect(src); }}
              className="focus-ring"
              style={{
                position: 'relative',
                height: 80,
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: selectedIdx === i ? '2px solid var(--accent)' : '1px solid var(--rule)'
              }}
            >
              <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Sugerencia" />
              {selectedIdx === i && (
                <div style={{ position: 'absolute', top: 4, right: 4, background: 'var(--paper)', borderRadius: '50%', color: 'var(--accent)', display: 'flex', padding: 2 }}>
                  <Icon name="check" size={12} stroke={3} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================
//  Fase 2B: New Reusable Components
// ============================================================

const TimerModal = ({ duration = 300, onComplete, onCancel, inline = false }) => {
  const [left, setLeft] = useState(duration);
  const [running, setRunning] = useState(true);
  
  useEffect(() => {
    if (!running || left <= 0) return;
    const t = setInterval(() => {
      setLeft(l => {
        if (l <= 1) {
          clearInterval(t);
          if (onComplete) onComplete();
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, left, onComplete]);

  const pct = left / duration;
  const mm = Math.floor(left / 60).toString().padStart(2, '0');
  const ss = (left % 60).toString().padStart(2, '0');
  const isDone = left === 0;

  useEffect(() => {
    if (isDone) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        // Synthesize a pleasant "microwave ding" (A Major chord)
        [880.00, 1108.73, 1318.51].forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 2.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 2.5);
        });
      } catch (e) { console.warn('Audio no soportado', e); }
    }
  }, [isDone]);

  const widget = (
    <div className="fade-in" style={{
      width: inline ? 320 : '90%', maxWidth: 420, height: inline ? 'auto' : 440, 
      background: inline ? 'transparent' : 'var(--paper-2)', 
      borderRadius: 'var(--radius-xl)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxShadow: inline ? 'none' : '0 24px 48px rgba(0,0,0,.2)',
      padding: inline ? 0 : 32
    }}>
      <div style={{ position: 'relative', width: inline ? 200 : 280, height: inline ? 200 : 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100%" height="100%" viewBox="0 0 280 280" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="140" cy="140" r="130" fill="none" stroke="var(--rule)" strokeWidth="6" />
          <circle 
            cx="140" cy="140" r="130" fill="none" 
            stroke={isDone ? 'var(--cat-veg)' : 'var(--accent)'} 
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 130}
            strokeDashoffset={2 * Math.PI * 130 * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="font-display" style={{ fontSize: inline ? 56 : 80, lineHeight: 1, letterSpacing: '-0.02em', color: isDone ? 'var(--cat-veg)' : 'var(--ink)' }}>
          {isDone ? '¡Listo!' : `${mm}:${ss}`}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 16, marginTop: inline ? 24 : 40 }}>
        {!isDone && (
          <Button variant={running ? 'ghost' : 'accent'} icon={running ? 'clock' : 'clock'} onClick={() => setRunning(!running)}>
            {running ? 'Pausar' : 'Reanudar'}
          </Button>
        )}
        <Button variant={isDone ? 'primary' : 'ghost'} onClick={onCancel}>
          {isDone ? 'Cerrar' : 'Cancelar'}
        </Button>
      </div>
    </div>
  );

  if (inline) return widget;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(28,24,20,.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {widget}
    </div>
  );
};

const RecipeCarousel = ({ recipes, onOpenRecipe }) => {
  const scrollRef = useRef(null);

  const scrollBy = (amount) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => scrollBy(-300)} className="btn-icon btn-ghost focus-ring" style={{ position: 'absolute', left: -24, top: '40%', zIndex: 2, background: 'var(--paper)', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
        <Icon name="back" size={20} />
      </button>
      <div 
        ref={scrollRef}
        style={{ 
          display: 'flex', gap: 24, overflowX: 'auto', scrollSnapType: 'x mandatory', 
          scrollbarWidth: 'none', padding: '16px 4px'
        }}
      >
        {recipes.map(r => (
          <div key={r.titulo} style={{ width: 280, flexShrink: 0, scrollSnapAlign: 'start', cursor: 'pointer' }} onClick={() => onOpenRecipe(r.id)}>
            <div className="card card-hover focus-ring" style={{ padding: 12, textAlign: 'left' }}>
              <RecipeCover titulo={r.titulo} categoria={r.categoria} height={160} compact />
              <div className="font-display" style={{ fontSize: 20, marginTop: 16, letterSpacing: '-0.01em', lineHeight: 1.1 }}>{r.titulo}</div>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 6 }}>{r.tiempo} · {r.dificultad}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scrollBy(300)} className="btn-icon btn-ghost focus-ring" style={{ position: 'absolute', right: -24, top: '40%', zIndex: 2, background: 'var(--paper)', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
        <Icon name="arrow" size={20} />
      </button>
    </div>
  );
};

// ============================================================
//  Fase 3: Comunidad & Perfil Components
// ============================================================

const FollowButton = ({ isFollowing, onToggle, variant = 'primary' }) => {
  return (
    <Button 
      variant={isFollowing ? 'ghost' : variant}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      style={{
        border: isFollowing ? '1px solid var(--rule)' : 'none',
        height: 32,
        padding: '0 16px',
        fontSize: 13,
      }}
    >
      {isFollowing ? 'Siguiendo' : 'Seguir'}
    </Button>
  );
};

const DesafioCard = ({ title, desc, participants, onJoin }) => {
  return (
    <div className="card focus-ring" style={{ padding: 24, textAlign: 'left', background: 'var(--paper)', border: '1px solid var(--rule)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ padding: '2px 8px', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', borderRadius: 12 }}>
              Desafío activo
            </span>
          </div>
          <h3 className="font-display" style={{ fontSize: 24, margin: '0 0 8px', lineHeight: 1.1 }}>{title}</h3>
          <p className="text-muted" style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.5 }}>{desc}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--rule-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)', fontSize: 13 }}>
          <Icon name="user" size={14} /> {participants} unidos
        </div>
        <Button variant="ghost" onClick={onJoin}>Unirse al desafío</Button>
      </div>
    </div>
  );
};

// ============================================================
//  Fase 1: Migrated Components
// ============================================================

const CleanRecipeImage = ({
  titulo,
  categoria,
  imagenUrl,
  height = 200,
  width,
  showCategoryPill = true,
  radius,
}) => {
  const style = {
    width: width || '100%',
    height,
    borderRadius: radius || 'var(--radius-lg)',
    overflow: 'hidden',
    position: 'relative',
    background: 'var(--rule-soft)',
    boxShadow: 'inset 0 0 0 1px rgba(28,24,20,.04)',
    flexShrink: 0,
  };

  if (!imagenUrl) {
    return (
      <div style={style}>
        <RecipeCover titulo={titulo} categoria={categoria} height={height} compact={height < 160} variant="typographic" />
      </div>
    );
  }

  return (
    <div style={style}>
      <img
        src={imagenUrl}
        alt={titulo}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {showCategoryPill && (
        <span style={{
          position: 'absolute', top: 12, left: 12, padding: '4px 10px',
          background: 'rgba(28,24,20,.65)', backdropFilter: 'blur(8px)',
          color: 'var(--paper)', borderRadius: 999, fontSize: 11, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '0.02em',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999,
            background: CAT_COLORS[categoria] || 'var(--paper)',
          }}/>
          {categoria}
        </span>
      )}
    </div>
  );
};

const VerifiedBadge = ({ size = 14, title = 'Usuario verificado' }) => (
  <span
    title={title} aria-label={title}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: 999, background: 'var(--ink)',
      color: 'var(--paper)', flexShrink: 0,
    }}
  >
    <svg width={Math.round(size * 0.65)} height={Math.round(size * 0.65)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7"/>
    </svg>
  </span>
);

const THEME_LS_KEY = 'recetario:theme:v1';
const useTheme = () => {
  const [theme, setThemeState] = useState(() => {
    try { const stored = localStorage.getItem(THEME_LS_KEY); if (stored === 'light' || stored === 'dark') return stored; } catch {}
    if (typeof window !== 'undefined' && window.matchMedia) return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return 'light';
  });

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try { localStorage.setItem(THEME_LS_KEY, next); } catch {}
  }, []);

  return [theme, setTheme];
};

const ThemeToggle = ({ value, onChange, compact = false }) => {
  const [internalTheme, setInternalTheme] = useTheme();
  const theme = value ?? internalTheme;
  const setTheme = onChange ?? setInternalTheme;

  const opts = [
    { v: 'light', icon: 'sun',  label: 'Claro' },
    { v: 'dark',  icon: 'moon', label: 'Oscuro' },
  ];

  return (
    <div role="radiogroup" aria-label="Tema" style={{ display: 'inline-flex', gap: 2, padding: 3, background: 'var(--cream)', border: '1px solid var(--rule)', borderRadius: 999 }}>
      {opts.map(o => {
        const active = theme === o.v;
        return (
          <button
            key={o.v} role="radio" aria-checked={active} onClick={() => setTheme(o.v)} title={o.label}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: compact ? '0 8px' : '0 12px',
              height: compact ? 24 : 28, borderRadius: 999, background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--paper)' : 'var(--ink-2)', fontSize: 12, fontWeight: 500,
              transition: 'background-color .2s ease, color .2s ease',
            }}
          >
            <Icon name={o.icon} size={compact ? 12 : 13} />
            {!compact && <span>{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

const useClickOutsideCD = (ref, onClose) => {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
};

const CustomDropdownMenu = ({ value, options, onChange, optionLabel, optionValue, optionDot, align }) => (
  <div
    role="listbox"
    style={{
      position: 'absolute', top: 'calc(100% + 8px)', [align]: 0, minWidth: 200,
      background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-lg)', padding: 5, zIndex: 100, maxHeight: 320, overflowY: 'auto',
      fontFamily: 'var(--font-body)', textAlign: 'left', animation: 'cdFade .18s ease-out',
    }}
  >
    {value !== '' && value !== null && value !== undefined && (
      <>
        <button
          onClick={() => onChange('')}
          style={{
            width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13,
            color: 'var(--ink-3)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rule-soft)'}
          onMouseLeave={(e) => e.currentTarget.style.background = ''}
        >
          <Icon name="close" size={12}/> Quitar filtro
        </button>
        <div style={{ height: 1, background: 'var(--rule-soft)', margin: '4px 0' }}/>
      </>
    )}
    {options.map((opt, i) => {
      const v = optionValue(opt);
      const isSel = v === value;
      const dot = optionDot ? optionDot(opt) : null;
      return (
        <button
          key={i} role="option" aria-selected={isSel} onClick={() => onChange(v)}
          style={{
            width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 13,
            color: 'var(--ink)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            background: isSel ? 'var(--rule-soft)' : 'transparent',
            transition: 'background-color .12s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rule-soft)'}
          onMouseLeave={(e) => e.currentTarget.style.background = isSel ? 'var(--rule-soft)' : 'transparent'}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {dot && <span style={{ width: 7, height: 7, borderRadius: 999, background: dot }}/>}
            {optionLabel(opt)}
          </span>
          {isSel && <Icon name="check" size={13}/>}
        </button>
      );
    })}
    <style>{`
      @keyframes cdFade {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
);

const CustomDropdown = ({
  label, value, options, onChange, placeholder = 'cualquiera',
  accent, variant = 'inline', align = 'left', width,
  optionLabel = (o) => o, optionValue = (o) => o, optionDot = () => null,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutsideCD(ref, () => setOpen(false));

  const active = value !== '' && value !== null && value !== undefined;
  const displayValue = active
    ? (options.find(o => optionValue(o) === value) ? optionLabel(options.find(o => optionValue(o) === value)) : value)
    : placeholder;

  if (variant === 'inline') {
    return (
      <span ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-display)',
            fontSize: 'inherit', color: active ? 'var(--accent)' : 'var(--ink-3)',
            fontWeight: active ? '600' : '400',
            fontStyle: 'italic', textDecoration: 'underline', textUnderlineOffset: 4,
            textDecorationColor: open ? 'var(--accent)' : 'var(--ink-4)', textDecorationThickness: '1.5px',
            cursor: 'pointer', padding: 0, transition: 'color .15s, text-decoration-color .15s',
            background: 'transparent', border: 'none'
          }}
        >
          {accent && active && <span style={{ width: 7, height: 7, borderRadius: 999, background: accent, display: 'inline-block' }}/>}
          {displayValue}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: .8, transform: open ? 'rotate(180deg)' : '', transition: 'transform .18s' }}>
            <path d="m2 4 3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {open && <CustomDropdownMenu value={value} options={options} onChange={(v) => { onChange(v); setOpen(false); }} optionLabel={optionLabel} optionValue={optionValue} optionDot={optionDot} align={align} />}
      </span>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: width || '100%' }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      )}
      <button
        onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}
        style={{
          width: '100%',
          height: 42,
          padding: '0 14px',
          background: active ? 'var(--paper-2)' : 'var(--paper)',
          border: open
            ? '1.5px solid var(--accent)'
            : active
              ? '1.5px solid var(--accent)'
              : '1px solid var(--rule)',
          borderRadius: 'var(--radius)',
          boxShadow: active ? 'var(--shadow-sm)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all .15s ease',
        }}
        onMouseEnter={(e) => {
          if (!open && !active) {
            e.currentTarget.style.borderColor = 'var(--ink-3)';
            e.currentTarget.style.background = 'var(--paper-2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = active ? 'var(--accent)' : 'var(--rule)';
            e.currentTarget.style.background = active ? 'var(--paper-2)' : 'var(--paper)';
          }
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {active ? (
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', display: 'inline-block' }}/>
          ) : (
            accent && <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, display: 'inline-block' }}/>
          )}
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: active ? '600' : '400',
            color: active ? 'var(--ink)' : 'var(--ink-3)'
          }}>
            {displayValue}
          </span>
        </span>
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{ color: active ? 'var(--accent)' : 'var(--ink-3)', transform: open ? 'rotate(180deg)' : '', transition: 'transform .18s' }}>
          <path d="m2 4 3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <CustomDropdownMenu value={value} options={options} onChange={(v) => { onChange(v); setOpen(false); }} optionLabel={optionLabel} optionValue={optionValue} optionDot={optionDot} align={align} />}
    </div>
  );
};


// expose to window
Object.assign(window, {
  Icon, Logo, Button, IconButton, CategoryBadge, Dificultad, Tiempo, Chip,
  RecipeCover, CAT_COLORS, ToastProvider, useToast, SkeletonCard, EmptyState,
  HoursMinutesInput, CookingMethodChips, ImageSuggestionStrip, TimerModal, RecipeCarousel,
  FollowButton, DesafioCard,
  CleanRecipeImage, CustomDropdown, ThemeToggle, VerifiedBadge
});
