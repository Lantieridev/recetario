# Documentación Técnica: Sistema de Monetización B2B y Dashboard de Administración

Esta documentación describe la arquitectura, el modelo de datos en grafos (Neo4j) y el flujo de seguridad implementado para la monetización B2B y el Dashboard del Administrador en el proyecto **Recetario**.

---

## 1. Arquitectura y Flujo General

El sistema permite que socios comerciales (marcas como Hellmann's, Nestlé o Carrefour) accedan a herramientas corporativas avanzadas de monetización en el grafo (Graph Bidding, Stock Clearance y Predictive Flavor Analytics).

La seguridad y los permisos de estas herramientas se gestionan de forma dinámica en la base de datos de grafos mediante relaciones de usuario. El ciclo de vida operativo es el siguiente:

```mermaid
graph TD
    A[Admin crea Partner en Panel Admin] -->|Registra nombre y dominio @brand.com| B(Partner en Neo4j)
    C[Usuario se registra con email corporativo] -->|Detección de dominio automática| D[Relación EMPLEADO_DE creada con activo:false]
    E[Admin revisa Panel Admin] -->|Aprueba cuenta con un clic| F[Relación EMPLEADO_DE actualizada a activo:true]
    G[Socio inicia sesión] -->|Acceso concedido a Portal B2B| H[Realiza pujas o consultas DaaS]
```

---

## 2. Modelo de Datos en Neo4j (Grafo B2B)

El modelo utiliza tres nodos y una relación clave para estructurar la seguridad corporativa:

### Nodos
* **`(:Usuario)`**: Representa a los usuarios del sistema. Posee propiedades como `nombre`, `mail` y `contrasena`. El usuario administrador cuenta con la propiedad especial `isAdmin: true`.
* **`(:Partner)`**: Representa a las marcas comerciales asociadas. Posee:
  * `nombre`: Nombre de la empresa (ej: `'Hellmanns'`).
  * `tier`: Nivel de servicio contratado (`'BRAND'`, `'RETAIL'`, o `'ENTERPRISE'`).
  * `dominio`: Dominio oficial de email corporativo de la empresa (ej: `'hellmanns.com'`).
* **`(:Ingrediente)`**: Nodo de ingrediente sobre el cual las marcas realizan pujas publicitaria usando la propiedad `pesoPatrocinio` (número flotante).

### Relaciones
* **`(:Usuario)-[r:EMPLEADO_DE]->(:Partner)`**: Conecta a un usuario registrado con una marca. Posee el atributo:
  * `activo`: Booleano (`true` o `false`). Determina si el administrador ya aprobó el acceso del usuario para pujar o ver analíticas a nombre de la empresa.

---

## 3. Seguridad y Controladores del Servidor

### A. Middleware de Autenticación de Administrador (`utils/adminAuth.js`)
Protege los endpoints de administración (`/api/admin/*`). Intercepta la petición y realiza una consulta rápida a Neo4j para validar si el usuario solicitante posee la propiedad `isAdmin: true`:
```cypher
MATCH (u:Usuario {nombre: $userName}) RETURN u.isAdmin AS isAdmin
```
Si es falso o no existe, retorna un código de error de seguridad `403 Forbidden`.

### B. Middleware de Autenticación B2B (`utils/b2bAuth.js`)
Controla el acceso a las APIs corporativas (`/api/b2b/*`). Resuelve la marca del usuario solicitante mediante su email (cabecera `X-USER-EMAIL`) ejecutando una consulta en el grafo que exige que la relación de empleado esté confirmada y activa:
```cypher
MATCH (u:Usuario {mail: $email})-[r:EMPLEADO_DE]->(p:Partner)
WHERE r.activo = true
RETURN p.nombre AS nombre, p.tier AS tier
```
Si no existe la relación o `activo` es `false`, retorna `403 Forbidden` impidiendo que el empleado opere o vea analíticas comerciales.

### C. Registro Automático con Coincidencia de Dominio
En el controlador [`usuariosController.js`](file:///c:/Users/lucas/.gemini/antigravity/scratch/recetario/controllers/usuariosController.js), al crear una cuenta nueva, el backend extrae el dominio del correo y busca si coincide con alguna empresa registrada. De ser así, crea la relación B2B de forma automática pero en estado **inactivo** (`activo: false`) para esperar la aprobación del administrador:
```cypher
MATCH (u:Usuario {nombre: $nombre})
WITH u
MATCH (p:Partner)
WHERE toLower(split(u.mail, '@')[1]) = toLower(p.dominio)
MERGE (u)-[:EMPLEADO_DE {activo: false}]->(p)
```

---

## 4. Endpoints de la API Administrativa (`/api/admin`)

* **`GET /stats`**: Devuelve estadísticas totales del grafo (usuarios, recetas, marcas, pujas activas).
* **`GET /partners`**: Lista todas las marcas comerciales, sus niveles y dominios.
* **`POST /partners`**: Registra o actualiza una marca comercial (Parámetros: `nombre`, `tier`, `dominio`).
* **`DELETE /partners/:nombre`**: Elimina una marca comercial y desvincula a todos sus usuarios.
* **`GET /users`**: Lista todos los usuarios comunes registrados en el sistema indicando su correo y si tienen una relación B2B pendiente o aprobada.
* **`POST /users/associate`**: Asocia manualmente a un usuario común a una marca (lo aprueba con `activo: true` inmediatamente).
* **`POST /users/confirm`**: Aprueba y activa una relación de socio corporativo pendiente (`r.activo = true`).
* **`POST /users/dissociate`**: Desvincula a un usuario de cualquier socio B2B (elimina la relación `[:EMPLEADO_DE]`).

---

## 5. Sincronización en Tiempo Real del Estado de Sesión (`GET /api/usuarios/:nombre/status`)

Para evitar inconsistencias de seguridad y de interfaz en el cliente React (por ejemplo, que un usuario siga viendo el Portal B2B o el Panel de Administración después de que sus permisos hayan sido revocados en la base de datos):
* El frontend realiza una llamada al navegar o al cambiar de ruta a este endpoint de sincronización.
* Si el rol local (almacenado en `localStorage`) difiere del estado actual en Neo4j (`isAdmin`, `isB2B`, o `tier`), el frontend actualiza la sesión de manera transparente e inmediata, y redirige al usuario si sus accesos fueron revocados.

---

## 6. Lógica de Búsqueda Inteligente e Ingredientes de Marca

### A. Concatenación Automática de Marca (Graph Bidding)
Para evitar que las marcas tengan que ingresar manualmente el nombre de su empresa al promocionar ingredientes en el portal (ej. ingresar `"Mayonesa Hellmanns"` en lugar de simplemente `"Mayonesa"`), el backend implementa una lógica de auto-concatenación:
* Si el ingrediente ingresado por el socio no contiene el nombre de su empresa (sin distinguir mayúsculas ni minúsculas), el servidor lo concatena automáticamente: `Ingrediente + " " + Marca`.
* Utiliza una sentencia `MERGE` en Neo4j, lo que crea automáticamente el ingrediente en el grafo si es nuevo:
  ```cypher
  MERGE (i:Ingrediente {nombre: $normalizedIngrediente})
  SET i.pesoPatrocinio = coalesce(i.pesoPatrocinio, 0) + $pesoAñadido
  RETURN i.nombre AS Ingrediente, i.pesoPatrocinio AS PesoActual
  ```

### B. Coincidencia por Límites de Palabra (Word-Boundary Matching)
En el buscador inteligente de recetas (`/api/recetas/buscar`), la consulta Cypher utiliza una lógica basada en límites de palabra para emparejar términos genéricos (ej. `"Aceite"`) con ingredientes específicos de marca (ej. `"Aceite Hellmanns"`):
* La condición en Cypher verifica que el ingrediente de la receta sea idéntico al término buscado, o comience/termine/contenga el término con espacios de separación correspondientes:
  ```cypher
  WHERE any(t in $ingredientes_tengo WHERE 
      toLower(i.nombre) = toLower(t) OR 
      toLower(i.nombre) STARTS WITH toLower(t) + " " OR 
      toLower(i.nombre) ENDS WITH " " + toLower(t) OR 
      toLower(i.nombre) CONTAINS " " + toLower(t) + " " OR
      toLower(t) STARTS WITH toLower(i.nombre) + " " OR
      toLower(t) ENDS WITH " " + toLower(i.nombre) OR
      toLower(t) CONTAINS " " + toLower(i.nombre) + " "
  )
  ```
Esto asegura que las recetas conteniendo productos patrocinados de marca aparezcan correctamente ordenadas por su peso de puja publicitaria, elevándolas en la prioridad del listado de búsqueda del usuario.
