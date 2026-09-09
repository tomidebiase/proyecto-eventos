import { EventModel } from '../models/Event.js'

export const getAllEvents = async () => {
  return EventModel.find()
}