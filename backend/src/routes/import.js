import { Router } from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import prisma from '../lib/prisma.js'
import { importPlayersFromCsv } from '../lib/importPlayers.js'
import { adminMiddleware, authMiddleware } from '../middleware/auth.js'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const csvPath = resolve(__dirname, '../../data/transfermarkt_players.csv')

router.post('/players', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await importPlayersFromCsv(prisma, csvPath)
    res.json({
      message: 'Импорт игроков завершен',
      ...result,
    })
  } catch (error) {
    res.status(500).json({ message: 'Не удалось импортировать игроков', error: error.message })
  }
})

export default router
