import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { adminMiddleware, authMiddleware } from '../middleware/auth.js'

const router = Router()

function applyUserStats(players, events) {
  const stats = new Map()

  for (const event of events) {
    if (!event.playerId) continue
    if (!stats.has(event.playerId)) {
      stats.set(event.playerId, {
        appearances: new Set(),
        assists: 0,
        goals: 0,
        redCards: 0,
        yellowCards: 0,
      })
    }

    const playerStats = stats.get(event.playerId)
    playerStats.appearances.add(event.matchId)

    if (event.type === 'ASSIST') playerStats.assists += 1
    if (event.type === 'GOAL') playerStats.goals += 1
    if (event.type === 'RED_CARD') playerStats.redCards += 1
    if (event.type === 'YELLOW_CARD') playerStats.yellowCards += 1
  }

  return players.map((player) => {
    const playerStats = stats.get(player.id)
    return {
      ...player,
      appearances: playerStats?.appearances.size || 0,
      assists: playerStats?.assists || 0,
      goals: playerStats?.goals || 0,
      redCards: playerStats?.redCards || 0,
      yellowCards: playerStats?.yellowCards || 0,
    }
  })
}

router.get('/', authMiddleware, async (req, res) => {
  const players = await prisma.player.findMany({
    include: { club: true },
    orderBy: [{ rating: 'desc' }, { price: 'desc' }],
  })
  const events = await prisma.matchEvent.findMany({
    where: {
      playerId: { not: null },
      match: { userId: req.user.id },
    },
    select: {
      matchId: true,
      playerId: true,
      type: true,
    },
  })

  res.json(applyUserStats(players, events))
})

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, age, position, rating, price, clubId } = req.body

    if (!name || !age || !position || !rating || !price || !clubId) {
      return res.status(400).json({ message: 'Заполните все поля игрока' })
    }

    const player = await prisma.player.create({
      data: {
        name,
        age: Number(age),
        position,
        rating: Number(rating),
        price: Number(price),
        clubId: Number(clubId),
      },
      include: { club: true },
    })

    res.status(201).json(player)
  } catch (error) {
    res.status(500).json({ message: 'Не удалось добавить игрока', error: error.message })
  }
})

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.player.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Игрок удален' })
  } catch (error) {
    res.status(404).json({ message: 'Не удалось удалить игрока', error: error.message })
  }
})

export default router
