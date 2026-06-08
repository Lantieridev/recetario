# Recetario · Componentes de Grafo (UI)

Cuatro componentes React para visualizar el grafo de recetas de Neo4j.
Estética: espacio profundo, glassmorphism, nodos neón cálidos.

```
styles/theme.css                       Tokens (colores por tipo de nodo, fuentes, glass)
components/RecipeGraphBackground.jsx   1 · Fondo force-directed (detalle de receta)
components/RecommendationPath.jsx      2 · Explicador de recomendaciones (dashboard)
components/AllergyAlert.jsx            3 · Alerta de alergias + mini-grafo de conflicto
components/StarMapExplore.jsx          4 · Mapa estelar arrastrable (browse / explore)
index.html                             Showroom de revisión (no se sube al repo)
```

## Cómo integrar en el repo (Vite / CRA / Next)

Cada componente está escrito como un `.jsx` autocontenido. Para llevarlo a un
proyecto real con bundler, hacé 3 cambios mínimos en cada archivo:

1. **Reemplazá los `const ... = window....`** del inicio por imports ESM reales:
   ```jsx
   import { useRef, useEffect, useMemo, useState } from 'react';
   import ForceGraph2D from 'react-force-graph-2d'; // sólo comp. 1
   ```
2. **Cambiá el cierre** `window.MiComponente = MiComponente;` por:
   ```jsx
   export default MiComponente;
   ```
3. **Reemplazá el mock por el fetch.** Cada archivo expone su contrato como
   `const mockData_N = {...}` y lo usa como valor por defecto de la prop. En tu
   pantalla:
   ```jsx
   const [data, setData] = useState(null);
   useEffect(() => {
     fetch('/api/grafos/recipe/' + id).then(r => r.json()).then(setData);
   }, [id]);
   return data && <RecipeGraphBackground graphData={data.graphData} />;
   ```

Importá `styles/theme.css` una vez en tu entrypoint (define las variables CSS de
color y las fuentes Sora + JetBrains Mono).

## Contratos (props)

| Componente | Prop | Forma |
|---|---|---|
| RecipeGraphBackground | `graphData` | `{ nodes:[{id,label,type,val}], links:[{source,target,label}] }` |
| | `highlightId` | `string \| null` — id del nodo a iluminar (hover en la UI) |
| RecommendationPath | `recommendationPath` | `{ reason, path:[ {nodeId,label,type,highlight?} \| {relation,direction?} ] }` |
| AllergyAlert | `allergyConflict` | `{ hasConflict, userCondition, conflictPath:[ {type,label,danger?} \| {relation} ] }` |
| StarMapExplore | `exploreGraph` | `{ nodes:[{id,label,type,size}], links:[{source,target,label}] }` |
| | `onOpenRecipe` | `(recipeNode) => void` — al pulsar "Ver receta" |

Tipos de nodo soportados y su color: **Recipe** (ámbar), **Ingredient** (oliva),
**User** (coral), **Allergen** (rojo), **Category** (naranja sol). Si llega un
`type` desconocido cae al color de Ingredient.

## Nota sobre `react-force-graph` (componente 1)

El componente usa `react-force-graph-2d` tal como pide el brief. Para que el
layout se vea correcto **en cualquier entorno** (incluido este preview, donde el
worker de física de la librería no corre), el componente **siembra posiciones
radiales iniciales** (`x/y`) y resuelve los `links` a referencias de nodo dentro
del `useMemo` de `data`. Esto es 100% compatible con la app real: react-force-graph
toma esas posiciones como punto de partida y las refina con su simulación física.
Si querés un layout puramente físico, podés borrar el bloque de siembra en
`data` y dejar sólo el `.map(n => ({...n}))`.

## Showroom

`index.html` arma los 4 componentes en una sola página para revisión visual.
Carga React + Babel + react-force-graph por CDN. No forma parte del entregable
de código: es sólo para que veas los componentes funcionando.
