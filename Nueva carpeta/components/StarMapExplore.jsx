/* ============================================================================
   COMPONENTE 4 · StarMapExplore
   ----------------------------------------------------------------------------
   Lienzo 2D arrastrable (canvas) tipo "sistema solar":
     · Las Categorías son SOLES grandes con corona.
     · Las Recetas son PLANETAS que orbitan su categoría (animación real).
   Arrastrá para desplazarte, rueda para zoom, click en un planeta para abrir
   un panel glassmorphism con el detalle.

   PROPS
     exploreGraph : { nodes:[{id,label,type,size}], links:[{source,target,label}] }
     onOpenRecipe : (recipeNode) => void   (opcional — al pulsar "Ver receta")

   --- USO EN EL REPO ---------------------------------------------------------
     import { useRef, useEffect, useState, useMemo } from 'react';
     export default function StarMapExplore({ exploreGraph, onOpenRecipe }) { ... }
   --------------------------------------------------------------------------- */

const { useRef: useRef4, useEffect: useEffect4, useState: useState4, useMemo: useMemo4 } = React;

// ---- MOCK (reemplazar por fetch('/api/grafos/explore')) ---------------------
const mockData_4 = {
  exploreGraph: {
    nodes: [
      { id: 'c-1', label: 'Postres',          type: 'Category', size: 30 },
      { id: 'r-1', label: 'Tarta de Manzana', type: 'Recipe',   size: 15 },
      { id: 'r-2', label: 'Flan',             type: 'Recipe',   size: 15 },
    ],
    links: [
      { source: 'r-1', target: 'c-1', label: 'PERTENECE_A' },
      { source: 'r-2', target: 'c-1', label: 'PERTENECE_A' },
    ],
  },
};

const SUN_COLOR_4 = { core: '#FB8C3C', glow: '251,140,60' };
const PLANET_COLOR_4 = { core: '#F5A524', glow: '245,165,36' };

