import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSession, closeDriver } from '../config/neo4j.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
    const session = getSession();
    try {
        console.log('⏳ Iniciando el sembrado de la base de datos Neo4j...');

        // Limpiar base de datos antes de sembrar para evitar duplicados
        console.log('🧹 Limpiando datos existentes...');
        await session.run('MATCH (n) DETACH DELETE n');

        // Leer el archivo .cypher
        const cypherPath = path.join(__dirname, '..', 'poblar_recetario.cypher');
        if (!fs.existsSync(cypherPath)) {
            throw new Error(`No se encontró el archivo de poblado en: ${cypherPath}`);
        }

        const cypherContent = fs.readFileSync(cypherPath, 'utf-8');

        // Dividir el archivo por punto y coma (;) para obtener sentencias individuales
        const statements = cypherContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('// ---- LIMPIAR'));

        console.log(`📌 Se encontraron ${statements.length} bloques de consultas Cypher para ejecutar.`);

        // Ejecutar cada sentencia secuencialmente
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Omitir si la sentencia es vacía o solo comentarios
            if (!statement || statement.replace(/\/\/.*/g, '').trim() === '') {
                continue;
            }

            console.log(`🚀 Ejecutando bloque ${i + 1}/${statements.length}...`);
            await session.run(statement);
        }

        console.log('✅ Base de datos poblada exitosamente.');

        // Asegurar usuarios demo B2B y administrador
        console.log('⏳ Asegurando usuarios demo B2B y administrador...');
        await session.run(`
            MERGE (u:Usuario {nombre: 'Admin'})
            ON CREATE SET u.mail = 'admin@recetario.com', u.contrasena = 'admin123', u.isAdmin = true
            ON MATCH SET u.isAdmin = true
        `);
        await session.run(`
            MERGE (p1:Partner {nombre: 'Hellmanns'})
            ON CREATE SET p1.tier = 'BRAND', p1.dominio = 'hellmanns.com'
            ON MATCH SET p1.dominio = 'hellmanns.com'

            MERGE (p2:Partner {nombre: 'Carrefour'})
            ON CREATE SET p2.tier = 'RETAIL', p2.dominio = 'carrefour.com'
            ON MATCH SET p2.dominio = 'carrefour.com'

            MERGE (p3:Partner {nombre: 'Nestle'})
            ON CREATE SET p3.tier = 'ENTERPRISE', p3.dominio = 'nestle.com'
            ON MATCH SET p3.dominio = 'nestle.com'
        `);
        await session.run(`
            MERGE (u1:Usuario {nombre: 'Hellmanns'})
            ON CREATE SET u1.mail = 'socio@hellmanns.com', u1.contrasena = 'pass123'
            WITH u1
            MATCH (p1:Partner {nombre: 'Hellmanns'})
            MERGE (u1)-[r:EMPLEADO_DE]->(p1)
            SET r.activo = true
        `);
        await session.run(`
            MERGE (u2:Usuario {nombre: 'Carrefour'})
            ON CREATE SET u2.mail = 'socio@carrefour.com', u2.contrasena = 'pass123'
            WITH u2
            MATCH (p2:Partner {nombre: 'Carrefour'})
            MERGE (u2)-[r:EMPLEADO_DE]->(p2)
            SET r.activo = true
        `);
        await session.run(`
            MERGE (u3:Usuario {nombre: 'Nestle'})
            ON CREATE SET u3.mail = 'socio@nestle.com', u3.contrasena = 'pass123'
            WITH u3
            MATCH (p3:Partner {nombre: 'Nestle'})
            MERGE (u3)-[r:EMPLEADO_DE]->(p3)
            SET r.activo = true
        `);
        console.log('✅ Usuarios demo B2B y administrador asegurados.');
    } catch (error) {
        console.error('❌ Error durante el sembrado de la base de datos:', error);
    } finally {
        await session.close();
        await closeDriver();
    }
}

// Ejecutar si se llama directamente
seedDatabase();
