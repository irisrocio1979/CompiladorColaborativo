const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const path = require('path');


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
//app.use(express.json());



// Ruta de prueba para confirmar que el backend funciona
app.get('/', (req, res) => {
    res.send('¡Backend funcionando!');
});


// Vincular rutas de usuarios
app.use('/api', userRoutes);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
