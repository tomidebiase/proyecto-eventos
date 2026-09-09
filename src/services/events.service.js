import { getEvents } from '../repositories/events.repository.js'

export const listEvents = async () => {
  return getEvents()
}