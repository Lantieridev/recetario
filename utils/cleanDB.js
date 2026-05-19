import { getSession, closeDriver } from '../config/neo4j.js';

async function cleanDatabase() {
    const session = getSession();
    try {
        console.log('🧹 Eliminando todos los nodos y relaciones de la base de datos Neo4j...');
        
        await session.run('MATCH (n) DETACH DELETE n');
        
        console.log('✅ Base de datos limpiada exitosamente. Lista para volver a sembrar.');
    } catch (error) {
        console.error('❌ Error durante la limpieza de la base de datos:', error);
    } finally {
        await session.close();
        await closeDriver();
    }
}

cleanDatabase();