function StarMapExplore({ exploreGraph = mockData_4.exploreGraph, onOpenRecipe }) {
  const wrapRef = useRef4(null);
  const canvasRef = useRef4(null);
  const view = useRef4({ camX: 0, camY: 0, zoom: 1 });
  const planetsScreen = useRef4([]);   // posiciones en pantalla para hit-test
  const drag = useRef4({ on: false, moved: 0, x: 0, y: 0 });
  const stars = useRef4([]);
  const [selected, setSelected] = useState4(null);
  const [hoverId, setHoverId] = useState4(null);
  // Espejos en refs: el bucle de render los lee sin re-suscribirse en cada interacción
  const selectedRef = useRef4(null);
  const hoverRef = useRef4(null);
  useEffect4(() => { selectedRef.current = selected; }, [selected]);
  useEffect4(() => { hoverRef.current = hoverId; }, [hoverId]);

  // Modelo: ubicar soles y asignar órbitas a los planetas (una sola vez)
  const model = useMemo4(() => {
    const cats = exploreGraph.nodes.filter((n) => n.type === 'Category')
      .map((c) => ({ ...c }));
    const recipes = exploreGraph.nodes.filter((n) => n.type === 'Recipe')
      .map((r) => ({ ...r }));
    const catOf = {};
    exploreGraph.links.forEach((l) => {
      const src = typeof l.source === 'object' ? l.source.id : l.source;
      const tgt = typeof l.target === 'object' ? l.target.id : l.target;
      catOf[src] = tgt; // Recipe PERTENECE_A Category
    });
    // posición de cada sol
    cats.forEach((c, i) => {
      if (cats.length === 1) { c.wx = 0; c.wy = 0; }
      else { const a = (i / cats.length) * Math.PI * 2; const R = 320; c.wx = Math.cos(a) * R; c.wy = Math.sin(a) * R; }
    });
    const catById = Object.fromEntries(cats.map((c) => [c.id, c]));
    // órbita de cada planeta
    const groups = {};
    recipes.forEach((r) => { const cid = catOf[r.id]; (groups[cid] ||= []).push(r); });
    Object.entries(groups).forEach(([cid, list]) => {
      const cat = catById[cid];
      list.forEach((r, idx) => {
        r.cat = cat;
        r.catId = cid;
        r.baseAngle = (idx / list.length) * Math.PI * 2;
        r.radius = (cat ? cat.size : 30) + 70 + (idx % 2) * 48;
        r.speed = 0.16 / Math.sqrt(r.radius); // rad/seg (más lento hacia afuera)
        r.dir = idx % 2 === 0 ? 1 : -1;
      });
    });
    return { cats, recipes, catById };
  }, [exploreGraph]);

  // Campo de estrellas de fondo
  useEffect4(() => {
    stars.current = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.2,
      a: Math.random() * 0.5 + 0.15, tw: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Bucle de render
  useEffect4(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf, w = 0, h = 0, dpr = 1;

    const resize = () => {
      const rect = wrapRef.current.getBoundingClientRect();
      w = rect.width; h = rect.height; dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrapRef.current);

    const toScreen = (wx, wy) => ({
      sx: w / 2 + (wx - view.current.camX) * view.current.zoom,
      sy: h / 2 + (wy - view.current.camY) * view.current.zoom,
    });

    const frame = (now) => {
      const t = now / 1000;
      const z = view.current.zoom;
      ctx.clearRect(0, 0, w, h);

      // estrellas
      stars.current.forEach((s) => {
        const tw = 0.5 + 0.5 * Math.sin(t * 1.5 + s.tw);
        ctx.fillStyle = `rgba(255,235,200,${s.a * tw})`;
        ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, 7); ctx.fill();
      });

      // órbitas (anillos tenues)
      model.recipes.forEach((r) => {
        if (!r.cat) return;
        const c = toScreen(r.cat.wx, r.cat.wy);
        ctx.strokeStyle = 'rgba(245,178,90,0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(c.sx, c.sy, r.radius * z, 0, 7); ctx.stroke();
      });

      // soles
      model.cats.forEach((cat) => {
        const p = toScreen(cat.wx, cat.wy);
        const R = (cat.size || 30) * z;
        const corona = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, R * 3);
        corona.addColorStop(0, `rgba(${SUN_COLOR_4.glow},0.55)`);
        corona.addColorStop(0.4, `rgba(${SUN_COLOR_4.glow},0.18)`);
        corona.addColorStop(1, `rgba(${SUN_COLOR_4.glow},0)`);
        ctx.fillStyle = corona;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, R * 3, 0, 7); ctx.fill();
        const body = ctx.createRadialGradient(p.sx - R * 0.3, p.sy - R * 0.3, 0, p.sx, p.sy, R);
        body.addColorStop(0, '#ffd27a'); body.addColorStop(1, SUN_COLOR_4.core);
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, R, 0, 7); ctx.fill();
        // etiqueta sol
        ctx.font = `600 ${Math.max(12, 14 * z)}px 'Sora', sans-serif`;
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(cat.label, p.sx, p.sy);
        ctx.font = `500 ${Math.max(8, 9 * z)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = 'rgba(255,225,190,0.8)';
        ctx.fillText('CATEGORÍA', p.sx, p.sy + R + 12);
      });

      // planetas
      const screenList = [];
      model.recipes.forEach((r) => {
        if (!r.cat) return;
        const ang = r.baseAngle + t * r.speed * r.dir;
        r.wx = r.cat.wx + Math.cos(ang) * r.radius;
        r.wy = r.cat.wy + Math.sin(ang) * r.radius;
        const p = toScreen(r.wx, r.wy);
        const R = (r.size || 14) * 0.7 * z;
        const isSel = selectedRef.current && selectedRef.current.id === r.id;
        const isHov = hoverRef.current === r.id;
        screenList.push({ id: r.id, x: p.sx, y: p.sy, R: Math.max(R, 9), node: r });

        const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, R * (isSel || isHov ? 4 : 2.6));
        glow.addColorStop(0, `rgba(${PLANET_COLOR_4.glow},${isSel || isHov ? 0.6 : 0.35})`);
        glow.addColorStop(1, `rgba(${PLANET_COLOR_4.glow},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, R * (isSel || isHov ? 4 : 2.6), 0, 7); ctx.fill();

        const body = ctx.createRadialGradient(p.sx - R * 0.4, p.sy - R * 0.4, 0, p.sx, p.sy, R);
        body.addColorStop(0, '#ffd98f'); body.addColorStop(1, PLANET_COLOR_4.core);
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, R, 0, 7); ctx.fill();
        ctx.lineWidth = isSel ? 2.4 : 1;
        ctx.strokeStyle = isSel ? '#fff' : 'rgba(255,255,255,0.45)';
        ctx.stroke();

        if (z > 0.7 || isSel || isHov) {
          ctx.font = `600 ${Math.max(11, 12 * z)}px 'Sora', sans-serif`;
          ctx.fillStyle = isSel || isHov ? '#fff' : 'rgba(246,239,228,0.85)';
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText(r.label, p.sx, p.sy + R + 5);
        }
      });
      planetsScreen.current = screenList;
      raf = requestAnimationFrame(frame);
    };
    // Primer frame sincrónico (los efectos corren aunque el documento esté oculto,
    // a diferencia de requestAnimationFrame): garantiza contenido inmediato.
    frame(performance.now());
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [model]);

  // Interacción: pan / zoom / click / hover
  const onDown = (e) => {
    drag.current = { on: true, moved: 0, x: e.clientX, y: e.clientY };
  };
  const onMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (drag.current.on) {
      const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
      drag.current.moved += Math.abs(dx) + Math.abs(dy);
      view.current.camX -= dx / view.current.zoom;
      view.current.camY -= dy / view.current.zoom;
      drag.current.x = e.clientX; drag.current.y = e.clientY;
    } else {
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const hit = planetsScreen.current.find((p) => Math.hypot(p.x - mx, p.y - my) <= p.R + 6);
      setHoverId(hit ? hit.id : null);
      if (canvasRef.current) canvasRef.current.style.cursor = hit ? 'pointer' : 'grab';
    }
  };
  const onUp = (e) => {
    if (drag.current.on && drag.current.moved < 5) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const hit = planetsScreen.current.find((p) => Math.hypot(p.x - mx, p.y - my) <= p.R + 6);
      setSelected(hit ? hit.node : null);
    }
    drag.current.on = false;
  };
  const onWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left - rect.width / 2;
    const my = e.clientY - rect.top - rect.height / 2;
    const old = view.current.zoom;
    const next = Math.min(3, Math.max(0.4, old * (e.deltaY < 0 ? 1.12 : 0.89)));
    // mantener el punto bajo el cursor
    view.current.camX += mx / old - mx / next;
    view.current.camY += my / old - my / next;
    view.current.zoom = next;
  };
  const resetView = () => { view.current = { camX: 0, camY: 0, zoom: 1 }; setSelected(null); };

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
        onMouseLeave={() => { drag.current.on = false; setHoverId(null); }}
        onWheel={onWheel}
        style={{ display: 'block', cursor: 'grab', touchAction: 'none' }}
      />

      {/* Controles */}
      <div style={{ position: 'absolute', left: 16, bottom: 16, display: 'flex', gap: 8 }}>
        <button onClick={resetView} className="glass" style={smBtn4}>↺ Centrar</button>
        <span className="glass mono" style={{ ...smBtn4, color: 'var(--text-300)', cursor: 'default' }}>
          arrastrá · rueda = zoom
        </span>
      </div>

      {/* Panel de detalle glassmorphism */}
      {selected && (
        <div className="glass-strong" style={{
          position: 'absolute', top: 16, right: 16, width: 248,
          borderRadius: 'var(--r-md)', padding: '18px 18px 20px',
          boxShadow: '0 18px 50px -12px rgba(0,0,0,0.6)',
          animation: 'none',
        }}>
          <button onClick={() => setSelected(null)} style={closeBtn4}>✕</button>
          <span className="type-pill" style={{ color: 'var(--recipe)', borderColor: 'var(--recipe)' }}>RECIPE</span>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 12, letterSpacing: '-0.01em' }}>
            {selected.label}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-500)', marginTop: 4 }}>
            id: {selected.id}
          </div>
          <div style={{ height: 1, background: 'var(--glass-border)', margin: '14px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-300)' }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: 'var(--category)', boxShadow: '0 0 8px var(--category)' }} />
            Pertenece a <strong style={{ color: 'var(--text-100)' }}>{selected.cat ? selected.cat.label : '—'}</strong>
          </div>
          <button
            onClick={() => onOpenRecipe && onOpenRecipe(selected)}
            style={openBtn4}
          >Ver receta →</button>
        </div>
      )}
    </div>
  );
}

const smBtn4 = {
  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-100)',
  padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
};
const closeBtn4 = {
  position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: 6,
  border: 'none', background: 'rgba(255,255,255,0.08)', color: 'var(--text-300)',
  cursor: 'pointer', fontSize: 11,
};
const openBtn4 = {
  marginTop: 16, width: '100%', padding: '10px', borderRadius: 10, border: 'none',
  cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
  color: '#1a1206', background: 'linear-gradient(90deg, var(--recipe), var(--accent))',
  boxShadow: '0 0 22px -6px var(--recipe)',
};

window.StarMapExplore = StarMapExplore;
window.__mockData_4 = mockData_4;
