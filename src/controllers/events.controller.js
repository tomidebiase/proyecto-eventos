import {
  listEvents,
  getEvent,
  createNewEvent,
  modifyEvent,
  changeEventStatus
} from '../services/events.service.js'

import { asyncHandler } from '../middlewares/async.middleware.js'

export const getAllEvents = asyncHandler(
  async (req, res) => {
    const result = await listEvents(req.query)

    res.status(200).json({
      status: 'success',
      ...result
    })
  }
)

export const getEventById = asyncHandler(
  async (req, res) => {
    const event = await getEvent(req.params.id)

    res.status(200).json({
      status: 'success',
      payload: event
    })
  }
)

export const createEvent = asyncHandler(
  async (req, res) => {
    const event = await createNewEvent(
      req.body,
      req.user
    )

    res.status(201).json({
      status: 'success',
      payload: event
    })
  }
)

export const updateEvent = asyncHandler(
  async (req, res) => {
    const event = await modifyEvent(
      req.params.id,
      req.body
    )

    res.status(200).json({
      status: 'success',
      payload: event
    })
  }
)

export const updateEventStatus = asyncHandler(
  async (req, res) => {
    const event = await changeEventStatus(
      req.params.id,
      req.body.status
    )

    res.status(200).json({
      status: 'success',
      payload: event
    })
  }
)