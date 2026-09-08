import {
  findEvents,
  countEvents,
  findEventById,
  createEvent,
  updateEventById
} from '../dao/events.dao.js'

export const getEvents = async (
  filter,
  sort,
  skip,
  limit
) => {
  return findEvents(filter, sort, skip, limit)
}

export const getEventsCount = async (filter) => {
  return countEvents(filter)
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