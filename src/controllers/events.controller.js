import { listEvents } from '../services/events.service.js'

export const getAllEvents = async (req, res, next) => {
  try {
    const events = await listEvents()

    res.status(200).json({
      status: 'success',
      payload: events
    })
  } catch (error) {
    next(error)
  }
}