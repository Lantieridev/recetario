/* eslint-disable */
// Admin Dashboard Screen — Console for managing corporate partners and users (Fase 3 Premium UI)
const { useState, useEffect } = React;

const AdminMetric = ({ label, value, icon }) => (
  <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--paper)', border: '1px solid var(--rule)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="eyebrow" style={{ color: 'var(--ink-2)', fontSize: 11 }}>{label}</span>
      <Icon name={icon} size={16} className="text-muted" />
    </div>
    <div className="font-display" style={{ fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{value}</div>
  </div>
);

const AdminDashboardScreen = ({ user }) => {
  const [stats, setStats] = useState({ totalUsers: 0, totalRecipes: 0, totalPartners: 0, activeBids: 0 });
  const [partners, setPartners] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form states
  const [partnerName, setPartnerName] = useState('');
  const [partnerTier, setPartnerTier] = useState('BRAND');
  const [partnerDomain, setPartnerDomain] = useState('');
  const [submittingPartner, setSubmittingPartner] = useState(false);
  
  // Association selectors mapping
  const [selectedUserPartners, setSelectedUserPartners] = useState({});

  const toast = useToast();

  const loadAllData = () => {
    // Stats
    setLoadingStats(true);
    window.api.adminGetStats(user.nombre)
      .then(res => {
        setStats(res);
        setLoadingStats(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingStats(false);
      });

    // Partners
    setLoadingPartners(true);
    window.api.adminGetPartners(user.nombre)
      .then(res => {
        setPartners(res.partners || []);
        setLoadingPartners(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPartners(false);
      });

    // Users
    setLoadingUsers(true);
    window.api.adminGetUsers(user.nombre)
      .then(res => {
        setUsers(res.users || []);
        setLoadingUsers(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingUsers(false);
      });
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      loadAllData();
    }
  }, [user]);

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerDomain.trim()) return;
    setSubmittingPartner(true);
    try {
      await window.api.adminCreatePartner(user.nombre, {
        nombre: partnerName.trim(),
        tier: partnerTier,
        dominio: partnerDomain.trim()
      });
      toast(`Empresa ${partnerName} registrada con dominio @${partnerDomain.trim().toLowerCase()}.`);
      setPartnerName('');
      setPartnerDomain('');
      loadAllData();
    } catch (err) {
      toast(`Error: ${err.error || 'No se pudo crear la empresa'}`);
    } finally {
      setSubmittingPartner(false);
    }
  };

  const handleDeletePartner = async (nombre) => {
    if (!confirm(`¿Estás seguro de eliminar a ${nombre}? Se desvincularán todos sus usuarios.`)) return;
    try {
      await window.api.adminDeletePartner(user.nombre, nombre);
      toast(`Empresa ${nombre} eliminada.`);
      loadAllData();
    } catch (err) {
      toast(`Error: ${err.error || 'No se pudo eliminar la empresa'}`);
    }
  };

  const handleAssociateUser = async (usuarioNombre) => {
    const partnerNombre = selectedUserPartners[usuarioNombre];
    if (!partnerNombre) {
      toast('Por favor, selecciona una empresa corporativa.');
      return;
    }
    try {
      await window.api.adminAssociateUser(user.nombre, { usuarioNombre, partnerNombre });
      toast(`Usuario ${usuarioNombre} promovido a socio B2B de ${partnerNombre}.`);
      loadAllData();
    } catch (err) {
      toast(`Error: ${err.error || 'No se pudo promover al usuario'}`);
    }
  };

  const handleConfirmUser = async (usuarioNombre) => {
    try {
      await window.api.adminConfirmUser(user.nombre, usuarioNombre);
      toast(`Acceso B2B verificado y habilitado para ${usuarioNombre}.`);
      loadAllData();
    } catch (err) {
      toast(`Error: ${err.error || 'No se pudo confirmar al usuario'}`);
    }
  };

  const handleDissociateUser = async (usuarioNombre) => {
    try {
      await window.api.adminDissociateUser(user.nombre, usuarioNombre);
      toast(`Acceso B2B revocado para ${usuarioNombre}.`);
      loadAllData();
    } catch (err) {
      toast(`Error: ${err.error || 'No se pudo revocar el acceso'}`);
    }
  };

  const handleSelectChange = (usuarioNombre, partnerNombre) => {
    setSelectedUserPartners(prev => ({
      ...prev,
      [usuarioNombre]: partnerNombre
    }));
  };

  return (
    <div data-screen-label="Admin Dashboard" className="fade-in" style={{ background: 'var(--cream)', minHeight: '100vh', paddingBottom: 120 }}>
      {/* Header */}
      <section style={{ padding: '56px 0 36px', borderBottom: '1px solid var(--rule-soft)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ 
              background: 'var(--accent)', 
              color: 'var(--paper)', 
              fontSize: 10, 
              fontWeight: 600, 
              padding: '4px 10px', 
              borderRadius: 999,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Administración Central
            </span>
            <span className="text-faint" style={{ fontSize: 13 }}>Recetario Graph Admin Console</span>
          </div>
          <h1 className="font-display" style={{
            fontSize: 'clamp(44px, 5.5vw, 68px)',
            margin: '0 0 16px',
            lineHeight: 1.0,
            letterSpacing: '-0.025em',
            textWrap: 'balance',
          }}>
            Panel de control <br/>y <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>gestión de marcas</em>
          </h1>
          <p className="text-muted" style={{ fontSize: 17, margin: 0, maxWidth: 620 }}>
            Habilitá el acceso a empresas de alimentación, modificá sus planes comerciales y
            gestioná los permisos de los usuarios en tiempo real.
          </p>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="container" style={{ padding: '32px 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          <AdminMetric label="Usuarios Registrados" value={loadingStats ? '...' : stats.totalUsers} icon="user" />
          <AdminMetric label="Recetas en Grafo" value={loadingStats ? '...' : stats.totalRecipes} icon="book" />
          <AdminMetric label="Partners Corporativos" value={loadingStats ? '...' : stats.totalPartners} icon="sliders" />
          <AdminMetric label="Pujas Activas" value={loadingStats ? '...' : stats.activeBids} icon="check" />
        </div>
      </section>

      {/* Main Administrative Control Panels */}
      <section className="container" style={{ padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 48, alignItems: 'start' }}>
          
          {/* Left Column: Partners management */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Create partner form */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-xl)', padding: 28 }}>
              <h2 className="font-display" style={{ fontSize: 22, margin: '0 0 20px', letterSpacing: '-0.01em' }}>Registrar Marca Comercial</h2>
              <form onSubmit={handleCreatePartner} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="field">
                  <label className="field-label">Nombre de la Marca</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Hellmanns, Nestle, etc."
                    value={partnerName}
                    onChange={e => setPartnerName(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Dominio de Correo Electrónico</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: hellmanns.com, nestle.com"
                    value={partnerDomain}
                    onChange={e => setPartnerDomain(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Nivel de Suscripción (Tier)</label>
                  <select
                    className="select"
                    style={{ width: '100%', height: 48 }}
                    value={partnerTier}
                    onChange={e => setPartnerTier(e.target.value)}
                  >
                    <option value="BRAND">BRAND (Subastas e ingredientes)</option>
                    <option value="RETAIL">RETAIL (Liquidación de stock)</option>
                    <option value="ENTERPRISE">ENTERPRISE (Analytics DaaS + Todo)</option>
                  </select>
                </div>

                <Button type="submit" variant="primary" loading={submittingPartner} style={{ height: 48, marginTop: 8 }}>
                  Crear / Actualizar Marca
                </Button>
              </form>
            </div>

            {/* List of partners */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-xl)', padding: 28 }}>
              <h2 className="font-display" style={{ fontSize: 22, margin: '0 0 20px', letterSpacing: '-0.01em' }}>Marcas Activas ({partners.length})</h2>
              {loadingPartners ? (
                <div className="text-muted" style={{ fontSize: 13 }}>Cargando marcas comerciales...</div>
              ) : partners.length === 0 ? (
                <div className="text-muted" style={{ fontSize: 13 }}>No hay marcas registradas.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {partners.map(p => (
                    <div key={p.nombre} style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--rule-soft)',
                      background: 'var(--cream)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{p.nombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>@{p.dominio}</div>
                        <span style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: 'var(--accent)',
                          background: 'rgba(184,64,31,0.06)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          letterSpacing: '0.05em'
                        }}>
                          {p.tier}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeletePartner(p.nombre)}
                        className="focus-ring"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--cat-postre)',
                          cursor: 'pointer',
                          padding: 4,
                          fontSize: 13
                        }}
                        title="Eliminar marca"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Users promotion management */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
            <h2 className="font-display" style={{ fontSize: 24, margin: '0 0 8px', letterSpacing: '-0.01em' }}>Control de Roles y Accesos B2B</h2>
            <p className="text-muted" style={{ fontSize: 13, margin: '0 0 24px' }}>
              Promové usuarios registrados comunes a la categoría de socios corporativos vinculándolos a su marca. Los usuarios que se registran con el dominio oficial de la marca aparecen aquí con estado Pendiente de Confirmación.
            </p>

            {loadingUsers ? (
              <div className="text-muted" style={{ fontSize: 13 }}>Cargando listado de usuarios...</div>
            ) : users.length === 0 ? (
              <div className="text-muted" style={{ fontSize: 13 }}>No hay usuarios registrados en el sistema.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {users.map(u => {
                  const isUserAdmin = u.isAdmin;
                  if (isUserAdmin) return null; // No mostrar al Admin en la lista

                  return (
                    <div key={u.nombre} style={{
                      padding: 18,
                      borderRadius: 'var(--radius)',
                      border: '1.5px solid var(--rule-soft)',
                      background: u.partner ? 'var(--paper-2)' : 'transparent',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16
                    }}>
                      <div style={{ minWidth: 200 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>
                          {u.nombre} 
                        </div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{u.mail}</div>
                        {u.partner && (
                          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: 'var(--paper)',
                              background: 'var(--accent)',
                              padding: '2px 8px',
                              borderRadius: 999,
                              display: 'inline-block'
                            }}>
                              Socio B2B: {u.partner.nombre} ({u.partner.tier})
                            </span>
                            <span style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: u.partner.activo ? 'var(--cat-veg)' : 'var(--cat-postre)',
                              background: 'var(--cream)',
                              border: `1px solid ${u.partner.activo ? 'var(--cat-veg)' : 'var(--cat-postre)'}`,
                              padding: '2px 8px',
                              borderRadius: 4,
                              display: 'inline-block'
                            }}>
                              {u.partner.activo ? 'Confirmado' : 'Pendiente'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {u.partner ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            {!u.partner.activo && (
                              <button
                                onClick={() => handleConfirmUser(u.nombre)}
                                className="btn btn-sm btn-primary"
                                style={{ height: 36, padding: '0 12px' }}
                              >
                                Confirmar Acceso B2B
                              </button>
                            )}
                            <button
                              onClick={() => handleDissociateUser(u.nombre)}
                              className="btn btn-sm"
                              style={{ background: 'rgba(184,64,31,0.06)', color: 'var(--accent)', border: '1px solid rgba(184,64,31,0.15)', height: 36 }}
                            >
                              Quitar Acceso B2B
                            </button>
                          </div>
                        ) : (
                          <>
                            <select
                              className="select"
                              style={{ height: 36, fontSize: 12, padding: '0 8px', width: 160 }}
                              value={selectedUserPartners[u.nombre] || ''}
                              onChange={e => handleSelectChange(u.nombre, e.target.value)}
                            >
                              <option value="">Seleccionar marca...</option>
                              {partners.map(p => (
                                <option key={p.nombre} value={p.nombre}>{p.nombre} ({p.tier})</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssociateUser(u.nombre)}
                              className="btn btn-sm btn-primary"
                              style={{ height: 36 }}
                              disabled={!selectedUserPartners[u.nombre]}
                            >
                              Vincular
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
        </div>
      </section>
    </div>
  );
};

Object.assign(window, { AdminDashboardScreen });
