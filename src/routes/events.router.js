import { Router } from 'express'

import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus
} from '../controllers/events.controller.js'

import { auth } from '../middlewares/auth.middleware.js'
import { authorizeRoles } from '../middlewares/authorize.middleware.js'
import { authorizeEventOwnerOrAdmin } from '../middlewares/event-owner.middleware.js'

const router = Router()

router.get('/', getAllEvents)

router.get('/:id', getEventById)

router.post(
  '/',
  auth,
  authorizeRoles('organizer', 'admin'),
  createEvent
)

router.put(
  '/:id',
  auth,
  authorizeRoles('organizer', 'admin'),
  authorizeEventOwnerOrAdmin,
  updateEvent
)

router.patch(
  '/:id/status',
  auth,
  authorizeRoles('organizer', 'admin'),
  authorizeEventOwnerOrAdmin,
  updateEventStatus
)

export default router