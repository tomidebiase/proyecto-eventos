import { getEventById } from '../repositories/events.repository.js'

export const validateEventOwnerOrAdmin = async (
  eventId,
  user
) => {
  const event = await getEventById(eventId)

  if (!event) {
    const error = new Error('Evento no encontrado')
    error.statusCode = 404
    throw error
  }

  const isAdmin = user.role === 'admin'

  const isOwner =
    event.organizer?.toString() === user.id.toString()

  if (!isAdmin && !isOwner) {
    const error = new Error(
      'No tenés permisos para modificar este evento'
    )

    error.statusCode = 403
    throw error
  }

  return event
}