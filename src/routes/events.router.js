import { Router } from 'express'

import {
  getAllEvents,
  createEvent,
  updateEvent
} from '../controllers/events.controller.js'

import { auth } from '../middlewares/auth.middleware.js'
import { authorizeRoles } from '../middlewares/authorize.middleware.js'
import { authorizeEventOwnerOrAdmin } from '../middlewares/event-owner.middleware.js'

const router = Router()

router.get('/', getAllEvents)

router.post(
  '/',
  auth,
  authorizeRoles('organizer', 'admin'),
  createEvent
)

router.put(
  '/:eid',
  auth,
  authorizeRoles('organizer', 'admin'),
  authorizeEventOwnerOrAdmin,
  updateEvent
)

export default router