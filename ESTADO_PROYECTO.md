# Estado Actual del Proyecto: Recetario Neo4j

Este documento detalla el nivel de completitud de cada módulo de la aplicación hasta la fecha, sirviendo como mapa de ruta para la cátedra de Bases de Datos No Relacionales y futuros desarrollos.

## 1. Backend y Base de Datos (Neo4j)
El backend es el núcleo fuerte del proyecto. Está construido en Node.js (Express) y utiliza el driver oficial de Neo4j.

* **CRUD Básico de Recetas e Ingredientes:** `[100% Completo]`
  * Creación de recetas, listado, filtrado por "tengo" y "no quiero".
  * Relaciones `(Receta)-[:CONTIENE]->(Ingrediente)` funcionales.
* **Sistema de Autenticación / Usuarios:** `[80% Completo]`
  * Creación de usuarios y sistema de favoritos `(Usuario)-[:GUARDO_FAV]->(Receta)`.
  * Faltaría agregar JWT y encriptación de contraseñas real para paso a producción.
* **Grafo de Alergias (Filtrado Dinámico):** `[100% Completo]`
  * Permite enlazar ingredientes con alérgenos `(Ingrediente)-[:PERTENECE_A_FAMILIA]->(Alergeno)`.
  * Búsqueda excluye dinámicamente cualquier receta cuyo ingrediente pertenezca a un alérgeno prohibido (Filtro de Ruta Negativa).
* **Motor de Recomendación Colaborativa:** `[100% Completo]`
  * Algoritmo Cypher que busca usuarios similares basados en recetas guardadas en común, recomendando lo que "tus gemelos de gustos" cocinan.
* **Fondo Interactivo de Nodos (API):** `[100% Completo]`
  * Endpoint `GET /api/recetas/:titulo/grafo` listo para alimentar librerías visuales de grafos en el frontend.

## 2. Frontend (React)
El frontend actualmente está en fase de transición. Tenemos el esqueleto funcional pero estamos descartando diseños genéricos para buscar una estética "Premium / Alta Cocina".

* **Estructura Base y Ruteo:** `[70% Completo]`
  * Rutas principales armadas (`/browse`, `/create`, `/detail`, `/comunidad`, `/dashboard`).
* **Diseño Visual (UI/UX):** `[20% Completo]`
  * Se generó código de prueba mediante Claude Design, pero no cumple con la calidad esperada.
  * *Estado:* En pausa. Se requiere implementar un sistema de diseño propio (Dark Slate, Glassmorphism, tipografías elegantes).
* **Integración con Neo4j (Visual):** `[0% Completo]`
  * Aún no se conectó el endpoint del grafo para renderizar los nodos flotando de fondo (requiere integrar `react-force-graph` u otra librería similar).

## 3. Integración y DevOps
* **Conexión Neo4j Aura:** `[100% Completo]`
  * Conectado a la nube exitosamente (recordar despertar la instancia si se pausa por inactividad).
* **Repositorio GitHub:** `[100% Completo]`
  * Versionado al día.

---

## 🚀 Ideas Posibles (Roadmap Visión 2.0)
Para llevar este proyecto a nivel de Startup "FoodTech", las próximas evoluciones matemáticas a realizar con grafos serían:

1. **Motor de Alacena "Zero Waste" (Rutas Mínimas):**
   * *Concepto:* El usuario declara qué le sobra en la heladera. Neo4j calcula un camino matemático (Shortest Path) para encadenar recetas durante 3 días asegurando que gaste hasta el último gramo de comida antes de que se pudra.
2. **Sinergia Nutricional (Grafo Científico):**
   * *Concepto:* Si una receta tiene mucho Hierro, el grafo detecta que se necesita Vitamina C para absorberlo, buscando en la BD una guarnición o bebida puente que la contenga para sugerir un "Combo Perfecto".
3. **Clustering de Sabores (Graph Data Science):**
   * *Concepto:* Usar algoritmos de Machine Learning en grafos (Louvain, Label Propagation) para agrupar recetas basándose en las combinaciones moleculares de sus ingredientes, descubriendo "Cocinas Ocultas" que los humanos no categorizamos.
4. **Planificador Semanal Automático:**
   * *Concepto:* Dado un presupuesto y objetivo calórico, el motor extrae un "Subgrafo" armando la lista de compras optimizada y el menú de lunes a domingo sin duplicar mermas.
