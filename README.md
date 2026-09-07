# Plataforma de Eventos e Inscripciones

API REST desarrollada para el proyecto de Backend II.

## Pre-entrega 3

En esta etapa se implementó autenticación de usuarios mediante JWT almacenado en una cookie HTTP Only.

El sistema permite:

- Registrar usuarios.
- Iniciar sesión.
- Generar un JWT.
- Guardar el JWT en una cookie `currentUser`.
- Consultar el usuario autenticado.
- Cerrar sesión.
- Proteger rutas mediante middleware de autenticación.

## Temática

El proyecto consiste en una plataforma de eventos e inscripciones donde los usuarios podrán consultar eventos y registrarse.

En futuras etapas se incorporarán inscripciones a eventos, organizadores, administradores y permisos según roles.

## Tecnologías

- Node.js
- Express
- JavaScript
- MongoDB Atlas
- Mongoose
- bcrypt
- JSON Web Token
- cookie-parser
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

Instalar las dependencias:

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

`MONGO_URL` debe contener la conexión a MongoDB Atlas.

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

El servidor funciona por defecto en:

```text
http://localhost:8080
```

## Estructura principal

```text
src/
├── app.js
├── server.js
├── config/
│   ├── database.js
│   └── env.js
├── controllers/
│   ├── events.controller.js
│   ├── health.controller.js
│   └── sessions.controller.js
├── dao/
│   └── users.dao.js
├── middlewares/
│   └── auth.middleware.js
├── models/
│   ├── Event.js
│   └── User.js
├── repositories/
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   ├── health.router.js
│   └── sessions.router.js
├── services/
│   └── sessions.service.js
└── utils/
    ├── hash.js
    └── jwt.js
```

## Rutas disponibles

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verifica que el servidor esté funcionando |
| GET | `/api/events` | Obtiene la lista de eventos |
| POST | `/api/sessions/register` | Registra un nuevo usuario |
| POST | `/api/sessions/login` | Inicia sesión y genera la cookie de autenticación |
| GET | `/api/sessions/current` | Devuelve los datos del usuario autenticado |
| POST | `/api/sessions/logout` | Cierra la sesión y elimina la cookie |

---

## GET /api/health

Verifica que el servidor esté activo.

### Response

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

---

## GET /api/events

Obtiene los eventos disponibles.

### Response

```json
{
  "status": "success",
  "payload": []
}
```

---

## POST /api/sessions/register

Registra un nuevo usuario.

### Request

```json
{
  "first_name": "Ana",
  "last_name": "Perez",
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

### Response exitosa

```json
{
  "status": "success",
  "payload": {
    "id": "ID_DEL_USUARIO",
    "first_name": "Ana",
    "last_name": "Perez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La contraseña nunca se devuelve en la respuesta.

### Validaciones

- `first_name` es obligatorio.
- `last_name` es obligatorio.
- `email` es obligatorio.
- `password` es obligatorio.
- Se valida el formato del email.
- El email se normaliza con `trim` y `lowercase`.
- La contraseña debe tener al menos 8 caracteres.
- No se permiten emails duplicados.
- La contraseña se almacena hasheada con bcrypt.
- El rol por defecto es `user`.
- El rol no puede establecerse desde el registro público.

---

## POST /api/sessions/login

Inicia sesión mediante email y contraseña.

### Request

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

### Response exitosa

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

Cuando las credenciales son correctas se genera un JWT con:

```text
id
email
role
```

El JWT se guarda en una cookie llamada:

```text
currentUser
```

La cookie utiliza:

- `httpOnly: true`
- `sameSite: lax`
- `maxAge: 3600000`
- `secure: true` solamente en producción

### Credenciales incorrectas

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

El sistema utiliza el mismo mensaje tanto si el email no existe como si la contraseña es incorrecta.

---

## GET /api/sessions/current

Ruta protegida que obtiene los datos del usuario autenticado.

Requiere la cookie `currentUser` generada durante el login.

### Response exitosa

```json
{
  "status": "success",
  "payload": {
    "id": "ID_DEL_USUARIO",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

No se devuelve la contraseña.

### Sin autenticación

Si la cookie no existe o el JWT es inválido, manipulado o expiró:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

HTTP Status:

```text
401 Unauthorized
```

---

## POST /api/sessions/logout

Cierra la sesión eliminando la cookie `currentUser`.

### Response

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

Luego del logout, una nueva petición a:

```text
GET /api/sessions/current
```

devuelve:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

con código HTTP `401`.

## Flujo de autenticación

```text
Registro
   ↓
Login
   ↓
Generación del JWT
   ↓
Cookie currentUser
   ↓
GET /current
   ↓
Logout
   ↓
GET /current → 401
```

## Arquitectura

La aplicación mantiene una estructura separada por responsabilidades:

```text
Ruta
↓
Controller
↓
Service
↓
Repository
↓
DAO
↓
Modelo
```

La generación y validación de JWT se encuentra en:

```text
src/utils/jwt.js
```

El manejo de bcrypt se encuentra en:

```text
src/utils/hash.js
```

El middleware de autenticación se encuentra en:

```text
src/middlewares/auth.middleware.js
```

La conexión a MongoDB Atlas se realiza mediante Mongoose utilizando la variable de entorno `MONGO_URL`.

## Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt.
- Las respuestas no exponen contraseñas.
- El JWT contiene solamente `id`, `email` y `role`.
- `JWT_SECRET` se obtiene desde variables de entorno.
- El JWT tiene expiración configurable.
- La autenticación utiliza una cookie HTTP Only.
- `.env` no se sube al repositorio.