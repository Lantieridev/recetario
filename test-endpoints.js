import app from './app.js';
import { closeDriver } from './config/neo4j.js';

const PORT = 3001; // Usamos un puerto diferente para la prueba
let server;

// Función auxiliar para realizar peticiones fetch locales
async function request(path, options = {}) {
    const url = `http://localhost:${PORT}${path}`;
    const defaultHeaders = options.body ? { 'Content-Type': 'application/json' } : {};
    const res = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });
    const status = res.status;
    let data;
    try {
        data = await res.json();
    } catch (e) {
        data = await res.text();
    }
    return { status, data };
}

async function runTests() {
    // Iniciar servidor temporal
    server = app.listen(PORT, async () => {
        console.log(`🧪 Servidor de pruebas iniciado en http://localhost:${PORT}`);
        try {
            console.log('\n--- INICIANDO PRUEBAS DE ENDPOINTS ---');

            // 1. Endpoint: Crear Usuario (POST /api/usuarios)
            console.log('\n1. Probando: Crear Usuario...');
            const res1 = await request('/api/usuarios', {
                method: 'POST',
                body: JSON.stringify({
                    nombre: 'Carlos',
                    mail: 'carlos@mail.com',
                    contrasena: 'carlos123'
                })
            });
            console.log('Status:', res1.status);
            console.log('Respuesta:', JSON.stringify(res1.data));

            // 2. Endpoint: Obtener Perfil de Usuario (GET /api/usuarios/:nombre)
            console.log('\n2. Probando: Obtener Perfil de Usuario...');
            const res2 = await request('/api/usuarios/Carlos');
            console.log('Status:', res2.status);
            console.log('Respuesta:', JSON.stringify(res2.data));

            // 3. Endpoint: Crear Receta vinculada a Creador (POST /api/recetas)
            console.log('\n3. Probando: Crear Receta...');
            const res3 = await request('/api/recetas', {
                method: 'POST',
                body: JSON.stringify({
                    titulo: 'Pollo al verdeo',
                    descripcion: 'Riquísimo pollo al verdeo con crema',
                    dificultad: 'Media',
                    tiempo: '35 min',
                    pasos: '1. Cortar el pollo. 2. Saltear con verdeo. 3. Agregar crema.',
                    creador: 'Carlos',
                    categoria: 'SIN TACC'
                })
            });
            console.log('Status:', res3.status);
            console.log('Respuesta:', JSON.stringify(res3.data));

            // 4. Endpoint: Agregar Ingrediente a Receta con cantidad (POST /api/recetas/:titulo/ingredientes)
            console.log('\n4. Probando: Asociar Ingrediente con propiedad cantidad...');
            const res4 = await request('/api/recetas/Pollo al verdeo/ingredientes', {
                method: 'POST',
                body: JSON.stringify({
                    nombreIngrediente: 'Pollo',
                    cantidad: '500g'
                })
            });
            console.log('Status:', res4.status);
            console.log('Respuesta:', JSON.stringify(res4.data));

            // 5. Endpoint: Guardar Receta en Favoritos (POST /api/usuarios/:nombre/favoritos)
            console.log('\n5. Probando: Guardar Receta en Favoritos...');
            const res5 = await request('/api/usuarios/Carlos/favoritos', {
                method: 'POST',
                body: JSON.stringify({
                    tituloReceta: 'Pizza margherita'
                })
            });
            console.log('Status:', res5.status);
            console.log('Respuesta:', JSON.stringify(res5.data));

            // 6. Endpoint: Listar y Filtrar Recetas (GET /api/recetas)
            console.log('\n6. Probando: Listar y filtrar recetas...');
            const res6 = await request('/api/recetas?categoria=SIN TACC');
            console.log('Status:', res6.status);
            console.log('Total recetas:', res6.data.total);
            console.log('Respuesta (primeras recetas):', JSON.stringify(res6.data.recetas.slice(0, 2)));

            // 7. Endpoint Complejo: Recomendación Colaborativa (GET /api/usuarios/:nombre/recomendaciones)
            console.log('\n7. Probando (Complejo): Recomendación Colaborativa...');
            const res7 = await request('/api/usuarios/Carlos/recomendaciones');
            console.log('Status:', res7.status);
            console.log('Respuesta:', JSON.stringify(res7.data));

            // 8. Endpoint Complejo: Buscador Inteligente (GET /api/recetas/buscar)
            console.log('\n8. Probando (Complejo): Buscador Inteligente...');
            const res8 = await request('/api/recetas/buscar?tengo=Lentejas,Cebolla,Zanahoria&noQuiero=Pollo');
            console.log('Status:', res8.status);
            console.log('Respuesta:', JSON.stringify(res8.data));

            // 9. Endpoint: Recetas Similares (GET /api/recetas/:titulo/similares)
            console.log('\n9. Probando: Recetas Similares...');
            const res9 = await request('/api/recetas/Pizza margherita/similares');
            console.log('Status:', res9.status);
            console.log('Respuesta:', JSON.stringify(res9.data));

            // 10. Endpoint: Receta del Dia (GET /api/recetas/del-dia)
            console.log('\n10. Probando: Receta del Dia...');
            const res10 = await request('/api/recetas/del-dia');
            console.log('Status:', res10.status);
            console.log('Respuesta:', JSON.stringify(res10.data));

            // 11. Endpoint: Tendencias (GET /api/recetas/tendencias)
            console.log('\n11. Probando: Tendencias...');
            const res11 = await request('/api/recetas/tendencias');
            console.log('Status:', res11.status);
            console.log('Respuesta:', JSON.stringify(res11.data));

            // 12. Endpoint: Dashboard Stats (GET /api/dashboard/stats)
            console.log('\n12. Probando: Dashboard Stats...');
            const res12 = await request('/api/dashboard/stats');
            console.log('Status:', res12.status);
            console.log('Respuesta:', JSON.stringify(res12.data));

            // 13. Endpoint: Top Creadores (GET /api/dashboard/top-creadores)
            console.log('\n13. Probando: Top Creadores...');
            const res13 = await request('/api/dashboard/top-creadores');
            console.log('Status:', res13.status);
            console.log('Respuesta:', JSON.stringify(res13.data));

            // 14. Endpoint: Seguir Usuario (POST /api/usuarios/:nombre/seguir)
            console.log('\n14. Probando: Seguir Usuario y Comunidad...');
            const res14 = await request('/api/usuarios/Carlos/seguir', {
                method: 'POST',
                body: JSON.stringify({ usuarioASeguir: 'Ornella' }) // Assume Ornella is seeded
            });
            console.log('Status:', res14.status);
            console.log('Respuesta Seguir:', JSON.stringify(res14.data));

            // 15. Endpoint: Comunidad (GET /api/usuarios/:nombre/comunidad)
            console.log('\n15. Probando: Comunidad...');
            const res15 = await request('/api/usuarios/Carlos/comunidad');
            console.log('Status:', res15.status);
            console.log('Respuesta Comunidad:', JSON.stringify(res15.data));

            // 16. Endpoint: Historial / Cook Mode (POST /api/usuarios/:nombre/historial)
            console.log('\n16. Probando: Historial...');
            const res16 = await request('/api/usuarios/Carlos/historial', {
                method: 'POST',
                body: JSON.stringify({ tituloReceta: 'Pizza margherita' })
            });
            console.log('Status:', res16.status);
            console.log('Respuesta Historial:', JSON.stringify(res16.data));


            console.log('\n--- PRUEBAS FINALIZADAS ---');
        } catch (error) {
            console.error('❌ Error durante la ejecución de las pruebas:', error);
        } finally {
            // Cerrar el servidor Express
            server.close(async () => {
                console.log('🔒 Servidor de pruebas cerrado.');
                // Cerrar la conexión de Neo4j para evitar procesos colgados
                await closeDriver();
                console.log('🔒 Conexión de Neo4j cerrada.');
                process.exit(0);
            });
        }
    });
}

runTests();
