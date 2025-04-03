# Servicio de Inventario - Microservicio

Este proyecto implementa un microservicio de gestión de inventario que se comunica con un servicio de productos, siguiendo el estándar JSON API para respuestas.

## Características

- 🚀 Microservicio NestJS para gestión de inventario
- 🔄 Comunicación con servicio de productos mediante HTTP
- 📊 Formato JSON API para respuestas
- 🐳 Configuración con Docker y Docker Compose
- 📝 Documentación API con Swagger
- ✅ Pruebas automatizadas con Jest
- 🧩 Validación de datos con class-validator

## Requisitos

- Node.js (>= 14.x)
- npm o yarn
- Docker y Docker Compose (para entorno containerizado)
- Servicio de productos funcionando en paralelo

## Instalación

### Instalación local

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run start:dev

# Compilar para producción
npm run build

# Iniciar en modo producción
npm run start:prod
```

### Instalación con Docker

```bash
# Construir imagen
docker build -t inventory-service .

# Ejecutar contenedor
docker run -p 3001:3001 -e PRODUCTS_SERVICE_URL=http://product-service:3000 inventory-service
```

### Usando Docker Compose

```bash
# Iniciar ambos servicios (productos e inventario)
docker-compose up -d

# Detener servicios
docker-compose down
```

## Configuración

El servicio utiliza las siguientes variables de entorno:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| PRODUCTS_SERVICE_URL | URL base del servicio de productos | http://localhost:3000 |
| API_KEY | Clave API para autenticación | my-secret-api-key |
| PORT | Puerto en el que se ejecuta el servicio | 3001 |

## Documentación API

La documentación interactiva de la API está disponible en `/api/docs` una vez iniciado el servicio.

### Endpoints principales

#### GET /inventory/:productId

Obtiene el inventario de un producto específico y su información relacionada.

**Respuesta exitosa (200 OK)**
```json
{
  "data": {
    "type": "inventory",
    "id": "1",
    "attributes": {
      "quantity": 100
    },
    "relationships": {
      "product": {
        "data": {
          "type": "product",
          "id": "1"
        }
      }
    }
  },
  "included": [
    {
      "type": "product",
      "id": "1",
      "attributes": {
        "name": "Producto de ejemplo",
        "price": 99.99
      }
    }
  ],
  "links": {
    "self": "/inventory/1"
  }
}
```

#### PATCH /inventory/:productId

Actualiza la cantidad disponible de un producto.

**Cuerpo de la solicitud**
```json
{
  "quantity": 50
}
```

**Respuesta exitosa (200 OK)**
```json
{
  "data": {
    "type": "inventory",
    "id": "1",
    "attributes": {
      "quantity": 50
    },
    "relationships": {
      "product": {
        "data": {
          "type": "product",
          "id": "1"
        }
      }
    }
  },
  "links": {
    "self": "/inventory/1"
  }
}
```

## Pruebas

```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas e2e
npm run test:e2e

# Ver cobertura de pruebas
npm run test:cov
```

## Arquitectura

### Estructura del proyecto

```
src/
├── inventory/
│   ├── dto/              # Objetos de transferencia de datos
│   ├── entities/         # Entidades y modelos
│   ├── inventory.controller.ts   # Controlador REST
│   ├── inventory.service.ts      # Lógica de negocio
│   └── inventory.module.ts       # Módulo NestJS
├── app.module.ts         # Módulo principal
└── main.ts              # Punto de entrada
```

### Flujo de comunicación

1. El cliente hace una petición al servicio de inventario
2. El servicio de inventario consulta su base de datos
3. Para información adicional, el servicio consulta al servicio de productos
4. La respuesta se formatea según el estándar JSON API y se envía al cliente

## Resolución de problemas

### Problemas de conexión con el servicio de productos

El servicio intenta conectar con múltiples URLs si la primera falla:
- URL configurada (PRODUCTS_SERVICE_URL)
- http://host.docker.internal:3000
- http://localhost:3000
- http://127.0.0.1:3000
- http://product-service:3000

Esto permite flexibilidad en diferentes entornos de despliegue, especialmente en Docker.

## Contribución

1. Haz fork del proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la licencia MIT - ver el archivo LICENSE para más detalles.
