# Plataforma de Eventos e Inscripciones

API REST desarrollada para el proyecto de Backend II.

## Pre-entrega 6 — Entidad Events y lógica de negocio

En esta etapa se desarrolló el CRUD de eventos incorporando:

- Creación de eventos.
- Listado con filtros.
- Consulta por ID.
- Modificación.
- Cambio de estado y cancelación lógica.
- Validaciones de negocio.
- Autorización por roles.
- Validación de propiedad del recurso.
- Paginación.
- Ordenamiento.

## Tecnologías

- Node.js
- Express
- JavaScript
- MongoDB Atlas
- Mongoose
- bcrypt
- JSON Web Token
- cookie-parser
- Passport.js
- passport-local
- passport-jwt
- dotenv
- npm

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/tomidebiase/proyecto-eventos.git
```

Entrar al proyecto:

```bash
cd proyecto-eventos
```

Instalar dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` tomando como referencia `.env.example`.

```env
PORT=8080
NODE_ENV=development
MONGO_URL=
JWT_SECRET=
JWT_EXPIRES_IN=1h
```

Las credenciales reales no deben subirse al repositorio.

## Ejecutar el proyecto

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

## Modelo Event

Los eventos contienen los siguientes campos:

- `title`
- `description`
- `category`
- `date`
- `location`
- `capacity`
- `price`
- `status`
- `organizer`

El campo `organizer` es una referencia `ObjectId` al modelo `User`.

No se guarda el objeto completo del usuario dentro del evento.

### Estados permitidos

```text
draft
published
cancelled
finished
```

### Validaciones del modelo

- `title` obligatorio.
- `description` obligatorio.
- `category` obligatorio.
- `location` obligatorio.
- `date` obligatorio.
- `capacity` debe ser mayor a `0`.
- `price` debe ser mayor o igual a `0`.
- `organizer` obligatorio.

## Roles

Los roles disponibles son:

```text
user
organizer
admin
```

### user

Puede consultar eventos.

No puede crear ni modificar eventos.

### organizer

Puede:

- Crear eventos.
- Modificar sus propios eventos.
- Cambiar el estado de sus propios eventos.

No puede modificar eventos ajenos.

### admin

Puede:

- Crear eventos.
- Modificar cualquier evento.
- Cambiar el estado de cualquier evento.

## Matriz de permisos

| Acción | user | organizer | admin |
|---|---|---|---|
| Consultar eventos | ✅ | ✅ | ✅ |
| Consultar evento por ID | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar evento propio | ❌ | ✅ | ✅ |
| Modificar evento ajeno | ❌ | ❌ | ✅ |
| Cambiar estado propio | ❌ | ✅ | ✅ |
| Cambiar estado de cualquier evento | ❌ | ❌ | ✅ |

