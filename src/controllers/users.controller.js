import { getUsers } from '../services/users.service.js'
import { asyncHandler } from '../middlewares/async.middleware.js'

export const getAllUsers = asyncHandler(
  async (req, res) => {
    const users = await getUsers()

    res.status(200).json({
      status: 'success',
      payload: users
    })
  }
)