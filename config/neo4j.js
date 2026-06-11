import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

// Inicializar el driver
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// Función para obtener una nueva sesión
// Opcionalmente podemos pasar el nombre de la base de datos si es necesario (Aura soporta varias bases a veces)
export const getSession = () => {
    const database = process.env.NEO4J_DATABASE || 'neo4j';
    return driver.session({ database });
};

export const closeDriver = async () => {
    await driver.close();
};

export default driver;
