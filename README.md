# Pre-entrega 8 - Arquitectura con DAO, Repository y DTO

## Plataforma de Eventos e Inscripciones

En esta pre-entrega se refactorizó la API de la Plataforma de Eventos e Inscripciones para implementar una arquitectura profesional basada en capas.

El objetivo principal fue separar claramente las responsabilidades entre:

```text
Routes
   ↓
Controllers / Middlewares
   ↓
Services
   ↓
Repositories
   ↓
DAO
   ↓
Models
   ↓
MongoDB
```

Además, se incorporaron DTOs para controlar la información que se devuelve desde la API y evitar la exposición de datos sensibles.

La API mantiene el mismo comportamiento externo de las entregas anteriores.

Continúan funcionando:

- registro
- login
- autenticación mediante JWT
- autorización por roles
- eventos
- tickets
- inscripciones
- control de cupos
- cancelaciones
- permisos sobre recursos propios
- notificaciones por email

---

# Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Passport
- Passport Local
- Passport JWT
- JSON Web Token
- bcrypt
- Nodemailer
- dotenv

---

# Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

Crear un archivo:

```text
.env
```

tomando como referencia:

```text
.env.example
```

Luego iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

El servidor se ejecuta por defecto en:

```text
http://localhost:8080
```

---

# Variables de entorno

Ejemplo de configuración:

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

Las credenciales reales solamente deben existir dentro de:

```text
.env
```

El archivo `.env` nunca debe subirse al repositorio.

---

# Arquitectura implementada

La aplicación utiliza una arquitectura por capas.

```text
Request
   ↓
Route
   ↓
Controller / Middleware
   ↓
Service
   ↓
Repository
   ↓
DAO
   ↓
Mongoose Model
   ↓
MongoDB
```

Cada capa tiene una responsabilidad específica.

---

# Models

Los modelos definen la estructura de los documentos almacenados en MongoDB.

Se utilizan las siguientes entidades principales:

```text
User
Event
Ticket
```

Ubicación:

```text
src/models/
```

Archivos principales:

```text
src/models/User.js
src/models/Event.js
src/models/Ticket.js
```

Los modelos de Mongoose solamente son importados directamente por los DAO.

---

# DAO

Los DAO son la única capa que accede directamente a los modelos de Mongoose.

Ubicación:

```text
src/dao/
```

Archivos:

```text
src/dao/users.dao.js
src/dao/events.dao.js
src/dao/tickets.dao.js
```

Sus responsabilidades incluyen operaciones de acceso a datos como:

```text
find
findOne
findById
create
update
countDocuments
aggregate
populate
```

Ejemplo de flujo:

```text
TicketDAO
   ↓
TicketModel
   ↓
MongoDB
```

Los controllers y services nunca importan modelos directamente.

---

# Repository

Los repositories utilizan los DAO correspondientes.

Ubicación:

```text
src/repositories/
```

Archivos:

```text
src/repositories/users.repository.js
src/repositories/events.repository.js
src/repositories/tickets.repository.js
```

Los repositories funcionan como capa intermedia entre los services y el acceso directo a datos.

Ejemplos de operaciones:

```text
getUserByEmail
saveUser
getEventById
getEvents
saveEvent
getActiveTicketByUserAndEvent
getReservedQuantityByEvent
getTicketsByUser
updateTicket
```

Los repositories no importan modelos de Mongoose.

---

# Services

La lógica de negocio se concentra en los services.

Ubicación:

```text
src/services/
```

Principales archivos:

```text
src/services/sessions.service.js
src/services/users.service.js
src/services/events.service.js
src/services/tickets.service.js
src/services/authorization.service.js
src/services/mail.service.js
```

Los services consumen repositories.

No acceden directamente a DAO ni a modelos de Mongoose.

---

# Sessions Service

Archivo:

```text
src/services/sessions.service.js
```

Contiene la lógica relacionada con:

- validación de registro
- normalización del email
- validación del formato del email
- validación de contraseña
- detección de email duplicado
- generación del hash de contraseña
- validación de credenciales durante login

Passport delega esta lógica al service.

El flujo es:

