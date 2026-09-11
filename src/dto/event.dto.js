import { toUserDTO } from './user.dto.js'

const toPlainObject = (event) => {
  if (!event) {
    return null
  }

  if (typeof event.toObject === 'function') {
    return event.toObject()
  }

  return event
}

const isPopulatedUser = (value) => {
  return (
    value &&
    typeof value === 'object' &&
    (
      'email' in value ||
      'first_name' in value ||
      'last_name' in value ||
      'role' in value
    )
  )
}

export const toEventDTO = (event) => {
  const data = toPlainObject(event)

  if (!data) {
    return null
  }

  const organizer = isPopulatedUser(data.organizer)
    ? toUserDTO(data.organizer)
    : data.organizer

  return {
    _id: data._id,
    title: data.title,
    description: data.description,
    category: data.category,
    date: data.date,
    location: data.location,
    capacity: data.capacity,
    price: data.price,
    status: data.status,
    organizer,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    __v: data.__v
  }
}

export const toEventListDTO = (events) => {
  return events.map((event) => toEventDTO(event))
}