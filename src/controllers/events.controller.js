import {
  listEvents,
  getEvent,
  createNewEvent,
  modifyEvent,
  changeEventStatus
} from '../services/events.service.js'

export const getAllEvents = async (req, res) => {
  try {
    const result = await listEvents(req.query)

    res.status(200).json({
      status: 'success',
      ...result
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }
}

export const getEventById = async (req, res) => {
  try {
    const event = await getEvent(req.params.id)

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

export const createEvent = async (req, res) => {
  try {
    const event = await createNewEvent(
      req.body,
      req.user
    )

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
      req.params.id,
      req.body
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

export const updateEventStatus = async (req, res) => {
  try {
    const event = await changeEventStatus(
      req.params.id,
      req.body.status
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