```text
Passport
   ↓
Sessions Service
   ↓
User Repository
   ↓
User DAO
   ↓
User Model
```

---

# Events Service

Archivo:

```text
src/services/events.service.js
```

Contiene la lógica relacionada con:

- creación de eventos
- validación de campos obligatorios
- validación de fechas
- validación de capacidad
- validación de precio
- validación de estados
- modificación de eventos
- cambios de estado
- filtros
- paginación
- ordenamiento

Los controllers no realizan estas validaciones.

---

# Tickets Service

Archivo:

```text
src/services/tickets.service.js
```

Contiene la lógica relacionada con:

- inscripción a eventos
- validación del evento
- validación de estado
- validación de fecha
- validación de cantidad
- detección de inscripciones duplicadas
- cálculo de cupos
- generación del ticket
- cancelación de tickets
- permisos sobre tickets
- envío del email de confirmación

---

# Authorization Service

Archivo:

```text
src/services/authorization.service.js
```

Contiene reglas relacionadas con la propiedad de recursos.

Por ejemplo:

```text
organizer dueño del evento
o
admin
```

El middleware de autorización delega la validación al service en lugar de consultar directamente el repository.

Flujo:

```text
Middleware
   ↓
Authorization Service
   ↓
Event Repository
   ↓
Event DAO
   ↓
Event Model
```

---

# Controllers

Los controllers se encargan solamente de coordinar:

```text
request
↓
service
↓
response
```

Ubicación:

```text
src/controllers/
```

Archivos principales:

```text
src/controllers/sessions.controller.js
src/controllers/events.controller.js
src/controllers/tickets.controller.js
src/controllers/users.controller.js
```

Los controllers:

- extraen información de `req.body`
- extraen parámetros de `req.params`
- extraen filtros de `req.query`
- llaman al service correspondiente
- devuelven la respuesta HTTP

No acceden directamente a MongoDB.

No importan modelos.

No calculan cupos.

No validan estados de negocio.

No resuelven reglas de propiedad de recursos.

---

# Manejo de funciones asincrónicas

Se agregó:

```text
src/middlewares/async.middleware.js
```

Este middleware permite enviar automáticamente los errores producidos por controllers asincrónicos al middleware centralizado de errores.

De esta forma se evita repetir bloques `try/catch` en cada controller.

---

# DTO

Se incorporó una capa DTO para controlar qué información sale de la aplicación.

Ubicación:

```text
src/dto/
```

Archivos:

```text
src/dto/user.dto.js
src/dto/event.dto.js
src/dto/ticket.dto.js
```

---

# User DTO

Archivo:

```text
src/dto/user.dto.js
```

Controla las respuestas relacionadas con usuarios.

Se utilizan DTOs específicos para:

```text
usuario
usuario registrado
usuario autenticado
```

El campo:

```text
password
```

nunca forma parte de una respuesta pública.

Ni siquiera se devuelve la contraseña hasheada.

---

# Usuario autenticado

La ruta:

```http
GET /api/sessions/current
```

devuelve únicamente:

```json
{
  "id": "USER_ID",
  "email": "usuario@example.com",
  "role": "user"
}
```

Nunca devuelve:

```text
password
```

---

# Event DTO

Archivo:

```text
src/dto/event.dto.js
```

Controla las respuestas correspondientes a eventos.

Puede manejar tanto referencias mediante ObjectId como documentos relacionados poblados.

Si el organizer se encuentra poblado, sus datos también pasan por el User DTO.

De esta forma no se exponen campos sensibles del usuario relacionado.

---

# Ticket DTO

Archivo:

```text
src/dto/ticket.dto.js
```

Controla las respuestas correspondientes a tickets e inscripciones.

Maneja:

```text
user
event
status
quantity
reservationCode
cancelledAt
createdAt
updatedAt
```

Si una relación viene mediante `populate`, el documento relacionado también pasa por el DTO correspondiente.

Esto evita exponer accidentalmente información sensible.

---

# Populate de tickets

La consulta:

```http
GET /api/tickets/my-tickets
```

utiliza `populate` para agregar información básica del evento.

Actualmente se incluyen solamente:

```text
title
date
location
```

No se expone información sensible del usuario.

