/* eslint-disable */
// Create Recipe — 2 steps: básicos → ingredientes → done
// Endpoints: POST /api/recetas + POST /api/recetas/:titulo/ingredientes

const CreateRecipeScreen = ({ user, onBack, onCreated }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    dificultad: 'Media',
    tiempo: '30 min',
    pasos: '',
  });
  const [ingredients, setIngredients] = useState([]);
  const [ingDraft, setIngDraft] = useState({ nombre: '', cantidad: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const toast = useToast();

  useEffect(() => { setSuggested(window.api.todosIngredientes()); }, []);

  const cats = window.api.categorias();

  const canStep1 = form.titulo && form.descripcion && form.categoria && form.pasos;
  const canSubmit = canStep1 && ingredients.length > 0;

  const addIngredient = () => {
    if (!ingDraft.nombre || !ingDraft.cantidad) {
      toast('Completá ambos campos');
      return;
    }
    if (ingredients.some(i => i.nombre.toLowerCase() === ingDraft.nombre.toLowerCase())) {
      toast('Ya está en la lista');
      return;
    }
    setIngredients([...ingredients, { ...ingDraft }]);
    setIngDraft({ nombre: '', cantidad: '' });
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await window.api.crearReceta({ ...form, creador: user.nombre });
      // Asociar ingredientes uno por uno (replica el endpoint real)
      for (const ing of ingredients) {
        await window.api.agregarIngrediente(form.titulo, {
          nombreIngrediente: ing.nombre,
          cantidad: ing.cantidad,
        });
      }
      toast('¡Receta publicada!');
      setStep(3);
      setTimeout(() => onCreated(form.titulo), 1100);
    } catch (err) {
      setError(err.error || 'No pudimos guardar la receta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-screen-label="Create Recipe" className="fade-in" style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '32px 32px 96px', maxWidth: 920 }}>
        <button onClick={onBack} className="btn btn-ghost btn-sm focus-ring" style={{ marginBottom: 32 }}>
          <Icon name="back" size={14} /> Cancelar
        </button>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <Step n={1} active={step >= 1} done={step > 1} label="Básicos" />
          <div style={{ flex: 1, height: 1, background: step >= 2 ? 'var(--ink)' : 'var(--rule)', maxWidth: 80 }}/>
          <Step n={2} active={step >= 2} done={step > 2} label="Ingredientes" />
          <div style={{ flex: 1, height: 1, background: step >= 3 ? 'var(--ink)' : 'var(--rule)', maxWidth: 80 }}/>
          <Step n={3} active={step >= 3} done={step > 3} label="Publicado" />
        </div>

        {/* Step 1: basics */}
        {step === 1 && (
          <div className="fade-in">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Paso 1 de 2</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(40px, 4.5vw, 56px)', margin: '0 0 12px', lineHeight: 1.05, letterSpacing: '-0.025em' }}>
              Contá tu receta
            </h1>
            <p className="text-muted" style={{ marginBottom: 40, fontSize: 16 }}>
              Lo esencial primero. Después le sumamos los ingredientes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
              <div className="field">
                <label className="field-label">Título</label>
                <input
                  className="input"
                  style={{ height: 56, fontSize: 22, fontFamily: 'var(--font-display)' }}
                  placeholder="Ñoquis de mi abuela"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">Descripción corta</label>
                <textarea
                  className="textarea"
                  placeholder="Una línea que enganche…"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={2}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label className="field-label">Categoría</label>
                  <select className="select" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                    <option value="">Elegir…</option>
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Dificultad</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['Baja', 'Media', 'Alta'].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm({ ...form, dificultad: d })}
                        className="btn"
                        style={{
                          flex: 1, height: 44, padding: 0, fontSize: 14,
                          background: form.dificultad === d ? 'var(--ink)' : 'var(--paper)',
                          color: form.dificultad === d ? 'var(--paper)' : 'var(--ink)',
                          border: `1px solid ${form.dificultad === d ? 'var(--ink)' : 'var(--rule)'}`,
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Tiempo</label>
                  <input
                    className="input"
                    placeholder="30 min"
                    value={form.tiempo}
                    onChange={(e) => setForm({ ...form, tiempo: e.target.value })}
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Pasos</label>
                <p className="text-muted" style={{ fontSize: 12, marginTop: -4 }}>Numerá cada paso. Ej: "1. Picar la cebolla. 2. Rehogar…"</p>
                <textarea
                  className="textarea"
                  style={{ minHeight: 180, fontFamily: 'var(--font-body)' }}
                  placeholder="1. Mezclar los ingredientes secos en un bowl…"
                  value={form.pasos}
                  onChange={(e) => setForm({ ...form, pasos: e.target.value })}
                />
              </div>
            </div>

            {/* Preview */}
            {form.titulo && form.categoria && (
              <div style={{ marginTop: 40 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Vista previa</div>
                <div style={{ maxWidth: 320 }}>
                  <RecipeCover titulo={form.titulo} categoria={form.categoria} height={220} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--rule)' }}>
              <div className="text-muted" style={{ fontSize: 13 }}>
                {canStep1 ? '✓ Listo para el siguiente paso' : 'Completá todos los campos'}
              </div>
              <Button variant="primary" iconRight="arrow" disabled={!canStep1} onClick={() => setStep(2)}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: ingredients */}
        {step === 2 && (
          <div className="fade-in">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Paso 2 de 2</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(40px, 4.5vw, 56px)', margin: '0 0 12px', lineHeight: 1.05, letterSpacing: '-0.025em' }}>
              ¿Qué lleva?
            </h1>
            <p className="text-muted" style={{ marginBottom: 32, fontSize: 16 }}>
              Sumá los ingredientes con su cantidad. Podés usar "c/n", "a gusto", o medidas como "200g", "1 cdita".
            </p>

            <div style={{
              background: 'var(--paper)', border: '1px solid var(--rule)',
              borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: 12, alignItems: 'end' }}>
                <div className="field">
                  <label className="field-label">Ingrediente</label>
                  <input
                    className="input"
                    list="ing-suggestions"
                    placeholder="Harina"
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
                    className="input"
                    placeholder="500g"
                    value={ingDraft.cantidad}
                    onChange={(e) => setIngDraft({ ...ingDraft, cantidad: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
                  />
                </div>
                <Button variant="primary" icon="plus" onClick={addIngredient} style={{ height: 44 }}>
                  Agregar
                </Button>
              </div>

              {/* Quick-add common */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--rule-soft)' }}>
                <div className="eyebrow" style={{ marginBottom: 10, fontSize: 10 }}>Comunes</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['Sal', 'Pimienta', 'Aceite', 'Cebolla', 'Ajo', 'Harina', 'Huevo'].map(s => (
                    <button
                      key={s}
                      onClick={() => setIngDraft({ nombre: s, cantidad: ingDraft.cantidad })}
                      className="chip"
                      style={{ height: 28, fontSize: 12 }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingredient list */}
            <div style={{ marginBottom: 32 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <h3 className="font-display" style={{ fontSize: 22, margin: 0 }}>
                  Tu lista ({ingredients.length})
                </h3>
                {ingredients.length > 0 && (
                  <button
                    className="btn-link"
                    onClick={() => setIngredients([])}
                    style={{ fontSize: 13, color: 'var(--ink-3)' }}
                  >
                    Vaciar
                  </button>
                )}
              </div>

              {ingredients.length === 0 ? (
                <div style={{
                  padding: 40, textAlign: 'center',
                  background: 'var(--paper)',
                  border: '1px dashed var(--rule)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--ink-3)',
                  fontSize: 14,
                }}>
                  Todavía no agregaste ningún ingrediente
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--rule)' }}>
                  {ingredients.map((ing, i) => (
                    <li key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '14px 4px',
                      borderBottom: '1px solid var(--rule-soft)',
                    }}>
                      <span className="font-mono" style={{ fontSize: 12, color: 'var(--ink-3)', width: 24 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ flex: 1, fontSize: 15 }}>{ing.nombre}</span>
                      <span className="font-mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{ing.cantidad}</span>
                      <button
                        onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}
                        className="btn btn-icon btn-ghost btn-sm"
                        aria-label="Quitar"
                        style={{ color: 'var(--ink-3)' }}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(184,64,31,.08)',
                border: '1px solid rgba(184,64,31,.2)',
                borderRadius: 'var(--radius)',
                color: 'var(--accent)',
                fontSize: 14,
                marginBottom: 20,
              }}>{error}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid var(--rule)' }}>
              <Button variant="ghost" icon="back" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button variant="accent" iconRight="check" disabled={!canSubmit || saving} onClick={submit}>
                {saving ? 'Publicando…' : 'Publicar receta'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: success */}
        {step === 3 && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 999,
              background: 'var(--accent)', color: 'var(--paper)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <Icon name="check" size={32} stroke={2.4}/>
            </div>
            <h1 className="font-display" style={{ fontSize: 56, margin: '0 0 12px', letterSpacing: '-0.025em' }}>
              ¡Publicada!
            </h1>
            <p className="text-muted" style={{ fontSize: 17, marginBottom: 32 }}>
              "{form.titulo}" ya está en la colección.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Step = ({ n, active, done, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{
      width: 28, height: 28, borderRadius: 999,
      background: done ? 'var(--accent)' : active ? 'var(--ink)' : 'var(--paper)',
      color: (done || active) ? 'var(--paper)' : 'var(--ink-3)',
      border: `1px solid ${active || done ? 'transparent' : 'var(--rule)'}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 500,
      transition: 'all .25s',
    }}>
      {done ? <Icon name="check" size={13} stroke={2.4}/> : n}
    </span>
    <span style={{ fontSize: 13, color: active ? 'var(--ink)' : 'var(--ink-3)', fontWeight: active ? 500 : 400 }}>
      {label}
    </span>
  </div>
);

Object.assign(window, { CreateRecipeScreen });
