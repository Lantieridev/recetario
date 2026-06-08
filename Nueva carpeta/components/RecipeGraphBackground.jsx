/* ============================================================================
   COMPONENTE 1 · RecipeGraphBackground
   ----------------------------------------------------------------------------
   Fondo animado (force-directed graph) para la pantalla de detalle de receta.
   El nodo Receta (grande) queda al centro; los Ingredientes orbitan alrededor.
   Pasale `highlightId` = id del nodo a iluminar cuando el usuario hace hover
   sobre un ingrediente en la UI de primer plano.

   PROPS
     graphData    : { nodes:[{id,label,type,val}], links:[{source,target,label}] }
     highlightId  : string | null   → id del nodo a resaltar
     interactive  : boolean          → permite zoom/pan/drag (default false: es fondo)

   --- USO EN EL REPO (Vite / CRA) -------------------------------------------
     import ForceGraph2D from 'react-force-graph-2d';
     import { useRef, useEffect, useMemo, useState } from 'react';
     export default function RecipeGraphBackground({ graphData, highlightId }) { ... }
   ...y borrá las dos líneas `const ... = window....` de abajo.
   --------------------------------------------------------------------------- */

const { useRef: useRef1, useEffect: useEffect1, useMemo: useMemo1, useState: useState1 } = React;
const ForceGraph2D = window.ForceGraph2D;

// Color por tipo de nodo (centralizado en theme.css; duplicado acá para canvas)
const NODE_COLORS_1 = {
  Recipe:     { core: '#F5A524', glow: '245,165,36' },
  Ingredient: { core: '#B9C46A', glow: '185,196,106' },
  User:       { core: '#E8825A', glow: '232,130,90' },
  Allergen:   { core: '#FF5347', glow: '255,83,71' },
  Category:   { core: '#FB8C3C', glow: '251,140,60' },
};

// ---- MOCK (el Arquitecto reemplaza por fetch('/api/grafos/recipe/:id')) -----
const mockData_1 = {
  graphData: {
    nodes: [
      { id: 'r-1', label: 'Tarta de Manzana', type: 'Recipe', val: 20 },
      { id: 'i-1', label: 'Manzana',          type: 'Ingredient', val: 10 },
      { id: 'i-2', label: 'Harina',           type: 'Ingredient', val: 10 },
      { id: 'i-3', label: 'Azúcar',           type: 'Ingredient', val: 10 },
    ],
    links: [
      { source: 'r-1', target: 'i-1', label: 'USA_INGREDIENTE' },
      { source: 'r-1', target: 'i-2', label: 'USA_INGREDIENTE' },
      { source: 'r-1', target: 'i-3', label: 'USA_INGREDIENTE' },
    ],
  },
};

// Hook: dimensiones del contenedor (mide de inmediato + observa cambios)
function useDims1(ref) {
  const [d, setD] = useState1({ w: 0, h: 0 });
  useEffect1(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setD({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [ref]);
  return d;
}

function RecipeGraphBackground({
  graphData = mockData_1.graphData,
  highlightId = null,
  interactive = false,
}) {
  const wrapRef = useRef1(null);
  const fgRef = useRef1(null);
  const { w, h } = useDims1(wrapRef);

  // Clonar para no mutar las props + sembrar un layout radial inicial
  // (Receta al centro, lo demás orbitando). En la app real, react-force-graph
  // refina estas posiciones con su física; las semillas sólo aceleran el layout.
  const data = useMemo1(() => {
    const nodes = graphData.nodes.map((n) => ({ ...n }));
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    // Resolver enlaces a referencias de nodo (necesario porque sembramos el layout)
    const links = graphData.links.map((l) => ({
      ...l,
      source: byId[typeof l.source === 'object' ? l.source.id : l.source],
      target: byId[typeof l.target === 'object' ? l.target.id : l.target],
    }));
    const center = nodes.find((n) => n.type === 'Recipe') || nodes[0];
    if (center) { center.x = 0; center.y = 0; }
    const others = nodes.filter((n) => n !== center);
    const R = 130;
    others.forEach((n, i) => {
      const ang = (i / Math.max(others.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const ring = R + (i % 2) * 46;
      n.x = Math.cos(ang) * ring;
      n.y = Math.sin(ang) * ring;
    });
    return { nodes, links };
  }, [graphData]);

  // Física (activa en la app real; en este preview las semillas ya posicionan)
  // y encuadre de cámara desplazado a la derecha de la tarjeta de detalle.
  useEffect1(() => {
    const fg = fgRef.current;
    if (!fg) return;
    if (fg.d3Force('charge')) fg.d3Force('charge').strength(-260);
    if (fg.d3Force('link')) fg.d3Force('link').distance(100).strength(1);
    fg.centerAt(-120, 0, 0);
    fg.zoom(1.05, 0);
  }, [data, w, h]);

  const handleStop = () => {};

  const paintNode = (node, ctx, scale) => {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;
    const c = NODE_COLORS_1[node.type] || NODE_COLORS_1.Ingredient;
    const base = Math.sqrt(node.val || 8) * 1.7 + 3;
    const isHi = node.id === highlightId;
    const isRecipe = node.type === 'Recipe';

    // halo / glow
    const glowR = base * (isHi ? 4.2 : isRecipe ? 3 : 2.4);
    const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
    const a = isHi ? 0.6 : isRecipe ? 0.4 : 0.28;
    grd.addColorStop(0, `rgba(${c.glow},${a})`);
    grd.addColorStop(1, `rgba(${c.glow},0)`);
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(node.x, node.y, glowR, 0, 2 * Math.PI); ctx.fill();

    // núcleo
    ctx.beginPath(); ctx.arc(node.x, node.y, base, 0, 2 * Math.PI);
    ctx.fillStyle = c.core; ctx.fill();
    ctx.lineWidth = (isHi ? 2.2 : 1) / scale;
    ctx.strokeStyle = `rgba(255,245,230,${isHi ? 0.95 : 0.4})`;
    ctx.stroke();

    // etiqueta (siempre en Receta y nodo resaltado; el resto al acercar)
    if (isRecipe || isHi || scale > 1.4) {
      const fs = (isRecipe ? 13 : 11) / scale;
      ctx.font = `${isRecipe ? 600 : 500} ${fs}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isHi ? '#fff' : 'rgba(246,239,228,0.82)';
      ctx.fillText(node.label, node.x, node.y + base + 4 / scale);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }}>
      {w > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={w}
          height={h}
          graphData={data}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={5}
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={(node, color, ctx) => {
            if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;
            const r = Math.sqrt(node.val || 8) * 1.7 + 6;
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, 2 * Math.PI); ctx.fill();
          }}
          linkColor={() => 'rgba(245,178,90,0.22)'}
          linkWidth={(l) =>
            (highlightId && (l.target.id === highlightId || l.source.id === highlightId)) ? 2.2 : 0.8
          }
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={(l) =>
            (highlightId && (l.target.id === highlightId || l.source.id === highlightId)) ? 3.4 : 1.8
          }
          linkDirectionalParticleColor={() => 'rgba(255,206,107,0.9)'}
          linkDirectionalParticleSpeed={0.006}
          cooldownTime={4000}
          d3VelocityDecay={0.32}
          onEngineStop={handleStop}
          enableZoomInteraction={interactive}
          enablePanInteraction={interactive}
          enableNodeDrag={interactive}
        />
      )}
    </div>
  );
}

window.RecipeGraphBackground = RecipeGraphBackground;
window.__mockData_1 = mockData_1;
