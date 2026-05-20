import { getSession } from '../config/neo4j.js';
import neo4j from 'neo4j-driver';

// 1. Crear Receta (relacionada con su creador y categoría)
// POST /api/recetas
// Body: { titulo, descripcion, dificultad, tiempo, pasos, creador, categoria }
export const crearReceta = async (req, res) => {
    const { titulo, descripcion, dificultad, tiempo, pasos, creador, categoria } = req.body;

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
        `;

        const result = await session.run(query, {
            titulo,
            descripcion,
            dificultad,
            tiempo,
            pasos,
            creador,
            categoria
        });

        const record = result.records[0];

        res.status(201).json({
            message: 'Receta creada y vinculada correctamente',
            receta: {
                titulo: record.get('titulo'),
                creador: record.get('creador'),
                categoria: record.get('categoria')
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
            RETURN r.titulo AS titulo, r.descripcion AS descripcion, r.dificultad AS dificultad, r.tiempo AS tiempo, c.nombre AS categoria, u.nombre AS creador
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
            tiempo: record.get('tiempo'),
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
    const { tengo, noQuiero } = req.query;

    const ingredientes_tengo = tengo ? tengo.split(',').map(i => i.trim()).filter(Boolean) : [];
    const ingredientes_no_quiero = noQuiero ? noQuiero.split(',').map(i => i.trim()).filter(Boolean) : [];

    if (ingredientes_tengo.length === 0) {
        return res.status(400).json({ error: 'Debes ingresar al menos un ingrediente en el parámetro "tengo"' });
    }

    const session = getSession();
    try {
        const query = `
            MATCH (r:Receta)
            WHERE NOT EXISTS {
                MATCH (r)-[:CONTIENE]->(ex:Ingrediente)
                WHERE ex.nombre IN $ingredientes_no_quiero
            }
            MATCH (r)-[:CONTIENE]->(i:Ingrediente)
            WHERE i.nombre IN $ingredientes_tengo
            OPTIONAL MATCH (r)-[:CONTIENE]->(faltante:Ingrediente)
            WHERE NOT faltante.nombre IN $ingredientes_tengo
            OPTIONAL MATCH (r)-[:PERTENECE_A]->(c:Categoria)
            RETURN r.titulo AS Receta,
                   r.dificultad AS Dificultad,
                   r.tiempo AS Tiempo,
                   c.nombre AS Categoria,
                   count(DISTINCT i) AS Coincidencias,
                   collect(DISTINCT faltante.nombre) AS Que_Te_Falta
            ORDER BY Coincidencias DESC
        `;

        const result = await session.run(query, {
            ingredientes_tengo,
            ingredientes_no_quiero
        });

        const resultados = result.records.map(record => {
            const coincidencias = record.get('Coincidencias');
            const matchCount = neo4j.isInt(coincidencias) 
                ? coincidencias.toNumber() 
                : Number(coincidencias);

            return {
                receta: record.get('Receta'),
                dificultad: record.get('Dificultad'),
                tiempo: record.get('Tiempo'),
                categoria: record.get('Categoria'),
                coincidencias: matchCount,
                queTeFalta: record.get('Que_Te_Falta')
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
            OPTIONAL MATCH (r)-[:PERTENECE_A]->(c:Categoria)
            OPTIONAL MATCH (u:Usuario)-[:CREO]->(r)
            OPTIONAL MATCH (r)-[co:CONTIENE]->(i:Ingrediente)
            RETURN r.titulo AS titulo,
                   r.descripcion AS descripcion,
                   r.dificultad AS dificultad,
                   r.tiempo AS tiempo,
                   r.pasos AS pasos,
                   c.nombre AS categoria,
                   u.nombre AS creador,
                   collect({ nombre: i.nombre, cantidad: co.cantidad }) AS ingredientes
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
                tiempo: record.get('tiempo'),
                pasos: record.get('pasos'),
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
        const result = await session.run('MATCH (i:Ingrediente) RETURN DISTINCT i.nombre AS nombre ORDER BY nombre');
        res.status(200).json({ ingredientes: result.records.map(r => r.get('nombre')) });
    } catch (error) {
        console.error('Error al obtener ingredientes:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};

