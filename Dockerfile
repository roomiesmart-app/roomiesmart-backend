# --- ETAPA 1: BASE COMÚN ---
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Copiamos solo los archivos de dependencias primero (Mejora el caché de Docker)
COPY package*.json ./
RUN npm install

# Copiamos el resto del código (incluyendo la carpeta src/)
COPY . .

# Exponemos el puerto interno del contenedor
EXPOSE 3000

# --- ETAPA 2: ENTORNO DE DESARROLLO (DEV) ---
FROM base AS development
# Usa el script "dev" configurado por Esteban (tsx watch src/index.ts)
CMD ["npm", "run", "dev"]

# --- ETAPA 3: ENTORNO DE PRODUCCIÓN (PROD) ---
FROM base AS production
# Ejecuta el compilador tsc para convertir TypeScript a JavaScript en dist/
RUN npm run build
# Usa el script "start" configurado por Esteban (node dist/index.js)
CMD ["npm", "start"]