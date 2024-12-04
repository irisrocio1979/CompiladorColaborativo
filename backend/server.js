const express = require('express');
const http = require('http'); // Para crear el servidor compatible con WebSockets
const { Server } = require('socket.io'); // WebSockets en Node.js
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Crear el servidor HTTP y asociarlo con Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Cambiar a la URL de tu frontend en producción
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // En producción, se debe configurar con HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

// Rutas
app.use('/api', userRoutes);

// WebSocket: Configuración de eventos
io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Evento para recibir cambios en el código y transmitirlos a otros clientes
    socket.on('code-change', (data) => {
        console.log('Cambio de código recibido:', data);
        socket.broadcast.emit('code-update', data); // Enviar a todos menos al emisor
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Backend funcionando con WebSockets!');
});


require('dotenv').config();
const mysql = require('mysql2');

// Configura la conexión con la base de datos usando las variables de entorno
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a la base de datos');
});


// Iniciar el servidor
server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
