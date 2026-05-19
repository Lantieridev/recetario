# Explicación de la Feature: Etapa 3 - Desarrollo de la API (8 Endpoints)

Esta rama (`feature/stage-3-api`) incorpora toda la estructura HTTP (rutas y controladores de Express.js) para exponer la API Rest y ejecutar las consultas de grafos en Cypher.

## Qué hace esta etapa

1.  **Creación del Servidor Express (`app.js` y `server.js`):**
    *   Se configuraron los middlewares globales como `cors` para el acceso externo y `morgan` para registrar solicitudes entrantes en consola.
    *   Se estructuró el arranque del servidor en un puerto configurable desde variables de entorno.

2.  **Definición de Rutas y Controladores:**
    *   Se dividió la lógica en dos submódulos organizados: `/api/usuarios` y `/api/recetas`.
    *   Los controladores ejecutan código Cypher puro y explícito a través del driver, garantizando control total de los grafos sin ORM.

3.  **Los 8 Endpoints Implementados:**
    *   **Usuarios (`/api/usuarios`):**
        1.  `POST /`: Crea un nodo `Usuario`.
        2.  `GET /:nombre`: Lee perfil, recetas creadas (`[:CREO]`) y favoritas (`[:GUARDO_FAV]`).
        3.  `POST /:nombre/favoritos`: Vincula usuario con receta mediante `GUARDO_FAV`.
        4.  `GET /:nombre/recomendaciones` **(Consulta Compleja 1)**: Algoritmo de filtrado colaborativo en grafos que analiza recetas comunes con otros usuarios para sugerir 5 nuevas recetas no guardadas previamente.
    *   **Recetas (`/api/recetas`):**
        5.  `POST /`: Registra una `Receta` y la enlaza a su creador (`Usuario`) y a su `Categoria`.
        6.  `POST /:titulo/ingredientes`: Agrega o enlaza un `Ingrediente` especificando la propiedad `cantidad` de la relación `CONTIENE`.
        7.  `GET /`: Lista las recetas permitiendo aplicar filtros de `categoria`, `dificultad` o `tiempo`.
        8.  `GET /buscar` **(Consulta Compleja 2)**: Buscador inteligente en grafo que recibe ingredientes disponibles (`tengo`) e indeseados (`noQuiero`), devolviendo recetas ordenadas por número de coincidencias y detallando qué ingredientes específicos te hacen falta para completarlas.

4.  **Pruebas de Integración (`test-endpoints.js`):**
    *   Se incluyó un script automatizado que inicia el servidor Express temporalmente, ejecuta llamadas a cada uno de los 8 endpoints y verifica que la base de datos Neo4j Aura devuelva datos y relaciones correctamente.
