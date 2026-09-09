export const errorHandler = (err, req, res, next) => {
  console.error(err)

  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Error interno del servidor'
  })
}