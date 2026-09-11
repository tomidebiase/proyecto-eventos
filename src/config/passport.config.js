import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy } from 'passport-jwt'

import { config } from './env.js'

import {
  registerUser,
  loginUser
} from '../services/sessions.service.js'

const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies.currentUser || null
  }

  return null
}

export const initializePassport = () => {
  passport.use(
    'register',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const user = await registerUser(req.body)

          return done(null, user)
        } catch (error) {
          if (error.statusCode) {
            return done(null, false, {
              message: error.message,
              statusCode: error.statusCode
            })
          }

          return done(error)
        }
      }
    )
  )

  passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await loginUser({
            email,
            password
          })

          return done(null, user)
        } catch (error) {
          if (error.statusCode) {
            return done(null, false, {
              message: error.message,
              statusCode: error.statusCode
            })
          }

          return done(error)
        }
      }
    )
  )

  passport.use(
    'current',
    new JwtStrategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: config.JWT_SECRET
      },
      async (payload, done) => {
        try {
          return done(null, {
            id: payload.id,
            email: payload.email,
            role: payload.role
          })
        } catch (error) {
          return done(error, false)
        }
      }
    )
  )
}