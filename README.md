# Pre-entrega 7 - Tickets, inscripciones y control de cupos

## Plataforma de Eventos e Inscripciones

En esta pre-entrega se implementó el flujo completo de inscripción a eventos mediante tickets.

El sistema permite que un usuario autenticado pueda inscribirse a un evento publicado, controlar los cupos disponibles, evitar inscripciones duplicadas, cancelar tickets sin eliminarlos físicamente y recibir un email de confirmación mediante Nodemailer.

---

# Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Passport
- JWT
- Nodemailer
- dotenv

---

# Entidad Ticket

Se agregó el modelo:

```text
Ticket
```

Ubicado en:

```text
src/models/Ticket.js
```

## Campos

El ticket contiene:

```text
user
event
status
quantity
reservationCode
createdAt
cancelledAt
```

### user

Referencia mediante `ObjectId` al modelo:

```text
User
```

### event

Referencia mediante `ObjectId` al modelo:

```text
Event
```

No se guardan objetos completos del usuario o del evento dentro del ticket.

---

# Estados de Ticket

Los estados permitidos son:

```text
confirmed
pending
cancelled
```

Por defecto, una inscripción confirmada se crea con:

```text
confirmed
```

---

# Código de reserva

Cada ticket genera un código único:

```text
reservationCode
```

El código se genera utilizando UUID.

---

# Endpoints implementados

## Crear una inscripción

```http
POST /api/events/:eid/tickets
```

Acceso:

```text
Usuario autenticado
```

Ejemplo de body:

```json
{
  "quantity": 1
}
```

El usuario y el evento se asignan mediante referencias.

---

## Consultar mis tickets

```http
GET /api/tickets/my-tickets
```

Acceso:

```text
Usuario autenticado
```

Devuelve solamente los tickets del usuario que realizó la petición.

---

## Consultar tickets de un evento

```http
GET /api/events/:eid/tickets
```

Acceso permitido:

```text
organizer dueño del evento
admin
```

Un organizer no puede consultar tickets de un evento perteneciente a otra persona.

---

## Cancelar ticket

```http
PATCH /api/tickets/:tid/cancel
```

Puede cancelar:

```text
dueño del ticket
admin
```

La cancelación es lógica.

El ticket no se elimina de MongoDB.

---

# Validaciones de inscripción

La lógica de negocio se encuentra en:

```text
src/services/tickets.service.js
```

Antes de generar un ticket se valida:

- que el evento exista
- que el evento esté publicado
- que el evento no esté cancelado
- que el evento no haya finalizado
- que `quantity` sea un número entero válido
- que `quantity` sea mayor a 0
- que existan cupos suficientes
- que el usuario no tenga otro ticket activo para el mismo evento

Las validaciones no se realizan directamente en el controller.

---

# Eventos disponibles para inscripción

Solo se puede generar una inscripción si el evento tiene:

```text
status = published
```

Los eventos cancelados, finalizados o que no estén publicados no permiten nuevas inscripciones.

---

# Control de cupos

Para determinar la disponibilidad se utiliza:

```text
capacidad del evento - cantidad reservada
```

La cantidad reservada se obtiene sumando el campo:

```text
quantity
```

de los tickets activos.

Ejemplo:

```text
Capacidad: 10

Ticket 1: quantity = 2
Ticket 2: quantity = 3

Ocupados: 5
Disponibles: 5
```

Si la cantidad solicitada supera los cupos disponibles, la inscripción es rechazada.

---

# Tickets cancelados y cupos

Los tickets con:

```text
status = cancelled
```

no se incluyen en el cálculo de cupos ocupados.

Por lo tanto, cuando un usuario cancela una inscripción, ese cupo vuelve automáticamente a quedar disponible.

Los tickets nunca se eliminan físicamente.

---

# Inscripciones duplicadas

La regla implementada permite solamente:

```text
una inscripción activa por usuario para cada evento
```

Si el usuario ya posee un ticket activo para ese evento, la API devuelve un error.

Ejemplo:

```text
Ya tenés una inscripción activa para este evento
```

Si el ticket anterior fue cancelado, el usuario puede volver a inscribirse siempre que existan cupos.

---

# Cancelación de tickets

Al cancelar un ticket se actualizan los campos:

```text
status = cancelled
cancelledAt = fecha actual
```

No se elimina el documento de MongoDB.

Antes de cancelar se valida:

- que el ticket exista
- que todavía no esté cancelado
- que pertenezca al usuario autenticado o que el solicitante sea admin

---

# Consulta de tickets propios

La ruta:

```http
GET /api/tickets/my-tickets
```

devuelve solamente las inscripciones del usuario autenticado.

Se utiliza `populate` para incluir información básica del evento.

Los datos incluidos son:

```text
title
date
location
```

No se exponen datos sensibles pertenecientes a otros usuarios.

---

# Consulta de tickets por evento

La ruta:

```http
GET /api/events/:eid/tickets
```

permite consultar las inscripciones asociadas a un evento.

Puede acceder:

```text
organizer propietario del evento
admin
```

Un usuario común recibe:

```http
403 Forbidden
```

Un organizer intentando consultar un evento ajeno también recibe:

```http
403 Forbidden
```

---

# Notificaciones por email

Al confirmar correctamente una inscripción se envía automáticamente un email utilizando:

```text
Nodemailer
```

La configuración del transporte se encuentra en:

```text
src/config/mailer.js
```

El envío del email se realiza desde:

