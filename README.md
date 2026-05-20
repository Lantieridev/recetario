# API Backend Recetario - Conexión Neo4j con Cypher Explícito

Este proyecto consiste en un backend desarrollado en **Node.js** y **Express.js** que interactúa de manera directa con una base de datos de grafos **Neo4j Aura** utilizando el driver oficial de JavaScript. El backend ejecuta consultas Cypher de forma explícita sin la intermediación de un ORM u OGM.

---

## 📁 Estructura del Proyecto

```text
TP2_Neo4j/
├── .env                         # Variables de entorno (Credenciales de Neo4j) - Ignorado en Git
├── .gitignore                   # Archivos excluidos del control de versiones
├── package.json                 # Configuración de Node.js y dependencias
├── server.js                    # Punto de entrada y arranque del servidor
├── app.js                       # Configuración y middleware de Express.js
├── test-connection.js           # Script rápido de prueba de conexión a la BD
├── test-endpoints.js            # Script de pruebas automatizadas para los 8 endpoints
├── config/
│   └── neo4j.js                 # Inicialización y cierre del Driver oficial de Neo4j
├── controllers/
│   ├── recetasController.js     # Controladores y consultas Cypher para Recetas
│   └── usuariosController.js    # Controladores y consultas Cypher para Usuarios
├── routes/
│   ├── recetasRoutes.js         # Definición de endpoints para Recetas
│   └── usuariosRoutes.js        # Definición de endpoints para Usuarios
└── utils/
    └── seeder.js                # Script de sembrado de datos desde 'poblar_recetario.cypher'
```

---

## 🛠️ Etapas del Desarrollo

### Etapa 1: Inicialización y Configuración
*   Configuración de la estructura de Node.js como ES Modules (`"type": "module"`).
*   Instalación de dependencias: `express` (servidor HTTP), `neo4j-driver` (driver oficial), `dotenv` (variables de entorno), `cors` (soporte de solicitudes cross-origin), y `morgan` (logger de solicitudes).
*   Configuración del cliente Neo4j (`config/neo4j.js`) para manejar sesiones y conexiones al cluster Aura.
*   Creación de un archivo de prueba (`test-connection.js`) que validó la conexión exitosa al servidor Aura y la correcta ejecución de una consulta básica.

### Etapa 2: Script de Semillero (Seeder)
*   Desarrollo de `utils/seeder.js` que lee secuencialmente el archivo `poblar_recetario.cypher`, divide las sentencias por punto y coma, limpia los espacios y comentarios opcionales, y ejecuta cada bloque en la base de datos de grafos.
*   Se agregó la ejecución del sembrado mediante el comando `npm run seed`, el cual pobló el grafo completo con 24 bloques de sentencias que incluyen categorías, usuarios de prueba, ingredientes, recetas, relaciones `CREO`, `PERTENECE_A`, `CONTIENE` y `GUARDO_FAV`.

### Etapa 3: Desarrollo de la API (8 Endpoints con Cypher Explícito)
*   **Usuarios (`/api/usuarios`):**
    *   `POST /`: Creación de un nodo `Usuario`.
    *   `GET /:nombre`: Obtención de perfil junto con sus recetas creadas (`[:CREO]`) y guardadas en favoritos (`[:GUARDO_FAV]`).
    *   `POST /:nombre/favoritos`: Creación de la relación `GUARDO_FAV` entre un `Usuario` y una `Receta`.
    *   `GET /:nombre/recomendaciones`: **(Consulta Compleja 1 - Filtro Colaborativo)** Recomienda recetas a un usuario en base a lo que han guardado otros usuarios con gustos comunes, ordenados por nivel de coincidencia.
*   **Recetas (`/api/recetas`):**
    *   `POST /`: Creación de una `Receta` enlazada con su `Usuario` creador y su `Categoria`.
    *   `POST /:titulo/ingredientes`: Creación o enlace de un `Ingrediente` a una `Receta` gestionando la propiedad `cantidad` de la relación `CONTIENE`.
    *   `GET /`: Búsqueda de recetas aplicando filtros dinámicos (`categoria`, `dificultad`, `tiempo`).
    *   `GET /buscar`: **(Consulta Compleja 2 - Buscador Inteligente)** Filtra recetas por ingredientes que el usuario tiene y excluye los que no desea, devolviendo la cantidad de coincidencias y un listado detallado de ingredientes faltantes.

### Etapa 4: Pruebas y Documentación
*   Creación de `test-endpoints.js` para realizar pruebas de integración de extremo a extremo, validando las respuestas JSON y los códigos de estado HTTP de los 8 endpoints.
*   Redacción del presente documento explicativo de las etapas de desarrollo.

