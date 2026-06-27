import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import authRoutes from './routes/auth.js'
import clubsRoutes from './routes/clubs.js'
import playersRoutes from './routes/players.js'
import matchesRoutes from './routes/matches.js'
import transfersRoutes from './routes/transfers.js'
import leagueTableRoutes from './routes/leagueTable.js'
import importRoutes from './routes/import.js'
import seasonRoutes from './routes/season.js'

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'European Super League API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/clubs', clubsRoutes)
app.use('/api/players', playersRoutes)
app.use('/api/matches', matchesRoutes)
app.use('/api/transfers', transfersRoutes)
app.use('/api/league-table', leagueTableRoutes)
app.use('/api/import', importRoutes)
app.use('/api/season', seasonRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' })
})

app.use((error, req, res, next) => {
  res.status(500).json({ message: 'Ошибка сервера', error: error.message })
})

app.listen(port, () => {
  console.log(`European Super League API is running on http://localhost:${port}`)
})
