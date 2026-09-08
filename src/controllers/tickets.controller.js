import {
  createNewTicket,
  getMyTickets,
  getEventTickets,
  cancelTicket
} from '../services/tickets.service.js'

export const createTicket = async (req, res) => {
  try {
    const ticket = await createNewTicket(
      req.params.eid,
      req.body.quantity,
      req.user
    )

    res.status(201).json({
      status: 'success',
      payload: ticket
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }
}

export const getMyTicketsController = async (req, res) => {
  try {
    const tickets = await getMyTickets(req.user.id)

    res.status(200).json({
      status: 'success',
      payload: tickets
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }
}

export const getEventTicketsController = async (req, res) => {
  try {
    const tickets = await getEventTickets(
      req.params.eid,
      req.user
    )

    res.status(200).json({
      status: 'success',
      payload: tickets
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }
}

export const cancelTicketController = async (req, res) => {
  try {
    const ticket = await cancelTicket(
      req.params.tid,
      req.user
    )

    res.status(200).json({
      status: 'success',
      payload: ticket
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }
}