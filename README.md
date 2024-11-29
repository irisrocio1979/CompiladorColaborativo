# Replit-Make: Plataforma de Edición y Compartición de Código

Este proyecto es una aplicación web colaborativa que permite a los usuarios editar y compartir proyectos de código. Se encuentra en desarrollo y actualmente funciona en un entorno local con Node.js y XAMPP.

## Requisitos Previos

# 1. Software Necesario:
# - Node.js
# - XAMPP
# - MySQL (incluido con XAMPP)

# 2. Paquetes NPM Necesarios:
npm install express dotenv mysql2 cors body-parser codemirror mongoose

# 3. Servidor Frontend:
npm install -g live-server

# 4. Estructura del Proyecto:
# replit-make/
# |--- backend/
# |    |--- config/
# |    |    |--- db.js
# |    |--- routes/
# |    |--- controllers/
# |    |--- models/
# |    |--- server.js
# |
# |--- frontend/
# |    |--- assets/
# |    |    |--- css/style.css 
# |    |    |--- js/script.js 
# |    |--- index.html
# |
# |--- .env
# |--- package.json
# |--- package-lock.json

# 5. Configuración del Proyecto

# 5.1 Base de Datos:
# Inicia XAMPP y abre phpMyAdmin.

# Crea una base de datos llamada "replit_make":
mysql -u root -p
CREATE DATABASE replit_make;

# Agrega la tabla de usuarios:
USE replit_make;
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL
);

# Agrega la tabla de proyectos:
CREATE TABLE proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    contenido TEXT,
    acceso ENUM('privado', 'publico') DEFAULT 'privado',
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

# Crea un usuario administrador:
INSERT INTO usuarios (nombre, correo, contraseña) 
VALUES ('Root Admin', 'admin@root.com', '$2b$10$7s5jZ5Y1iTpPzxKbdkp2xe0mjV5i6KAKt3V8Bx7cKpmfMHKk8hDKS');

# 5.2 Configuración de Variables de Entorno:
# Crea un archivo .env en la raíz del proyecto y agrega lo siguiente:
echo "DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=replit_make
DB_PORT=3306" > .env

# 6. Inicia los Servidores

# 6.1 Backend:
cd backend
node server.js

# 6.2 Frontend:
cd frontend
live-server

# 7. Prueba la Conexión
# Abre el archivo frontend/index.html en tu navegador.
# Haz clic en el botón "Probar Backend".
# Deberías ver la respuesta del backend en pantalla.
#importante: tener XAMPP activo con Apache y MySQL activos
