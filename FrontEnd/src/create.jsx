/* eslint-disable */
// Create Recipe — Redesign Premium
// Endpoints: POST /api/recetas + POST /api/recetas/:titulo/ingredientes

/* ── Auto-resize textarea helper ─────────────────────────────── */
const autoResize = (el) => {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
};

const AutoTextarea = ({ value, onChange, placeholder, rows = 2, style = {}, className = '' }) => {
  const ref = React.useRef(null);

  React.useEffect(() => { autoResize(ref.current); }, [value]);

  return (
    <textarea
      ref={ref}
      className={`textarea ${className}`}
      placeholder={placeholder}
      value={value}
      rows={rows}
      style={{ resize: 'none', overflow: 'hidden', ...style }}
      onChange={(e) => { onChange(e); autoResize(e.target); }}
    />
  );
};

/* ── Toggle switch ────────────────────────────────────────────── */
const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    style={{
      display: 'flex', alignItems: 'center', gap: 8, background: 'none',
      border: 'none', cursor: 'pointer', padding: '4px 0'
    }}
  >
    <div style={{
      width: 34, height: 20, borderRadius: 999,
      background: checked ? 'var(--accent)' : 'var(--rule)',
      position: 'relative', transition: 'background .2s', flexShrink: 0,
      boxShadow: checked ? '0 0 0 3px var(--accent-soft)' : 'none'
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: checked ? 17 : 3, transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)'
      }} />
    </div>
    {label && <span style={{ fontSize: 13, color: checked ? 'var(--accent)' : 'var(--ink-3)', fontWeight: 500, transition: 'color .2s' }}>{label}</span>}
  </button>
);

/* ── Section header ───────────────────────────────────────────── */
const SectionHeader = ({ number, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
    {/* Decorative number pill */}
    <div style={{
      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
      color: '#fff', fontFamily: 'var(--font-display)', fontSize: 26,
      width: 48, height: 48, borderRadius: '50%', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: '0 4px 12px rgba(184,64,31,.3)', letterSpacing: '-0.02em',
    }}>{number}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}>{subtitle}</div>}
    </div>
    {/* Decorative rule line */}
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--rule) 0%, transparent 100%)', maxWidth: 120 }} />
  </div>
);

/* ── Step editor ──────────────────────────────────────────────── */
const StepEditor = ({ steps, onChange }) => {
  const addStep = () => onChange([...steps, { texto: '', timer: { hs: '', min: '' } }]);

  const updateStep = (idx, field, val) => {
    const next = [...steps];
    next[idx][field] = val;
    onChange(next);
  };

  const removeStep = (idx) => {
    if (steps.length <= 1) return; // at least 1 step required
    onChange(steps.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            display: 'flex', gap: 20, alignItems: 'flex-start',
            background: 'var(--paper)', border: '1px solid var(--rule)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
            transition: 'border-color .2s, box-shadow .2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink-3)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          {/* Step number */}
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--accent)',
            lineHeight: 1, width: 36, flexShrink: 0, paddingTop: 6,
            opacity: 0.7
          }}>
            {i + 1}
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AutoTextarea
              placeholder="Describí el paso con detalle..."
              value={step.texto}
              onChange={(e) => updateStep(i, 'texto', e.target.value)}
              rows={2}
              style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--rule)', borderRadius: 0, padding: '4px 0', fontSize: 15, boxShadow: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>⏱ Duración</span>
                <div style={{ width: 130 }}>
                  <HoursMinutesInput value={step.timer} onChange={(v) => updateStep(i, 'timer', v)} />
                </div>
              </div>
              {/* Only show remove button from step 2 onwards */}
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  style={{
                    fontSize: 12, color: 'var(--ink-3)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 8px', borderRadius: 6,
                    transition: 'color .15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-3)'; }}
                >
                  Quitar paso
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addStep}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
          border: '2px dashed var(--rule)', borderRadius: 'var(--radius-lg)',
          color: 'var(--ink-3)', fontSize: 14, fontWeight: 500,
          background: 'transparent', cursor: 'pointer', transition: 'border-color .2s, color .2s',
          width: '100%', justifyContent: 'center',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink-3)'; }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Agregar otro paso
      </button>
    </div>
  );
};

