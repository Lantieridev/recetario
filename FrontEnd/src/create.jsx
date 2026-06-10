/* eslint-disable */
// Create Recipe — Full validation + Premium Redesign
// Endpoints: POST /api/recetas + POST /api/recetas/:titulo/ingredientes

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

/* ── Auto-resize textarea ──────────────────────────────────────── */
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

/* ── Toggle switch ─────────────────────────────────────────────── */
const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
  >
    <div style={{
      width: 34, height: 20, borderRadius: 999,
      background: checked ? 'var(--accent)' : 'var(--rule)',
      position: 'relative', transition: 'background .2s', flexShrink: 0,
      boxShadow: checked ? '0 0 0 3px var(--accent-soft)' : 'none'
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: checked ? 17 : 3, transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)'
      }} />
    </div>
    {label && <span style={{ fontSize: 13, color: checked ? 'var(--accent)' : 'var(--ink-3)', fontWeight: 500, transition: 'color .2s' }}>{label}</span>}
  </button>
);

/* ── Section header ────────────────────────────────────────────── */
const SectionHeader = ({ number, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
    <div style={{
      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
      color: '#fff', fontFamily: 'var(--font-display)', fontSize: 22,
      width: 44, height: 44, borderRadius: '50%', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: '0 4px 12px rgba(184,64,31,.28)', letterSpacing: '-0.02em',
    }}>{number}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}>{subtitle}</div>}
    </div>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--rule) 0%, transparent 100%)', maxWidth: 100 }} />
  </div>
);

/* ── Validation badge ──────────────────────────────────────────── */
const ValidBadge = ({ ok, text }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500,
    padding: '2px 10px', borderRadius: 999,
    background: ok ? 'rgba(126,148,96,.12)' : 'rgba(184,64,31,.08)',
    color: ok ? '#5a7a40' : 'var(--accent)',
    border: `1px solid ${ok ? 'rgba(126,148,96,.25)' : 'rgba(184,64,31,.2)'}`,
    transition: 'all .25s',
  }}>
    {ok ? '✓' : '○'} {text}
  </span>
);

/* ── Units for ingredients (matching stage-5) ───────────────────── */
const UNIDADES_ESPECIALES = ['a gusto'];
const UNIDADES_OPTIONS = [
  { value: 'gramos',       label: 'gramos' },
  { value: 'mililitros',   label: 'mililitros' },
  { value: 'tazas',        label: 'tazas' },
  { value: 'cucharadas',   label: 'cucharadas' },
  { value: 'cucharaditas', label: 'cucharaditas' },
  { value: 'unidades',     label: 'unidades' },
  { value: 'a gusto',      label: 'a gusto' },
];

/* ── Ingredientes comunes quick-add ─────────────────────────────── */
const COMUNES = ['Sal', 'Pimienta', 'Aceite', 'Cebolla', 'Ajo', 'Harina', 'Huevo'];

/* ── Ingredient amount input (removed to inline in grid) ────────── */

/* ── formatTiempo (from stage-5, converts val+unit to readable) ── */
const formatTiempo = (horas, minutos) => {
  const h = parseInt(horas) || 0;
  const m = parseInt(minutos) || 0;
  const totalMins = h * 60 + m;
  if (totalMins === 0) return null;
  const hFinal = Math.floor(totalMins / 60);
  const mFinal = totalMins % 60;
  if (hFinal === 0) return `${mFinal} min`;
  if (mFinal === 0) return `${hFinal}h`;
  return `${hFinal}h ${mFinal}min`;
};

/* ── cleanStepText (from stage-5) ──────────────────────────────── */
const cleanStepText = (text) =>
  text.replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(l => l !== '').join('\n').trim();

/* ── Difficulty label traducido ─────────────────────────────────── */
const DIFF_MAP = { Baja: 'Baja', Media: 'Media', Alta: 'Alta' };

