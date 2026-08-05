# recetario

Backend en **Node.js + Express** sobre una base de datos de grafos
**Neo4j Aura**, con Cypher explícito (sin ORM/OGM) y un frontend en React
sin build step. Arrancó como el TP2 de la cátedra de Bases de Datos No
Relacionales (UTN FRC) y creció hasta incluir un buscador con recomendación
colaborativa, un feed social y una capa B2B donde marcas patrocinan
ingredientes dentro del propio grafo de recomendaciones.

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para el modelo de dominio,
el mecanismo de patrocinio y el detalle de endpoints.

## Stack

`Node.js` · `Express 5` · `Neo4j` (driver oficial, Cypher explícito) ·
`React 18` (sin bundler, Babel standalone vía CDN) · `dotenv` · `cors` · `morgan`

## Cómo correrlo

```bash
npm install
```

Crear un `.env` en la raíz:

```env
PORT=3000
NEO4J_URI=neo4j+s://tu-instancia.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=tu-password
NEO4J_DATABASE=neo4j
```

```bash
npm run seed      # puebla el grafo desde poblar_recetario.cypher
npm start         # http://localhost:3000
npm run db:clean  # vacía el grafo si necesitás resembrar
```

## Estructura

```
config/       inicialización del driver de Neo4j
controllers/  lógica de negocio + Cypher por dominio (usuarios, recetas, dashboard, b2b, admin)
routes/       definición de endpoints Express
utils/        seeder, limpieza de BD, formateo, búsqueda de imágenes, auth de admin/b2b
FrontEnd/     cliente React servido como estático, sin build step
docs/         arquitectura y modelo de dominio
```

## Limitaciones conocidas

Nivel TP universitario, no producción — documentado sin maquillar:

- Las contraseñas se guardan y comparan en texto plano (no hay hashing).
- La autenticación de admin/B2B resuelve el rol contra el grafo en cada
  request; no hay JWT ni sesión firmada.
- Sin suite de tests automatizados — `test-endpoints.js` es un script manual
  de humo contra una instancia real, no un runner de CI.

## Créditos

Proyecto grupal de la Tecnicatura en Programación (UTN FRC):

- [Martín Lantieri](https://github.com/Lantieridev)
- [lucas-bima](https://github.com/lucas-bima)
- [Lucas Rojo](https://github.com/Lucas-Rojo-421581-1w1)
- [Ornella Gonzalez](https://github.com/421405-2w1-Gonzalez-Ornella)
- [Álvaro Amatto](https://github.com/421411-Amatto-Alvaro)

## Licencia

[MIT](LICENSE)
