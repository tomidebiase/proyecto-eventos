import { randomUUID } from 'crypto'

import { getEventById } from '../repositories/events.repository.js'

import {
  saveTicket,
  getActiveTicketByUserAndEvent,
  getReservedQuantityByEvent,
  getTicketsByUser,
  getTicketsByEvent,
  getTicketById,
  updateTicket
} from '../repositories/tickets.repository.js'

import {
  toTicketDTO,
  toTicketListDTO
} from '../dto/ticket.dto.js'

import { sendTicketConfirmationEmail } from './mail.service.js'

export const createNewTicket = async (
  eventId,
  quantity,
  user
) => {
  const event = await getEventById(eventId)

  if (!event) {
    const error = new Error('Evento no encontrado')
    error.statusCode = 404
    throw error
  }

  if (event.status !== 'published') {
    const error = new Error(
      'El evento no está disponible para inscripciones'
    )
    error.statusCode = 400
    throw error
  }

  if (event.date <= new Date()) {
    const error = new Error('El evento ya finalizó')
    error.statusCode = 400
    throw error
  }

  const quantityNumber = Number(quantity)

  if (
    !Number.isInteger(quantityNumber) ||
    quantityNumber <= 0
  ) {
    const error = new Error(
      'La cantidad debe ser mayor a 0'
    )
    error.statusCode = 400
    throw error
  }

  const existingTicket =
    await getActiveTicketByUserAndEvent(
      user.id,
      event._id
    )

  if (existingTicket) {
    const error = new Error(
      'Ya tenés una inscripción activa para este evento'
    )
    error.statusCode = 409
    throw error
  }

  const reservedQuantity =
    await getReservedQuantityByEvent(event._id)

  const availableCapacity =
    event.capacity - reservedQuantity

  if (availableCapacity < quantityNumber) {
    const error = new Error(
      'No hay cupos suficientes disponibles'
    )
    error.statusCode = 400
    throw error
  }

  const ticket = await saveTicket({
    user: user.id,
    event: event._id,
    status: 'confirmed',
    quantity: quantityNumber,
    reservationCode: randomUUID()
  })

  await sendTicketConfirmationEmail({
    to: user.email,
    event,
    ticket
  })

  return toTicketDTO(ticket)
}

export const getMyTickets = async (userId) => {
  const tickets = await getTicketsByUser(userId)

  return toTicketListDTO(tickets)
}

export const getEventTickets = async (
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
      'No tenés permisos para consultar los tickets de este evento'
    )
    error.statusCode = 403
    throw error
  }

  const tickets = await getTicketsByEvent(eventId)

  return toTicketListDTO(tickets)
}

export const cancelTicket = async (
  ticketId,
  user
) => {
  const ticket = await getTicketById(ticketId)

  if (!ticket) {
    const error = new Error('Ticket no encontrado')
    error.statusCode = 404
    throw error
  }

  if (ticket.status === 'cancelled') {
    const error = new Error(
      'El ticket ya está cancelado'
    )
    error.statusCode = 400
    throw error
  }

  const isAdmin = user.role === 'admin'

  const isOwner =
    ticket.user?.toString() === user.id.toString()

  if (!isAdmin && !isOwner) {
    const error = new Error(
      'No tenés permisos para cancelar este ticket'
    )
    error.statusCode = 403
    throw error
  }

  const updatedTicket = await updateTicket(ticketId, {
    status: 'cancelled',
    cancelledAt: new Date()
  })

  return toTicketDTO(updatedTicket)
}