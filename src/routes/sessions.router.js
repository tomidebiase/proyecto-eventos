import { Router } from 'express'
import passport from 'passport'

import {
  register,
  login,
  current,
  logout
} from '../controllers/sessions.controller.js'

import { auth } from '../middlewares/auth.middleware.js'

const router = Router()

const registerAuthentication = (req, res, next) => {
  passport.authenticate(
    'register',
    { session: false },
    (error, user, info) => {
      if (error) {
        return next(error)
      }

      if (!user) {
        const authError = new Error(
          info?.message || 'Error al registrar usuario'
        )

        authError.statusCode = info?.statusCode || 401

        return next(authError)
      }

      req.user = user
      next()
    }
  )(req, res, next)
}

const loginAuthentication = (req, res, next) => {
  passport.authenticate(
    'login',
    { session: false },
    (error, user) => {
      if (error) {
        return next(error)
      }

      if (!user) {
        const authError = new Error(
          'Credenciales inválidas'
        )

        authError.statusCode = 401

        return next(authError)
      }

      req.user = user
      next()
    }
  )(req, res, next)
}

router.post(
  '/register',
  registerAuthentication,
  register
)

router.post(
  '/login',
  loginAuthentication,
  login
)

router.get('/current', auth, current)

router.post('/logout', logout)

export default router