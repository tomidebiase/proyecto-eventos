import bcrypt from 'bcrypt'

export const createHash = async (password) => {
  return bcrypt.hash(password, 10)
}