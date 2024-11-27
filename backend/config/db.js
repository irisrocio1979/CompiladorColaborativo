const mysql = require('mysql2');
const dotenv = require('dotenv');

// Cargar las variables del archivo .env
dotenv.config();

// Crear el pool de conexión
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'replit_make',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();

(async () => {
    const db = require('./db');
    try {
        const [result] = await db.query('SELECT 1 + 1 AS resultado');
        console.log('Conexión exitosa a MySQL:', result);
    } catch (error) {
        console.error('Error al conectar a MySQL:', error);
    }
})();

