import {
  getPublishedEvents,
  saveEvent,
  updateEvent
} from '../repositories/events.repository.js'

export const getEvents = async () => {
  return getPublishedEvents()
}

export const createNewEvent = async (eventData, user) => {
  const {
    title,
    description,
    date,
    location,
    capacity,
    price
  } = eventData

  if (!title || !description || !date || !location || !capacity) {
    const error = new Error('Faltan campos obligatorios')
    error.statusCode = 400
    throw error
  }

  const event = await saveEvent({
    title,
    description,
    date,
    location,
    capacity,
    price: price ?? 0,
    status: 'published',
    organizer: user.id
  })

  return event
}

export const modifyEvent = async (eventId, updateData) => {
  return updateEvent(eventId, updateData)
}