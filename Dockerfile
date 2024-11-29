# Imagen base para Node.js
FROM node:18

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./
COPY backend/ ./backend
COPY frontend/ ./frontend

# Instalar dependencias
RUN npm install

# Exponer el puerto que usará el servidor
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "backend/server.js"]
