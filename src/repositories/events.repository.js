import {
  findPublishedEvents,
  findEventById,
  createEvent,
  updateEventById
} from '../dao/events.dao.js'

export const getPublishedEvents = async () => {
  return findPublishedEvents()
}

export const getEventById = async (eventId) => {
  return findEventById(eventId)
}

export const saveEvent = async (eventData) => {
  return createEvent(eventData)
}

export const updateEvent = async (eventId, updateData) => {
  return updateEventById(eventId, updateData)
}