import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy } from 'passport-jwt'

import { config } from './env.js'
import {
  getUserByEmail,
  saveUser
} from '../repositories/users.repository.js'

import {
  createHash,
  isValidPassword
} from '../utils/hash.js'

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
          const { first_name, last_name } = req.body

          if (!first_name || !last_name || !email || !password) {
            return done(null, false, {
              message: 'Faltan campos obligatorios',
              statusCode: 400
            })
          }

          const normalizedEmail = email.trim().toLowerCase()
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

          if (!emailRegex.test(normalizedEmail)) {
            return done(null, false, {
              message: 'Email inválido',
              statusCode: 400
            })
          }

          if (password.length < 8) {
            return done(null, false, {
              message: 'La contraseña debe tener al menos 8 caracteres',
              statusCode: 400
            })
          }

          const existingUser = await getUserByEmail(normalizedEmail)

          if (existingUser) {
            return done(null, false, {
              message: 'El email ya está registrado',
              statusCode: 409
            })
          }

          const hashedPassword = await createHash(password)

          const user = await saveUser({
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: normalizedEmail,
            password: hashedPassword
          })

          return done(null, {
            id: user._id.toString(),
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role
          })
        } catch (error) {
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
          if (!email || !password) {
            return done(null, false, {
              message: 'Credenciales inválidas'
            })
          }

          const normalizedEmail = email.trim().toLowerCase()

          const user = await getUserByEmail(normalizedEmail)

          if (!user) {
            return done(null, false, {
              message: 'Credenciales inválidas'
            })
          }

          const validPassword = await isValidPassword(
            password,
            user.password
          )

          if (!validPassword) {
            return done(null, false, {
              message: 'Credenciales inválidas'
            })
          }

          return done(null, {
            id: user._id.toString(),
            email: user.email,
            role: user.role
          })
        } catch (error) {
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