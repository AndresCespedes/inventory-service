FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Instalar explícitamente class-validator y class-transformer para validación
RUN npm install --save class-validator class-transformer @nestjs/swagger swagger-ui-express

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3001

# Comando para ejecutar la aplicación en modo desarrollo
CMD ["npm", "run", "start:dev"]
