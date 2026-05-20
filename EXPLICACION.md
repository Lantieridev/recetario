# Explicación de la Feature: Etapa 6 - Correcciones UI y Filtros Avanzados

Esta rama (`feature/stage-6-ui-filters`) incluye arreglos estéticos solicitados y una importante mejora en el motor del Buscador Inteligente, unificando filtrado por propiedades y filtrado por relaciones en Neo4j.

## Qué hace esta etapa

1.  **Arreglos Estéticos (Frontend):**
    *   **Barra de Búsqueda:** Se solucionó el problema del ícono de lupa duplicado en `browse.jsx` eliminando el componente superpuesto.
    *   **Tema de "Mi Cocina":** Se reescribió el esquema de colores de la sección de Recomendaciones Colaborativas (`profile.jsx`). Pasó de usar variables oscuras a variables claras (`var(--cream)` y `var(--paper)`), logrando una integración visual armónica con el resto de la interfaz.

2.  **Buscador Inteligente Evolucionado:**
    *   **Interfaz de Usuario (`search.jsx`):** Se integraron tres listas desplegables (Categoría, Dificultad, Tiempo) para permitir filtrado tradicional cruzado con el buscador de ingredientes.
    *   **Cliente API (`api.js`):** La función `buscarPorIngredientes` ahora recolecta estos tres nuevos parámetros de manera opcional y construye el query string para HTTP.
    *   **Neo4j y Backend (`recetasController.js`):** Se modificó la consulta Cypher compleja. Ahora, antes de contar coincidencias de ingredientes con la relación `CONTIENE`, filtra preventivamente los nodos `Receta` asegurándose de que cumplan con la `categoria` (vía relación `PERTENECE_A`) y con las propiedades internas `dificultad` y `tiempo` (usando lógica `$param IS NULL OR r.prop = $param`). Esto optimiza enormemente el rendimiento en el motor de grafos.
