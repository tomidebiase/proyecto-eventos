import { mailTransporter } from '../config/mailer.js'
import { config } from '../config/env.js'

export const sendTicketConfirmationEmail = async ({
  to,
  event,
  ticket
}) => {
  await mailTransporter.sendMail({
    from: config.MAIL_FROM,
    to,
    subject: `Inscripción confirmada: ${event.title}`,
    text: `
Tu inscripción fue confirmada.

Evento: ${event.title}
Fecha: ${event.date}
Lugar: ${event.location}
Cantidad: ${ticket.quantity}
Código de reserva: ${ticket.reservationCode}
    `.trim()
  })
}