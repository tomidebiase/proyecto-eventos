# API Backend - Plataforma de Eventos e Inscripciones

Proyecto final del curso Backend II.

La aplicación es una API para gestionar eventos e inscripciones. Permite registrar usuarios, iniciar sesión, crear eventos según el rol, inscribirse a eventos, controlar cupos, cancelar tickets y enviar un mail de confirmación.

El proyecto fue realizado con una arquitectura por capas para separar el acceso a datos, la lógica de negocio y las respuestas de la API.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- Passport
- JWT
- bcrypt
- Nodemailer
- dotenv

## Instalación

Instalar dependencias:

```bash
npm install
```

Crear un archivo `.env` tomando como referencia `.env.example`.

Para iniciar en desarrollo:

```bash
npm run dev
```

Para iniciar normalmente:

```bash
npm start
```

Por defecto el servidor funciona en:

```text
http://localhost:8080
```

## Variables de entorno

```env
PORT=8080
NODE_ENV=development
MONGO_URL=

JWT_SECRET=
JWT_EXPIRES_IN=1h

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

Las credenciales reales se guardan solamente en `.env`.

## Arquitectura

El proyecto está separado en las siguientes capas:

```text
routes
controllers
services
repositories
dao
dto
models
middlewares
utils
config
```

El flujo principal es:

```text
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
Model
  ↓
