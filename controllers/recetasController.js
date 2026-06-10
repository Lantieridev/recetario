import { getSession } from '../config/neo4j.js';
import neo4j from 'neo4j-driver';
import { formatDuration } from '../utils/timeFormatter.js';

// 1. Crear Receta (relacionada con su creador y categoría)
// POST /api/recetas
// Body: { titulo, descripcion, dificultad, tiempo, pasos, creador, categoria, imagen }
export const crearReceta = async (req, res) => {
    const { titulo, descripcion, dificultad, tiempo, porciones, pasos, creador, categoria, imagen } = req.body;

    if (!titulo || !descripcion || !dificultad || !tiempo || !pasos || !creador || !categoria) {
        return res.status(400).json({ 
            error: 'Faltan campos obligatorios: titulo, descripcion, dificultad, tiempo, pasos, creador (Usuario) y categoria' 
        });
    }

    const session = getSession();
    try {
        // Verificar que el creador exista
        const userCheck = await session.run('MATCH (u:Usuario {nombre: $creador}) RETURN u', { creador });
        if (userCheck.records.length === 0) {
            return res.status(404).json({ error: `Usuario creador '${creador}' no encontrado. Por favor créalo primero.` });
        }

        // Verificar o crear la categoría
        const catCheck = await session.run('MATCH (c:Categoria {nombre: $categoria}) RETURN c', { categoria });
        if (catCheck.records.length === 0) {
            // Si no existe, la creamos
            await session.run('CREATE (c:Categoria {nombre: $categoria})', { categoria });
        }

        const query = `
            MATCH (u:Usuario {nombre: $creador})
            MATCH (c:Categoria {nombre: $categoria})
            WITH u, c LIMIT 1
            MERGE (r:Receta {titulo: $titulo})
            SET r.descripcion = $descripcion,
                r.dificultad = $dificultad,
                r.tiempo = $tiempo,
                r.porciones = $porciones,
                r.pasos = $pasos,
                r.imagen = $imagen
            MERGE (u)-[:CREO]->(r)
            MERGE (r)-[:PERTENECE_A]->(c)
            RETURN r.titulo AS titulo, u.nombre AS creador, c.nombre AS categoria, r.imagen AS imagen
        `;

        const result = await session.run(query, {
            titulo,
            descripcion,
            dificultad,
            tiempo,
            porciones: parseInt(porciones) || 4,
            pasos,
            creador,
            categoria,
            imagen: imagen || null
        });

        const record = result.records[0];

        res.status(201).json({
            message: 'Receta creada y vinculada correctamente',
            receta: {
                titulo: record.get('titulo'),
                creador: record.get('creador'),
                categoria: record.get('categoria'),
                imagen: record.get('imagen')
            }
        });
    } catch (error) {
        console.error('Error al crear receta:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear receta', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 2. Asociar Ingrediente a Receta (con propiedad de relación cantidad en CONTIENE)
// POST /api/recetas/:titulo/ingredientes
// Body: { nombreIngrediente, cantidad }
export const agregarIngrediente = async (req, res) => {
    const { titulo } = req.params;
    const { nombreIngrediente, cantidad } = req.body;

    if (!nombreIngrediente || !cantidad) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: nombreIngrediente y cantidad' });
    }

    const session = getSession();
    try {
        // Verificar que la receta exista
        const recipeCheck = await session.run('MATCH (r:Receta {titulo: $titulo}) RETURN r', { titulo });
        if (recipeCheck.records.length === 0) {
            return res.status(404).json({ error: `Receta '${titulo}' no encontrada` });
        }

        const query = `
            MATCH (r:Receta {titulo: $titulo})
            WITH r LIMIT 1
            MERGE (i:Ingrediente {nombre: $nombreIngrediente})
            MERGE (r)-[c:CONTIENE]->(i)
            SET c.cantidad = $cantidad
            RETURN r.titulo AS receta, i.nombre AS ingrediente, c.cantidad AS cantidad
        `;

        const result = await session.run(query, { titulo, nombreIngrediente, cantidad });
        const record = result.records[0];

        res.status(200).json({
            message: 'Ingrediente asociado a la receta con éxito',
            ingredienteAsociado: {
                receta: record.get('receta'),
                ingrediente: record.get('ingrediente'),
                cantidad: record.get('cantidad')
            }
        });
    } catch (error) {
        console.error('Error al agregar ingrediente a receta:', error);
        res.status(500).json({ error: 'Error interno del servidor al asociar ingrediente', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 3. Listar Recetas con filtros (CRUD de Lectura)
// GET /api/recetas
// Query params: categoria, dificultad, tiempo
export const listarRecetas = async (req, res) => {
    const { categoria, dificultad, tiempo } = req.query;

    const session = getSession();
    try {
        // Armar consulta dinámica con parámetros opcionales
        const query = `
            MATCH (r:Receta)
            WHERE ($categoria IS NULL OR (r)-[:PERTENECE_A]->(:Categoria {nombre: $categoria}))
              AND ($dificultad IS NULL OR r.dificultad = $dificultad)
              AND ($tiempo IS NULL OR r.tiempo = $tiempo)
            OPTIONAL MATCH (r)-[:PERTENECE_A]->(c:Categoria)
            OPTIONAL MATCH (u:Usuario)-[:CREO]->(r)
            RETURN DISTINCT r.titulo AS titulo, r.descripcion AS descripcion, r.dificultad AS dificultad, r.tiempo AS tiempo, r.imagen AS imagen, c.nombre AS categoria, u.nombre AS creador
        `;

        const result = await session.run(query, {
            categoria: categoria || null,
            dificultad: dificultad || null,
            tiempo: tiempo || null
        });

        const recetas = result.records.map(record => ({
            titulo: record.get('titulo'),
            descripcion: record.get('descripcion'),
            dificultad: record.get('dificultad'),
            tiempo: formatDuration(record.get('tiempo')),
            imagen: record.get('imagen'),
            categoria: record.get('categoria'),
            creador: record.get('creador')
        }));

        res.status(200).json({
            filtrosAplicados: { categoria, dificultad, tiempo },
            total: recetas.length,
            recetas
        });
    } catch (error) {
        console.error('Error al listar recetas:', error);
        res.status(500).json({ error: 'Error interno del servidor al listar recetas', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 4. Buscador Inteligente (Consulta Compleja #1)
// GET /api/recetas/buscar
// Query params: tengo (lista separada por coma), noQuiero (lista separada por coma)
export const buscarRecetas = async (req, res) => {
    const { tengo, noQuiero, alergias, categoria, dificultad, tiempo } = req.query;

    const ingredientes_tengo = tengo ? tengo.split(',').map(i => i.trim()).filter(Boolean) : [];
    const ingredientes_no_quiero = noQuiero ? noQuiero.split(',').map(i => i.trim()).filter(Boolean) : [];
    const alergias_usuario = alergias ? alergias.split(',').map(a => a.trim()).filter(Boolean) : [];

    if (ingredientes_tengo.length === 0) {
        return res.status(400).json({ error: 'Debes ingresar al menos un ingrediente en el parámetro "tengo"' });
    }

    const session = getSession();
    try {
        const query = `
            MATCH (r:Receta)
            WHERE ($categoria IS NULL OR (r)-[:PERTENECE_A]->(:Categoria {nombre: $categoria}))
              AND ($dificultad IS NULL OR r.dificultad = $dificultad)
              AND ($tiempo IS NULL OR r.tiempo = $tiempo)
              AND NOT EXISTS {
                MATCH (r)-[:CONTIENE]->(ex:Ingrediente)
                WHERE ex.nombre IN $ingredientes_no_quiero
            }
              AND NOT EXISTS {
                MATCH (r)-[:CONTIENE]->(:Ingrediente)-[:PERTENECE_A_FAMILIA]->(a:Alergeno)
                WHERE a.nombre IN $alergias_usuario
            }
            MATCH (r)-[:CONTIENE]->(i:Ingrediente)
            WHERE any(t in $ingredientes_tengo WHERE 
                toLower(i.nombre) = toLower(t) OR 
                toLower(i.nombre) STARTS WITH toLower(t) + " " OR 
                toLower(i.nombre) ENDS WITH " " + toLower(t) OR 
                toLower(i.nombre) CONTAINS " " + toLower(t) + " " OR
                toLower(t) STARTS WITH toLower(i.nombre) + " " OR
                toLower(t) ENDS WITH " " + toLower(i.nombre) OR
                toLower(t) CONTAINS " " + toLower(i.nombre) + " "
            )
            OPTIONAL MATCH (r)-[:CONTIENE]->(faltante:Ingrediente)
            WHERE NOT any(t in $ingredientes_tengo WHERE 
                toLower(faltante.nombre) = toLower(t) OR 
                toLower(faltante.nombre) STARTS WITH toLower(t) + " " OR 
                toLower(faltante.nombre) ENDS WITH " " + toLower(t) OR 
                toLower(faltante.nombre) CONTAINS " " + toLower(t) + " " OR
                toLower(t) STARTS WITH toLower(faltante.nombre) + " " OR
                toLower(t) ENDS WITH " " + toLower(faltante.nombre) OR
                toLower(t) CONTAINS " " + toLower(faltante.nombre) + " "
            )
            OPTIONAL MATCH (r)-[:PERTENECE_A]->(c:Categoria)
            
            CALL {
                WITH r
                OPTIONAL MATCH (r)-[:CONTIENE]->(ing:Ingrediente)
                OPTIONAL MATCH (patr:Ingrediente)
                WHERE (patr = ing OR 
                       toLower(patr.nombre) STARTS WITH toLower(ing.nombre) + " " OR 
                       toLower(patr.nombre) ENDS WITH " " + toLower(ing.nombre) OR 
                       toLower(patr.nombre) CONTAINS " " + toLower(ing.nombre) + " ")
                  AND coalesce(patr.pesoPatrocinio, 0) > 0
                WITH ing, patr ORDER BY patr.pesoPatrocinio DESC
                WITH ing, collect(patr) AS matchingPatrs
                WITH ing, matchingPatrs, (CASE WHEN size(matchingPatrs) > 0 THEN head(matchingPatrs).pesoPatrocinio ELSE null END) AS maxWeight
                WITH ing, [p in matchingPatrs WHERE p.pesoPatrocinio = maxWeight] AS topPatrs
                UNWIND (CASE WHEN size(topPatrs) = 0 THEN [null] ELSE topPatrs END) AS p
                RETURN collect(DISTINCT p.nombre) AS IngredientesPatrocinados, sum(coalesce(p.pesoPatrocinio, 0)) AS ScorePatrocinio
            }
            
            RETURN r.titulo AS Receta,
                   r.dificultad AS Dificultad,
                   r.tiempo AS Tiempo,
                   c.nombre AS Categoria,
                   count(DISTINCT i) AS Coincidencias,
                   collect(DISTINCT faltante.nombre) AS Que_Te_Falta,
                   IngredientesPatrocinados,
                   ScorePatrocinio,
                   (count(DISTINCT i) * 10) + ScorePatrocinio AS ScoreFinal
            ORDER BY ScoreFinal DESC
        `;

        const result = await session.run(query, {
            ingredientes_tengo,
            ingredientes_no_quiero,
            alergias_usuario,
            categoria: categoria || null,
            dificultad: dificultad || null,
            tiempo: tiempo || null
        });

        const resultados = result.records.map(record => {
            const coincidencias = record.get('Coincidencias');
            const matchCount = neo4j.isInt(coincidencias) 
                ? coincidencias.toNumber() 
                : Number(coincidencias);
                
            const scorePatrocinio = record.get('ScorePatrocinio');
            const ingPatrocinados = record.get('IngredientesPatrocinados') || [];

            return {
                receta: record.get('Receta'),
                dificultad: record.get('Dificultad'),
                tiempo: formatDuration(record.get('Tiempo')),
                categoria: record.get('Categoria'),
                coincidencias: matchCount,
                queTeFalta: record.get('Que_Te_Falta'),
                scorePublicitario: neo4j.isInt(scorePatrocinio) ? scorePatrocinio.toNumber() : Number(scorePatrocinio),
                ingredientesPatrocinados: ingPatrocinados
            };
        });

        res.status(200).json({
            ingredientesTengo: ingredientes_tengo,
            ingredientesExcluidos: ingredientes_no_quiero,
            totalResultados: resultados.length,
            resultados
        });
    } catch (error) {
        console.error('Error al realizar búsqueda inteligente:', error);
        res.status(500).json({ error: 'Error interno del servidor al buscar recetas', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 5. Obtener Detalle de Receta
// GET /api/recetas/:titulo
export const obtenerReceta = async (req, res) => {
    const { titulo } = req.params;
    const session = getSession();
    try {
        const query = `
            MATCH (r:Receta {titulo: $titulo})
            WITH r LIMIT 1
            OPTIONAL MATCH (r)-[:PERTENECE_A]->(c:Categoria)
            OPTIONAL MATCH (u:Usuario)-[:CREO]->(r)
            OPTIONAL MATCH (r)-[co:CONTIENE]->(i:Ingrediente)
            
            // Para cada ingrediente i, encontrar la versión patrocinada con mayor peso (soportando empates)
            CALL {
                WITH i
                OPTIONAL MATCH (patr:Ingrediente)
                WHERE (patr = i OR 
                       toLower(patr.nombre) STARTS WITH toLower(i.nombre) + " " OR 
                       toLower(patr.nombre) ENDS WITH " " + toLower(i.nombre) OR 
                       toLower(patr.nombre) CONTAINS " " + toLower(i.nombre) + " ")
                  AND coalesce(patr.pesoPatrocinio, 0) > 0
                WITH patr ORDER BY patr.pesoPatrocinio DESC
                WITH collect(patr) AS matchingPatrs
                WITH matchingPatrs, (CASE WHEN size(matchingPatrs) > 0 THEN head(matchingPatrs).pesoPatrocinio ELSE null END) AS maxWeight
                WITH [p in matchingPatrs WHERE p.pesoPatrocinio = maxWeight] AS topPatrs
                RETURN (CASE WHEN size(topPatrs) > 0 THEN reduce(s = "", p in topPatrs | s + (CASE WHEN s = "" THEN "" ELSE " & " END) + p.nombre) ELSE null END) AS maxPatrNombre
            }
            
            RETURN r.titulo AS titulo,
                   r.descripcion AS descripcion,
                   r.dificultad AS dificultad,
                   r.tiempo AS tiempo,
                   r.porciones AS porciones,
                   r.pasos AS pasos,
                   r.imagen AS imagen,
                   c.nombre AS categoria,
                   u.nombre AS creador,
                   collect(DISTINCT { nombre: i.nombre, cantidad: co.cantidad, recomendado: maxPatrNombre }) AS ingredientes
        `;
        const result = await session.run(query, { titulo });
        if (result.records.length === 0 || result.records[0].get('titulo') === null) {
            return res.status(404).json({ error: `Receta '${titulo}' no encontrada` });
        }
        const record = result.records[0];
        
        const ingredientesRaw = record.get('ingredientes');
        const ingredientes = ingredientesRaw.filter(ing => ing.nombre !== null && ing.nombre !== undefined);

        res.status(200).json({
            receta: {
                titulo: record.get('titulo'),
                descripcion: record.get('descripcion'),
                dificultad: record.get('dificultad'),
                tiempo: formatDuration(record.get('tiempo')),
                porciones: record.get('porciones') ? (neo4j.isInt(record.get('porciones')) ? record.get('porciones').toNumber() : record.get('porciones')) : 4,
                pasos: record.get('pasos'),
                imagen: record.get('imagen'),
                categoria: record.get('categoria'),
                creador: record.get('creador'),
                ingredientes
            }
        });
    } catch (error) {
        console.error('Error al obtener detalle:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 6. Listar todas las categorías
// GET /api/recetas/categorias
export const obtenerCategorias = async (req, res) => {
    const session = getSession();
    try {
        const result = await session.run('MATCH (c:Categoria) RETURN DISTINCT c.nombre AS nombre ORDER BY nombre');
        res.status(200).json({ categorias: result.records.map(r => r.get('nombre')) });
    } catch (error) {
        console.error('Error al obtener categorias:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 7. Listar todos los ingredientes
// GET /api/recetas/ingredientes
export const obtenerIngredientes = async (req, res) => {
    const session = getSession();
    try {
        const query = `
            MATCH (i:Ingrediente)
            WHERE NOT EXISTS {
                MATCH (p:Partner)
                WHERE toLower(i.nombre) = toLower(p.nombre)
                   OR toLower(i.nombre) ENDS WITH " " + toLower(p.nombre)
            }
            RETURN DISTINCT i.nombre AS nombre ORDER BY nombre
        `;
        const result = await session.run(query);
        res.status(200).json({ ingredientes: result.records.map(r => r.get('nombre')) });
    } catch (error) {
        console.error('Error al obtener ingredientes:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 8. Recetas Similares
// GET /api/recetas/:titulo/similares
export const obtenerRecetasSimilares = async (req, res) => {
    const { titulo } = req.params;
    const session = getSession();
    try {
        const query = `
            MATCH (r1:Receta {titulo: $titulo})-[:CONTIENE]->(i:Ingrediente)<-[:CONTIENE]-(r2:Receta)
            OPTIONAL MATCH (r2)-[:PERTENECE_A]->(c:Categoria)
            RETURN r2.titulo AS receta, r2.dificultad AS dificultad, r2.tiempo AS tiempo, r2.imagen AS imagen, c.nombre AS categoria, count(i) AS ingredientes_comunes
            ORDER BY ingredientes_comunes DESC LIMIT 5
        `;
        const result = await session.run(query, { titulo });
        const similares = result.records.map(r => {
            const count = r.get('ingredientes_comunes');
            return {
                titulo: r.get('receta'),
                dificultad: r.get('dificultad'),
                tiempo: r.get('tiempo'),
                imagen: r.get('imagen'),
                categoria: r.get('categoria'),
                ingredientesComunes: neo4j.isInt(count) ? count.toNumber() : Number(count)
            };
        });
        res.status(200).json({ similares });
    } catch (error) {
        console.error('Error al obtener recetas similares:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 9. Receta del Día
// GET /api/recetas/del-dia
export const obtenerRecetaDelDia = async (req, res) => {
    const session = getSession();
    try {
        // Obtenemos el día del año
        const start = new Date(new Date().getFullYear(), 0, 0);
        const diff = new Date() - start + (start.getTimezoneOffset() - new Date().getTimezoneOffset()) * 60 * 1000;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        // Usamos el dayOfYear para saltar y elegir de forma "pseudo-aleatoria" pero determinística por día
        const query = `
            MATCH (r:Receta)
            WITH r ORDER BY r.titulo
            WITH collect(r) AS recetas
            WITH recetas, size(recetas) AS total
            WITH recetas[toInteger($dayOfYear % total)] AS delDia
            OPTIONAL MATCH (delDia)-[:PERTENECE_A]->(c:Categoria)
            OPTIONAL MATCH (u:Usuario)-[:CREO]->(delDia)
            RETURN delDia.titulo AS titulo, delDia.descripcion AS descripcion, delDia.dificultad AS dificultad, 
                   delDia.tiempo AS tiempo, delDia.imagen AS imagen, c.nombre AS categoria, u.nombre AS creador
        `;
        const result = await session.run(query, { dayOfYear });
        if (result.records.length === 0 || result.records[0].get('titulo') === null) {
            return res.status(404).json({ error: 'No hay recetas disponibles para receta del día' });
        }
        const record = result.records[0];
        res.status(200).json({
            receta: {
                titulo: record.get('titulo'),
                descripcion: record.get('descripcion'),
                dificultad: record.get('dificultad'),
                tiempo: record.get('tiempo'),
                imagen: record.get('imagen'),
                categoria: record.get('categoria'),
                creador: record.get('creador')
            }
        });
    } catch (error) {
        console.error('Error al obtener receta del dia:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 10. Tendencias
// GET /api/recetas/tendencias
export const obtenerTendencias = async (req, res) => {
    const session = getSession();
    try {
        const query = `
            MATCH (r:Receta)<-[:GUARDO_FAV]-(u:Usuario)
            OPTIONAL MATCH (r)-[:PERTENECE_A]->(c:Categoria)
            RETURN r.titulo AS titulo, r.descripcion AS descripcion, r.dificultad AS dificultad, r.tiempo AS tiempo, r.imagen AS imagen, c.nombre AS categoria, count(u) AS popularidad
            ORDER BY popularidad DESC LIMIT 6
        `;
        const result = await session.run(query);
        const tendencias = result.records.map(record => {
            const pop = record.get('popularidad');
            return {
                titulo: record.get('titulo'),
                descripcion: record.get('descripcion'),
                dificultad: record.get('dificultad'),
                tiempo: record.get('tiempo'),
                imagen: record.get('imagen'),
                categoria: record.get('categoria'),
                popularidad: neo4j.isInt(pop) ? pop.toNumber() : Number(pop)
            };
        });
        res.status(200).json({ tendencias });
    } catch (error) {
        console.error('Error al obtener tendencias:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};


// GET /api/recetas/:titulo/grafo
export const obtenerGrafoReceta = async (req, res) => {
    const { titulo } = req.params;
    const session = getSession();
    try {
        const query = `
            MATCH (r:Receta {titulo: $titulo})
            OPTIONAL MATCH (r)-[rel:USA_INGREDIENTE]->(i:Ingrediente)
            RETURN r, collect(rel) as relations, collect(i) as ingredientes
        `;
        const result = await session.run(query, { titulo });
        
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Receta no encontrada' });
        }

        const record = result.records[0];
        const recetaNode = record.get('r');
        const ingredientes = record.get('ingredientes');
        
        const nodes = [];
        const links = [];
        
        const recId = 'r-' + recetaNode.properties.titulo;
        nodes.push({
            id: recId,
            label: recetaNode.properties.titulo,
            type: 'Recipe',
            val: 20
        });

        ingredientes.forEach(ing => {
            if(ing && ing.properties) {
                const ingId = 'i-' + ing.properties.nombre;
                nodes.push({
                    id: ingId,
                    label: ing.properties.nombre,
                    type: 'Ingredient',
                    val: 10
                });
                links.push({
                    source: recId,
                    target: ingId,
                    label: 'USA_INGREDIENTE'
                });
            }
        });

        res.json({ graphData: { nodes, links } });
    } catch (error) {
        console.error('Error al obtener grafo de receta:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};


// POST /api/recetas/ingredientes/:ingrediente/alergenos
// Body: { alergeno: 'Gluten' }
export const enlazarAlergeno = async (req, res) => {
    const { ingrediente } = req.params;
    const { alergeno } = req.body;

    if (!alergeno) {
        return res.status(400).json({ error: 'Falta campo obligatorio: alergeno' });
    }

    const session = getSession();
    try {
        const query = `
            MATCH (i:Ingrediente {nombre: $ingrediente})
            MERGE (a:Alergeno {nombre: $alergeno})
            MERGE (i)-[:TIENE_ALERGENO]->(a)
            RETURN i.nombre AS Ingrediente, a.nombre AS Alergeno
        `;
        
        const result = await session.run(query, { ingrediente, alergeno });
        
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Ingrediente no encontrado' });
        }
        
        res.status(200).json({
            message: 'Alérgeno enlazado exitosamente',
            ingrediente: result.records[0].get('Ingrediente'),
            alergeno: result.records[0].get('Alergeno')
        });
    } catch (error) {
        console.error('Error al enlazar alérgeno:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};

// 15. Obtener estadísticas públicas para la pantalla de acceso
// GET /api/recetas/estadisticas-publicas
export const obtenerEstadisticasPublicas = async (req, res) => {
    const session = getSession();
    try {
        const query = `
            MATCH (r:Receta)
            WITH count(r) AS totalRecetas
            MATCH (c:Categoria)
            RETURN totalRecetas, count(c) AS totalCategorias
        `;
        const result = await session.run(query);
        const record = result.records[0];
        let recetas = 0;
        let categorias = 0;
        if (record) {
            const rVal = record.get('totalRecetas');
            const cVal = record.get('totalCategorias');
            recetas = neo4j.isInt(rVal) ? rVal.toNumber() : Number(rVal);
            categorias = neo4j.isInt(cVal) ? cVal.toNumber() : Number(cVal);
        }
        res.status(200).json({ recetas, categorias });
    } catch (error) {
        console.error('Error al obtener estadisticas publicas:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};
