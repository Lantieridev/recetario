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

            MERGE (p4:Partner {nombre: 'Danone'})
            ON CREATE SET p4.tier = 'BRAND', p4.dominio = 'danone.com'
            ON MATCH SET p4.dominio = 'danone.com'

            MERGE (p5:Partner {nombre: 'Heinz'})
            ON CREATE SET p5.tier = 'BRAND', p5.dominio = 'heinz.com'
            ON MATCH SET p5.dominio = 'heinz.com'

            MERGE (p6:Partner {nombre: 'CocaCola'})
            ON CREATE SET p6.tier = 'BRAND', p6.dominio = 'cocacola.com'
            ON MATCH SET p6.dominio = 'cocacola.com'

            MERGE (p7:Partner {nombre: 'Coto'})
            ON CREATE SET p7.tier = 'RETAIL', p7.dominio = 'coto.com'
            ON MATCH SET p7.dominio = 'coto.com'

            MERGE (p8:Partner {nombre: 'Walmart'})
            ON CREATE SET p8.tier = 'RETAIL', p8.dominio = 'walmart.com'
            ON MATCH SET p8.dominio = 'walmart.com'
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
        await session.run(`
            MERGE (u4:Usuario {nombre: 'Danone'})
            ON CREATE SET u4.mail = 'socio@danone.com', u4.contrasena = 'pass123'
            WITH u4
            MATCH (p4:Partner {nombre: 'Danone'})
            MERGE (u4)-[r:EMPLEADO_DE]->(p4)
            SET r.activo = true
        `);
        await session.run(`
            MERGE (u5:Usuario {nombre: 'Heinz'})
            ON CREATE SET u5.mail = 'socio@heinz.com', u5.contrasena = 'pass123'
            WITH u5
            MATCH (p5:Partner {nombre: 'Heinz'})
            MERGE (u5)-[r:EMPLEADO_DE]->(p5)
            SET r.activo = true
        `);
        await session.run(`
            MERGE (u6:Usuario {nombre: 'CocaCola'})
            ON CREATE SET u6.mail = 'socio@cocacola.com', u6.contrasena = 'pass123'
            WITH u6
            MATCH (p6:Partner {nombre: 'CocaCola'})
            MERGE (u6)-[r:EMPLEADO_DE]->(p6)
            SET r.activo = true
        `);
        await session.run(`
            MERGE (u7:Usuario {nombre: 'Coto'})
            ON CREATE SET u7.mail = 'socio@coto.com', u7.contrasena = 'pass123'
            WITH u7
            MATCH (p7:Partner {nombre: 'Coto'})
            MERGE (u7)-[r:EMPLEADO_DE]->(p7)
            SET r.activo = true
        `);
        await session.run(`
            MERGE (u8:Usuario {nombre: 'Walmart'})
            ON CREATE SET u8.mail = 'socio@walmart.com', u8.contrasena = 'pass123'
            WITH u8
            MATCH (p8:Partner {nombre: 'Walmart'})
            MERGE (u8)-[r:EMPLEADO_DE]->(p8)
            SET r.activo = true
        `);
        
        console.log('⏳ Creando relaciones de distribución y compras simuladas para supermercados...');
        await session.run(`
            MATCH (carrefour:Partner {nombre: 'Carrefour'})
            MATCH (coto:Partner {nombre: 'Coto'})
            MATCH (walmart:Partner {nombre: 'Walmart'})
            MATCH (hellmanns:Partner {nombre: 'Hellmanns'})
            MATCH (nestle:Partner {nombre: 'Nestle'})
            MATCH (danone:Partner {nombre: 'Danone'})
            MATCH (heinz:Partner {nombre: 'Heinz'})
            MATCH (cocacola:Partner {nombre: 'CocaCola'})

            MERGE (carrefour)-[:DISTRIBUYE]->(hellmanns)
            MERGE (carrefour)-[:DISTRIBUYE]->(nestle)

            MERGE (coto)-[:DISTRIBUYE]->(hellmanns)
            MERGE (coto)-[:DISTRIBUYE]->(danone)
            MERGE (coto)-[:DISTRIBUYE]->(cocacola)

            MERGE (walmart)-[:DISTRIBUYE]->(heinz)
            MERGE (walmart)-[:DISTRIBUYE]->(nestle)
            MERGE (walmart)-[:DISTRIBUYE]->(danone)
        `);
        
        await session.run(`
            MATCH (carrefour:Partner {nombre: 'Carrefour'})
            MERGE (c1:Compra {id: 'c1', fecha: '2026-06-10', monto: 1450.0, itemsCount: 4})
            MERGE (c1)-[:COMPRADA_EN]->(carrefour)
            MERGE (c2:Compra {id: 'c2', fecha: '2026-06-11', monto: 850.0, itemsCount: 2})
            MERGE (c2)-[:COMPRADA_EN]->(carrefour)

            MATCH (coto:Partner {nombre: 'Coto'})
            MERGE (c3:Compra {id: 'c3', fecha: '2026-06-10', monto: 1200.0, itemsCount: 3})
            MERGE (c3)-[:COMPRADA_EN]->(coto)
            MERGE (c4:Compra {id: 'c4', fecha: '2026-06-11', monto: 900.0, itemsCount: 2})
            MERGE (c4)-[:COMPRADA_EN]->(coto)

            MATCH (walmart:Partner {nombre: 'Walmart'})
            MERGE (c5:Compra {id: 'c5', fecha: '2026-06-10', monto: 3200.0, itemsCount: 6})
            MERGE (c5)-[:COMPRADA_EN]->(walmart)
            MERGE (c6:Compra {id: 'c6', fecha: '2026-06-11', monto: 1500.0, itemsCount: 4})
            MERGE (c6)-[:COMPRADA_EN]->(walmart)
        `);

        console.log('⏳ Creando ingredientes con pujas (patrocinios) activas...');
        await session.run(`
            // Hellmanns
            MERGE (i1:Ingrediente {nombre: 'Mayonesa Hellmanns'}) SET i1.pesoPatrocinio = 25.0
            MERGE (i2:Ingrediente {nombre: 'Mostaza Hellmanns'}) SET i2.pesoPatrocinio = 12.0
            MERGE (i3:Ingrediente {nombre: 'Aceite Hellmanns'}) SET i3.pesoPatrocinio = 15.0
            MERGE (i4:Ingrediente {nombre: 'Sal Hellmanns'}) SET i4.pesoPatrocinio = 5.0
            MERGE (i5:Ingrediente {nombre: 'Pimienta Hellmanns'}) SET i5.pesoPatrocinio = 6.0

            // Nestle
            MERGE (i6:Ingrediente {nombre: 'Chocolate Nestle'}) SET i6.pesoPatrocinio = 30.0
            MERGE (i7:Ingrediente {nombre: 'Leche Nestle'}) SET i7.pesoPatrocinio = 18.0
            MERGE (i8:Ingrediente {nombre: 'Harina Nestle'}) SET i8.pesoPatrocinio = 12.0
            MERGE (i9:Ingrediente {nombre: 'Azúcar Nestle'}) SET i9.pesoPatrocinio = 10.0

            // Danone
            MERGE (i10:Ingrediente {nombre: 'Leche Danone'}) SET i10.pesoPatrocinio = 20.0
            MERGE (i11:Ingrediente {nombre: 'Manteca Danone'}) SET i11.pesoPatrocinio = 15.0
            MERGE (i12:Ingrediente {nombre: 'Queso Parmesano Danone'}) SET i12.pesoPatrocinio = 18.0
            MERGE (i13:Ingrediente {nombre: 'Queso Muzzarella Danone'}) SET i13.pesoPatrocinio = 14.0
            MERGE (i14:Ingrediente {nombre: 'Yogur Danone'}) SET i14.pesoPatrocinio = 22.0

            // Heinz
            MERGE (i15:Ingrediente {nombre: 'Salsa de Tomate Heinz'}) SET i15.pesoPatrocinio = 22.0
            MERGE (i16:Ingrediente {nombre: 'Ketchup Heinz'}) SET i16.pesoPatrocinio = 25.0
            MERGE (i17:Ingrediente {nombre: 'Mostaza Heinz'}) SET i17.pesoPatrocinio = 10.0
            MERGE (i18:Ingrediente {nombre: 'Aceite Heinz'}) SET i18.pesoPatrocinio = 8.0

            // CocaCola
            MERGE (i19:Ingrediente {nombre: 'Azúcar CocaCola'}) SET i19.pesoPatrocinio = 20.0
            MERGE (i20:Ingrediente {nombre: 'Limón CocaCola'}) SET i20.pesoPatrocinio = 15.0
            MERGE (i21:Ingrediente {nombre: 'Ginebra CocaCola'}) SET i21.pesoPatrocinio = 12.0
            MERGE (i22:Ingrediente {nombre: 'Agua CocaCola'}) SET i22.pesoPatrocinio = 10.0
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
