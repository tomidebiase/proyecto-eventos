import nodemailer from 'nodemailer'
import { config } from './env.js'

export const mailTransporter = nodemailer.createTransport({
  host: config.MAIL_HOST,
  port: Number(config.MAIL_PORT),
  secure: Number(config.MAIL_PORT) === 465,
  auth: {
    user: config.MAIL_USER,
    pass: config.MAIL_PASS
  }
})