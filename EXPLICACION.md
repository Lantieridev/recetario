# Explicación de la Feature: Etapa 1 - Inicialización y Configuración

Esta rama (`feature/stage-1-config`) contiene la configuración inicial del entorno del servidor y la conexión base a la base de datos Neo4j Aura.

## Qué hace esta etapa

1.  **Inicialización del Proyecto Node.js:**
    Se creó el archivo `package.json` y se configuró como módulo ES (`"type": "module"`) para habilitar el uso moderno de sentencias `import/export`.

2.  **Instalación de Dependencias Clave:**
    *   `express`: Framework para construir el servidor y los endpoints.
    *   `neo4j-driver`: SDK oficial para conectar la aplicación Node.js a la base de datos de grafos Neo4j.
    *   `dotenv`: Administrador de variables de entorno para proteger datos sensibles como credenciales de acceso.
    *   `cors` y `morgan`: Middlewares para configurar el intercambio de recursos de origen cruzado y llevar registro (logging) de solicitudes HTTP.

3.  **Configuración del Driver de Neo4j (`config/neo4j.js`):**
    *   Se implementó la instanciación única del driver oficial de Neo4j utilizando la URI y autenticación básica desde las variables de entorno.
    *   Se expone la función `getSession()` encargada de proveer sesiones individuales para interactuar con la base de datos y la función `closeDriver()` para cerrar la conexión global ordenadamente.

4.  **Verificación de la Conexión (`test-connection.js`):**
    *   Script auxiliar de consola que establece una sesión, ejecuta una consulta simple (`RETURN 1 AS number`), imprime la versión y dirección del servidor Aura remoto y cierra la sesión. Sirve para garantizar que las credenciales del `.env` son correctas antes de iniciar el desarrollo de la API.
