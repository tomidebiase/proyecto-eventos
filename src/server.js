import app from './app.js'
import { config } from './config/env.js'

app.listen(config.PORT, () => {
  console.log(`Servidor activo en puerto ${config.PORT}`)
})