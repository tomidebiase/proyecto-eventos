import { getAllEvents } from '../dao/events.dao.js'

export const getEvents = async () => {
  return getAllEvents()
}