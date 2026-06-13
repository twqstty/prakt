import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const matches = await prisma.match.findMany({
    include: {
      homeClub: true,
      awayClub: true,
    },
    orderBy: { matchDate: 'desc' },
  })
  res.json(matches)
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { homeClubId, awayClubId, homeScore, awayScore, matchDate } = req.body

    if (!homeClubId || !awayClubId || homeScore === undefined || awayScore === undefined || !matchDate) {
      return res.status(400).json({ message: 'Заполните все поля матча' })
    }

    if (Number(homeClubId) === Number(awayClubId)) {
      return res.status(400).json({ message: 'Клубы в матче должны отличаться' })
    }

    const match = await prisma.match.create({
      data: {
        homeClubId: Number(homeClubId),
        awayClubId: Number(awayClubId),
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        matchDate: new Date(matchDate),
      },
      include: {
        homeClub: true,
        awayClub: true,
      },
    })

    res.status(201).json(match)
  } catch (error) {
    res.status(500).json({ message: 'Не удалось добавить матч', error: error.message })
  }
})

export default router
