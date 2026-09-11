const toPlainObject = (user) => {
  if (!user) {
    return null
  }

  if (typeof user.toObject === 'function') {
    return user.toObject()
  }

  return user
}

const getUserId = (user) => {
  if (user.id) {
    return user.id.toString()
  }

  if (user._id) {
    return user._id.toString()
  }

  return undefined
}

export const toUserDTO = (user) => {
  const data = toPlainObject(user)

  if (!data) {
    return null
  }

  return {
    _id: data._id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    role: data.role,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    __v: data.__v
  }
}

export const toRegisteredUserDTO = (user) => {
  const data = toPlainObject(user)

  if (!data) {
    return null
  }

  return {
    id: getUserId(data),
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    role: data.role
  }
}

export const toAuthenticatedUserDTO = (user) => {
  const data = toPlainObject(user)

  if (!data) {
    return null
  }

  return {
    id: getUserId(data),
    email: data.email,
    role: data.role
  }
}