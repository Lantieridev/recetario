# Explicación de la Feature: Etapa 2 - Script de Semillero (Seeder)

Esta rama (`feature/stage-2-seeder`) incorpora la lógica para automatizar la inserción de datos iniciales en la base de datos de grafos de Neo4j Aura.

## Qué hace esta etapa

1.  **Script de Poblado (`utils/seeder.js`):**
    *   Este script lee dinámicamente el archivo `poblar_recetario.cypher` desde el sistema de archivos del backend.
    *   Analiza y divide el archivo por punto y coma (`;`) para separar cada bloque de consultas.
    *   Filtra líneas en blanco o comentarios y ejecuta secuencialmente cada sentencia Cypher utilizando la sesión del driver de Neo4j configurada en la etapa anterior.
    *   Permite poblar la base de datos entera de una sola vez con 24 bloques de instrucciones.

2.  **Configuración de Tareas en `package.json`:**
    *   Se registró el script `"seed": "node utils/seeder.js"` dentro de la sección `"scripts"` de `package.json`.
    *   Esto permite a cualquier desarrollador ejecutar el comando simple `npm run seed` en la terminal para poblar la base de datos automáticamente de forma local o en entornos de staging.

3.  **Datos insertados en el Grafo:**
    *   **5 Categorías:** 'SIN TACC', 'Vegetariano', 'Vegano', 'Pastas', 'Postre'.
    *   **3 Usuarios de Prueba:** 'Ornella', 'Juan', 'Ana'.
    *   **39 Ingredientes:** Lentejas, cebolla, zanahoria, pollo, etc.
    *   **10 Recetas de Cocina:** Guiso de lentejas, Pizza margherita, etc. con sus relaciones `CREO`, `PERTENECE_A` y `CONTIENE`.
    *   **Relación de Favoritos (`GUARDO_FAV`):** Guardados de recetas preestablecidos para cada usuario.
