import {
  getEvents as getEventsFromRepository,
  getEventsCount,
  getEventById,
  saveEvent,
  updateEvent
} from '../repositories/events.repository.js'

const validStatuses = [
  'draft',
  'published',
  'cancelled',
  'finished'
]

export const listEvents = async (query) => {
  const {
    status,
    category,
    location,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
    sort = 'date'
  } = query

  const pageNumber = Number(page)
  const limitNumber = Number(limit)

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    !Number.isInteger(limitNumber) ||
    limitNumber < 1
  ) {
    const error = new Error('Paginación inválida')
    error.statusCode = 400
    throw error
  }

  const filter = {}

  if (status) {
    if (!validStatuses.includes(status)) {
      const error = new Error('Estado inválido')
      error.statusCode = 400
      throw error
    }

    filter.status = status
  }

  if (category) {
    filter.category = category
  }

  if (location) {
    filter.location = {
      $regex: location,
      $options: 'i'
    }
  }

  if (dateFrom || dateTo) {
    filter.date = {}

    if (dateFrom) {
      const from = new Date(dateFrom)

      if (Number.isNaN(from.getTime())) {
        const error = new Error('dateFrom inválido')
        error.statusCode = 400
        throw error
      }

      filter.date.$gte = from
    }

    if (dateTo) {
      const to = new Date(dateTo)

      if (Number.isNaN(to.getTime())) {
        const error = new Error('dateTo inválido')
        error.statusCode = 400
        throw error
      }

      filter.date.$lte = to
    }
  }

  const allowedSortFields = [
    'date',
    'title',
    'price',
    'capacity',
    'createdAt'
  ]

  const sortDirection = sort.startsWith('-') ? -1 : 1
  const sortField = sort.replace('-', '')

  if (!allowedSortFields.includes(sortField)) {
    const error = new Error('Ordenamiento inválido')
    error.statusCode = 400
    throw error
  }

  const sortOption = {
    [sortField]: sortDirection
  }

  const skip = (pageNumber - 1) * limitNumber

  const [data, total] = await Promise.all([
    getEventsFromRepository(
      filter,
      sortOption,
      skip,
      limitNumber
    ),
    getEventsCount(filter)
  ])

  return {
    data,
    page: pageNumber,
    limit: limitNumber,
    total,
    totalPages: Math.ceil(total / limitNumber)
  }
}

export const getEvent = async (eventId) => {
  const event = await getEventById(eventId)

  if (!event) {
    const error = new Error('Evento no encontrado')
    error.statusCode = 404
    throw error
  }

  return event
}

export const createNewEvent = async (eventData, user) => {
  const {
    title,
    description,
    category,
    date,
    location,
    capacity,
    price = 0,
    status = 'draft'
  } = eventData

  if (
    !title ||
    !description ||
    !category ||
    !date ||
    !location ||
    capacity === undefined
  ) {
    const error = new Error('Faltan campos obligatorios')
    error.statusCode = 400
    throw error
  }

  const eventDate = new Date(date)

  if (
    Number.isNaN(eventDate.getTime()) ||
    eventDate <= new Date()
  ) {
    const error = new Error(
      'La fecha del evento debe ser futura'
    )
    error.statusCode = 400
    throw error
  }

  if (Number(capacity) <= 0) {
    const error = new Error(
      'La capacidad debe ser mayor a 0'
    )
    error.statusCode = 400
    throw error
  }

  if (Number(price) < 0) {
    const error = new Error(
      'El precio no puede ser negativo'
    )
    error.statusCode = 400
    throw error
  }

  if (!validStatuses.includes(status)) {
    const error = new Error('Estado inválido')
    error.statusCode = 400
    throw error
  }

  if (
    status === 'cancelled' ||
    status === 'finished'
  ) {
    const error = new Error(
      'No se puede crear un evento con ese estado'
    )
    error.statusCode = 400
    throw error
  }

  return saveEvent({
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    date: eventDate,
    location: location.trim(),
    capacity: Number(capacity),
    price: Number(price),
    status,
    organizer: user.id
  })
}

export const modifyEvent = async (
  eventId,
  updateData
) => {
  const event = await getEventById(eventId)

  if (!event) {
    const error = new Error('Evento no encontrado')
    error.statusCode = 404
    throw error
  }

  if (event.status === 'cancelled') {
    const error = new Error(
      'No se puede modificar un evento cancelado'
    )
    error.statusCode = 400
    throw error
  }

  const safeUpdate = { ...updateData }

  delete safeUpdate.organizer
  delete safeUpdate.status

  if (
    safeUpdate.capacity !== undefined &&
    Number(safeUpdate.capacity) <= 0
  ) {
    const error = new Error(
      'La capacidad debe ser mayor a 0'
    )
    error.statusCode = 400
    throw error
  }

  if (
    safeUpdate.price !== undefined &&
    Number(safeUpdate.price) < 0
  ) {
    const error = new Error(
      'El precio no puede ser negativo'
    )
    error.statusCode = 400
    throw error
  }

  if (safeUpdate.date !== undefined) {
    const newDate = new Date(safeUpdate.date)

    if (
      Number.isNaN(newDate.getTime()) ||
      newDate <= new Date()
    ) {
      const error = new Error(
        'La fecha del evento debe ser futura'
      )
      error.statusCode = 400
      throw error
    }

    safeUpdate.date = newDate
  }

  return updateEvent(eventId, safeUpdate)
}

export const changeEventStatus = async (
  eventId,
  newStatus
) => {
  const event = await getEventById(eventId)

  if (!event) {
    const error = new Error('Evento no encontrado')
    error.statusCode = 404
    throw error
  }

  if (!validStatuses.includes(newStatus)) {
    const error = new Error('Estado inválido')
    error.statusCode = 400
    throw error
  }

  if (event.status === 'cancelled') {
    const error = new Error(
      'No se puede cambiar el estado de un evento cancelado'
    )
    error.statusCode = 400
    throw error
  }

  if (
    newStatus === 'published' &&
    (
      event.status === 'finished' ||
      event.date <= new Date()
    )
  ) {
    const error = new Error(
      'No se puede publicar un evento finalizado'
    )
    error.statusCode = 400
    throw error
  }

  return updateEvent(eventId, {
    status: newStatus
  })
}