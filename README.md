# Plataforma de Eventos e Inscripciones

Proyecto desarrollado para Programación Backend II.

## Temática

La aplicación consiste en una API REST para una plataforma de eventos e inscripciones.

Esta primera pre-entrega establece la arquitectura base del proyecto utilizando Express, MongoDB y una organización por capas.

## Tecnologías

- Node.js
- Express
- JavaScript
- MongoDB
- Mongoose
- dotenv
- npm

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/tomidebiase/proyecto-eventos.git
```

Entrar a la carpeta del proyecto:

```bash
cd proyecto-eventos
```

Instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` tomando como referencia `.env.example`.

Ejemplo:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://127.0.0.1:27017/proyecto_eventos
JWT_SECRET=
```

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

## Arquitectura por capas

El proyecto está organizado separando responsabilidades.

Para el recurso de eventos se implementó un recorrido completo:

```text
GET /api/events
        ↓
Route
        ↓
Controller
        ↓
Service
        ↓
Repository
        ↓
DAO
        ↓
EventModel
        ↓
MongoDB
```

### Routes

Reciben las peticiones HTTP y delegan en los controllers.

```text
src/routes/
```

### Controllers

Manejan request y response.

Los errores se envían al middleware global mediante `next(error)`.

```text
src/controllers/
```

### Services

Contienen la lógica de la aplicación.

```text
src/services/
```

### Repositories

Actúan como intermediarios entre services y acceso a datos.

```text
src/repositories/
```

### DAO

Acceden directamente a los modelos de Mongoose.

```text
src/dao/
```

### Models

Definen los esquemas de MongoDB utilizando Mongoose.

```text
src/models/
```

### Middlewares

Contienen funciones reutilizables que se ejecutan durante el ciclo de una petición.

Se implementó un middleware global para manejo de errores.

```text
src/middlewares/error.middleware.js
```

## Conexión a MongoDB

La aplicación se conecta a MongoDB utilizando Mongoose.

La URL se obtiene desde la variable de entorno:

```text
MONGO_URL
```

La conexión se inicializa desde:

```text
src/app.js
```

## Rutas disponibles

### Health

```text
GET /api/health
```

Permite verificar que el servidor se encuentra activo.

Ejemplo de respuesta:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

### Eventos

```text
GET /api/events
```

Obtiene los eventos almacenados en MongoDB utilizando el flujo completo de arquitectura por capas.

Ejemplo de respuesta:

```json
{
  "status": "success",
  "payload": []
}
```

## Estructura principal

```text
src/
├── app.js
├── server.js
├── config/
│   └── env.js
├── controllers/
│   ├── events.controller.js
│   ├── health.controller.js
│   └── sessions.controller.js
├── dao/
│   └── events.dao.js
├── middlewares/
│   └── error.middleware.js
├── models/
│   ├── Event.js
│   └── User.js
├── repositories/
│   └── events.repository.js
├── routes/
│   ├── events.router.js
│   ├── health.router.js
│   └── sessions.router.js
├── services/
│   └── events.service.js
└── utils/
```

## Manejo de errores

Los controllers utilizan `try/catch`.

Los errores se delegan al middleware global:

```text
src/middlewares/error.middleware.js
```

Este middleware responde con un formato uniforme:

```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

## Seguridad y configuración

Los archivos sensibles no se suben al repositorio.

El archivo `.gitignore` excluye:

```text
.env
node_modules
```