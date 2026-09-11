import { generateToken } from '../utils/jwt.js'
import { config } from '../config/env.js'

import {
  toRegisteredUserDTO,
  toAuthenticatedUserDTO
} from '../dto/user.dto.js'

export const register = (req, res) => {
  res.status(201).json({
    status: 'success',
    payload: toRegisteredUserDTO(req.user)
  })
}

export const login = (req, res) => {
  const token = generateToken({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role
  })

  res.cookie('currentUser', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 3600000,
    secure: config.NODE_ENV === 'production'
  })

  res.status(200).json({
    status: 'success',
    message: 'Login correcto'
  })
}

export const current = (req, res) => {
  res.status(200).json({
    status: 'success',
    payload: toAuthenticatedUserDTO(req.user)
  })
}

export const logout = (req, res) => {
  res.clearCookie('currentUser', {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.NODE_ENV === 'production'
  })

  res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada'
  })
}