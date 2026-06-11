/* ============================================================================
   COMPONENTE 3 · AllergyAlert
   ----------------------------------------------------------------------------
   Tarjeta de advertencia (rojos/naranjas) que se muestra cuando la condición
   del usuario choca con un ingrediente. No sólo avisa: dibuja el mini-grafo
   del conflicto para evidenciar cómo se modeló el dato en Neo4j:
       Receta —USA_INGREDIENTE→ Ingrediente —CONTIENE_ALERGENO→ Alérgeno(!)

   PROPS
     allergyConflict : {
       hasConflict, userCondition,
       conflictPath: [ {type,label} | {relation} | {type,label,danger} ]
     }

   --- USO EN EL REPO ---------------------------------------------------------
     export default function AllergyAlert({ allergyConflict }) { ... }
   --------------------------------------------------------------------------- */

// ---- MOCK (reemplazar por fetch('/api/grafos/allergy-check/:recipe/:user')) -
const mockData_3 = {
  allergyConflict: {
    hasConflict: true,
    userCondition: 'Celíaco',
    conflictPath: [
      { type: 'Recipe',     label: 'Tarta de Manzana' },
      { relation: 'USA_INGREDIENTE' },
      { type: 'Ingredient', label: 'Harina de Trigo' },
      { relation: 'CONTIENE_ALERGENO' },
      { type: 'Allergen',   label: 'Gluten', danger: true },
    ],
  },
};

const NODE_COLORS_3 = {
  Recipe: '#F5A524', Ingredient: '#B9C46A', Allergen: '#FF5347',
};

function ensureStyle3() {
  if (document.getElementById('aa-style-3')) return;
  const s = document.createElement('style');
  s.id = 'aa-style-3';
  s.textContent = `
    @keyframes aa-throb-3 { 0%,100%{ r:13; opacity:.9 } 50%{ r:16; opacity:1 } }
    @keyframes aa-ring-3  { 0%{ r:13; opacity:.7 } 100%{ r:30; opacity:0 } }
    @keyframes aa-dash-3  { to { stroke-dashoffset: -16; } }
    @keyframes aa-icon-3  { 0%,100%{ transform: rotate(0) } 12%{ transform: rotate(-9deg) } 24%{ transform: rotate(7deg) } 36%{ transform: rotate(-4deg) } 48%{ transform: rotate(0) } }
  `;
  document.head.appendChild(s);
}

function AllergyAlert({ allergyConflict = mockData_3.allergyConflict }) {
  React.useEffect(() => { ensureStyle3(); }, []);
  if (!allergyConflict || !allergyConflict.hasConflict) return null;

  const { userCondition, conflictPath } = allergyConflict;
  const nodes = conflictPath.filter((p) => p.type);
  const rels = conflictPath.filter((p) => p.relation);

  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: 560,
      borderRadius: 'var(--r-lg)', overflow: 'hidden',
      background: 'linear-gradient(150deg, rgba(46,16,12,0.82), rgba(34,18,10,0.74))',
      border: '1px solid rgba(255,83,71,0.42)',
      boxShadow: '0 0 50px -10px rgba(255,83,71,0.4), inset 0 1px 0 rgba(255,154,61,0.15)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* franja superior peligro */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, var(--danger), var(--danger-2), var(--danger))' }} />

      <div style={{ padding: '22px 24px 26px' }}>
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13, flex: '0 0 auto',
            display: 'grid', placeItems: 'center',
            background: 'radial-gradient(circle at 35% 30%, #ff6b5b, #d8362b)',
            boxShadow: '0 0 22px -3px var(--danger)',
            animation: 'aa-icon-3 3.2s ease-in-out infinite',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3 L22 20 H2 Z" fill="#fff2ee" />
              <rect x="11" y="9" width="2" height="6" rx="1" fill="#c62a20" />
              <circle cx="12" cy="17.4" r="1.3" fill="#c62a20" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: '#fff' }}>
              Conflicto con tu perfil
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,200,190,0.85)', marginTop: 2 }}>
              Sos <strong style={{ color: 'var(--danger-2)' }}>{userCondition}</strong> y esta receta contiene un alérgeno.
            </div>
          </div>
        </div>

        {/* condición chip */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 6 }}>
          <span className="type-pill" style={{ color: 'var(--danger-2)', borderColor: 'var(--danger-2)' }}>
            CONDICIÓN · {userCondition.toUpperCase()}
          </span>
        </div>

        {/* Mini-grafo del conflicto */}
        <div style={{ marginTop: 14 }}>
          <div className="rel-tag" style={{ marginBottom: 8, color: 'rgba(255,200,190,0.6)' }}>
            RUTA DETECTADA EN EL GRAFO
          </div>
          <ConflictGraph3 nodes={nodes} rels={rels} />
        </div>
      </div>
    </div>
  );
}

/* Mini-grafo SVG horizontal con flechas animadas y alérgeno latiendo */
function ConflictGraph3({ nodes, rels }) {
  const W = 510, H = 120;
  const pad = 46;
  const step = (W - pad * 2) / (nodes.length - 1);
  const cy = 44;
  const pos = nodes.map((_, i) => ({ x: pad + step * i, y: cy }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {/* enlaces */}
      {rels.map((rel, i) => {
        const a = pos[i], b = pos[i + 1];
        const mx = (a.x + b.x) / 2;
        const last = i === rels.length - 1;
        return (
          <g key={i}>
            <line x1={a.x + 16} y1={a.y} x2={b.x - 18} y2={b.y}
              stroke={last ? 'var(--danger)' : 'rgba(255,178,120,0.55)'} strokeWidth="2"
              strokeDasharray="4 4" markerEnd={`url(#arrow3-${last ? 'd' : 'n'})`}
              style={{ animation: 'aa-dash-3 0.7s linear infinite' }} />
            <text x={mx} y={a.y - 12} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="0.04em"
              fill={last ? 'var(--danger-2)' : 'rgba(255,200,170,0.7)'}>
              {rel.relation}
            </text>
          </g>
        );
      })}

      {/* nodos */}
      {nodes.map((n, i) => {
        const p = pos[i];
        const color = NODE_COLORS_3[n.type] || '#B9C46A';
        const danger = n.danger;
        return (
          <g key={i}>
            {danger && (
              <circle cx={p.x} cy={p.y} r="13" fill="none" stroke="var(--danger)" strokeWidth="2"
                style={{ animation: 'aa-ring-3 1.6s ease-out infinite' }} />
            )}
            <circle cx={p.x} cy={p.y} r="13"
              fill={danger ? 'var(--danger)' : color}
              stroke={danger ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth={danger ? 1.6 : 1}
              style={danger ? { animation: 'aa-throb-3 1.4s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'center' } : null} />
            {danger && <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">!</text>}
            <text x={p.x} y={p.y + 30} textAnchor="middle"
              fontFamily="var(--font-sans)" fontSize="11" fontWeight="600"
              fill={danger ? '#fff' : 'var(--text-100)'}>{n.label}</text>
            <text x={p.x} y={p.y + 43} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.08em"
              fill={danger ? 'var(--danger-2)' : color} style={{ textTransform: 'uppercase' }}>
              {n.type}
            </text>
          </g>
        );
      })}

      <defs>
        <marker id="arrow3-n" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0 L6,3.5 L0,7 Z" fill="rgba(255,178,120,0.7)" />
        </marker>
        <marker id="arrow3-d" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0 L6,3.5 L0,7 Z" fill="var(--danger)" />
        </marker>
      </defs>
    </svg>
  );
}

window.AllergyAlert = AllergyAlert;
window.__mockData_3 = mockData_3;
