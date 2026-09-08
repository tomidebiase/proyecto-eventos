import { EventModel } from '../models/Event.js'

export const findEvents = async (
  filter,
  sort,
  skip,
  limit
) => {
  return EventModel
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
}

export const countEvents = async (filter) => {
  return EventModel.countDocuments(filter)
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
    {
      new: true,
      runValidators: true
    }
  )
}