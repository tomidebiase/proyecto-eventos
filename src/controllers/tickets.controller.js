import {
  createNewTicket,
  getMyTickets,
  getEventTickets,
  cancelTicket
} from '../services/tickets.service.js'

import { asyncHandler } from '../middlewares/async.middleware.js'

export const createTicket = asyncHandler(
  async (req, res) => {
    const ticket = await createNewTicket(
      req.params.eid,
      req.body.quantity,
      req.user
    )

    res.status(201).json({
      status: 'success',
      payload: ticket
    })
  }
)

export const getMyTicketsController = asyncHandler(
  async (req, res) => {
    const tickets = await getMyTickets(req.user.id)

    res.status(200).json({
      status: 'success',
      payload: tickets
    })
  }
)

export const getEventTicketsController = asyncHandler(
  async (req, res) => {
    const tickets = await getEventTickets(
      req.params.eid,
      req.user
    )

    res.status(200).json({
      status: 'success',
      payload: tickets
    })
  }
)

export const cancelTicketController = asyncHandler(
  async (req, res) => {
    const ticket = await cancelTicket(
      req.params.tid,
      req.user
    )

    res.status(200).json({
      status: 'success',
      payload: ticket
    })
  }
)