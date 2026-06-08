/* ============================================================================
   COMPONENTE 2 · RecommendationPath
   ----------------------------------------------------------------------------
   Explica POR QUÉ se recomienda una receta (filtrado colaborativo) dibujando
   la ruta del grafo como una línea de tiempo horizontal:
     Tú →(GUARDO_FAV)→ Receta A ←(GUARDO_FAV)← Usuario Z →(CREO)→ Recomendada
   Un pulso de luz fluye continuamente por las flechas.

   PROPS
     recommendationPath : { reason, path:[ nodeEntry | relationEntry, ... ] }
        nodeEntry     = { nodeId, label, type, highlight? }
        relationEntry = { relation, direction? ('incoming' invierte la flecha) }

   --- USO EN EL REPO ---------------------------------------------------------
     import { useState } from 'react';
     export default function RecommendationPath({ recommendationPath }) { ... }
   --------------------------------------------------------------------------- */

const NODE_COLORS_2 = {
  Recipe:     '#F5A524',
  Ingredient: '#B9C46A',
  User:       '#E8825A',
  Allergen:   '#FF5347',
  Category:   '#FB8C3C',
};

const REASON_LABEL_2 = {
  collaborative_filtering: 'Filtrado colaborativo',
  content_based: 'Basado en contenido',
};

// ---- MOCK (reemplazar por fetch('/api/grafos/recommendation/:id')) ----------
const mockData_2 = {
  recommendationPath: {
    reason: 'collaborative_filtering',
    path: [
      { nodeId: 'u-me', label: 'Tú',          type: 'User' },
      { relation: 'GUARDO_FAV' },
      { nodeId: 'r-1',  label: 'Pizza Casera', type: 'Recipe' },
      { relation: 'GUARDO_FAV_TAMBIEN', direction: 'incoming' },
      { nodeId: 'u-2',  label: 'Marcos',       type: 'User' },
      { relation: 'CREO' },
      { nodeId: 'r-2',  label: 'Masa Madre',   type: 'Recipe', highlight: true },
    ],
  },
};

// Inyecta los keyframes una sola vez (mantiene el .jsx autocontenido)
function ensureStyle2() {
  if (document.getElementById('rp-style-2')) return;
  const s = document.createElement('style');
  s.id = 'rp-style-2';
  s.textContent = `
    @keyframes rp-flow-2 {
      0%   { left: -12%;  opacity: 0; }
      12%  { opacity: 1; }
      88%  { opacity: 1; }
      100% { left: 108%;  opacity: 0; }
    }
    @keyframes rp-pulse-2 {
      0%,100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(245,206,107,0.0); }
      50%     { transform: scale(1.06); box-shadow: 0 0 0 10px rgba(245,206,107,0.0); }
    }
    .rp-conn-2 { position: relative; flex: 1 1 64px; min-width: 56px; height: 2px;
      background: linear-gradient(90deg, rgba(245,178,90,0.15), rgba(245,178,90,0.4), rgba(245,178,90,0.15)); }
    .rp-spark-2 { position: absolute; top: 50%; width: 26px; height: 6px; border-radius: 999px;
      transform: translateY(-50%);
      background: linear-gradient(90deg, transparent, #ffce6b, #fff, #ffce6b, transparent);
      filter: drop-shadow(0 0 6px rgba(255,206,107,0.9));
      animation: rp-flow-2 3.6s linear infinite; }
  `;
  document.head.appendChild(s);
}

function RecommendationPath({ recommendationPath = mockData_2.recommendationPath }) {
  React.useEffect(() => { ensureStyle2(); }, []);

  const { reason, path } = recommendationPath;
  // Separar la secuencia en nodos y las relaciones entre ellos
  const nodes = path.filter((p) => p.nodeId);
  const rels = path.filter((p) => p.relation);

  return (
    <div className="glass" style={{
      borderRadius: 'var(--r-lg)', padding: '24px 26px 28px',
      width: '100%', maxWidth: 860,
    }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <span style={{
          width: 8, height: 8, borderRadius: 999, background: 'var(--accent)',
          boxShadow: '0 0 10px var(--accent)',
        }} />
        <span className="rel-tag" style={{ color: 'var(--accent)' }}>
          POR QUÉ LO VES · {REASON_LABEL_2[reason] || reason}
        </span>
      </div>

      {/* Ruta */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
        {nodes.map((n, i) => (
          <React.Fragment key={n.nodeId}>
            <PathNode2 node={n} delay={i * 0.18} />
            {i < rels.length && (
              <div style={{ flex: '1 1 64px', minWidth: 56, paddingTop: 26 }}>
                <Connector2 rel={rels[i]} index={i} total={rels.length} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function PathNode2({ node }) {
  const color = NODE_COLORS_2[node.type] || NODE_COLORS_2.Ingredient;
  const hi = node.highlight;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      width: 96, flex: '0 0 auto',
    }}>
      <div style={{
        width: hi ? 60 : 50, height: hi ? 60 : 50, borderRadius: '50%',
        display: 'grid', placeItems: 'center', position: 'relative',
        background: `radial-gradient(circle at 35% 30%, ${color}, ${color}99)`,
        border: `1.5px solid ${hi ? '#fff' : color}`,
        boxShadow: hi
          ? `0 0 28px -2px ${color}, inset 0 0 12px rgba(255,255,255,0.25)`
          : `0 0 18px -6px ${color}`,
        animation: hi ? 'rp-pulse-2 2.4s ease-in-out infinite' : 'none',
      }}>
        <span className="mono" style={{
          fontSize: 9, fontWeight: 600, color: 'rgba(0,0,0,0.55)', letterSpacing: '0.04em',
        }}>{node.type === 'User' ? 'USER' : node.type === 'Recipe' ? 'REC' : node.type.slice(0, 3).toUpperCase()}</span>
        {hi && (
          <span style={{
            position: 'absolute', top: -10, right: -14, fontSize: 8.5, fontWeight: 700,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
            background: 'var(--recipe)', color: '#1a1206', padding: '2px 7px',
            borderRadius: 999, boxShadow: '0 0 14px -2px var(--recipe)',
          }}>★ PARA TI</span>
        )}
      </div>
      <div style={{ textAlign: 'center', lineHeight: 1.25 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: hi ? '#fff' : 'var(--text-100)' }}>{node.label}</div>
        <div className="rel-tag" style={{ color, marginTop: 2 }}>{node.type}</div>
      </div>
    </div>
  );
}

function Connector2({ rel, index, total }) {
  const incoming = rel.direction === 'incoming';
  const Arrow = (
    <span style={{
      fontSize: 14, color: 'var(--text-300)', lineHeight: 1,
      transform: incoming ? 'scaleX(-1)' : 'none', flex: '0 0 auto',
    }}>➜</span>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
      <span className="rel-tag" style={{
        fontSize: 8.5, color: incoming ? 'var(--user)' : 'var(--text-300)', textAlign: 'center',
        maxWidth: 110, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{rel.relation}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
        {incoming && Arrow}
        <div className="rp-conn-2">
          <div className="rp-spark-2" style={{
            animationDelay: `${index * (3.6 / Math.max(total, 1))}s`,
            transform: incoming ? 'translateY(-50%) scaleX(-1)' : 'translateY(-50%)',
          }} />
        </div>
        {!incoming && Arrow}
      </div>
    </div>
  );
}

window.RecommendationPath = RecommendationPath;
window.__mockData_2 = mockData_2;
