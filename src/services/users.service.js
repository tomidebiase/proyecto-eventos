import { getAllUsers } from '../repositories/users.repository.js'

export const getUsers = async () => {
  return getAllUsers()
}