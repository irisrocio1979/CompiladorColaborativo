const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { exec } = require('child_process');
const fs = require('fs');

// Ruta para registrar un nuevo usuario
router.post('/usuarios/registro', async (req, res) => {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const [existingUser] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, error: 'El correo ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);
        await db.query('INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)', [nombre, correo, hashedPassword]);

        res.status(201).json({ success: true, message: 'Usuario registrado con éxito' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error al registrar usuario' });
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

// Middleware de autenticación para verificar si el usuario está autenticado
function autenticar(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({ error: 'No autorizado. Inicia sesión primero.' });
    }
    next();
}


// Ruta para ejecutar código
router.post('/run', async (req, res) => {
    console.log("Se recibió una solicitud para ejecutar Python:", req.body);

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No se envió código para ejecutar' });
    }

    // Guardar el código en un archivo temporal
    const tempFilePath = './temp_script.py';
    fs.writeFileSync(tempFilePath, code, 'utf8');

    // Ejecutar el archivo usando Python con un timeout de 10 segundos
    exec(`python ${tempFilePath}`, { timeout: 10000 }, (error, stdout, stderr) => {
        // Eliminar el archivo temporal después de la ejecución
        fs.unlinkSync(tempFilePath);

        // Verificar si hubo un error o si se alcanzó el tiempo de espera
        if (error) {
            if (error.signal === 'SIGTERM') {
                return res.status(500).json({ error: 'El código excedió el tiempo de ejecución (bucle infinito o proceso largo)' });
            }
            return res.status(500).json({ error: stderr || 'Error ejecutando el código' });
        }

        // Si todo salió bien, devolver la salida
        res.json({ output: stdout });
    });
});

// Ruta para compartir proyectos
router.post('/proyectos/compartir', autenticar, async (req, res) => {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ success: false, error: 'Debe proporcionar al menos un correo.' });
    }

    try {
        // Opcional: Filtrar correos válidos y buscar usuarios en la base de datos
        const [users] = await db.query('SELECT correo FROM usuarios WHERE correo IN (?)', [emails]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'No se encontraron usuarios para los correos proporcionados.' });
        }

        // Lógica para vincular usuarios con el proyecto (ejemplo)
        // await db.query('INSERT INTO permisos (proyecto_id, usuario_id) VALUES (?, ?)', [proyectoId, userId]);

        res.json({ success: true, message: 'Proyecto compartido exitosamente.', sharedWith: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error al compartir el proyecto.' });
    }
});

// Ruta para crear o actualizar un proyecto
router.post('/crear-proyecto', autenticar, async (req, res) => {
    const { id, nombre, descripcion, codigo, creador_id } = req.body;

    // Verificar que todos los campos obligatorios estén presentes
    if (!nombre || !descripcion || !codigo || !creador_id) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        if (id) {
            // Si existe un id, intentamos actualizar el proyecto
            const [existingProject] = await db.query('SELECT * FROM proyectos WHERE id = ?', [id]);

            if (existingProject.length === 0) {
                return res.status(404).json({ error: 'Proyecto no encontrado' });
            }

            // Actualizar el proyecto en la base de datos
            const query = 'UPDATE proyectos SET nombre = ?, descripcion = ?, codigo = ?, creador_id = ? WHERE id = ?';
            await db.query(query, [nombre, descripcion, codigo, creador_id, id]);

            return res.json({ success: true, message: 'Proyecto actualizado exitosamente' });
        } else {
            // Si no existe un id, creamos un nuevo proyecto
            const query = 'INSERT INTO proyectos (nombre, descripcion, codigo, creador_id) VALUES (?, ?, ?, ?)';
            const [result] = await db.query(query, [nombre, descripcion, codigo, creador_id]);

            return res.status(201).json({ success: true, proyecto: { id: result.insertId, nombre, descripcion, codigo, creador_id } });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear o actualizar el proyecto' });
    }
});


// Cerrar sesión
router.post('/usuarios/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error al cerrar sesión');
        }
        res.json({ message: 'Sesión cerrada exitosamente' });
    });
});

module.exports = router;
