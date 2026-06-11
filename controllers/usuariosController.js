import { getSession } from '../config/neo4j.js';
import neo4j from 'neo4j-driver';
import { formatDuration } from '../utils/timeFormatter.js';

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

        // Detección y vinculación automática de dominio corporativo B2B (crea la relación inactiva)
        try {
            const domainQuery = `
                MATCH (u:Usuario {nombre: $nombre})
                WITH u
                MATCH (p:Partner)
                WHERE toLower(split(u.mail, '@')[1]) = toLower(p.dominio)
                MERGE (u)-[:EMPLEADO_DE {activo: false}]->(p)
            `;
            await session.run(domainQuery, { nombre });
        } catch (domainErr) {
            console.error('Error al pre-vincular dominio corporativo:', domainErr);
        }

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
            OPTIONAL MATCH (u)-[:SIGUE]->(sg:Usuario)
            OPTIONAL MATCH (s:Usuario)-[:SIGUE]->(u)
            OPTIONAL MATCH (u)-[:TERMINO]->(t:Receta)
            RETURN u.nombre AS nombre, u.mail AS mail, 
                   collect(DISTINCT c.id) AS creadas, 
                   collect(DISTINCT f.id) AS favoritas,
                   collect(DISTINCT sg.nombre) AS seguidos,
                   collect(DISTINCT s.nombre) AS seguidores,
                   collect(DISTINCT t.id) AS terminadas
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
                recetasCreadas: record.get('creadas').filter(id => id !== null),
                recetasFavoritas: record.get('favoritas').filter(id => id !== null),
                seguidos: record.get('seguidos').filter(n => n !== null),
                seguidores: record.get('seguidores').filter(n => n !== null),
                recetasTerminadas: record.get('terminadas').filter(id => id !== null)
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
// Body: { recetaId }
export const agregarFavorito = async (req, res) => {
    const { nombre } = req.params;
    const { recetaId } = req.body;

    if (!recetaId) {
        return res.status(400).json({ error: 'Falta campo obligatorio: recetaId' });
    }

    const session = getSession();
    try {
        // Verificar que el usuario exista
        const userCheck = await session.run('MATCH (u:Usuario {nombre: $nombre}) RETURN u', { nombre });
        if (userCheck.records.length === 0) {
            return res.status(404).json({ error: `Usuario '${nombre}' no encontrado` });
        }

        // Verificar que la receta exista
        const recipeCheck = await session.run('MATCH (r:Receta {id: $recetaId}) RETURN r', { recetaId });
        if (recipeCheck.records.length === 0) {
            return res.status(404).json({ error: `Receta '${recetaId}' no encontrada` });
        }

        const fechaStr = new Date().toISOString().split('T')[0];
        const query = `
            MATCH (u:Usuario {nombre: $nombre})
            MATCH (r:Receta {id: $recetaId})
            MERGE (u)-[f:GUARDO_FAV]->(r)
            ON CREATE SET f.fecha = $fechaStr
            RETURN u.nombre AS usuario, r.titulo AS receta
        `;

        const result = await session.run(query, { nombre, recetaId, fechaStr });
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

        // 1. Intento: filtro colaborativo (usuarios con gustos similares)
        const colaborativaQuery = `
            MATCH (yo:Usuario {nombre: $nombre})-[:GUARDO_FAV]->(:Receta)<-[:GUARDO_FAV]-(otro:Usuario)
            MATCH (otro)-[:GUARDO_FAV]->(recomendacion:Receta)
            WHERE NOT (yo)-[:GUARDO_FAV]->(recomendacion)
            RETURN recomendacion.id AS id,
                   recomendacion.titulo AS Recomendacion,
                   recomendacion.descripcion AS Descripcion,
                   recomendacion.dificultad AS Dificultad,
                   recomendacion.tiempo AS Tiempo,
                   COUNT(otro) AS NivelDeMatch
            ORDER BY NivelDeMatch DESC
            LIMIT 5
        `;

        const colaborativaResult = await session.run(colaborativaQuery, { nombre });

        let recomendaciones = colaborativaResult.records.map(record => {
            const nivelDeMatch = record.get('NivelDeMatch');
            const matchCount = neo4j.isInt(nivelDeMatch) ? nivelDeMatch.toNumber() : Number(nivelDeMatch);
            return {
                id: record.get('id'),
                receta: record.get('Recomendacion'),
                descripcion: record.get('Descripcion'),
                dificultad: record.get('Dificultad'),
                tiempo: formatDuration(record.get('Tiempo')),
                nivelDeMatch: matchCount,
                tipo: 'colaborativa'
            };
        });

        // 2. Fallback: si no hay colaborativas, mostrar las más populares que el usuario no tenga
        if (recomendaciones.length === 0) {
            const popularQuery = `
                MATCH (r:Receta)
                WHERE NOT ((:Usuario {nombre: $nombre})-[:GUARDO_FAV]->(r))
                OPTIONAL MATCH (u:Usuario)-[:GUARDO_FAV]->(r)
                OPTIONAL MATCH (r)-[:PERTENECE_A]->(c:Categoria)
                RETURN r.id AS id,
                       r.titulo AS Recomendacion,
                       r.descripcion AS Descripcion,
                       r.dificultad AS Dificultad,
                       r.tiempo AS Tiempo,
                       COUNT(u) AS NivelDeMatch
                ORDER BY NivelDeMatch DESC
                LIMIT 5
            `;
            const popularResult = await session.run(popularQuery, { nombre });
            recomendaciones = popularResult.records.map(record => {
                const nivelDeMatch = record.get('NivelDeMatch');
                const matchCount = neo4j.isInt(nivelDeMatch) ? nivelDeMatch.toNumber() : Number(nivelDeMatch);
                return {
                    id: record.get('id'),
                    receta: record.get('Recomendacion'),
                    descripcion: record.get('Descripcion'),
                    dificultad: record.get('Dificultad'),
                    tiempo: formatDuration(record.get('Tiempo')),
                    nivelDeMatch: matchCount,
                    tipo: 'popular'
                };
            });
        }

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
            MATCH (u:Usuario)
            WHERE toLower(u.nombre) = toLower($nombre)
            RETURN u.nombre AS nombre, u.mail AS mail, u.contrasena AS contrasena, u.isAdmin AS isAdmin
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
                mail: record.get('mail'),
                isAdmin: !!record.get('isAdmin')
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
// Body: { recetaId }
export const toggleFavorito = async (req, res) => {
    const { nombre } = req.params;
    const { recetaId } = req.body;

    if (!recetaId) {
        return res.status(400).json({ error: 'Falta campo obligatorio: recetaId' });
    }

    const session = getSession();
    try {
        // Verificar que usuario y receta existan
        const userCheck = await session.run('MATCH (u:Usuario {nombre: $nombre}) RETURN u', { nombre });
        if (userCheck.records.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        const recipeCheck = await session.run('MATCH (r:Receta {id: $recetaId}) RETURN r', { recetaId });
        if (recipeCheck.records.length === 0) return res.status(404).json({ error: 'Receta no encontrada' });

        // Revisar si existe la relación
        const relCheck = await session.run(
            'MATCH (u:Usuario {nombre: $nombre})-[f:GUARDO_FAV]->(r:Receta {id: $recetaId}) RETURN f',
            { nombre, recetaId }
        );

        let added = false;
        if (relCheck.records.length > 0) {
            // Existe -> Eliminar
            await session.run(
                'MATCH (u:Usuario {nombre: $nombre})-[f:GUARDO_FAV]->(r:Receta {id: $recetaId}) DELETE f',
                { nombre, recetaId }
            );
            added = false;
        } else {
            // No existe -> Crear
            const fechaStr = new Date().toISOString().split('T')[0];
            await session.run(
                'MATCH (u:Usuario {nombre: $nombre}), (r:Receta {id: $recetaId}) MERGE (u)-[f:GUARDO_FAV]->(r) ON CREATE SET f.fecha = $fechaStr',
                { nombre, recetaId, fechaStr }
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

// 7. Seguir Usuario
// POST /api/usuarios/:nombre/seguir
// Body: { usuarioASeguir }
export const seguirUsuario = async (req, res) => {
    const { nombre } = req.params;
    const { usuarioASeguir } = req.body;

    if (!usuarioASeguir) {
        return res.status(400).json({ error: 'Falta campo obligatorio: usuarioASeguir' });
    }

    if (nombre === usuarioASeguir) {
        return res.status(400).json({ error: 'Un usuario no puede seguirse a sí mismo' });
    }

    const session = getSession();
    try {
        const query = `
            MATCH (u1:Usuario {nombre: $nombre})
            MATCH (u2:Usuario {nombre: $usuarioASeguir})
            MERGE (u1)-[:SIGUE]->(u2)
            RETURN u1.nombre AS seguidor, u2.nombre AS seguido
        `;
        const result = await session.run(query, { nombre, usuarioASeguir });
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'No se encontraron uno o ambos usuarios' });
        }
        res.status(200).json({ message: 'Usuario seguido exitosamente' });
    } catch (error) {
        console.error('Error al seguir usuario:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 8. Dejar de seguir Usuario
// POST /api/usuarios/:nombre/dejardeseguir
// Body: { usuarioADejar }
export const dejarDeSeguirUsuario = async (req, res) => {
    const { nombre } = req.params;
    const { usuarioADejar } = req.body;

    if (!usuarioADejar) {
        return res.status(400).json({ error: 'Falta campo obligatorio: usuarioADejar' });
    }

    const session = getSession();
    try {
        const query = `
            MATCH (u1:Usuario {nombre: $nombre})-[s:SIGUE]->(u2:Usuario {nombre: $usuarioADejar})
            DELETE s
        `;
        await session.run(query, { nombre, usuarioADejar });
        res.status(200).json({ message: 'Dejaste de seguir al usuario' });
    } catch (error) {
        console.error('Error al dejar de seguir usuario:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 9. Obtener Comunidad
// GET /api/usuarios/:nombre/comunidad
export const obtenerComunidad = async (req, res) => {
    const { nombre } = req.params;
    const session = getSession();
    try {
        const query = `
            MATCH (u:Usuario {nombre: $nombre})
            OPTIONAL MATCH (u)-[:SIGUE]->(seguido:Usuario)
            OPTIONAL MATCH (seguidor:Usuario)-[:SIGUE]->(u)
            RETURN collect(DISTINCT seguido.nombre) AS seguidos, collect(DISTINCT seguidor.nombre) AS seguidores
        `;
        const result = await session.run(query, { nombre });
        if (result.records.length === 0 || result.records[0].get('seguidores') === null) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const record = result.records[0];
        res.status(200).json({
            comunidad: {
                seguidos: record.get('seguidos').filter(n => n !== null),
                seguidores: record.get('seguidores').filter(n => n !== null)
            }
        });
    } catch (error) {
        console.error('Error al obtener comunidad:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 10. Registrar Historial (Cook Mode)
// POST /api/usuarios/:nombre/historial
// Body: { recetaId }
export const registrarTerminada = async (req, res) => {
    const { nombre } = req.params;
    const { recetaId } = req.body;

    if (!recetaId) {
        return res.status(400).json({ error: 'Falta campo obligatorio: recetaId' });
    }

    const session = getSession();
    try {
        const query = `
            MATCH (u:Usuario {nombre: $nombre})
            MATCH (r:Receta {id: $recetaId})
            CREATE (u)-[:TERMINO {fecha: datetime()}]->(r)
            RETURN u.nombre AS usuario, r.titulo AS receta
        `;
        const result = await session.run(query, { nombre, recetaId });
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Usuario o receta no encontrados' });
        }
        res.status(200).json({ message: 'Historial registrado exitosamente' });
    } catch (error) {
        console.error('Error al registrar historial:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};


// GET /api/usuarios/:nombre/recomendaciones/:recetaId/explicacion
export const obtenerExplicacionRecomendacion = async (req, res) => {
    const { nombre, recetaId } = req.params;
    const session = getSession();
    try {
        const query = `
            MATCH (yo:Usuario {nombre: $nombre})-[:GUARDO_FAV]->(r1:Receta)<-[:GUARDO_FAV]-(otro:Usuario)-[:GUARDO_FAV]->(recomendada:Receta {id: $recetaId})
            RETURN r1, otro
            LIMIT 1
        `;
        
        const result = await session.run(query, { nombre, recetaId });
        
        if (result.records.length === 0) {
            return res.json({ recommendationPath: null });
        }
        
        const record = result.records[0];
        const r1 = record.get('r1');
        const otro = record.get('otro');
        
        const path = [
            { nodeId: 'u-me', label: nombre, type: 'User' },
            { relation: 'GUARDO_FAV' },
            { nodeId: 'r-' + r1.properties.id, label: r1.properties.titulo, type: 'Recipe' },
            { relation: 'GUARDO_FAV', direction: 'incoming' },
            { nodeId: 'u-' + otro.properties.nombre, label: otro.properties.nombre, type: 'User' },
            { relation: 'GUARDO_FAV' },
            { nodeId: 'r-' + recetaId, label: 'Receta Recomendada', type: 'Recipe', highlight: true }
        ];

        res.json({
            recommendationPath: {
                reason: 'collaborative_filtering',
                path: path
            }
        });
    } catch (error) {
        console.error('Error al explicar recomendacion:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};

// GET /api/usuarios/:nombre/status
export const obtenerUsuarioStatus = async (req, res) => {
    const { nombre } = req.params;
    const session = getSession();
    try {
        const query = `
            MATCH (u:Usuario)
            WHERE toLower(u.nombre) = toLower($nombre)
            OPTIONAL MATCH (u)-[r:EMPLEADO_DE]->(p:Partner)
            RETURN u.nombre AS nombre, u.mail AS mail, u.isAdmin AS isAdmin, 
                   p.nombre AS partnerNombre, p.tier AS partnerTier, r.activo AS partnerActivo
        `;
        const result = await session.run(query, { nombre });
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const record = result.records[0];
        const isB2B = !!record.get('partnerNombre') && record.get('partnerActivo') === true;
        res.status(200).json({
            nombre: record.get('nombre'),
            mail: record.get('mail'),
            isAdmin: !!record.get('isAdmin'),
            isB2B,
            tier: isB2B ? record.get('partnerTier') : null,
            partner: isB2B ? record.get('partnerNombre') : null
        });
    } catch (error) {
        console.error('Error al obtener status de usuario:', error);
        res.status(500).json({ error: 'Error al verificar status' });
        return null;
    } finally {
        session.close();
    }
};