/* ═══════════════════════════════════════════════════════════════
   STEP EDITOR
═══════════════════════════════════════════════════════════════ */
const StepEditor = ({ steps, onChange, stepErrors }) => {
  const addStep = () => onChange([...steps, { texto: '', timer: { hs: '', min: '' } }]);

  const updateStep = (idx, field, val) => {
    const next = [...steps];
    next[idx][field] = val;
    onChange(next);
  };

  const removeStep = (idx) => {
    if (steps.length <= 1) return;
    onChange(steps.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {steps.map((step, i) => {
        const hasError = stepErrors && stepErrors[i];
        return (
          <div
            key={i}
            style={{
              display: 'flex', gap: 18, alignItems: 'flex-start',
              background: hasError ? 'rgba(184,64,31,.04)' : 'var(--paper)',
              border: `1.5px solid ${hasError ? 'rgba(184,64,31,.35)' : 'var(--rule)'}`,
              borderRadius: 'var(--radius-lg)', padding: '18px 22px',
              transition: 'border-color .2s, box-shadow .2s, background .2s',
            }}
            onMouseEnter={(e) => { if (!hasError) { e.currentTarget.style.borderColor = 'var(--ink-3)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = hasError ? 'rgba(184,64,31,.35)' : 'var(--rule)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Step number bubble */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: hasError ? 'rgba(184,64,31,.12)' : 'var(--accent-soft)',
              color: hasError ? 'var(--accent)' : 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 17, marginTop: 4,
              border: `1.5px solid ${hasError ? 'rgba(184,64,31,.3)' : 'transparent'}`,
            }}>
              {i + 1}
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AutoTextarea
                placeholder={i === 0 ? 'Primer paso: Ej. Precalentar el horno a 180°C...' : 'Describí este paso...'}
                value={step.texto}
                onChange={(e) => updateStep(i, 'texto', e.target.value)}
                rows={2}
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: `1px solid ${hasError ? 'rgba(184,64,31,.3)' : 'var(--rule)'}`,
                  borderRadius: 0, padding: '4px 0', fontSize: 15, boxShadow: 'none',
                }}
              />
              {hasError && (
                <span style={{ fontSize: 12, color: 'var(--accent)' }}>
                  {!step.texto.trim()
                    ? '⚠ Este paso no puede estar vacío'
                    : '⚠ El tiempo del paso debe ser de al menos 1 minuto'}
                </span>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>⏱ Duración paso</span>
                  <div style={{ width: 130 }}>
                    <HoursMinutesInput value={step.timer} onChange={(v) => updateStep(i, 'timer', v)} />
                  </div>
                </div>
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    style={{ fontSize: 12, color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'color .15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-3)'; }}
                  >
                    Quitar paso
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addStep}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
          border: '2px dashed var(--rule)', borderRadius: 'var(--radius-lg)',
          color: 'var(--ink-3)', fontSize: 14, fontWeight: 500, background: 'transparent',
          cursor: 'pointer', transition: 'border-color .2s, color .2s', width: '100%', justifyContent: 'center',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink-3)'; }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Agregar otro paso
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   VALIDATION ENGINE
═══════════════════════════════════════════════════════════════ */
const validate = (form) => {
  const errors = {};

  if (!form.titulo.trim())
    errors.titulo = 'El título es obligatorio';
  else if (form.titulo.trim().length < 3)
    errors.titulo = 'El título debe tener al menos 3 caracteres';

  if (!form.categoria)
    errors.categoria = 'Elegí una categoría';

  // Tiempo mínimo: al menos 1 minuto
  const h = parseInt(form.tiempo.hs) || 0;
  const m = parseInt(form.tiempo.min) || 0;
  const totalMins = h * 60 + m;
  if (totalMins < 1)
    errors.tiempo = 'Ingresá el tiempo de preparación (mínimo 1 minuto)';

  if (form.ingredientes.length === 0)
    errors.ingredientes = 'Agregá al menos un ingrediente';

  // Pasos: todos los que existan deben tener texto. Si tienen tiempo, debe ser al menos 1 minuto.
  const stepErrors = form.pasos.map(p => {
    const stepH = parseInt(p.timer.hs) || 0;
    const stepM = parseInt(p.timer.min) || 0;
    const stepTotalMins = stepH * 60 + stepM;
    const hasTimerInput = (p.timer.hs || '').trim() !== '' || (p.timer.min || '').trim() !== '';
    const hasTimerError = hasTimerInput && stepTotalMins < 1;
    return !p.texto.trim() || hasTimerError;
  });
  if (stepErrors.some(Boolean))
    errors.pasos = stepErrors;
  if (!form.pasos[0]?.texto.trim())
    errors.paso0 = true;

  return errors;
};

/* ── Validation summary bar ────────────────────────────────────── */
const ValidationBar = ({ form }) => {
  const h = parseInt(form.tiempo.hs) || 0;
  const m = parseInt(form.tiempo.min) || 0;
  const totalMins = h * 60 + m;
  const tiempoOk = totalMins >= 1;
  const stepsFilled = form.pasos.filter(p => p.texto.trim()).length;
  const stepsTotal = form.pasos.length;
  const stepErrors = form.pasos.map(p => {
    const stepH = parseInt(p.timer.hs) || 0;
    const stepM = parseInt(p.timer.min) || 0;
    const stepTotalMins = stepH * 60 + stepM;
    const hasTimerInput = (p.timer.hs || '').trim() !== '' || (p.timer.min || '').trim() !== '';
    const hasTimerError = hasTimerInput && stepTotalMins < 1;
    return !p.texto.trim() || hasTimerError;
  });
  const stepsOk = stepsFilled === stepsTotal && stepsTotal > 0 && !stepErrors.some(Boolean);

  const checks = [
    { key: 'titulo', ok: form.titulo.trim().length >= 3, label: 'Título' },
    { key: 'categoria', ok: !!form.categoria, label: 'Categoría' },
    { key: 'tiempo', ok: tiempoOk, label: 'Tiempo' },
    { key: 'ingredientes', ok: form.ingredientes.length > 0, label: 'Ingredientes' },
    { key: 'pasos', ok: stepsOk, label: stepsOk ? `${stepsTotal} paso${stepsTotal > 1 ? 's' : ''}` : `${stepsFilled}/${stepsTotal} pasos` },
  ];

  const allOk = checks.every(c => c.ok);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      padding: '10px 16px', borderRadius: 'var(--radius)',
      background: allOk ? 'rgba(126,148,96,.08)' : 'var(--paper-2)',
      border: `1px solid ${allOk ? 'rgba(126,148,96,.2)' : 'var(--rule)'}`,
      marginBottom: 4, transition: 'all .3s',
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: allOk ? '#5a7a40' : 'var(--ink-3)', marginRight: 4, flexShrink: 0 }}>
        {allOk ? '✓ Todo completo' : 'Requerido:'}
      </span>
      {checks.map(c => (
        <ValidBadge key={c.key} ok={c.ok} text={c.label} />
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN SCREEN
═══════════════════════════════════════════════════════════════ */
const CreateRecipeScreen = ({ user, onBack, onCreated }) => {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    dificultad: 'Media',
    tiempo: { hs: '', min: '' },
    porciones: '4',
    metodoCoccion: 'Horno',
    imagenUrl: '',
    ingredientes: [],
    pasos: [{ texto: '', timer: { hs: '', min: '' } }]
  });

  const [ingDraft, setIngDraft] = useState({ nombre: '', cantidadVal: '', cantidadUnidad: 'gramos', esOpcional: false });
  const [ingErrors, setIngErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const toast = useToast();

  useEffect(() => { setSuggested(window.api.todosIngredientes()); }, []);

  const cats = window.api.categorias();

  // Live validation after first submit attempt
  useEffect(() => {
    if (submitted) setFormErrors(validate(form));
  }, [form, submitted]);

  // (Tiempo se normaliza/traduce al guardar o mostrar en la UI)

  /* ── Ingredient validation ── */
  const validateIng = () => {
    const errs = {};
    if (!ingDraft.nombre.trim()) errs.nombre = 'Ingresá el ingrediente';
    const isEspecial = UNIDADES_ESPECIALES.includes(ingDraft.cantidadUnidad);
    if (!isEspecial && (!ingDraft.cantidadVal || isNaN(parseFloat(ingDraft.cantidadVal)) || parseFloat(ingDraft.cantidadVal) <= 0)) {
      errs.cantidad = 'Cantidad inválida';
    }
    setIngErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addIngredient = () => {
    if (!validateIng()) return;
    
    // Normalize input name against database (suggested)
    const rawVal = ingDraft.nombre.trim();
    const lower = rawVal.toLowerCase();
    let matchedName = rawVal;
    
    // Try to find matching ingredient in suggested (database)
    let dbMatch = suggested.find(i => i.toLowerCase() === lower);
    if (!dbMatch) {
      const alternative = lower.endsWith('s') ? lower.slice(0, -1) : lower + 's';
      dbMatch = suggested.find(i => i.toLowerCase() === alternative);
    }
    
    if (dbMatch) {
      matchedName = dbMatch; // Use existing ingredient name from DB
    }
    
    // Check if it's already in the currently added list using case-insensitive + singular/plural matching
    const matchInAdded = form.ingredientes.some(i => {
      const addedLower = i.nombre.toLowerCase();
      if (addedLower === matchedName.toLowerCase()) return true;
      const altAdded = addedLower.endsWith('s') ? addedLower.slice(0, -1) : addedLower + 's';
      return altAdded === matchedName.toLowerCase();
    });
    
    if (matchInAdded) {
      toast('Ya está en la lista');
      return;
    }
    
    const isEspecial = UNIDADES_ESPECIALES.includes(ingDraft.cantidadUnidad);
    const cantidadDisplay = isEspecial ? ingDraft.cantidadUnidad : `${ingDraft.cantidadVal} ${ingDraft.cantidadUnidad}`;
    
    setForm({
      ...form,
      ingredientes: [...form.ingredientes, {
        nombre: matchedName,
        cantidadVal: ingDraft.cantidadVal,
        cantidadUnidad: ingDraft.cantidadUnidad,
        esOpcional: ingDraft.esOpcional,
        cantidadDisplay
      }]
    });
    
    setIngDraft({ nombre: '', cantidadVal: '', cantidadUnidad: 'gramos', esOpcional: false });
    setIngErrors({});
  };

  const removeIngredient = (idx) => {
    setForm({ ...form, ingredientes: form.ingredientes.filter((_, i) => i !== idx) });
  };

  /* ── Submit ── */
  const submit = async () => {
    setSubmitted(true);
    const errs = validate(form);
    setFormErrors(errs);

    const hasStepErrors = errs.pasos && errs.pasos.some(Boolean);

    if (Object.keys(errs).length > 0) {
      // Mensajes específicos
      if (errs.tiempo) { toast('⏱ ' + errs.tiempo); return; }
      if (hasStepErrors) {
        const emptyIdxs = (errs.pasos || []).map((e, i) => e ? i + 1 : null).filter(Boolean);
        toast(`Completá el paso ${emptyIdxs.join(', ')}`);
        return;
      }
      toast('Completá todos los campos requeridos');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const tiempoStr = formatTiempo(form.tiempo.hs, form.tiempo.min) || '30 min';

      const pasosStr = form.pasos
        .filter(p => p.texto.trim())
        .map((p, i) => {
          const cleaned = cleanStepText(p.texto);
          const formattedTimer = formatTiempo(p.timer.hs, p.timer.min);
          const timer = formattedTimer ? ` [⏱ ${formattedTimer}]` : '';
          return `${i + 1}. ${cleaned}${timer}`;
        })
        .join('\n');

      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoria: form.categoria,
        dificultad: form.dificultad,
        tiempo: tiempoStr,
        porciones: parseInt(form.porciones) || 4,
        creador: user.nombre,
        pasos: pasosStr,
        imagen: form.imagenUrl || null
      };

      await window.api.crearReceta(payload);

      for (const ing of form.ingredientes) {
        await window.api.agregarIngrediente(form.titulo.trim(), {
          nombreIngrediente: ing.nombre,
          cantidad: ing.cantidadDisplay || ing.cantidad,
        });
      }

      toast('¡Receta publicada!');
      setTimeout(() => onCreated(form.titulo.trim()), 1100);
    } catch (err) {
      setError(err.error || 'No pudimos guardar la receta');
    } finally {
      setSaving(false);
    }
  };

  const tiempoLabel = formatTiempo(form.tiempo.hs, form.tiempo.min);
  const allErrors = submitted ? validate(form) : {};
  const canSubmit = Object.keys(validate(form)).length === 0;

  const Divider = () => (
    <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--rule) 20%, var(--rule) 80%, transparent)' }} />
  );

  return (
    <div data-screen-label="Create Recipe" className="fade-in" style={{ background: 'var(--cream)', minHeight: '100vh', paddingBottom: 120 }}>

      {/* ── Top nav ── */}
      <div style={{ background: 'var(--paper)', borderBottom: '1px solid var(--rule)', padding: '16px 0' }}>
        <div className="container" style={{ maxWidth: 780, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} className="btn btn-ghost btn-sm focus-ring" style={{ gap: 6 }}>
            <Icon name="back" size={13} /> Volver
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: canSubmit ? '#7E9460' : 'var(--rule)', transition: 'background .3s', boxShadow: canSubmit ? '0 0 0 3px rgba(126,148,96,.2)' : 'none' }} />
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {canSubmit ? 'Lista para publicar ✓' : 'Completá los campos requeridos'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Title hero ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--ink) 0%, #2D2520 100%)', padding: '44px 0 52px', marginBottom: 40 }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 500, color: 'rgba(244,236,221,.45)', textTransform: 'uppercase', marginBottom: 10 }}>
            Nueva receta
          </div>
          <input
            className="focus-ring"
            style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 50px)',
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${allErrors.titulo ? 'rgba(224,122,69,.6)' : 'rgba(255,255,255,.12)'}`,
              color: '#F4ECDD', width: '100%', padding: '8px 0',
              letterSpacing: '-0.025em', lineHeight: 1.1, outline: 'none', transition: 'border-color .2s',
            }}
            placeholder="Título de la receta..."
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = allErrors.titulo ? 'rgba(224,122,69,.6)' : 'rgba(255,255,255,.12)'}
          />
          {allErrors.titulo && (
            <div style={{ fontSize: 13, color: 'var(--accent-2)', marginTop: 8 }}>⚠ {allErrors.titulo}</div>
          )}

        </div>
      </div>

      {/* ── Form card ── */}
      <div className="container" style={{ maxWidth: 780, paddingBottom: 20 }}>
        {/* Validation summary */}
        <ValidationBar form={form} touched={submitted} />

        {/* Decorative recipe card */}
        <div style={{
          marginTop: 16, position: 'relative',
          background: 'var(--paper)', border: '1px solid var(--rule)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 8px 40px -8px rgba(28,24,20,.12), 0 2px 8px -2px rgba(28,24,20,.06)',
          overflow: 'hidden',
        }}>
          {/* Left accent stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 5,
            background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 50%, var(--accent) 100%)',
          }} />

          {/* Inner inset */}
          <div style={{ margin: '20px 20px 24px 28px', border: '1px solid var(--rule-soft)', borderRadius: 'calc(var(--radius-xl) - 8px)', padding: '40px 44px', position: 'relative' }}>

            {/* Corner ornaments */}
            {[{ top: 8, left: 8 }, { top: 8, right: 8 }, { bottom: 8, left: 8 }, { bottom: 8, right: 8 }].map((pos, k) => (
              <div key={k} style={{
                position: 'absolute', width: 16, height: 16, ...pos,
                borderTop: pos.top !== undefined ? '2px solid var(--accent-soft)' : 'none',
                borderBottom: pos.bottom !== undefined ? '2px solid var(--accent-soft)' : 'none',
                borderLeft: pos.left !== undefined ? '2px solid var(--accent-soft)' : 'none',
                borderRight: pos.right !== undefined ? '2px solid var(--accent-soft)' : 'none',
              }} />
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>

              {/* ── 1. Identidad ── */}
              <section>
                <SectionHeader number="1" title="Identidad" subtitle="Nombre, descripción, categoría y dificultad" />

                {/* Descripcion */}
                <div className="field" style={{ marginBottom: 28 }}>
                  <label className="field-label">Descripción <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(opcional)</span></label>
                  <AutoTextarea
                    placeholder="Una línea que invite a cocinar esta receta..."
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Categoria + Dificultad */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: form.titulo && form.categoria ? 24 : 0 }}>
                  <div className="field">
                    <CustomDropdown
                      label="Categoría *"
                      variant="field"
                      value={form.categoria}
                      options={cats}
                      onChange={(v) => setForm({ ...form, categoria: v })}
                      placeholder="Elegir..."
                      accent={CAT_COLORS[form.categoria]}
                    />
                    {allErrors.categoria && <span style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>{allErrors.categoria}</span>}
                  </div>
                  <div className="field">
                    <label className="field-label">Dificultad</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[{ key: 'Baja', emoji: '🟢' }, { key: 'Media', emoji: '🟡' }, { key: 'Alta', emoji: '🔴' }].map(({ key, emoji }) => {
                        const active = form.dificultad === key;
                        return (
                          <button key={key} type="button" onClick={() => setForm({ ...form, dificultad: key })} className="btn focus-ring" style={{
                            flex: 1, height: 44, padding: 0, fontSize: 13, gap: 5,
                            background: active ? 'var(--ink)' : 'var(--paper)',
                            color: active ? 'var(--paper)' : 'var(--ink-2)',
                            border: `1.5px solid ${active ? 'var(--ink)' : 'var(--rule)'}`,
                            borderRadius: 'var(--radius)', fontWeight: active ? 600 : 400,
                            transform: active ? 'scale(1.03)' : 'scale(1)',
                            boxShadow: active ? 'var(--shadow-sm)' : 'none', transition: 'all .18s ease',
                          }}>
                            <span style={{ fontSize: 14 }}>{emoji}</span> {key}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Vista previa */}
                {form.titulo && form.categoria && (
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 10 }}>Vista previa</div>
                    <div style={{ maxWidth: 280 }}>
                      <RecipeCover titulo={form.titulo} categoria={form.categoria} height={180} />
                    </div>
                  </div>
                )}
              </section>

              <Divider />

              {/* ── 2. Tiempo y cocción ── */}
              <section>
                <SectionHeader number="2" title="Tiempo y cocción" subtitle="Cuánto tarda y cómo se cocina" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 24, alignItems: 'start' }}>
                  {/* Tiempo */}
                  <div className="field">
                    <label className="field-label">Tiempo total *</label>
                    <div style={{ width: 140 }}>
                      <HoursMinutesInput
                        value={form.tiempo}
                        onChange={(v) => setForm({ ...form, tiempo: v })}
                      />
                    </div>
                    {allErrors.tiempo && <span style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>⚠ {allErrors.tiempo}</span>}
                  </div>
                  {/* Porciones */}
                  <div className="field">
                    <label className="field-label">Porciones</label>
                    <input
                      type="number"
                      min="1"
                      className="input focus-ring"
                      placeholder="4"
                      value={form.porciones}
                      onChange={(e) => setForm({ ...form, porciones: e.target.value })}
                    />
                  </div>
                  {/* Método */}
                  <div className="field">
                    <label className="field-label">Método principal</label>
                    <CookingMethodChips value={form.metodoCoccion} onChange={(v) => setForm({ ...form, metodoCoccion: v })} />
                  </div>
                </div>
              </section>

              <Divider />

              {/* ── 3. Imagen ── */}
              <section>
                <SectionHeader number="3" title="Imagen" subtitle="Una foto que entre por los ojos (opcional)" />
                <div
                  style={{ border: '2px dashed var(--rule)', borderRadius: 'var(--radius-lg)', padding: '40px', textAlign: 'center', background: 'var(--paper-2)', cursor: 'pointer', transition: 'border-color .2s, background .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--paper)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.background = 'var(--paper-2)'; }}
                >
                  {form.imagenUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                      <img src={form.imagenUrl} style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
                      <span style={{ fontSize: 15, color: 'var(--ink)' }}>Imagen seleccionada</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.35 }}>🖼</div>
                      <div style={{ fontSize: 15, color: 'var(--ink-3)', fontWeight: 500 }}>Subir imagen</div>
                      <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 4 }}>Función próximamente disponible</div>
                    </>
                  )}
                </div>
              </section>

              <Divider />

              {/* ── 4. Ingredientes ── */}
              <section>
                <SectionHeader number="4" title="Ingredientes" subtitle="Los que hacen falta para preparar la receta" />

                {/* Add form */}
                <div style={{ background: 'var(--paper-2)', border: `1.5px solid ${allErrors.ingredientes ? 'rgba(184,64,31,.3)' : 'var(--rule)'}`, borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr auto auto', gap: 12, alignItems: 'end' }}>
                    {/* Nombre */}
                    <div className="field">
                      <label className="field-label">Ingrediente *</label>
                      <input
                        className="input focus-ring"
                        list="ing-suggestions"
                        placeholder="Ej: Harina de trigo"
                        value={ingDraft.nombre}
                        onChange={(e) => { setIngDraft({ ...ingDraft, nombre: e.target.value }); setIngErrors({ ...ingErrors, nombre: null }); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
                        style={{ borderColor: ingErrors.nombre ? 'var(--accent)' : undefined }}
                      />
                      <datalist id="ing-suggestions">
                        {suggested.map(s => <option key={s} value={s} />)}
                      </datalist>
                      {ingErrors.nombre && <span style={{ fontSize: 11, color: 'var(--accent)' }}>{ingErrors.nombre}</span>}
                    </div>

                    {/* Cantidad */}
                    <div className="field">
                      <label className="field-label">Cantidad</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="200"
                        disabled={UNIDADES_ESPECIALES.includes(ingDraft.cantidadUnidad)}
                        value={ingDraft.cantidadVal}
                        onChange={(e) => { setIngDraft({ ...ingDraft, cantidadVal: e.target.value }); setIngErrors({ ...ingErrors, cantidad: null }); }}
                        className="input focus-ring"
                        style={{ minWidth: 90, borderColor: ingErrors.cantidad ? 'var(--accent)' : undefined, opacity: UNIDADES_ESPECIALES.includes(ingDraft.cantidadUnidad) ? 0.4 : 1 }}
                      />
                      {ingErrors.cantidad && <span style={{ fontSize: 11, color: 'var(--accent)' }}>{ingErrors.cantidad}</span>}
                    </div>

                    {/* Unidad */}
                    <div className="field">
                      <label className="field-label">Unidad</label>
                      <select
                        value={ingDraft.cantidadUnidad}
                        onChange={(e) => {
                          const v = e.target.value;
                          const isOldEspecial = UNIDADES_ESPECIALES.includes(ingDraft.cantidadUnidad);
                          const isNewEspecial = UNIDADES_ESPECIALES.includes(v);
                          const shouldClear = isNewEspecial || isOldEspecial;
                          setIngDraft({
                            ...ingDraft,
                            cantidadUnidad: v,
                            cantidadVal: shouldClear ? '' : ingDraft.cantidadVal
                          });
                        }}
                        className="select"
                        style={{ width: '100%' }}
                      >
                        {UNIDADES_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </select>
                    </div>

                    {/* Opcional */}
                    <div style={{ paddingBottom: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 8 }}>Opc.</div>
                      <Toggle checked={ingDraft.esOpcional} onChange={(val) => setIngDraft({ ...ingDraft, esOpcional: val })} />
                    </div>

                    {/* Add button */}
                    <div style={{ paddingBottom: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', color: 'transparent', textTransform: 'uppercase', marginBottom: 8 }}>-</div>
                      <Button variant="accent" icon="plus" onClick={addIngredient} style={{ height: 44 }}>
                        Añadir
                      </Button>
                    </div>
                  </div>

                  {/* Quick-add comunes */}
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--rule-soft)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)', flexShrink: 0 }}>Comunes:</span>
                    {COMUNES.map(s => (
                      <button key={s} type="button" onClick={() => setIngDraft({ ...ingDraft, nombre: s })} className="chip" style={{ height: 26, fontSize: 12, cursor: 'pointer' }}>
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ingredient list header */}
                {form.ingredientes.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>Tu lista ({form.ingredientes.length})</span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, ingredientes: [] })}
                      style={{ fontSize: 13, color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink-3)'}
                    >Vaciar</button>
                  </div>
                )}

                {/* Ingredient list */}
                {form.ingredientes.length > 0 ? (
                  <div style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    {form.ingredientes.map((ing, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 20px',
                        borderBottom: i < form.ingredientes.length - 1 ? '1px solid var(--rule-soft)' : 'none',
                        background: i % 2 === 0 ? 'var(--paper)' : 'var(--paper-2)',
                      }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', width: 20, flexShrink: 0 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span style={{ flex: 1, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {ing.nombre}
                          {ing.esOpcional && (
                            <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 999 }}>
                              opcional
                            </span>
                          )}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)', background: 'var(--paper-2)', padding: '2px 10px', borderRadius: 999, border: '1px solid var(--rule)' }}>
                          {ing.cantidadDisplay || ing.cantidad}
                        </span>
                        <button type="button" onClick={() => removeIngredient(i)}
                          style={{ color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color .15s, background .15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-soft)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-4)'; e.currentTarget.style.background = 'none'; }}
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--ink-4)', fontSize: 14, border: `1.5px dashed ${allErrors.ingredientes ? 'rgba(184,64,31,.3)' : 'var(--rule)'}`, borderRadius: 'var(--radius-lg)' }}>
                    {allErrors.ingredientes ? (
                      <span style={{ color: 'var(--accent)' }}>⚠ {allErrors.ingredientes}</span>
                    ) : 'Todavía no hay ingredientes — agregá el primero arriba'}
                  </div>
                )}
              </section>

              <Divider />

              {/* ── 5. Pasos ── */}
              <section>
                <SectionHeader number="5" title="Preparación" subtitle="Los pasos para llegar al plato final" />
                <StepEditor
                  steps={form.pasos}
                  onChange={(pasos) => setForm({ ...form, pasos })}
                  stepErrors={allErrors.pasos}
                />
              </section>

              {/* Error global */}
              {error && (
                <div style={{ padding: '14px 20px', background: 'rgba(184,64,31,.08)', border: '1px solid rgba(184,64,31,.25)', borderRadius: 'var(--radius)', color: 'var(--accent)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>⚠</span> {error}
                </div>
              )}

            </div>{/* /flex column */}
          </div>{/* /inner inset */}
        </div>{/* /outer card */}
      </div>{/* /container */}

      {/* ── Sticky footer ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(251,247,239,.94)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--rule)', padding: '14px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, gap: 16,
      }}>
        <Button variant="ghost" onClick={onBack}>Cancelar</Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {submitted && !canSubmit && (
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
              {allErrors.tiempo ? '⏱ Ingresá el tiempo de preparación' :
               allErrors.pasos?.some(Boolean) ? '✏ Completá los pasos o corregí su duración' :
               allErrors.ingredientes ? '🧂 Agregá al menos un ingrediente' :
               allErrors.categoria ? '📂 Elegí una categoría' :
               '✏ Completá los campos requeridos'}
            </span>
          )}
          <Button
            variant="accent" iconRight="check"
            disabled={saving}
            onClick={submit}
            style={{ height: 44, paddingLeft: 24, paddingRight: 24, fontSize: 15, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Publicando...' : 'Guardar receta'}
          </Button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CreateRecipeScreen });
