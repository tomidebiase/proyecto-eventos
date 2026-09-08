import { getEventById } from '../repositories/events.repository.js'

export const authorizeEventOwnerOrAdmin = async (req, res, next) => {
  try {
    const event = await getEventById(req.params.id)

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Evento no encontrado'
      })
    }

    const isAdmin = req.user.role === 'admin'
    const isOwner =
      event.organizer?.toString() === req.user.id.toString()

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'No tenés permisos para modificar este evento'
      })
    }

    req.event = event
    next()
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    })
  }
}