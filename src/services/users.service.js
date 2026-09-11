import { getAllUsers } from '../repositories/users.repository.js'
import { toUserDTO } from '../dto/user.dto.js'

export const getUsers = async () => {
  const users = await getAllUsers()

  return users.map((user) => toUserDTO(user))
}