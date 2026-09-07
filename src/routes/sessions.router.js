import { Router } from 'express'
import passport from 'passport'

import {
  register,
  login,
  current,
  logout
} from '../controllers/sessions.controller.js'

const router = Router()

const finishAuthentication = (
  req,
  res,
  next,
  error,
  user,
  info,
  fallbackMessage,
  useStrategyMessage = false
) => {
  if (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }

  if (!user) {
    const statusCode = useStrategyMessage
      ? info?.statusCode || 401
      : 401

    const message = useStrategyMessage
      ? info?.message || fallbackMessage
      : fallbackMessage

    return res.status(statusCode).json({
      status: 'error',
      message
    })
  }

  req.user = user
  next()
}

router.post(
  '/register',
  (req, res, next) => {
    passport.authenticate(
      'register',
      { session: false },
      (error, user, info) => {
        finishAuthentication(
          req,
          res,
          next,
          error,
          user,
          info,
          'Error al registrar usuario',
          true
        )
      }
    )(req, res, next)
  },
  register
)

router.post(
  '/login',
  (req, res, next) => {
    passport.authenticate(
      'login',
      { session: false },
      (error, user, info) => {
        finishAuthentication(
          req,
          res,
          next,
          error,
          user,
          info,
          'Credenciales inválidas'
        )
      }
    )(req, res, next)
  },
  login
)

router.get(
  '/current',
  (req, res, next) => {
    passport.authenticate(
      'current',
      { session: false },
      (error, user, info) => {
        finishAuthentication(
          req,
          res,
          next,
          error,
          user,
          info,
          'No autenticado'
        )
      }
    )(req, res, next)
  },
  current
)

router.post('/logout', logout)

export default router