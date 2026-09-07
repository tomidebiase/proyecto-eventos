# Plataforma de Eventos e Inscripciones

API REST desarrollada para el proyecto de Backend II.

## Pre-entrega 4

En esta etapa se refactorizó el sistema de autenticación incorporando Passport.js.

El comportamiento externo de la API se mantiene igual que en la Pre-entrega 3, pero la lógica de autenticación ahora queda centralizada mediante estrategias de Passport.

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

## Passport.js

Passport se inicializa en:

```text
src/app.js
```

Las estrategias se encuentran centralizadas en:

```text
src/config/passport.config.js
```

Se implementaron tres estrategias:

### register

Se utiliza para:

```text
POST /api/sessions/register
```

La estrategia se encarga de:

- Validar campos obligatorios.
- Normalizar el email.
- Validar formato de email.
- Validar longitud de contraseña.
- Verificar que el email no exista.
- Hashear la contraseña con bcrypt.
- Crear el usuario.
- Mantener el rol `user` por defecto.

### login

Se utiliza para:

```text
POST /api/sessions/login
```

La estrategia:

- Busca el usuario por email.
- Compara la contraseña con bcrypt.
- Rechaza credenciales inválidas con un mensaje genérico.

Si la autenticación es correcta, Passport deja el usuario disponible en `req.user`.

El controller genera el JWT y configura la cookie `currentUser`.

Passport no genera el JWT.

### current

Se utiliza para:

```text
GET /api/sessions/current
```

La estrategia:

- Lee el JWT desde la cookie `currentUser`.
- Verifica el token.
- Deja el usuario disponible en `req.user`.
- Rechaza tokens inválidos, manipulados o expirados.

La respuesta contiene únicamente:

```text
id
email
role
```

Nunca incluye `password`.

## Cookie de autenticación

El JWT se guarda en una cookie llamada:

```text
currentUser
```

Configuración:

- `httpOnly: true`
- `sameSite: lax`
- `maxAge: 3600000`
- `secure: true` únicamente en producción

## Rutas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verifica que el servidor esté activo |
| GET | `/api/events` | Obtiene la lista de eventos |
| POST | `/api/sessions/register` | Registra un usuario mediante Passport |
| POST | `/api/sessions/login` | Valida credenciales y genera el JWT |
| GET | `/api/sessions/current` | Devuelve el usuario autenticado |
| POST | `/api/sessions/logout` | Elimina la cookie de autenticación |

## Ejemplos

### Registro

```json
{
  "first_name": "Juan",
  "last_name": "Lopez",
  "email": "juan@mail.com",
  "password": "Secreta123"
}
```

Respuesta:

```json
{
  "status": "success",
  "payload": {
    "id": "ID_DEL_USUARIO",
    "first_name": "Juan",
    "last_name": "Lopez",
    "email": "juan@mail.com",
    "role": "user"
  }
}
```

## Login

Request:

```json
{
  "email": "juan@mail.com",
  "password": "Secreta123"
}
```

Respuesta:

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

Credenciales inválidas:

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

## Current

Con cookie válida:

```json
{
  "status": "success",
  "payload": {
    "id": "ID_DEL_USUARIO",
    "email": "juan@mail.com",
    "role": "user"
  }
}
```

Sin cookie o con token inválido:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

HTTP status:

```text
401
```

## Logout

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

Luego del logout, `/api/sessions/current` devuelve `401`.

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
│   └── sessions.controller.js
├── dao/
│   └── users.dao.js
├── models/
│   ├── Event.js
│   └── User.js
├── repositories/
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   ├── health.router.js
│   └── sessions.router.js
└── utils/
    ├── hash.js
    └── jwt.js
```

## Preparación para proveedores externos

La autenticación quedó centralizada en `passport.config.js`.

Esto permite agregar futuras estrategias como:

- Google
- GitHub

sin tener que modificar la lógica principal de `app.js`.

## Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt.
- Las respuestas no exponen contraseñas.
- El JWT contiene únicamente `id`, `email` y `role`.
- `JWT_SECRET` se obtiene desde variables de entorno.
- El JWT tiene expiración configurable.
- El JWT se almacena en una cookie HTTP Only.
- `.env` no se sube al repositorio.
- Passport se utiliza con `session: false` porque la autenticación se maneja mediante JWT.