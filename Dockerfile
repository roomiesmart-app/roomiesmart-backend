# Usamos una imagen ligera de Node.js
FROM node:18-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del proyecto
COPY . .

# Exponemos el puerto estándar de la API
EXPOSE 3000

# Comando para iniciar la aplicación (Asumiendo que tendrán un index.js)
CMD ["node", "src/index.js"]