Ejemplo:

```json
{
  "user": "USER_ID",
  "event": {
    "_id": "EVENT_ID",
    "title": "Evento Pre 8",
    "date": "2026-12-20T20:00:00.000Z",
    "location": "Buenos Aires"
  }
}
```

---

# Autenticación

La aplicación utiliza Passport.

Las estrategias se encuentran centralizadas en:

```text
src/config/passport.config.js
```

Se utilizan:

```text
register
login
current
```

Passport no contiene directamente la lógica de acceso a datos.

Las estrategias de registro y login delegan la lógica al:

```text
Sessions Service
```

---

# JWT

Después de un login correcto se genera un JWT.

El token contiene:

```text
id
email
role
```

El JWT se guarda dentro de una cookie:

```text
currentUser
```

Configurada con:

```text
httpOnly
sameSite=lax
```

y:

```text
secure=true
```

cuando la aplicación se encuentra en producción.

---

# Roles

Los roles disponibles son:

```text
user
organizer
admin
```

El rol por defecto al registrarse públicamente es:

```text
user
```

El registro público no permite asignarse automáticamente los roles:

```text
organizer
admin
```

---

# Permisos

## user

Puede:

- registrarse
- iniciar sesión
- consultar eventos
- inscribirse a eventos publicados
- consultar sus tickets
- cancelar sus propios tickets

No puede crear eventos.

---

## organizer

Puede:

- realizar las acciones de un usuario autenticado
- crear eventos
- modificar sus propios eventos
- cambiar el estado de sus propios eventos
- consultar tickets de sus propios eventos

No puede modificar eventos pertenecientes a otro organizer.

---

## admin

Puede:

- acceder a todos los usuarios
- crear eventos
- modificar cualquier evento
- consultar tickets de eventos
- cancelar tickets cuando corresponda
- administrar recursos protegidos

---

# Eventos

## Listar eventos

```http
GET /api/events
```

Permite utilizar filtros, paginación y ordenamiento.

---

## Obtener evento

```http
GET /api/events/:id
```

---

## Crear evento

```http
POST /api/events
```

Roles permitidos:

```text
organizer
admin
```

Ejemplo:

```json
{
  "title": "Evento",
  "description": "Descripción",
  "category": "Tecnologia",
  "date": "2026-12-20T20:00:00.000Z",
  "location": "Buenos Aires",
  "capacity": 50,
  "price": 1000,
  "status": "published"
}
```

---

## Modificar evento

```http
PUT /api/events/:id
```

Puede modificar:

```text
organizer dueño del evento
admin
```

---

## Cambiar estado de evento

```http
PATCH /api/events/:id/status
```

Puede modificar:

```text
organizer dueño del evento
admin
```

---

# Tickets e inscripciones

## Crear inscripción

```http
POST /api/events/:eid/tickets
```

Requiere autenticación.

Ejemplo:

```json
{
  "quantity": 1
}
```

Antes de generar un ticket se valida:

- que el evento exista
- que esté publicado
- que no haya finalizado
- que la cantidad sea válida
- que existan cupos suficientes
- que el usuario no tenga otra inscripción activa para ese evento

---

# Control de cupos

La capacidad disponible se calcula mediante:

```text
capacidad del evento - cantidad reservada
```

La cantidad reservada se obtiene sumando:

```text
quantity
```

de todos los tickets activos.

Los tickets con:

```text
status = cancelled
```

no ocupan cupos.

---

# Inscripciones duplicadas

Cada usuario puede tener solamente:

```text
una inscripción activa por evento
```

Si intenta crear otra inscripción activa se devuelve:

```http
409 Conflict
```

con el mensaje:

```text
Ya tenés una inscripción activa para este evento
```

Si el ticket anterior fue cancelado, puede volver a inscribirse mientras existan cupos.

---

# Consultar mis tickets

```http
GET /api/tickets/my-tickets
```

Requiere autenticación.

Devuelve exclusivamente los tickets pertenecientes al usuario autenticado.

---

# Consultar tickets de un evento

```http
GET /api/events/:eid/tickets
```

Acceso:

```text
organizer dueño del evento
admin
```

---

# Cancelar ticket

