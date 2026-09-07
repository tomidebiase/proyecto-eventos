# Plataforma de Eventos e Inscripciones

API REST desarrollada para el proyecto de Backend II.

## Pre-entrega 5 — Roles y autorización

En esta etapa se incorporó un sistema de autorización basado en roles.

La API diferencia entre:

- Usuario no autenticado → `401 Unauthorized`
- Usuario autenticado sin permisos → `403 Forbidden`

Los roles disponibles son:

- `user`
- `organizer`
- `admin`

El registro público siempre crea usuarios con rol `user`. El rol no puede definirse desde el body del registro.

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

## Roles

### user

Puede:

- Consultar eventos publicados.
- Consultar su sesión mediante `/current`.

No puede:

- Crear eventos.
- Modificar eventos.
- Consultar todos los usuarios.

### organizer

Puede:

- Consultar eventos publicados.
- Crear eventos.
- Modificar sus propios eventos.

No puede:

- Modificar eventos de otros organizadores.
- Consultar todos los usuarios.

### admin

Puede:

- Consultar eventos publicados.
- Crear eventos.
- Modificar cualquier evento.
- Consultar todos los usuarios.

## Matriz de permisos

| Acción | user | organizer | admin |
|---|---|---|---|
| Consultar eventos publicados | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar eventos propios | ❌ | ✅ | ✅ |
| Modificar cualquier evento | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

## Middlewares

### Autenticación

Archivo:

```text
src/middlewares/auth.middleware.js
```

Se encarga de:

- Leer y validar la autenticación mediante JWT.
- Utilizar la estrategia `current` de Passport.
- Dejar el usuario autenticado en `req.user`.
- Responder `401` cuando no existe una sesión válida.

### Autorización por roles

Archivo:

```text
src/middlewares/authorize.middleware.js
```

Recibe los roles permitidos como parámetros.

Ejemplo:

```js
authorizeRoles('organizer', 'admin')
```

Si el usuario está autenticado pero su rol no está permitido, responde:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

con código HTTP:

```text
403
```

### Propiedad de eventos

Archivo:

```text
src/middlewares/event-owner.middleware.js
```

Valida que:

- Un `organizer` solo pueda modificar sus propios eventos.
- Un `admin` pueda modificar cualquier evento.

Si un organizer intenta modificar un evento ajeno, responde `403`.

## Diferencia entre 401 y 403

### 401 Unauthorized

Se utiliza cuando el usuario no tiene una sesión válida.

Ejemplo:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

### 403 Forbidden

Se utiliza cuando el usuario está autenticado pero no tiene permisos para realizar la acción.

Ejemplo:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

## Rutas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Verifica que el servidor esté activo |
| GET | `/api/events` | Público | Consulta eventos publicados |
| POST | `/api/events` | organizer / admin | Crea un evento |
| PUT | `/api/events/:eid` | organizer / admin | Modifica un evento con validación de propiedad |
| POST | `/api/sessions/register` | Público | Registra un usuario |
| POST | `/api/sessions/login` | Público | Inicia sesión |
| GET | `/api/sessions/current` | Autenticado | Devuelve el usuario autenticado |
| POST | `/api/sessions/logout` | Público | Cierra la sesión |
| GET | `/api/users` | admin | Consulta todos los usuarios |

## Crear evento

Ruta:

```text
POST /api/events
```

Solo pueden acceder:

```text
organizer
admin
```

Ejemplo:

```json
{
  "title": "Congreso Tech 2026",
  "description": "Evento de tecnología",
  "date": "2026-10-20",
  "location": "Buenos Aires",
  "capacity": 100,
  "price": 0
}
```

Un usuario con rol `user` recibe:

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

Un `organizer` o `admin` recibe una respuesta exitosa con código HTTP `201`.

## Modificar evento

Ruta:

```text
PUT /api/events/:eid
```

Un `organizer` puede modificar solamente eventos cuyo campo `organizer` corresponda a su usuario.

Un `admin` puede modificar cualquier evento.

Si un organizer intenta modificar un evento ajeno:

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

## Ruta administrativa

Ruta:

```text
GET /api/users
```

Solo puede acceder un usuario con rol:

```text
admin
```

Un `organizer` o `user` recibe `403`.

La respuesta exitosa no incluye contraseñas.

## Current

Ruta:

```text
GET /api/sessions/current
```

Requiere una sesión válida.

Respuesta:

```json
{
  "status": "success",
  "payload": {
    "id": "ID_DEL_USUARIO",
    "email": "usuario@mail.com",
    "role": "user"
  }
}
```

Sin cookie válida:

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

## Passport.js

Passport continúa centralizando las estrategias:

```text
register
login
current
```

Archivo:

```text
src/config/passport.config.js
```

Passport valida la autenticación y deja el usuario disponible en `req.user`.

El JWT continúa siendo generado por el controller luego de un login exitoso.

## Estructura principal

```text
src/
├── app.js
├── server.js
├── config/
│   ├── database.js
│   ├── env.js
│   └── passport.config.js
├── controllers/
│   ├── events.controller.js
│   ├── health.controller.js
│   ├── sessions.controller.js
│   └── users.controller.js
├── dao/
│   ├── events.dao.js
│   └── users.dao.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   └── event-owner.middleware.js
├── models/
│   ├── Event.js
│   └── User.js
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   ├── health.router.js
│   ├── sessions.router.js
│   └── users.router.js
├── services/
│   ├── events.service.js
│   └── users.service.js
└── utils/
    ├── hash.js
    └── jwt.js
```

## Casos probados

Se verificaron los siguientes casos:

1. `POST /api/events` con rol `user` → `403`.
2. `POST /api/events` con rol `organizer` → creación exitosa.
3. `GET /api/users` con rol `organizer` → `403`.
4. `GET /api/users` con rol `admin` → éxito.
5. Ruta privada sin cookie → `401`.
6. `organizer` intentando modificar evento ajeno → `403`.

## Seguridad

- Contraseñas hasheadas con bcrypt.
- El registro público no permite elegir roles privilegiados.
- JWT almacenado en cookie HTTP Only.
- JWT contiene únicamente `id`, `email` y `role`.
- Las rutas privadas requieren autenticación.
- Los permisos se validan mediante middlewares reutilizables.
- Se diferencia correctamente entre `401` y `403`.
- Las respuestas de usuarios no incluyen `password`.
- `.env` no se sube al repositorio.