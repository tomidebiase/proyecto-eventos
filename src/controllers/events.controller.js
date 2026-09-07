import {
  getEvents,
  createNewEvent,
  modifyEvent
} from '../services/events.service.js'

export const getAllEvents = async (req, res) => {
  try {
    const events = await getEvents()

    res.status(200).json({
      status: 'success',
      payload: events
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }
}

export const createEvent = async (req, res) => {
  try {
    const event = await createNewEvent(req.body, req.user)

    res.status(201).json({
      status: 'success',
      payload: event
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }
}

export const updateEvent = async (req, res) => {
  try {
    const event = await modifyEvent(
      req.params.eid,
      req.body,
      req.user
    )

    res.status(200).json({
      status: 'success',
      payload: event
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }
}