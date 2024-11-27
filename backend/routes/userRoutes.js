const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Para encriptar contraseñas
const db = require('../config/db');
const session = require('express-session');

// Configurar sesión
router.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,  // Solo para desarrollo local sin HTTPS
        httpOnly: true, // Asegura que la cookie no pueda ser accesada por JavaScript
        maxAge: 24 * 60 * 60 * 1000, // Duración de la sesión
        sameSite: 'lax'//'strict'  
    }
}));



// Ruta para obtener todos los usuarios (opcional, para pruebas o administración)
router.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM usuarios');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener usuarios');
    }
});

// Ruta para registrar un nuevo usuario
router.post('/usuarios/registro', async (req, res) => {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si el correo ya está registrado
        const [existingUser] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, error: 'El correo ya está registrado' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar el nuevo usuario en la base de datos
        await db.query(
            'INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)',
            [nombre, correo, hashedPassword]
        );

        res.status(201).json({success: true, message: 'Usuario registrado con éxito' });
    } catch (err) {
        console.error(err);
        res.status(500).send({success: false, error:'Error al registrar usuario'});
    }
});

// Ruta para inicio de sesión
router.post('/usuarios/login', async (req, res) => {
    console.log('Datos recibidos en la solicitud de login:', req.body);
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Buscar al usuario por correo
        const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

        console.log('Usuario encontrado en la base de datos:', rows);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        const usuario = rows[0];

        // Comparar la contraseña ingresada con la almacenada
        const isPasswordValid = await bcrypt.compare(contraseña, usuario.contraseña);
        
        console.log('Contraseña válida:', isPasswordValid); 

        // Verificar si la contraseña es válida
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
        }

        // Log de verificación de inicio de sesión exitoso
        console.log(`Usuario logueado: ${usuario.nombre} (${usuario.correo})`);
        // Guardar la información del usuario en la sesión
        req.session.user = { id: usuario.id, nombre: usuario.nombre };

        // Log para verificar si la sesión está correcta
        console.log('Sesión guardada:', req.session.user);

        res.json({ success: true, message: 'Inicio de sesión exitoso', usuario: { id: usuario.id, nombre: usuario.nombre } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
    }
});

// Ruta para verificar si el usuario está logueado
router.get('/usuarios/verify-session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});


// Ruta para cerrar sesión
router.post('/usuarios/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error al cerrar sesión');
        }
        res.json({ message: 'Sesión cerrada exitosamente' });
    });
});

// Ruta para eliminar un usuario (opcional, solo para pruebas)
router.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        res.json({ message: 'Usuario eliminado con éxito' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar usuario');
    }
});

// Middleware de autenticación para verificar si el usuario está autenticado
function autenticar(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({ error: 'No autorizado. Inicia sesión primero.' });
    }
    next();
}


const { exec } = require('child_process'); // Importa exec para ejecutar comandos en la terminal

// Ruta para ejecutar código Python
router.post('/py', async (req, res) => {

    console.log("Se recibió una solicitud para ejecutar Python:", req.body);

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No se envió código para ejecutar' });
    }

    // Guardar el código en un archivo temporal
    const fs = require('fs');
    const tempFilePath = './temp_script.py';

    fs.writeFileSync(tempFilePath, code, 'utf8');

    // Ejecutar el archivo usando Python
    exec(`python ${tempFilePath}`, (error, stdout, stderr) => {
        // Eliminar el archivo temporal después de la ejecución
        fs.unlinkSync(tempFilePath);

        if (error) {
            return res.status(500).json({ error: stderr || 'Error ejecutando el código' });
        }

        res.json({ output: stdout });
    });
});



module.exports = router;
