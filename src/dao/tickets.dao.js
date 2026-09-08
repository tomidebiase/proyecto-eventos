import { TicketModel } from '../models/Ticket.js'

export const createTicket = async (ticketData) => {
  return TicketModel.create(ticketData)
}

export const findActiveTicketByUserAndEvent = async (
  userId,
  eventId
) => {
  return TicketModel.findOne({
    user: userId,
    event: eventId,
    status: { $ne: 'cancelled' }
  })
}

export const countReservedQuantityByEvent = async (eventId) => {
  const result = await TicketModel.aggregate([
    {
      $match: {
        event: eventId,
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$quantity' }
      }
    }
  ])

  return result[0]?.total || 0
}

export const findTicketsByUser = async (userId) => {
  return TicketModel.find({
    user: userId
  }).populate(
    'event',
    'title date location'
  )
}

export const findTicketsByEvent = async (eventId) => {
  return TicketModel.find({
    event: eventId
  })
}

export const findTicketById = async (ticketId) => {
  return TicketModel.findById(ticketId)
}

export const updateTicketById = async (
  ticketId,
  updateData
) => {
  return TicketModel.findByIdAndUpdate(
    ticketId,
    updateData,
    {
      new: true,
      runValidators: true
    }
  )
}