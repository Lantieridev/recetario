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
    } catch (error) {
        console.error('❌ Error durante el sembrado de la base de datos:', error);
    } finally {
        await session.close();
        await closeDriver();
    }
}

// Ejecutar si se llama directamente
seedDatabase();
