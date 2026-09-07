# Plataforma de Eventos e Inscripciones

API REST desarrollada para el proyecto de Backend II.

## Temática

El proyecto consiste en una plataforma de eventos e inscripciones donde los usuarios podrán consultar eventos, registrarse y, en futuras etapas, inscribirse a eventos.

También se incorporarán organizadores y administradores con diferentes permisos.

## Tecnologías

- Node.js
- Express
- JavaScript
- MongoDB
- Mongoose
- bcrypt
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
MONGO_URL=mongodb://127.0.0.1:27017/proyecto_eventos
JWT_SECRET=
```

## Ejecutar el proyecto

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

## Registro de usuarios

### Endpoint

```http
POST /api/sessions/register
```

### Body esperado

```json
{
  "first_name": "Ana",
  "last_name": "Perez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

### Validaciones

- `first_name`, `last_name`, `email` y `password` son obligatorios.
- El email debe tener un formato válido.
- El email se normaliza utilizando `trim()` y `toLowerCase()`.
- La contraseña debe tener al menos 8 caracteres.
- No se permiten emails duplicados.
- El rol se asigna automáticamente como `user`.
- El rol enviado desde el body no se utiliza.
- La contraseña se guarda hasheada con bcrypt.
- La respuesta nunca devuelve el campo `password`.

### Registro exitoso

Respuesta `201`:

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Perez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

### Campos faltantes

Respuesta `400`:

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

### Email inválido

Respuesta `400`:

```json
{
  "status": "error",
  "message": "Email inválido"
}
```

### Email duplicado

Respuesta `409`:

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

### Contraseña demasiado corta

Respuesta `400`:

```json
{
  "status": "error",
  "message": "La contraseña debe tener al menos 8 caracteres"
}
```

## Rutas disponibles

```http
GET /api/health
GET /api/events
POST /api/sessions/register
```

## Arquitectura

```text
src/
├── config/
├── routes/
├── controllers/
├── services/
├── repositories/
├── dao/
├── models/
├── middlewares/
├── utils/
├── app.js
└── server.js
```