```http
PATCH /api/tickets/:tid/cancel
```

Puede cancelar:

```text
dueño del ticket
admin
```

La cancelación es lógica.

El documento no se elimina de MongoDB.

Se modifica:

```text
status = cancelled
cancelledAt = fecha actual
```

---

# Notificaciones por email

Después de crear correctamente una inscripción se envía un email de confirmación mediante Nodemailer.

Configuración:

```text
src/config/mailer.js
```

Servicio:

```text
src/services/mail.service.js
```

El email contiene:

- nombre del evento
- fecha
- lugar
- cantidad reservada
- código de reserva

Las credenciales de email se configuran mediante variables de entorno.

---

# Usuarios

Existe una ruta administrativa para consultar usuarios:

```http
GET /api/users
```

Acceso:

```text
admin
```

Las respuestas pasan por User DTO.

El campo `password` nunca se devuelve.

---

# Sessions

## Registro

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

Respuesta exitosa:

```http
201 Created
```

El password nunca se incluye en la respuesta.

---

# Login

```http
POST /api/sessions/login
```

Ejemplo:

```json
{
  "email": "juan@example.com",
  "password": "Password123"
}
```

Respuesta:

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

---

# Current

```http
GET /api/sessions/current
```

Requiere cookie de autenticación.

Respuesta:

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

No devuelve password.

---

# Logout

```http
POST /api/sessions/logout
```

Elimina la cookie:

```text
currentUser
```

---

# Manejo centralizado de errores

Se agregó:

```text
src/middlewares/error.middleware.js
```

Los errores generados por services y controllers terminan en este middleware.

Formato:

```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

---

# Códigos HTTP utilizados

La API distingue correctamente:

```text
400 Bad Request
```

Datos inválidos o reglas de negocio incorrectas.

```text
401 Unauthorized
```

Usuario no autenticado o credenciales inválidas.

```text
403 Forbidden
```

Usuario autenticado pero sin permisos.

```text
404 Not Found
```

Recurso inexistente.

```text
409 Conflict
```

Conflictos como email o inscripción duplicada.

```text
500 Internal Server Error
```

Errores internos inesperados.

Los errores de negocio no se devuelven como `500`.

---

# Ejemplo de flujo de inscripción

```text
Usuario autenticado
        ↓
POST /api/events/:eid/tickets
        ↓
Tickets Controller
        ↓
Tickets Service
        ↓
Validar evento
        ↓
Validar estado
        ↓
Validar fecha
        ↓
Validar quantity
        ↓
Buscar inscripción duplicada
        ↓
Calcular cupos
        ↓
Tickets Repository
        ↓
Tickets DAO
        ↓
Ticket Model
        ↓
MongoDB
        ↓
Ticket DTO
        ↓
Response
```

---

# Ejemplo de flujo de cancelación

```text
Usuario autenticado
        ↓
PATCH /api/tickets/:tid/cancel
        ↓
Tickets Controller
        ↓
Tickets Service
        ↓
Buscar ticket
        ↓
Validar propietario o admin
        ↓
Validar estado
        ↓
Tickets Repository
        ↓
Tickets DAO
        ↓
Actualizar Ticket
        ↓
Ticket DTO
        ↓
Response
```

---

# Ejemplo de flujo de registro

```text
POST /api/sessions/register
        ↓
Passport register
        ↓
Sessions Service
        ↓
Validaciones
        ↓
User Repository
        ↓
User DAO
        ↓
User Model
        ↓
MongoDB
        ↓
User DTO
        ↓
