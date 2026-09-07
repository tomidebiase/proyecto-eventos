import { UserModel } from '../models/User.js'

export const findUserByEmail = async (email) => {
  return UserModel.findOne({ email })
}

export const createUser = async (userData) => {
  return UserModel.create(userData)
}

export const findAllUsers = async () => {
  return UserModel.find().select('-password')
}