/* eslint-disable */
// Create Recipe — Fase 2A Redesign
// Endpoints: POST /api/recetas + POST /api/recetas/:titulo/ingredientes

const StepEditor = ({ steps, onChange }) => {
  const addStep = () => onChange([...steps, { texto: '', timer: { hs: '', min: '' } }]);
  const updateStep = (idx, field, val) => {
    const next = [...steps];
    next[idx][field] = val;
    onChange(next);
  };
  const removeStep = (idx) => onChange(steps.filter((_, i) => i !== idx));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div className="font-display" style={{ fontSize: 32, color: 'var(--ink-3)', lineHeight: 1, paddingTop: 4, width: 40, flexShrink: 0 }}>
            {i + 1}.
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea
              className="textarea"
              placeholder="Ej: Mezclar los ingredientes secos..."
              value={step.texto}
              onChange={(e) => updateStep(i, 'texto', e.target.value)}
              rows={2}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Duración (opcional)</span>
                <div style={{ width: 140 }}>
                  <HoursMinutesInput value={step.timer} onChange={(v) => updateStep(i, 'timer', v)} />
                </div>
              </div>
              <button onClick={() => removeStep(i)} className="btn-link" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                Quitar paso
              </button>
            </div>
          </div>
        </div>
      ))}
      <Button variant="ghost" onClick={addStep} style={{ alignSelf: 'flex-start' }}>
        + Agregar otro paso
      </Button>
    </div>
  );
};

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
    if (!ingDraft.nombre) {
      toast('Completá el nombre del ingrediente');
      return;
    }

    if (form.ingredientes.some(i => i.nombre.toLowerCase() === ingDraft.nombre.toLowerCase())) {
      toast('Ya está en la lista');
      return;
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

      // Formatear el tiempo total
      let tiempoStr = '';
      if (form.tiempo.hs) tiempoStr += `${form.tiempo.hs}h `;
      if (form.tiempo.min) tiempoStr += `${form.tiempo.min}min`;
      tiempoStr = tiempoStr.trim() || '30 min';

      // Formatear pasos
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
      
      // Asociar ingredientes
      for (const ing of form.ingredientes) {

        await window.api.agregarIngrediente(form.titulo, {
          nombreIngrediente: ing.nombre,
          cantidad: ing.cantidad,
          // Idealmente la API soportaría esOpcional, pero al menos lo guardamos en nuestro form
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

  return (
    <div data-screen-label="Create Recipe" className="fade-in" style={{ background: 'var(--cream)', minHeight: '100vh', paddingBottom: 120 }}>
      <div className="container" style={{ padding: '32px 32px 0', maxWidth: 760 }}>
        <button onClick={onBack} className="btn btn-ghost btn-sm focus-ring" style={{ marginBottom: 32 }}>
          <Icon name="back" size={14} /> Volver
        </button>

        <h1 className="font-display" style={{ fontSize: 'clamp(40px, 4.5vw, 56px)', margin: '0 0 48px', lineHeight: 1.05, letterSpacing: '-0.025em' }}>
          Nueva receta
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
          {/* Bloque Identidad */}
          <section>
            <div className="eyebrow" style={{ marginBottom: 24, fontSize: 12, color: 'var(--ink-3)' }}>1. Identidad</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="field">
                <input
                  className="input focus-ring"
                  style={{ height: 64, fontSize: 32, fontFamily: 'var(--font-display)', padding: '0 16px', background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, borderBottom: '2px solid var(--rule)' }}
                  placeholder="Título de la receta"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">Descripción</label>
                <textarea
                  className="textarea"
                  placeholder="Una línea que enganche..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={2}
                />
              </div>


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
                    {['Baja', 'Media', 'Alta'].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm({ ...form, dificultad: d })}
                        className="btn focus-ring"
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


              </div>
            </div>
          </section>

          <hr style={{ border: 0, borderTop: '1px solid var(--rule)' }} />

          {/* Bloque Tiempo y cocción */}
          <section>
            <div className="eyebrow" style={{ marginBottom: 24, fontSize: 12, color: 'var(--ink-3)' }}>2. Tiempo y cocción</div>
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

          <hr style={{ border: 0, borderTop: '1px solid var(--rule)' }} />

          {/* Bloque Imagen */}
          <section>
            <div className="eyebrow" style={{ marginBottom: 24, fontSize: 12, color: 'var(--ink-3)' }}>3. Imagen</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div 
                style={{ 
                  border: '2px dashed var(--rule)', borderRadius: 'var(--radius-lg)', padding: 40, 
                  textAlign: 'center', background: 'var(--paper)', cursor: 'pointer', transition: 'border-color .2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--rule)'}
              >
                {form.imagenUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <img src={form.imagenUrl} style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} />
                    <span style={{ fontSize: 15, color: 'var(--ink)' }}>Imagen seleccionada</span>
                  </div>
                ) : (
                  <>
                    <Icon name="sparkle" size={24} />
                    <div style={{ marginTop: 12, fontSize: 16 }}>Sube una imagen (desactivado temporalmente)</div>
                  </>
                )}
              </div>
            </div>
          </section>


          <hr style={{ border: 0, borderTop: '1px solid var(--rule)' }} />


          {/* Bloque Ingredientes */}
          <section>
            <div className="eyebrow" style={{ marginBottom: 24, fontSize: 12, color: 'var(--ink-3)' }}>4. Ingredientes</div>
            <div style={{
              background: 'var(--paper)', border: '1px solid var(--rule)',
              borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24,
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
                <div className="field" style={{ flex: 1.5 }}>
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

                <div className="field" style={{ flex: 1 }}>
                  <label className="field-label">Cantidad</label>
                  <input
                    className="input focus-ring"
                    placeholder="Ej: 500g"
                    value={ingDraft.cantidad}
                    onChange={(e) => setIngDraft({ ...ingDraft, cantidad: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
                  />

                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px' }}>
                  <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <div style={{
                      width: 32, height: 18, borderRadius: 999, background: ingDraft.esOpcional ? 'var(--accent)' : 'var(--rule)',
                      position: 'relative', transition: 'background .2s'
                    }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 2, left: ingDraft.esOpcional ? 16 : 2, transition: 'left .2s'
                      }} />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Opcional</span>
                  </label>
                  <input
                    type="checkbox"
                    style={{ display: 'none' }}
                    checked={ingDraft.esOpcional}
                    onChange={(e) => setIngDraft({ ...ingDraft, esOpcional: e.target.checked })}
                  />
                </div>
                <Button variant="primary" icon="plus" onClick={addIngredient} style={{ height: 44 }}>
                  Añadir
                </Button>
              </div>
            </div>


            {form.ingredientes.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--rule)' }}>
                {form.ingredientes.map((ing, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 4px', borderBottom: '1px solid var(--rule-soft)' }}>
                    <span className="font-mono" style={{ fontSize: 12, color: 'var(--ink-3)', width: 24 }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ flex: 1, fontSize: 15 }}>{ing.nombre} {ing.esOpcional && <span className="text-muted" style={{ fontSize: 12 }}>(opcional)</span>}</span>
                    <span className="font-mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{ing.cantidad}</span>
                    <button onClick={() => removeIngredient(i)} className="btn btn-icon btn-ghost btn-sm focus-ring" style={{ color: 'var(--ink-3)' }}>
                      <Icon name="trash" size={13} />

                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <hr style={{ border: 0, borderTop: '1px solid var(--rule)' }} />

          {/* Bloque Pasos */}
          <section>
            <div className="eyebrow" style={{ marginBottom: 24, fontSize: 12, color: 'var(--ink-3)' }}>5. Pasos</div>
            <StepEditor steps={form.pasos} onChange={(pasos) => setForm({ ...form, pasos })} />
          </section>

          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(184,64,31,.08)', border: '1px solid rgba(184,64,31,.2)', borderRadius: 'var(--radius)', color: 'var(--accent)', fontSize: 14 }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer sticky */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--paper)', borderTop: '1px solid var(--rule)', padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10
      }}>
        <Button variant="ghost" onClick={onBack}>Cancelar</Button>
        <Button variant="accent" iconRight="check" disabled={!canSubmit || saving} onClick={submit}>
          {saving ? 'Publicando...' : 'Guardar receta'}
        </Button>
      </div>
    </div>
  );
};

Object.assign(window, { CreateRecipeScreen });