### Etapa 5: Integración Frontend-Backend
*   Se renombró y sirvió de manera estática el cliente web de React (ubicado en `/FrontEnd`) directamente a través de Express.
*   Se crearon nuevos endpoints para alimentar el frontend: `POST /api/usuarios/login`, `POST /api/usuarios/:nombre/favoritos/toggle`, `GET /api/recetas/categorias`, y `GET /api/recetas/ingredientes`.
*   Se actualizó el endpoint de buscar y listar recetas para devolver la información estructurada (como la categoría y el creador) que requiere la interfaz visual.
*   Se reescribió `FrontEnd/src/api.js` reemplazando los mocks de memoria local por llamadas HTTP `fetch` reales conectadas a la API REST, logrando un flujo "Fullstack Neo4j" 100% operativo en `http://localhost:3000/`.

---

## 📌 Detalle de los 8 Endpoints y Consultas Cypher

### 1. Crear Usuario
*   **Ruta:** `POST /api/usuarios`
*   **Body (JSON):**
    ```json
    {
      "nombre": "Carlos",
      "mail": "carlos@mail.com",
      "contrasena": "carlos123"
    }
    ```
*   **Cypher:**
    ```cypher
    CREATE (u:Usuario {nombre: $nombre, mail: $mail, contrasena: $contrasena})
    RETURN u.nombre AS nombre, u.mail AS mail
    ```

### 2. Obtener Perfil de Usuario
*   **Ruta:** `GET /api/usuarios/:nombre`
*   **Cypher:**
    ```cypher
    MATCH (u:Usuario {nombre: $nombre})
    OPTIONAL MATCH (u)-[:CREO]->(c:Receta)
    OPTIONAL MATCH (u)-[:GUARDO_FAV]->(f:Receta)
    RETURN u.nombre AS nombre, u.mail AS mail, 
           collect(DISTINCT c.titulo) AS creadas, 
           collect(DISTINCT f.titulo) AS favoritas
    ```

### 3. Crear Receta vinculada a Creador y Categoría
*   **Ruta:** `POST /api/recetas`
*   **Body (JSON):**
    ```json
    {
      "titulo": "Pollo al verdeo",
      "descripcion": "Riquísimo pollo al verdeo con crema",
      "dificultad": "Media",
      "tiempo": "35 min",
      "pasos": "1. Cortar el pollo. 2. Saltear con verdeo. 3. Agregar crema.",
      "creador": "Carlos",
      "categoria": "SIN TACC"
    }
    ```
*   **Cypher:**
    ```cypher
    MATCH (u:Usuario {nombre: $creador})
    MATCH (c:Categoria {nombre: $categoria})
    CREATE (r:Receta {
        titulo: $titulo,
        descripcion: $descripcion,
        dificultad: $dificultad,
        tiempo: $tiempo,
        pasos: $pasos
    })
    CREATE (u)-[:CREO]->(r)
    CREATE (r)-[:PERTENECE_A]->(cat:Categoria {nombre: $categoria})
    RETURN r.titulo AS titulo, u.nombre AS creador, cat.nombre AS categoria
    ```

### 4. Asociar Ingrediente a Receta (con propiedad de relación)
*   **Ruta:** `POST /api/recetas/:titulo/ingredientes`
*   **Body (JSON):**
    ```json
    {
      "nombreIngrediente": "Pollo",
      "cantidad": "500g"
    }
    ```
*   **Cypher:**
    ```cypher
    MATCH (r:Receta {titulo: $titulo})
    MERGE (i:Ingrediente {nombre: $nombreIngrediente})
    MERGE (r)-[c:CONTIENE]->(i)
    SET c.cantidad = $cantidad
    RETURN r.titulo AS receta, i.nombre AS ingrediente, c.cantidad AS cantidad
    ```

### 5. Guardar Receta en Favoritos
*   **Ruta:** `POST /api/usuarios/:nombre/favoritos`
*   **Body (JSON):**
    ```json
    {
      "tituloReceta": "Pizza margherita"
    }
    ```
*   **Cypher:**
    ```cypher
    MATCH (u:Usuario {nombre: $nombre})
    MATCH (r:Receta {titulo: $tituloReceta})
    MERGE (u)-[f:GUARDO_FAV]->(r)
    RETURN u.nombre AS usuario, r.titulo AS receta
    ```

### 6. Listar y Filtrar Recetas
*   **Ruta:** `GET /api/recetas`
*   **Parámetros query (Opcionales):** `categoria`, `dificultad`, `tiempo` (Ej: `/api/recetas?categoria=SIN TACC`)
*   **Cypher:**
    ```cypher
    MATCH (r:Receta)
    WHERE ($categoria IS NULL OR (r)-[:PERTENECE_A]->(:Categoria {nombre: $categoria}))
      AND ($dificultad IS NULL OR r.dificultad = $dificultad)
      AND ($tiempo IS NULL OR r.tiempo = $tiempo)
    RETURN r.titulo AS titulo, r.descripcion AS descripcion, r.dificultad AS dificultad, r.tiempo AS tiempo
    ```

