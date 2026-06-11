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

## 🚀 Roadmap Visión 2.0 y Modelo de Negocios (B2B)

Para que el proyecto sea financieramente viable y escalable a nivel Startup, el modelo de negocios se apalanca puramente en vender la inteligencia del grafo (B2B), no en cobrarle al usuario final (B2C).

### 1. El Motor Central: "Graph Bidding" (Nodos Patrocinados Dinámicos)
El núcleo comercial es un sistema de subastas algorítmicas. No vendemos banners publicitarios, vendemos **peso matemático en el algoritmo de recomendación**.
* **El Concepto:** Las empresas pujan por tener la mayor *centralidad* en el grafo. Si una empresa paga por patrocinar un ingrediente, reducimos matemáticamente el "costo" (`weight`) de recorrer la arista hacia ese nodo en la base de datos.
* **El Resultado:** Cuando Neo4j busca el camino más corto (Shortest Path / Dijkstra) para sugerirle una receta o un ingrediente al usuario, el algoritmo fluye *naturalmente* hacia el nodo patrocinado porque es el camino más "barato" de recorrer.
* **Cobro:** Modelo CPC (Costo por Clic) o por "Impresión Algorítmica" (cada vez que el algoritmo selecciona ese nodo por sobre otro).

**Casos de uso del Graph Bidding:**
* **Marcas de Alimentos:** Hellmann's puja para que el nodo "Mayonesa" derive en su marca específica cuando los usuarios buscan recetas de ensaladas.
* **Supermercados (Liquidación de Stock Inteligente):** En lugar de hacer una integración compleja de carritos, si un supermercado necesita deshacerse de toneladas de pollo antes de que venza, usan nuestro sistema de Bidding para patrocinar masivamente el nodo "Pollo". El algoritmo ajusta los pesos instantáneamente y miles de usuarios empiezan a recibir sugerencias óptimas de recetas con pollo, liquidando el inventario del supermercado a cambio de una tarifa de patrocinio.

### 2. Visión a Futuro (Horizonte 3.0): Data-as-a-Service para I+D
A muy largo plazo, la base de datos anonimizada se convierte en un producto en sí mismo.
* Corporaciones alimenticias (ej. Nestlé) pagan una suscripción Enterprise para acceder al grafo.
* Utilizan algoritmos de *Graph Data Science* para descubrir tendencias emergentes, analizando qué combinaciones raras de ingredientes están haciendo los usuarios en sus casas antes de que se vuelvan populares comercialmente.
