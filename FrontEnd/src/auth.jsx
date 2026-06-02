/* eslint-disable */
// Login + Registro — split-screen editorial layout

const AuthScreen = ({ onAuth }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ nombre: '', mail: '', contrasena: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { usuario } = await window.api.login({ nombre: form.nombre, contrasena: form.contrasena });
        toast(`Bienvenida, ${usuario.nombre}`);
        onAuth(usuario);
      } else {
        const res = await window.api.crearUsuario(form);
        toast('Cuenta creada');
        onAuth(res.usuario);
      }
    } catch (err) {
      setError(err.error || 'Algo salió mal');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (nombre) => {
    setForm({ nombre, mail: '', contrasena: 'pass123' });
    setError(null);
    setLoading(true);
    try {
      const { usuario } = await window.api.login({
        nombre,
        contrasena: nombre === 'Ornella' ? 'pass123' : nombre === 'Juan' ? 'pass456' : 'pass789',
      });
      toast(`Bienvenida, ${usuario.nombre}`);
      onAuth(usuario);
    } catch (err) {
      setError(err.error || 'Algo salió mal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-screen-label="Auth" style={{ height: '100vh', overflow: 'hidden', background: 'var(--cream)' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
        height: '100vh',
      }}>
        {/* LEFT — editorial */}
        <div className="auth-left" style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '48px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Logo size={28} />
          </div>

          {/* Decorative typography */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div className="font-display" style={{
              position: 'absolute',
              right: -40, top: '30%',
              fontSize: 380,
              lineHeight: 0.85,
              color: 'rgba(245,239,228,.04)',
              userSelect: 'none',
              transform: 'rotate(-8deg)',
            }}>
              ℞
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 2, maxWidth: 480 }}>
            <div className="eyebrow" style={{ color: 'var(--accent-2)', marginBottom: 24 }}>
              Una colección personal
            </div>
            <h1 className="font-display" style={{
              fontSize: 'clamp(48px, 6vw, 76px)',
              lineHeight: 1.02,
              margin: '0 0 20px',
              fontWeight: 400,
              letterSpacing: '-0.025em',
              textWrap: 'balance',
            }}>
              Tu cocina,<br/>
              <em style={{ fontStyle: 'italic', color: 'var(--accent-2)' }}>recordada</em>.
            </h1>
            <p style={{
              fontSize: 17, lineHeight: 1.55, color: 'rgba(245,239,228,.7)',
              maxWidth: 420, margin: 0,
            }}>
              Guardá tus recetas, descubrí lo que cocinan otros y encontrá qué hacer
              con lo que tenés en la heladera.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 32, fontSize: 13, color: 'rgba(245,239,228,.5)' }}>
            <span>10 recetas</span>
            <span style={{ width: 1, background: 'rgba(245,239,228,.15)' }}/>
            <span>5 categorías</span>
            <span style={{ width: 1, background: 'rgba(245,239,228,.15)' }}/>
            <span>Recomendaciones colaborativas</span>
          </div>
        </div>

        {/* RIGHT — form */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 56px',
          maxWidth: 560,
          width: '100%',
          margin: '0 auto',
        }}>
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              {mode === 'login' ? 'Volvé a tu cocina' : 'Empezá tu colección'}
            </div>
            <h2 className="font-display" style={{
              fontSize: 42, margin: '0 0 8px', lineHeight: 1.1, letterSpacing: '-0.02em',
            }}>
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>
            <p className="text-muted" style={{ margin: 0 }}>
              {mode === 'login'
                ? 'Ingresá con tu nombre y contraseña.'
                : 'Solo necesitamos tres cosas para empezar.'}
            </p>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="field">
              <label className="field-label">Nombre</label>
              <input
                className="input"
                placeholder="Cómo querés que te llamemos"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                autoFocus
                required
              />
            </div>

            {mode === 'register' && (
              <div className="field fade-in">
                <label className="field-label">Mail</label>
                <input
                  className="input"
                  type="email"
                  placeholder="tu@mail.com"
                  value={form.mail}
                  onChange={(e) => setForm({ ...form, mail: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="field">
              <label className="field-label">Contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.contrasena}
                onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(184,64,31,.08)',
                border: '1px solid rgba(184,64,31,.2)',
                borderRadius: 'var(--radius)',
                color: 'var(--accent)',
                fontSize: 14,
              }}>
                {error}
              </div>
            )}

            <Button type="submit" variant="accent" size="lg" disabled={loading} className="w-full">
              {loading ? 'Un momento…' : (mode === 'login' ? 'Entrar' : 'Crear cuenta')}
            </Button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--ink-2)' }}>
            {mode === 'login' ? (
              <>¿No tenés cuenta?{' '}
                <button type="button" className="btn-link" onClick={() => { setMode('register'); setError(null); }}>
                  Crear una
                </button>
              </>
            ) : (
              <>¿Ya tenés cuenta?{' '}
                <button type="button" className="btn-link" onClick={() => { setMode('login'); setError(null); }}>
                  Iniciar sesión
                </button>
              </>
            )}
          </div>

          {/* quick demo logins */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--rule)' }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Probá con un usuario demo</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Ornella', 'Juan', 'Ana'].map(n => (
                <button
                  key={n}
                  type="button"
                  className="chip"
                  onClick={() => quickLogin(n)}
                  disabled={loading}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: 999,
                    background: 'var(--ink)', color: 'var(--paper)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600,
                  }}>
                    {n[0]}
                  </span>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .auth-left { padding: 32px !important; min-height: 280px; }
        }
        @media (max-width: 760px) {
          [data-screen-label="Auth"] > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

window.AuthScreen = AuthScreen;