```text
src/services/mail.service.js
```

---

# Email de confirmación

El email enviado contiene:

- nombre del evento
- fecha
- lugar
- cantidad reservada
- código de reserva

El email se envía después de crear correctamente el ticket.

---

# Variables de entorno de email

Se agregaron las siguientes variables:

```env
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

Estas variables se encuentran documentadas en:

```text
.env.example
```

Las credenciales reales solamente deben existir dentro de:

```text
.env
```

Nunca deben estar hardcodeadas dentro del código.

---

# .env.example

Ejemplo:

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

---

# Arquitectura implementada

La funcionalidad de tickets mantiene la arquitectura por capas:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
DAO
   ↓
MongoDB
```

## Modelo

```text
src/models/Ticket.js
```

Define la estructura del ticket.

## DAO

```text
src/dao/tickets.dao.js
```

Realiza las operaciones directas sobre MongoDB.

## Repository

```text
src/repositories/tickets.repository.js
```

Intermedia entre los services y el DAO.

## Service

```text
src/services/tickets.service.js
```

Contiene la lógica de negocio:

- validación del evento
- validación de cantidad
- control de cupos
- detección de duplicados
- permisos
- cancelaciones

## Controller

```text
src/controllers/tickets.controller.js
```

Gestiona `req` y `res`.

## Routes

```text
src/routes/tickets.router.js
src/routes/events.router.js
```

Definen los endpoints correspondientes.

---

# Flujo de inscripción

```text
Usuario autenticado
        ↓
POST /api/events/:eid/tickets
        ↓
Buscar evento
        ↓
Validar estado
        ↓
Validar fecha
        ↓
Validar quantity
        ↓
Buscar inscripción duplicada
        ↓
Calcular cupos ocupados
        ↓
Validar disponibilidad
        ↓
Crear Ticket
        ↓
Generar reservationCode
        ↓
Enviar email
        ↓
Inscripción confirmada
```

---

# Flujo de cancelación

```text
Usuario autenticado
        ↓
PATCH /api/tickets/:tid/cancel
        ↓
Buscar ticket
        ↓
Validar propietario o admin
        ↓
Validar estado
        ↓
Cambiar status a cancelled
        ↓
Registrar cancelledAt
        ↓
Liberar cupo automáticamente
```

---

# Casos probados

Antes de entregar se realizaron los siguientes casos.

## 1. Inscripción exitosa

Se creó correctamente el ticket.

Resultado:

```text
status = confirmed
```

También se verificó que el email de confirmación fuera recibido correctamente.

```text
APROBADO
```

---

## 2. Inscripción sin sesión

Resultado:

```http
401 Unauthorized
```

Mensaje:

```text
No autenticado
```

```text
APROBADO
```

---

## 3. Evento inexistente

Resultado:

```http
404 Not Found
```

Mensaje:

```text
Evento no encontrado
```

```text
APROBADO
```

---

## 4. Inscripción a evento cancelado

Resultado:

```http
400 Bad Request
```

Mensaje:

```text
El evento no está disponible para inscripciones
```

```text
APROBADO
```

---

## 5. Cupos insuficientes

Se utilizó un evento cuya capacidad ya estaba ocupada.

Resultado:

```http
400 Bad Request
```

Mensaje:

```text
No hay cupos suficientes disponibles
```

```text
APROBADO
```

---

## 6. Inscripción duplicada activa

Un usuario intentó generar un segundo ticket activo para el mismo evento.

Resultado:

```http
409 Conflict
```

Mensaje:

```text
Ya tenés una inscripción activa para este evento
```

```text
APROBADO
```

---

## 7. Cancelación propia y liberación del cupo

Se canceló correctamente el ticket.

El ticket quedó con:

```text
status = cancelled
cancelledAt registrado
```

Después de la cancelación fue posible volver a utilizar el cupo liberado.

```text
APROBADO
```

---

## 8. Cancelación de ticket ajeno

Un usuario común intentó cancelar el ticket perteneciente a otro usuario.

Resultado:

```http
403 Forbidden
```

Mensaje:

```text
No tenés permisos para cancelar este ticket
```

```text
APROBADO
```

---

## 9. Usuario común consultando tickets de un evento

Resultado:

```http
403 Forbidden
```

```text
APROBADO
```

---

## 10. Organizer consultando tickets de un evento ajeno

Resultado:

```http
403 Forbidden
```

Mensaje:

```text
No tenés permisos para consultar los tickets de este evento
```

```text
APROBADO
```

---

# Seguridad

Para esta pre-entrega se mantiene:

- autenticación obligatoria para crear tickets
- autorización por rol
- validación de propiedad de tickets
- validación de propiedad de eventos
- referencias mediante ObjectId
- credenciales de email mediante variables de entorno
- cancelación lógica
- no exposición de datos sensibles
- `.env` fuera del repositorio

---

# Archivos que no deben subirse

```text
.env
node_modules/
cookies.txt
```

El repositorio incluye solamente:

```text
.env.example
```

sin credenciales reales.

---

# Pre-entrega 7 completada

Se implementó el flujo completo de:

- tickets
- inscripciones
- referencias entre usuarios y eventos
- estados de tickets
- control de cupos
- prevención de duplicados
- cancelaciones
- liberación automática de cupos
- consulta de tickets propios
- permisos de organizer y admin
- códigos de reserva
- Nodemailer
- email de confirmación
- variables de entorno para email

Los 10 casos solicitados fueron probados correctamente antes de la entrega.