Response
```

---

# Casos probados antes de entregar

## Flujo completo

Se probó:

```text
registro
↓
login
↓
crear evento
↓
inscribirse
↓
consultar mis tickets
↓
cancelar ticket
↓
consultar nuevamente
```

Resultado:

```text
APROBADO
```

---

## Current sin password

Ruta:

```http
GET /api/sessions/current
```

La respuesta contiene:

```text
id
email
role
```

No contiene:

```text
password
```

Resultado:

```text
APROBADO
```

---

## Ticket con populate

La consulta:

```http
GET /api/tickets/my-tickets
```

devolvió el evento relacionado mediante `populate`.

La respuesta no expuso ningún password.

Resultado:

```text
APROBADO
```

---

## Error de negocio

Se intentó crear una segunda inscripción activa para el mismo usuario y evento.

Resultado:

```http
409 Conflict
```

Mensaje:

```text
Ya tenés una inscripción activa para este evento
```

El error no fue convertido en `500`.

Resultado:

```text
APROBADO
```

---

## Endpoint protegido sin sesión

Se consultó:

```http
GET /api/sessions/current
```

sin cookie.

Resultado:

```http
401 Unauthorized
```

Respuesta:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

Resultado:

```text
APROBADO
```

---

## Usuario autenticado sin permisos

Un usuario con rol:

```text
user
```

intentó crear un evento.

Resultado:

```http
403 Forbidden
```

Mensaje:

```text
No tenés permisos para realizar esta acción
```

Resultado:

```text
APROBADO
```

---

# Seguridad

La API implementa:

- autenticación mediante JWT
- JWT almacenado en cookie httpOnly
- Passport para autenticación
- contraseñas protegidas con bcrypt
- autorización por roles
- autorización por propiedad de recursos
- DTO para controlar respuestas
- password excluido de respuestas públicas
- variables sensibles almacenadas en `.env`
- manejo centralizado de errores
- validaciones de negocio en services
- cancelación lógica de tickets

---

# Separación de responsabilidades

La arquitectura cumple las siguientes reglas:

```text
Models
↑
solo son usados directamente por DAO

DAO
↑
solo son usados por Repository

Repository
↑
son utilizados por Services

Services
↑
contienen la lógica de negocio

Controllers
↑
coordinan request y response

DTO
↑
controlan la información de salida
```

Los controllers no importan modelos.

Los services no importan DAO ni modelos.

Los repositories no importan controllers ni services.

Los DAO son los únicos archivos que importan directamente los modelos de Mongoose.

---

# Estructura principal

```text
src/
├── config/
│   ├── database.js
│   ├── env.js
│   ├── mailer.js
│   └── passport.config.js
│
├── controllers/
│   ├── events.controller.js
│   ├── health.controller.js
│   ├── sessions.controller.js
│   ├── tickets.controller.js
│   └── users.controller.js
│
├── dao/
│   ├── events.dao.js
│   ├── tickets.dao.js
│   └── users.dao.js
│
├── dto/
│   ├── event.dto.js
│   ├── ticket.dto.js
│   └── user.dto.js
│
├── middlewares/
│   ├── async.middleware.js
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   ├── error.middleware.js
│   └── event-owner.middleware.js
│
├── models/
│   ├── Event.js
│   ├── Ticket.js
│   └── User.js
│
├── repositories/
│   ├── events.repository.js
│   ├── tickets.repository.js
│   └── users.repository.js
│
├── routes/
│   ├── events.router.js
│   ├── health.router.js
│   ├── sessions.router.js
│   ├── tickets.router.js
│   └── users.router.js
│
├── services/
│   ├── authorization.service.js
│   ├── events.service.js
│   ├── mail.service.js
│   ├── sessions.service.js
│   ├── tickets.service.js
│   └── users.service.js
│
├── utils/
│   ├── hash.js
│   └── jwt.js
│
├── app.js
└── server.js
```

---

# Archivos que no deben subirse

```text
.env
node_modules/
cookies.txt
```

El repositorio debe incluir:

```text
.env.example
```

sin credenciales reales.

---

# Pre-entrega 8 completada

La aplicación fue refactorizada utilizando:

```text
DAO
Repository
Service
Controller
DTO
```

Se verificó que:

- solamente los DAO importen modelos de Mongoose
- los repositories consuman DAO
- los services consuman repositories
- la lógica de negocio permanezca en services
- los controllers se limiten a request y response
- los DTO controlen las respuestas
- ningún password sea expuesto
- los errores utilicen códigos HTTP adecuados
- exista manejo centralizado de errores
- los endpoints existentes continúen funcionando
- tickets, cupos, permisos y notificaciones continúen operativos

Los casos obligatorios de la Pre-entrega 8 fueron probados correctamente antes de la entrega.