MongoDB
```

Los modelos de Mongoose solamente se importan desde los DAO.

Los services contienen la lógica de negocio y utilizan repositories.

Los controllers reciben la petición, llaman al service correspondiente y devuelven la respuesta.

También se utilizan DTO para controlar los datos que devuelve la API.

## Usuarios y autenticación

El modelo User contiene:

```text
first_name
last_name
email
password
role
```

La contraseña se guarda hasheada utilizando bcrypt.

Los roles disponibles son:

```text
user
organizer
admin
```

Cuando un usuario se registra públicamente siempre se crea como:

```text
user
```

El campo `role` enviado desde el body no permite que alguien se registre directamente como organizer o admin.

### Registro

```http
POST /api/sessions/register
```

Ejemplo:

```json
{
  "first_name": "Juan",
  "last_name": "Perez",
  "email": "juan@example.com",
  "password": "Password123"
}
```

### Login

```http
POST /api/sessions/login
```

Si las credenciales son correctas se genera un JWT y se guarda en una cookie `httpOnly`.

### Usuario actual

```http
GET /api/sessions/current
```

Devuelve:

```json
{
  "status": "success",
  "payload": {
    "id": "USER_ID",
    "email": "juan@example.com",
    "role": "user"
  }
}
```

Nunca se devuelve el password.

### Logout

```http
POST /api/sessions/logout
```

Elimina la cookie de autenticación.

## Passport

Se utilizan tres estrategias:

```text
register
login
current
```

La configuración se encuentra en:

```text
src/config/passport.config.js
```

La lógica de registro y login está en `sessions.service.js`.

## Roles y permisos

### user

Puede:

- ver eventos
- inscribirse
- consultar sus tickets
- cancelar sus propios tickets

### organizer

Además puede:

- crear eventos
- modificar sus propios eventos
- cambiar el estado de sus eventos
- consultar las inscripciones de sus eventos

### admin

Puede administrar recursos propios y ajenos y acceder al listado de usuarios.

Si un usuario no está autenticado se devuelve:

```text
401
```

Si está autenticado pero no tiene permisos:

```text
403
```

## Eventos

El modelo Event contiene:

```text
title
description
category
date
location
capacity
price
status
organizer
```

Los estados posibles son:

```text
draft
published
cancelled
finished
```

`organizer` es una referencia al usuario creador del evento.

### Listar eventos

```http
GET /api/events
```

Se pueden utilizar filtros como:

```text
status
category
location
dateFrom
dateTo
```

También se puede usar paginación y ordenamiento:

```text
page
limit
sort
```

Ejemplo:

```http
GET /api/events?status=published&page=2&limit=5
```

La respuesta incluye:

```json
{
  "status": "success",
  "data": [],
  "page": 2,
  "limit": 5,
  "total": 5,
  "totalPages": 1
}
```

### Obtener evento

```http
GET /api/events/:id
```

### Crear evento

```http
POST /api/events
```

Solo pueden hacerlo:

```text
organizer
admin
```

Ejemplo:

```json
{
  "title": "Congreso Tech",
  "description": "Evento de tecnología",
  "category": "Tecnologia",
  "date": "2026-12-20T20:00:00.000Z",
  "location": "Buenos Aires",
  "capacity": 50,
  "price": 1000,
  "status": "published"
}
```

### Modificar evento

```http
PUT /api/events/:id
```

Puede modificarlo el organizer dueño o un admin.

### Cambiar estado

```http
PATCH /api/events/:id/status
```

Ejemplo:

```json
{
  "status": "cancelled"
}
```

Entre las validaciones se controla:

- que la fecha sea futura
- que capacity sea mayor a 0
- que price no sea negativo
- que el estado sea válido
- que no se modifique un evento cancelado

## Tickets e inscripciones

El modelo Ticket tiene referencias a:

```text
user
event
```

y además:

```text
status
quantity
reservationCode
cancelledAt
createdAt
```

Los estados posibles son:

```text
confirmed
pending
cancelled
```

### Inscribirse a un evento

```http
POST /api/events/:eid/tickets
```

Ejemplo:

```json
{
  "quantity": 1
}
```

Antes de crear una inscripción se valida:

- que el evento exista
- que esté publicado
- que no haya finalizado
- que haya cupos
- que quantity sea válido
- que el usuario no tenga otra inscripción activa al mismo evento

Si ya existe una inscripción activa:

```text
409 Conflict
```

Si no hay cupos:

```text
409 Conflict
```

## Control de cupos

El cupo disponible se calcula restando a la capacidad del evento la cantidad reservada en tickets activos.

Los tickets cancelados no cuentan como cupo ocupado.

Por eso, cuando un ticket se cancela, ese lugar vuelve a quedar disponible.

## Mis tickets

```http
GET /api/tickets/my-tickets
```

Devuelve solamente los tickets del usuario autenticado.

Se utiliza `populate` para incluir algunos datos básicos del evento:

```text
title
date
location
```

## Tickets de un evento

```http
GET /api/events/:eid/tickets
```

Solamente pueden acceder:

```text
organizer dueño del evento
admin
```

## Cancelar ticket

```http
PATCH /api/tickets/:tid/cancel
```

No se elimina el documento.

Se actualizan:

```text
status = cancelled
cancelledAt = fecha actual
```

Puede cancelar el dueño del ticket o un admin.

## DTO

Se crearon DTO para:

```text
User
Event
Ticket
```

Están ubicados en:

```text
src/dto/
```

Sirven para controlar los datos que salen en las respuestas.

Por ejemplo, el password nunca se devuelve aunque esté guardado hasheado en MongoDB.

## DAO y Repository

Los DAO son los únicos archivos que trabajan directamente con los modelos de Mongoose.

```text
src/dao/users.dao.js
src/dao/events.dao.js
src/dao/tickets.dao.js
```

Los repositories utilizan los DAO:

```text
src/repositories/users.repository.js
src/repositories/events.repository.js
src/repositories/tickets.repository.js
```

Los services utilizan los repositories y no los modelos directamente.

## Emails

Cuando una inscripción se crea correctamente se envía un email de confirmación utilizando Nodemailer.

La configuración se encuentra en:

```text
src/config/mailer.js
```

y el envío se realiza desde:

```text
src/services/mail.service.js
```

El mail contiene:

- nombre del evento
- fecha
- lugar
- cantidad
- código de reserva

Las credenciales están configuradas mediante variables de entorno.

## Manejo de errores

La API tiene un middleware centralizado:

```text
src/middlewares/error.middleware.js
```

Se utilizan códigos distintos según el error:

```text
400 - datos inválidos
401 - no autenticado
403 - sin permisos
404 - recurso no encontrado
409 - conflicto
500 - error interno
```

## Cómo probar organizer y admin

El registro público siempre crea usuarios con rol `user`.

Para realizar pruebas de organizer y admin se puede modificar temporalmente el campo `role` del usuario desde MongoDB Atlas.

Después de cambiarlo hay que volver a iniciar sesión para generar un JWT con el rol nuevo.

## Pruebas realizadas

Antes de entregar se probaron los casos principales pedidos.

1. Registro, login, `/current`, logout y `/current` sin sesión → `401`.
2. Usuario común intentando crear un evento → `403`.
3. Organizer creando evento y usuario inscribiéndose correctamente.
4. Inscripción duplicada → `409`.
5. Evento con capacidad completa → `409`.
6. Cancelación de ticket libera el cupo y permite una nueva inscripción.
7. Organizer intentando modificar un evento ajeno → `403`.
8. Admin modificando un evento creado por otro organizer → `200`.
9. Las respuestas de usuarios, eventos y tickets no muestran passwords.
10. El listado con `status`, `page` y `limit` devuelve la estructura paginada correctamente.

También se comprobó que el email de confirmación de inscripción llega correctamente.

## Archivos que no se suben

```text
.env
node_modules/
cookies.txt
juan.txt
organizer.txt
```

El repositorio solamente incluye `.env.example` sin credenciales reales.