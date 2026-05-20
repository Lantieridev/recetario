# Explicación Consolidada de Features (Ramas Git)

Este documento detalla el propósito de cada una de las ramas (`features`) creadas durante el ciclo de vida del proyecto, explicando qué aportó cada etapa al producto final.

---

## 1. `feature/stage-1-config` (Inicialización)
*   **Propósito:** Sentar las bases del proyecto backend en Node.js.
*   **Qué hace:** Configura el entorno como módulos ES (`"type": "module"`), instala dependencias críticas (Express, Dotenv, Cors, Morgan) e instancia el driver oficial de Neo4j en `config/neo4j.js`, permitiendo conectarse al cluster de Aura mediante variables de entorno en `.env`.

## 2. `feature/stage-2-seeder` (Población de Datos)
*   **Propósito:** Automatizar la inyección de datos de prueba en la base de datos de grafos.
*   **Qué hace:** Implementa el script `utils/seeder.js` (ejecutable vía `npm run seed`), el cual procesa y envía de forma secuencial todas las consultas Cypher definidas en el archivo `poblar_recetario.cypher`. Esto genera los nodos (Usuarios, Recetas, Categorías, Ingredientes) y sus respectivas relaciones de manera automatizada.

## 3. `feature/stage-3-api` (Controladores y Lógica Cypher)
*   **Propósito:** Construir la lógica de la API REST que comunica al servidor con Neo4j.
*   **Qué hace:** Define todas las rutas en `/routes` y establece la lógica principal en `/controllers`. Implementa explícitamente consultas Cypher para listar recetas, registrar usuarios, guardar favoritos, y ejecutar dos consultas complejas: 
    *   Filtro colaborativo de recomendaciones de recetas.
    *   Buscador inteligente para cruzar ingredientes en la heladera con recetas que los requieran.
    *   *(Recientemente, también se agregó en esta rama el soporte en Cypher para filtrar la búsqueda inteligente por categoría, tiempo y dificultad).*

## 4. `feature/stage-4-docs` (Pruebas y Documentación)
*   **Propósito:** Asegurar la calidad y documentar el uso de la API.
*   **Qué hace:** Introduce el script automatizado `test-endpoints.js` para probar con solicitudes HTTP reales (Fetch) la funcionalidad correcta de los endpoints contra el clúster. También establece el archivo principal `README.md` que detalla los cuerpos de solicitud (Body) e instrucciones de instalación.

## 5. `feature/stage-5-frontend` (Integración de la UI y Arreglos Finales)
*   **Propósito:** Conectar el cliente web React existente con nuestro nuevo servidor backend.
*   **Qué hace:** 
    *   Se adaptó la aplicación de Express (`app.js`) para servir de forma estática la carpeta compilada `/FrontEnd`.
    *   Se crearon endpoints adicionales (login, listar categorías e ingredientes) requeridos específicamente por los componentes visuales.
    *   Se reescribió por completo el archivo `FrontEnd/src/api.js` (eliminando la persistencia en memoria local falsa) y reemplazándolo por llamadas a la API REST que interactúan con Neo4j.
    *   Se corrigieron fallas visuales de la plantilla (eliminación de íconos superpuestos, ajustes de tema claro en la sección colaborativa de perfiles).
    *   Se enlazó la Interfaz Gráfica con el Buscador Inteligente, permitiendo que el usuario escoja filtros adicionales a sus ingredientes desde un desplegable en `search.jsx`.
