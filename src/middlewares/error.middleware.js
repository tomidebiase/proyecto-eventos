export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Error interno del servidor'

  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Datos inválidos'
  }

  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Identificador inválido'
  }

  if (err.code === 11000) {
    statusCode = 409
    message = 'El recurso ya existe'
  }

  if (statusCode === 500) {
    message = 'Error interno del servidor'
  }

  res.status(statusCode).json({
    status: 'error',
    message
  })
}