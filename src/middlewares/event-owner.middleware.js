import {
  validateEventOwnerOrAdmin
} from '../services/authorization.service.js'

export const authorizeEventOwnerOrAdmin = async (
  req,
  res,
  next
) => {
  try {
    const event = await validateEventOwnerOrAdmin(
      req.params.id,
      req.user
    )

    req.event = event
    next()
  } catch (error) {
    next(error)
  }
}