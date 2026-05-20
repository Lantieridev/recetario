import { getSession } from '../config/neo4j.js';
import neo4j from 'neo4j-driver';

// 1. Crear Usuario
// POST /api/usuarios
// Body: { nombre, mail, contrasena }
export const crearUsuario = async (req, res) => {
    const { nombre, mail, contrasena } = req.body;

    if (!nombre || !mail || !contrasena) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, mail y contrasena' });
    }

    const session = getSession();
    try {
        const query = `
            CREATE (u:Usuario {nombre: $nombre, mail: $mail, contrasena: $contrasena})
            RETURN u.nombre AS nombre, u.mail AS mail
        `;

        const result = await session.run(query, { nombre, mail, contrasena });

        if (result.records.length === 0) {
            return res.status(500).json({ error: 'No se pudo crear el usuario' });
        }

        const record = result.records[0];
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            usuario: {
                nombre: record.get('nombre'),
                mail: record.get('mail')
            }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
            return res.status(409).json({ error: 'El usuario o el correo ya existen' });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear usuario', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 2. Obtener Perfil de Usuario con relaciones
// GET /api/usuarios/:nombre
export const obtenerUsuario = async (req, res) => {
    const { nombre } = req.params;

    const session = getSession();
    try {
        const query = `
            MATCH (u:Usuario {nombre: $nombre})
            OPTIONAL MATCH (u)-[:CREO]->(c:Receta)
            OPTIONAL MATCH (u)-[:GUARDO_FAV]->(f:Receta)
            RETURN u.nombre AS nombre, u.mail AS mail, 
                   collect(DISTINCT c.titulo) AS creadas, 
                   collect(DISTINCT f.titulo) AS favoritas
        `;

        const result = await session.run(query, { nombre });

        if (result.records.length === 0 || result.records[0].get('nombre') === null) {
            return res.status(404).json({ error: `Usuario '${nombre}' no encontrado` });
        }

        const record = result.records[0];
        res.status(200).json({
            usuario: {
                nombre: record.get('nombre'),
                mail: record.get('mail'),
                recetasCreadas: record.get('creadas'),
                recetasFavoritas: record.get('favoritas')
            }
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener usuario', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 3. Guardar Receta en Favoritos
// POST /api/usuarios/:nombre/favoritos
// Body: { tituloReceta }
export const agregarFavorito = async (req, res) => {
    const { nombre } = req.params;
    const { tituloReceta } = req.body;

    if (!tituloReceta) {
        return res.status(400).json({ error: 'Falta campo obligatorio: tituloReceta' });
    }

    const session = getSession();
    try {
        // Verificar que el usuario exista
        const userCheck = await session.run('MATCH (u:Usuario {nombre: $nombre}) RETURN u', { nombre });
        if (userCheck.records.length === 0) {
            return res.status(404).json({ error: `Usuario '${nombre}' no encontrado` });
        }

        // Verificar que la receta exista
        const recipeCheck = await session.run('MATCH (r:Receta {titulo: $tituloReceta}) RETURN r', { tituloReceta });
        if (recipeCheck.records.length === 0) {
            return res.status(404).json({ error: `Receta '${tituloReceta}' no encontrada` });
        }

        const query = `
            MATCH (u:Usuario {nombre: $nombre})
            MATCH (r:Receta {titulo: $tituloReceta})
            MERGE (u)-[f:GUARDO_FAV]->(r)
            RETURN u.nombre AS usuario, r.titulo AS receta
        `;

        const result = await session.run(query, { nombre, tituloReceta });
        const record = result.records[0];

        res.status(200).json({
            message: 'Receta agregada a favoritos exitosamente',
            relacion: {
                usuario: record.get('usuario'),
                receta: record.get('receta')
            }
        });
    } catch (error) {
        console.error('Error al agregar favorito:', error);
        res.status(500).json({ error: 'Error interno del servidor al agregar favorito', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 4. Recomendación Colaborativa (Consulta Compleja #2)
// GET /api/usuarios/:nombre/recomendaciones
export const obtenerRecomendaciones = async (req, res) => {
    const { nombre } = req.params;

    const session = getSession();
    try {
        // Verificar que el usuario exista
        const userCheck = await session.run('MATCH (u:Usuario {nombre: $nombre}) RETURN u', { nombre });
        if (userCheck.records.length === 0) {
            return res.status(404).json({ error: `Usuario '${nombre}' no encontrado` });
        }

        // Consulta de recomendación colaborativa avanzada (Graph Traversal)
        const query = `
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
        `;

        const result = await session.run(query, { nombre });

        const recomendaciones = result.records.map(record => {
            const nivelDeMatch = record.get('NivelDeMatch');
            // Convertir número Neo4j (que puede ser un objeto Integer de la librería) a número JS estándar
            const matchCount = neo4j.isInt(nivelDeMatch) 
                ? nivelDeMatch.toNumber() 
                : Number(nivelDeMatch);

            return {
                receta: record.get('Recomendacion'),
                descripcion: record.get('Descripcion'),
                dificultad: record.get('Dificultad'),
                tiempo: record.get('Tiempo'),
                nivelDeMatch: matchCount
            };
        });

        res.status(200).json({
            usuario: nombre,
            recomendaciones
        });
    } catch (error) {
        console.error('Error al obtener recomendaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor al calcular recomendaciones', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 5. Iniciar Sesión
// POST /api/usuarios/login
// Body: { nombre, contrasena }
export const loginUsuario = async (req, res) => {
    const { nombre, contrasena } = req.body;

    if (!nombre || !contrasena) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: nombre y contrasena' });
    }

    const session = getSession();
    try {
        const query = `
            MATCH (u:Usuario {nombre: $nombre})
            RETURN u.nombre AS nombre, u.mail AS mail, u.contrasena AS contrasena
        `;

        const result = await session.run(query, { nombre });

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const record = result.records[0];
        const dbContrasena = record.get('contrasena');

        if (dbContrasena !== contrasena) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            usuario: {
                nombre: record.get('nombre'),
                mail: record.get('mail')
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor al iniciar sesión', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 6. Alternar Favorito
// POST /api/usuarios/:nombre/favoritos/toggle
// Body: { tituloReceta }
export const toggleFavorito = async (req, res) => {
    const { nombre } = req.params;
    const { tituloReceta } = req.body;

    if (!tituloReceta) {
        return res.status(400).json({ error: 'Falta campo obligatorio: tituloReceta' });
    }

    const session = getSession();
    try {
        // Verificar que usuario y receta existan
        const userCheck = await session.run('MATCH (u:Usuario {nombre: $nombre}) RETURN u', { nombre });
        if (userCheck.records.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        const recipeCheck = await session.run('MATCH (r:Receta {titulo: $tituloReceta}) RETURN r', { tituloReceta });
        if (recipeCheck.records.length === 0) return res.status(404).json({ error: 'Receta no encontrada' });

        // Revisar si existe la relación
        const relCheck = await session.run(
            'MATCH (u:Usuario {nombre: $nombre})-[f:GUARDO_FAV]->(r:Receta {titulo: $tituloReceta}) RETURN f',
            { nombre, tituloReceta }
        );

        let added = false;
        if (relCheck.records.length > 0) {
            // Existe -> Eliminar
            await session.run(
                'MATCH (u:Usuario {nombre: $nombre})-[f:GUARDO_FAV]->(r:Receta {titulo: $tituloReceta}) DELETE f',
                { nombre, tituloReceta }
            );
            added = false;
        } else {
            // No existe -> Crear
            await session.run(
                'MATCH (u:Usuario {nombre: $nombre}), (r:Receta {titulo: $tituloReceta}) MERGE (u)-[:GUARDO_FAV]->(r)',
                { nombre, tituloReceta }
            );
            added = true;
        }

        res.status(200).json({ added });
    } catch (error) {
        console.error('Error al alternar favorito:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};
