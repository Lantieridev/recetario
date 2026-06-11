1. El Buscador Inteligente (Variables: $ingredientes_tengo y $ingredientes_no_quiero)

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
   count(DISTINCT i) AS Coincidencias,
   collect(DISTINCT faltante.nombre) AS Que_Te_Falta
   ORDER BY Coincidencias DESC

2. Perfil: Recetas Creadas (Variable: $nombre_usuario)

   MATCH (u:Usuario {nombre: $nombre_usuario})-[:CREO]->(r:Receta)
   RETURN r.titulo AS Receta, r.descripcion AS Descripcion, r.dificultad AS Dificultad

3. Perfil: Apartado de Favoritos (Variable: $nombre_usuario)

   MATCH (u:Usuario {nombre: $nombre_usuario})-[:GUARDO_FAV]->(r:Receta)
   RETURN r.titulo AS Receta, r.tiempo AS Tiempo, r.dificultad AS Dificultad

4. Feed Inicial: Top 3 Más Guardadas (Trending)

   MATCH (u:Usuario)-[:GUARDO_FAV]->(r:Receta)
   RETURN r.titulo AS Receta, COUNT(u) AS TotalGuardados
   ORDER BY TotalGuardados DESC
   LIMIT 3

5. Feed Recomendaciones (Variable: $nombre_usuario)

   MATCH (yo:Usuario {nombre: $nombre_usuario})-[:GUARDO_FAV]->(:Receta)<-[:GUARDO_FAV]-(otro:Usuario)
   MATCH (otro)-[:GUARDO_FAV]->(recomendacion:Receta)
   WHERE NOT (yo)-[:GUARDO_FAV]->(recomendacion)
   RETURN recomendacion.titulo AS Recomendacion, COUNT(otro) AS NivelDeMatch
   ORDER BY NivelDeMatch DESC
   LIMIT 5

6. Filtro por Categoría (Variable: $nombre_categoria)

   MATCH (r:Receta)-[:PERTENECE_A]->(c:Categoria {nombre: $nombre_categoria})
   RETURN r.titulo AS Receta, r.dificultad AS Dificultad, r.tiempo AS Tiempo

7. Filtro por Dificultad y Tiempo (Variables: $dificultad_elegida y $tiempo_elegido)

   MATCH (r:Receta)
   WHERE r.dificultad = $dificultad_elegida AND r.tiempo = $tiempo_elegido
   RETURN r.titulo AS Receta, r.dificultad AS Dificultad, r.tiempo AS Tiempo

8. ACCIÓN: Agregar a favoritos (Variables: $nombre_usuario y $titulo_receta)

   MATCH (u:Usuario {nombre: $nombre_usuario}), (r:Receta {titulo: $titulo_receta})
   MERGE (u)-[:GUARDO_FAV]->(r)