## Endpoints de eventos

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/events` | organizer / admin |
| GET | `/api/events` | Público |
| GET | `/api/events/:id` | Público |
| PUT | `/api/events/:id` | Dueño / admin |
| PATCH | `/api/events/:id/status` | Dueño / admin |

## POST /api/events

Crea un evento.

Solo pueden acceder usuarios con rol:

```text
organizer
admin
```

Ejemplo:

```json
{
  "title": "Workshop Node",
  "description": "Evento de programación",
  "category": "workshop",
  "date": "2026-12-15",
  "location": "Buenos Aires",
  "capacity": 50,
  "price": 100,
  "status": "published"
}
```

El campo `organizer` no se recibe desde el body.

Se asigna automáticamente desde:

```text
req.user
```

Respuesta exitosa:

```json
{
  "status": "success",
  "payload": {
    "id": "ID_DEL_EVENTO",
    "title": "Workshop Node",
    "organizer": "ID_DEL_USUARIO"
  }
}
```

HTTP:

```text
201
```

## GET /api/events

Lista eventos con soporte para filtros, paginación y ordenamiento.

### Filtros disponibles

```text
status
category
location
dateFrom
dateTo
```

Ejemplo:

```text
GET /api/events?status=published&category=workshop&location=Buenos Aires
```

### Rango de fechas

```text
GET /api/events?dateFrom=2026-10-01&dateTo=2026-12-31
```

### Paginación

Parámetros:

```text
page
limit
```

Ejemplo:

```text
GET /api/events?page=2&limit=5
```

### Ordenamiento

Se utiliza el parámetro:

```text
sort
```

Campos permitidos:

```text
date
title
price
capacity
createdAt
```

Ejemplo ascendente:

```text
GET /api/events?sort=date
```

Ejemplo descendente:

```text
GET /api/events?sort=-date
```

### Ejemplo completo

```text
GET /api/events?status=published&category=workshop&page=1&limit=5&sort=date
```

Respuesta:

```json
{
  "status": "success",
  "data": [],
  "page": 1,
  "limit": 5,
  "total": 0,
  "totalPages": 0
}
```

Los valores dependen de los eventos almacenados.

## GET /api/events/:id

Consulta un evento específico.

Ejemplo:

```text
GET /api/events/ID_DEL_EVENTO
```

Si existe:

```json
{
  "status": "success",
  "payload": {
    "id": "ID_DEL_EVENTO",
    "title": "Workshop Node"
  }
}
```

Si no existe:

```json
{
  "status": "error",
  "message": "Evento no encontrado"
}
```

HTTP:

```text
404
```

## PUT /api/events/:id

Permite modificar un evento.

Puede hacerlo:

- El `organizer` dueño del evento.
- Un `admin`.

Un organizer intentando modificar un evento ajeno recibe:

```json
{
  "status": "error",
  "message": "No tenés permisos para modificar este evento"
}
```

HTTP:

```text
403
```

El campo `organizer` no puede modificarse desde el body.

El campo `status` tampoco se modifica mediante este endpoint.

## PATCH /api/events/:id/status

Permite cambiar el estado de un evento.

Ejemplo:

```json
{
  "status": "cancelled"
}
```

Cancelar un evento significa cambiar:

```text
status → cancelled
```

El evento no se elimina físicamente de MongoDB.

## Reglas de negocio

La lógica de negocio se encuentra en:

```text
src/services/events.service.js
```

Las principales reglas son:

- No se permiten eventos con fecha pasada.
- `capacity` debe ser mayor a `0`.
- `price` no puede ser negativo.
- Solo se permiten estados definidos.
- No se puede crear un evento directamente como `cancelled` o `finished`.
- Un evento cancelado no puede modificarse.
- Un evento cancelado no puede volver a cambiar de estado.
- No se puede publicar un evento finalizado.
- No se puede publicar un evento cuya fecha ya pasó.
- La cancelación es lógica y no elimina el documento.
- El organizer se asigna desde el usuario autenticado.

## Autenticación y autorización

### Middleware de autenticación

```text
src/middlewares/auth.middleware.js
```

Valida JWT y cookie.

Sin sesión válida:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

HTTP:

```text
401
```

### Middleware de roles

```text
src/middlewares/authorize.middleware.js
```

Si existe sesión pero el rol no tiene permiso:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

HTTP:

```text
403
```

### Middleware de propiedad

```text
src/middlewares/event-owner.middleware.js
```

Valida que:

- `organizer` solo modifique eventos propios.
- `admin` pueda modificar cualquier evento.

## Arquitectura

La lógica está separada por responsabilidades:

```text
Route
↓
Middleware
↓
Controller
↓
Service
↓
Repository
↓
DAO
↓
Model
```

### DAO

```text
src/dao/events.dao.js
```

Realiza operaciones directamente con Mongoose.

### Repository

```text
src/repositories/events.repository.js
```

Centraliza el acceso a datos del dominio de eventos.

### Service

```text
src/services/events.service.js
```

Contiene las reglas de negocio.

### Controller

```text
src/controllers/events.controller.js
```

Maneja únicamente request y response.

### Routes

```text
src/routes/events.router.js
```

Define los endpoints y aplica middlewares reutilizables.

## Casos probados

Se verificaron los siguientes casos:

1. Crear evento con rol `user` → `403`.
2. Crear evento con fecha pasada → error.
3. Crear evento con `capacity: 0` → error.
4. `organizer` modifica evento propio → éxito.
5. `organizer` modifica evento ajeno → `403`.
6. `admin` modifica evento de otro organizer → éxito.
7. Cambiar estado de evento cancelado → error.
8. Listar con filtros, paginación y ordenamiento → éxito.
9. Consultar evento inexistente → `404`.

## Seguridad

- `.env` no se sube al repositorio.
- `node_modules` no se sube.
- Las contraseñas se almacenan con bcrypt.
- JWT se almacena en cookie HTTP Only.
- `organizer` no puede enviarse desde el body del evento.
- Los permisos se validan mediante middlewares.
- Se diferencia entre `401` y `403`.
- Los eventos no se eliminan físicamente al cancelarlos.