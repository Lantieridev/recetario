import driver, { getSession, closeDriver } from './config/neo4j.js';

async function testConnection() {
    try {
        // Verificar la conexión con el servidor
        const serverInfo = await driver.getServerInfo();
        console.log('✅ Conexión exitosa a Neo4j');
        console.log('Información del Servidor:', serverInfo);

        // Probar una consulta básica
        const session = getSession();
        const result = await session.run('RETURN 1 AS number');
        console.log('✅ Prueba de consulta exitosa. Resultado:', result.records[0].get('number').toNumber());
        
        await session.close();
    } catch (error) {
        console.error('❌ Error conectando a Neo4j:', error);
    } finally {
        await closeDriver();
    }
}

testConnection();