### 7. Recomendación Colaborativa (Consulta Compleja 1 - Grafo Completo)
*   **Ruta:** `GET /api/usuarios/:nombre/recomendaciones`
*   **Explicación:** Encuentra qué otras personas han marcado como favoritos las mismas recetas que el usuario (`yo`), busca qué otras recetas tienen en sus favoritos esas personas (`otro`) que `yo` aún no he guardado, y las sugiere puntuándolas según cuántas personas coinciden.
*   **Cypher:**
    ```cypher
    MATCH (yo:Usuario {nombre: $nombre})-[:GUARDO_FAV]->(:Receta)<-[:GUARDO_FAV]-(otro:Usuario)
    MATCH (otro)-[:GUARDO_FAV]->(recomendacion:Receta)
    WHERE NOT (yo)-[:GUARDO_FAV]->(recomendacion)
    RETURN recomendacion.titulo AS Recomendacion,
           recomendacion.descripcion AS Descripcion,
           recomendacion.dificultad AS Dificultad,
           recomendacion.tiempo AS Tiempo,
           COUNT(otro) AS NivelDeMatch
    ORDER BY NivelDeMatch DESC
    LIMIT 5
    ```

### 8. Buscador Inteligente (Consulta Compleja 2 - Grafo Completo)
*   **Ruta:** `GET /api/recetas/buscar`
*   **Parámetros query:** `tengo` (Ingredientes separados por coma), `noQuiero` (Ingredientes a excluir separados por coma)
*   **Explicación:** Filtra recetas descartando las que contengan ingredientes no deseados. Luego, analiza las recetas restantes buscando ingredientes que sí se poseen, indicando la cantidad de coincidencias y recolectando una lista dinámica con el nombre de todos los ingredientes faltantes.
*   **Cypher:**
    ```cypher
    MATCH (r:Receta)
    WHERE NOT EXISTS {
        MATCH (r)-[:CONTIENE]->(ex:Ingrediente)
        WHERE ex.nombre IN $ingredientes_no_quiero
    }
    MATCH (r)-[:CONTIENE]->(i:Ingrediente)
    WHERE i.nombre IN $ingredientes_tengo
    OPTIONAL MATCH (r)-[:CONTIENE]->(faltante:Ingrediente)
    WHERE NOT faltante.nombre IN $ingredientes_tengo
    RETURN r.titulo AS Receta,
           r.dificultad AS Dificultad,
           r.tiempo AS Tiempo,
           count(DISTINCT i) AS Coincidencias,
           collect(DISTINCT faltante.nombre) AS Que_Te_Falta
    ORDER BY Coincidencias DESC
    ```

---

## 🚀 Cómo Ejecutar el Proyecto

1.  **Instalar Dependencias:**
    ```bash
    npm install
    ```
2.  **Configurar Variables de Entorno:**
    Crear un archivo `.env` en la raíz con las credenciales provistas:
    ```env
    PORT=3000
    NEO4J_URI=neo4j+s://91e3e7b8.databases.neo4j.io
    NEO4J_USERNAME=91e3e7b8
    NEO4J_PASSWORD=aRXLSYDFhrJ3-Hym4Okw5pggIfz9Q0FuuPgAJCgIrvU
    NEO4J_DATABASE=91e3e7b8
    ```
3.  **Poblar la Base de Datos (Semillero):**
    ```bash
    npm run seed
    ```
4.  **Iniciar Servidor de Desarrollo:**
    ```bash
    node server.js
    ```
5.  **Ejecutar Pruebas Automatizadas de Endpoints:**
    ```bash
    node test-endpoints.js
    ```

---

## 📈 Ramas Git Utilizadas

El trabajo se estructuró dividiéndolo en ramas dedicadas para cada *feature*, siguiendo los estándares requeridos:
*   `feature/stage-1-config`: Inicialización del proyecto, instalación de módulos de Node.js y cliente con driver de Neo4j.
*   `feature/stage-2-seeder`: Implementación del script de sembrado automatizado de datos.
*   `feature/stage-3-api`: Creación de controladores, enrutadores de Express, endpoints y consultas Cypher correspondientes.
*   `feature/stage-4-docs`: Creación de la documentación completa del proyecto (`README.md`).
*   `feature/stage-5-frontend`: Reestructuración y conexión del cliente web React con el backend Neo4j a través de fetch.
