# Explicación de la Feature: Etapa 5 - Integración Frontend y Servidor Completo

Esta rama (`feature/stage-5-frontend`) consolida el proyecto unificando el backend de Neo4j con el cliente web de React.

## Qué hace esta etapa

1.  **Servidor Estático y Renombre:**
    *   Se renombró la carpeta cliente a `FrontEnd`.
    *   Se configuró `express.static('FrontEnd')` en `app.js` para exponer el cliente en el puerto 3000 de forma automática.

2.  **Adaptación y Nuevos Endpoints:**
    *   Se incluyeron las proyecciones de `categoria` y `creador` a las consultas de Cypher de los endpoints pre-existentes (`/api/recetas` y `/api/recetas/buscar`) requeridas para que el FrontEnd arme sus tarjetas (`RecipeCard`).
    *   Se desarrollaron cuatro endpoints nuevos en los controladores, totalmente cubiertos por Neo4j:
        *   `POST /api/usuarios/login`
        *   `POST /api/usuarios/:nombre/favoritos/toggle`
        *   `GET /api/recetas/categorias`
        *   `GET /api/recetas/ingredientes`

3.  **Cliente API Real y Reescritura del Mock:**
    *   El archivo simulador del front (`FrontEnd/src/api.js`) se reescribió de manera completa y elegante.
    *   Ahora ejecuta llamadas HTTP (`fetch`) verdaderas asincrónicas a la API REST.
    *   Implementa un sistema de caché síncrono al arranque para no quebrar las interfaces de React existentes para la carga de componentes como menús de `categorias` o inputs predictivos de `todosIngredientes`.

4.  **Flujo Fullstack:**
    *   Desde este punto, arrancar con `node server.js` levanta de forma simultánea el cliente React y el servidor Express. Toda interacción del cliente viaja a la API y la API consulta y muta datos reales directamente desde el cluster gráfico de **Neo4j Aura**.