/* ── Main Screen ──────────────────────────────────────────────── */
const CreateRecipeScreen = ({ user, onBack, onCreated }) => {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    dificultad: 'Media',
    tiempo: { hs: '', min: '' },
    metodoCoccion: 'Horno',
    imagenUrl: '',
    ingredientes: [],
    pasos: [{ texto: '', timer: { hs: '', min: '' } }]
  });

  const [ingDraft, setIngDraft] = useState({ nombre: '', cantidad: '', esOpcional: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const toast = useToast();

  useEffect(() => { setSuggested(window.api.todosIngredientes()); }, []);

  const cats = window.api.categorias();

  const addIngredient = () => {
    if (!ingDraft.nombre) { toast('Completá el nombre del ingrediente'); return; }
    if (form.ingredientes.some(i => i.nombre.toLowerCase() === ingDraft.nombre.toLowerCase())) {
      toast('Ya está en la lista'); return;
    }
    setForm({ ...form, ingredientes: [...form.ingredientes, { ...ingDraft }] });
    setIngDraft({ nombre: '', cantidad: '', esOpcional: false });
  };

  const removeIngredient = (idx) => {
    setForm({ ...form, ingredientes: form.ingredientes.filter((_, i) => i !== idx) });
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      let tiempoStr = '';
      if (form.tiempo.hs) tiempoStr += `${form.tiempo.hs}h `;
      if (form.tiempo.min) tiempoStr += `${form.tiempo.min}min`;
      tiempoStr = tiempoStr.trim() || '30 min';

      const pasosStr = form.pasos
        .filter(p => p.texto.trim())
        .map((p, i) => `${i + 1}. ${p.texto}${p.timer.hs || p.timer.min ? ` [⏱ ${p.timer.hs ? p.timer.hs + 'h ' : ''}${p.timer.min ? p.timer.min + 'min' : ''}]` : ''}`)
        .join('\n');

      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria: form.categoria,
        dificultad: form.dificultad,
        tiempo: tiempoStr,
        creador: user.nombre,
        pasos: pasosStr,
        imagen: form.imagenUrl || null
      };

      await window.api.crearReceta(payload);

      for (const ing of form.ingredientes) {
        await window.api.agregarIngrediente(form.titulo, {
          nombreIngrediente: ing.nombre,
          cantidad: ing.cantidad,
        });
      }

      toast('¡Receta publicada!');
      setTimeout(() => onCreated(form.titulo), 1100);
    } catch (err) {
      setError(err.error || 'No pudimos guardar la receta');
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = form.titulo && form.categoria && form.ingredientes.length > 0 && form.pasos[0].texto;

  /* ── Section divider ── */
  const Divider = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '8px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
    </div>
  );

  return (
    <div data-screen-label="Create Recipe" className="fade-in" style={{ background: 'var(--cream)', minHeight: '100vh', paddingBottom: 120 }}>

      {/* ── Hero header ── */}
      <div style={{
        background: 'var(--paper)', borderBottom: '1px solid var(--rule)',
        padding: '24px 0', marginBottom: 0,
      }}>
        <div className="container" style={{ maxWidth: 720, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} className="btn btn-ghost btn-sm focus-ring" style={{ gap: 6 }}>
            <Icon name="back" size={13} /> Volver
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: canSubmit ? 'var(--accent)' : 'var(--rule)',
              transition: 'background .3s',
            }} />
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {canSubmit ? 'Lista para publicar' : 'Completá los campos requeridos'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Title banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--ink) 0%, #2D2520 100%)',
        padding: '48px 0 52px',
        marginBottom: 48,
      }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 500, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 12 }}>
            Nueva receta
          </div>
          <input
            className="focus-ring"
            style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 4vw, 52px)',
              background: 'transparent', border: 'none', borderBottom: '2px solid rgba(255,255,255,.12)',
              color: '#F4ECDD', width: '100%', padding: '8px 0',
              letterSpacing: '-0.025em', lineHeight: 1.1,
              outline: 'none', transition: 'border-color .2s',
            }}
            placeholder="Título de la receta..."
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,.12)'}
          />
        </div>
      </div>

      {/* ── Form body — decorative recipe card ── */}
      <div className="container" style={{ maxWidth: 760, paddingBottom: 0 }}>
        {/* Outer decorative frame */}
        <div style={{
          position: 'relative',
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 8px 40px -8px rgba(28,24,20,.12), 0 2px 8px -2px rgba(28,24,20,.06)',
          overflow: 'hidden',
        }}>
          {/* Left accent stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 5,
            background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 50%, var(--accent) 100%)',
          }} />

          {/* Inner double-border inset */}
          <div style={{
            margin: '20px 20px 20px 28px',
            border: '1px solid var(--rule-soft)',
            borderRadius: 'calc(var(--radius-xl) - 8px)',
            padding: '40px 44px',
            position: 'relative',
          }}>
            {/* Corner ornaments */}
            {[
              { top: 8, left: 8 },
              { top: 8, right: 8 },
              { bottom: 8, left: 8 },
              { bottom: 8, right: 8 },
            ].map((pos, k) => (
              <div key={k} style={{
                position: 'absolute', width: 16, height: 16, ...pos,
                borderTop: pos.top !== undefined ? '2px solid var(--accent-soft)' : 'none',
                borderBottom: pos.bottom !== undefined ? '2px solid var(--accent-soft)' : 'none',
                borderLeft: pos.left !== undefined ? '2px solid var(--accent-soft)' : 'none',
                borderRight: pos.right !== undefined ? '2px solid var(--accent-soft)' : 'none',
              }} />
            ))}

            {/* Actual form content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>

        {/* 1. Identidad */}
        <section>
          <SectionHeader number="1" title="Identidad" subtitle="Descripción, categoría y dificultad" />

          {/* Descripcion */}
          <div className="field" style={{ marginBottom: 28 }}>
            <label className="field-label">Descripción</label>
            <AutoTextarea
              placeholder="Una línea que invite a cocinar esta receta..."
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={2}
            />
          </div>

          {/* Categoria + Dificultad */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="field">
              <CustomDropdown
                label="Categoría"
                variant="field"
                value={form.categoria}
                options={cats}
                onChange={(v) => setForm({ ...form, categoria: v })}
                placeholder="Elegir..."
                accent={CAT_COLORS[form.categoria]}
              />
            </div>
            <div className="field">
              <label className="field-label">Dificultad</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { key: 'Baja', emoji: '🟢' },
                  { key: 'Media', emoji: '🟡' },
                  { key: 'Alta', emoji: '🔴' },
                ].map(({ key, emoji }) => {
                  const active = form.dificultad === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, dificultad: key })}
                      className="btn focus-ring"
                      style={{
                        flex: 1, height: 44, padding: 0, fontSize: 13, gap: 5,
                        background: active ? 'var(--ink)' : 'var(--paper)',
                        color: active ? 'var(--paper)' : 'var(--ink-2)',
                        border: `1.5px solid ${active ? 'var(--ink)' : 'var(--rule)'}`,
                        borderRadius: 'var(--radius)',
                        fontWeight: active ? 600 : 400,
                        transform: active ? 'scale(1.03)' : 'scale(1)',
                        boxShadow: active ? 'var(--shadow-sm)' : 'none',
                        transition: 'all .18s ease',
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{emoji}</span> {key}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* 2. Tiempo y cocción */}
        <section>
          <SectionHeader number="2" title="Tiempo y cocción" subtitle="Cuánto tarda y cómo se cocina" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40, alignItems: 'start' }}>
            <div className="field">
              <label className="field-label">Tiempo total</label>
              <HoursMinutesInput value={form.tiempo} onChange={(v) => setForm({ ...form, tiempo: v })} />
            </div>
            <div className="field">
              <label className="field-label">Método principal</label>
              <CookingMethodChips value={form.metodoCoccion} onChange={(v) => setForm({ ...form, metodoCoccion: v })} />
            </div>
          </div>
        </section>

        <Divider />

        {/* 3. Imagen */}
        <section>
          <SectionHeader number="3" title="Imagen" subtitle="Una foto que entre por los ojos" />
          <div
            style={{
              border: '2px dashed var(--rule)', borderRadius: 'var(--radius-lg)',
              padding: '48px 40px', textAlign: 'center', background: 'var(--paper)',
              cursor: 'pointer', transition: 'border-color .2s, background .2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--paper-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.background = 'var(--paper)'; }}
          >
            {form.imagenUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <img src={form.imagenUrl} style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
                <span style={{ fontSize: 15, color: 'var(--ink)' }}>Imagen seleccionada</span>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>🖼</div>
                <div style={{ fontSize: 15, color: 'var(--ink-3)', fontWeight: 500 }}>Subir imagen</div>
                <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 4 }}>Función próximamente disponible</div>
              </>
            )}
          </div>
        </section>

        <Divider />

        {/* 4. Ingredientes */}
        <section>
          <SectionHeader number="4" title="Ingredientes" subtitle="Los que hacen falta para preparar la receta" />

          {/* Add ingredient row */}
          <div style={{
            background: 'var(--paper)', border: '1px solid var(--rule)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr auto auto', gap: 12, alignItems: 'end' }}>
              <div className="field">
                <label className="field-label">Ingrediente</label>
                <input
                  className="input focus-ring"
                  list="ing-suggestions"
                  placeholder="Ej: Harina de trigo"
                  value={ingDraft.nombre}
                  onChange={(e) => setIngDraft({ ...ingDraft, nombre: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
                />
                <datalist id="ing-suggestions">
                  {suggested.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div className="field">
                <label className="field-label">Cantidad</label>
                <input
                  className="input focus-ring"
                  placeholder="Ej: 500g"
                  value={ingDraft.cantidad}
                  onChange={(e) => setIngDraft({ ...ingDraft, cantidad: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
                />
              </div>

              <div style={{ paddingBottom: 1 }}>
                <Toggle
                  checked={ingDraft.esOpcional}
                  onChange={(val) => setIngDraft({ ...ingDraft, esOpcional: val })}
                  label="Opcional"
                />
              </div>

              <div style={{ paddingBottom: 1 }}>
                <Button variant="accent" icon="plus" onClick={addIngredient} style={{ height: 44, paddingLeft: 18, paddingRight: 18 }}>
                  Añadir
                </Button>
              </div>
            </div>
          </div>

          {/* Ingredient list */}
          {form.ingredientes.length > 0 ? (
            <div style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {form.ingredientes.map((ing, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '13px 20px',
                    borderBottom: i < form.ingredientes.length - 1 ? '1px solid var(--rule-soft)' : 'none',
                    background: i % 2 === 0 ? 'var(--paper)' : 'var(--paper-2)',
                    transition: 'background .15s',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', width: 22, textAlign: 'right', flexShrink: 0 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ flex: 1, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {ing.nombre}
                    {ing.esOpcional && (
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: '2px 8px',
                        background: 'var(--accent-soft)', color: 'var(--accent)',
                        borderRadius: 999, letterSpacing: '0.04em',
                      }}>
                        opcional
                      </span>
                    )}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{ing.cantidad}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="btn btn-icon btn-sm focus-ring"
                    style={{ color: 'var(--ink-4)', width: 28, height: 28 }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink-4)'}
                  >
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '32px 0', color: 'var(--ink-4)',
              fontSize: 14, border: '1px dashed var(--rule)', borderRadius: 'var(--radius-lg)',
            }}>
              Todavía no hay ingredientes — agregá el primero arriba
            </div>
          )}
        </section>

        <Divider />

        {/* 5. Pasos */}
        <section>
          <SectionHeader number="5" title="Preparación" subtitle="Los pasos para llegar al plato final" />
          <StepEditor steps={form.pasos} onChange={(pasos) => setForm({ ...form, pasos })} />
        </section>

        {/* Error */}
        {error && (
          <div style={{
            padding: '14px 20px', background: 'rgba(184,64,31,.08)',
            border: '1px solid rgba(184,64,31,.25)', borderRadius: 'var(--radius)',
            color: 'var(--accent)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>⚠</span> {error}
          </div>
        )}
      </div>{/* /.form content flex */}
      </div>{/* /.inner double-border */}
      </div>{/* /.outer card */}
      </div>{/* /.container */}

      {/* ── Sticky footer ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(251,247,239,.92)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--rule)', padding: '14px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, gap: 16,
      }}>
        <Button variant="ghost" onClick={onBack}>Cancelar</Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!canSubmit && (
            <span style={{ fontSize: 13, color: 'var(--ink-4)' }}>
              {!form.titulo ? 'Falta el título' : !form.categoria ? 'Elegí una categoría' : !form.ingredientes.length ? 'Agregá ingredientes' : 'Completá el primer paso'}
            </span>
          )}
          <Button
            variant="accent"
            iconRight="check"
            disabled={!canSubmit || saving}
            onClick={submit}
            style={{ height: 44, paddingLeft: 24, paddingRight: 24, fontSize: 15 }}
          >
            {saving ? 'Publicando...' : 'Guardar receta'}
          </Button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CreateRecipeScreen });
