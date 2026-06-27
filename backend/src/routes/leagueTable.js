import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  const clubs = await prisma.club.findMany()
  const matches = await prisma.match.findMany({ where: { userId: req.user.id } })

  const table = new Map(
    clubs.map((club) => [
      club.id,
      {
        clubId: club.id,
        club: club.name,
        games: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
    ]),
  )

  matches.forEach((match) => {
    const home = table.get(match.homeClubId)
    const away = table.get(match.awayClubId)

    if (!home || !away) return

    home.games += 1
    away.games += 1
    home.goalsFor += match.homeScore
    home.goalsAgainst += match.awayScore
    away.goalsFor += match.awayScore
    away.goalsAgainst += match.homeScore

    if (match.homeScore > match.awayScore) {
      home.wins += 1
      home.points += 3
      away.losses += 1
    } else if (match.homeScore < match.awayScore) {
      away.wins += 1
      away.points += 3
      home.losses += 1
    } else {
      home.draws += 1
      away.draws += 1
      home.points += 1
      away.points += 1
    }
  })

  const rows = Array.from(table.values())
    .sort((a, b) => {
      const pointsDiff = b.points - a.points
      if (pointsDiff) return pointsDiff

      const goalDiffA = a.goalsFor - a.goalsAgainst
      const goalDiffB = b.goalsFor - b.goalsAgainst
      if (goalDiffB - goalDiffA) return goalDiffB - goalDiffA

      return b.goalsFor - a.goalsFor
    })
    .map((row, index) => ({ place: index + 1, ...row }))

  res.json(rows)
})

export default router
