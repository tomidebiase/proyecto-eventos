import { getUsers } from '../services/users.service.js'

export const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers()

    res.status(200).json({
      status: 'success',
      payload: users
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }
}