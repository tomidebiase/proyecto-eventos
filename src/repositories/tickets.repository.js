import {
  createTicket,
  findActiveTicketByUserAndEvent,
  countReservedQuantityByEvent,
  findTicketsByUser,
  findTicketsByEvent,
  findTicketById,
  updateTicketById
} from '../dao/tickets.dao.js'

export const saveTicket = async (ticketData) => {
  return createTicket(ticketData)
}

export const getActiveTicketByUserAndEvent = async (
  userId,
  eventId
) => {
  return findActiveTicketByUserAndEvent(
    userId,
    eventId
  )
}

export const getReservedQuantityByEvent = async (eventId) => {
  return countReservedQuantityByEvent(eventId)
}

export const getTicketsByUser = async (userId) => {
  return findTicketsByUser(userId)
}

export const getTicketsByEvent = async (eventId) => {
  return findTicketsByEvent(eventId)
}

export const getTicketById = async (ticketId) => {
  return findTicketById(ticketId)
}

export const updateTicket = async (
  ticketId,
  updateData
) => {
  return updateTicketById(
    ticketId,
    updateData
  )
}