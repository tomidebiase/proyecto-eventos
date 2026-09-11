import { toUserDTO } from './user.dto.js'
import { toEventDTO } from './event.dto.js'

const toPlainObject = (ticket) => {
  if (!ticket) {
    return null
  }

  if (typeof ticket.toObject === 'function') {
    return ticket.toObject()
  }

  return ticket
}

const isPopulatedUser = (value) => {
  return (
    value &&
    typeof value === 'object' &&
    (
      'email' in value ||
      'first_name' in value ||
      'last_name' in value ||
      'role' in value
    )
  )
}

const isPopulatedEvent = (value) => {
  return (
    value &&
    typeof value === 'object' &&
    (
      'title' in value ||
      'date' in value ||
      'location' in value
    )
  )
}

const getReferenceId = (value) => {
  if (!value) {
    return value
  }

  if (value._id) {
    return value._id.toString()
  }

  if (typeof value.toString === 'function') {
    return value.toString()
  }

  return value
}

export const toTicketDTO = (ticket) => {
  const data = toPlainObject(ticket)

  if (!data) {
    return null
  }

  const user = isPopulatedUser(data.user)
    ? toUserDTO(data.user)
    : getReferenceId(data.user)

  const event = isPopulatedEvent(data.event)
    ? toEventDTO(data.event)
    : getReferenceId(data.event)

  return {
    _id: data._id,
    user,
    event,
    status: data.status,
    quantity: data.quantity,
    reservationCode: data.reservationCode,
    cancelledAt: data.cancelledAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    __v: data.__v
  }
}

export const toTicketListDTO = (tickets) => {
  return tickets.map((ticket) => toTicketDTO(ticket))
}