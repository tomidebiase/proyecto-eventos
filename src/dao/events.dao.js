import { EventModel } from '../models/Event.js'

export const findPublishedEvents = async () => {
  return EventModel.find({ status: 'published' })
}

export const findEventById = async (eventId) => {
  return EventModel.findById(eventId)
}

export const createEvent = async (eventData) => {
  return EventModel.create(eventData)
}

export const updateEventById = async (eventId, updateData) => {
  return EventModel.findByIdAndUpdate(
    eventId,
    updateData,
    { new: true, runValidators: true }
  )
}