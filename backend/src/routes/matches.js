import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function averagePlayerRating(players) {
  if (!players.length) return 65
  return players.reduce((sum, player) => sum + player.rating, 0) / players.length
}

function calculateTeamPower(club, homeBonus = 0) {
  const squadRating = averagePlayerRating(club.players)
  return club.rating * 0.4 + squadRating * 0.6 + homeBonus + randomBetween(-8, 8)
}

function generateGoals(attackingPower, defendingPower) {
  const powerDiff = attackingPower - defendingPower
  const expectedGoals = Math.max(0.25, Math.min(3.8, 1.25 + powerDiff * 0.055))
  let goals = 0
  let chance = expectedGoals

  while (chance > 0) {
    if (Math.random() < Math.min(0.82, chance / 2.4)) goals += 1
    chance -= 0.85
  }

  if (Math.random() < 0.06) goals += 1
  return Math.min(goals, 6)
}

function calculateXg(attackingPower, defendingPower) {
  const powerDiff = attackingPower - defendingPower
  return Math.max(0.35, Math.min(4.2, 1.25 + powerDiff * 0.05 + randomBetween(-0.25, 0.35)))
}

function generateShots(xg, goals) {
  const shots = Math.max(goals + 3, Math.round(xg * randomBetween(5.2, 7.2) + randomBetween(1, 5)))
  const shotsOnTarget = Math.max(goals, Math.min(shots, Math.round(xg * randomBetween(2.0, 3.2) + goals)))
  return { shots, shotsOnTarget }
}

function pickPlayer(players, preferredPositions = []) {
  const preferred = players.filter((player) => preferredPositions.includes(player.position))
  const pool = preferred.length ? preferred : players
  return pool[Math.floor(Math.random() * pool.length)]
}

function uniqueMinute(usedMinutes) {
  let minute = Math.floor(randomBetween(2, 91))
  while (usedMinutes.has(minute)) minute = Math.floor(randomBetween(2, 91))
  usedMinutes.add(minute)
  return minute
}

function createGoalEvents(club, goals, usedMinutes) {
  const events = []
  for (let index = 0; index < goals; index += 1) {
    const scorer = pickPlayer(club.players, ['ST', 'LW', 'RW', 'CAM', 'CM'])
    events.push({
      clubName: club.name,
      detail: 'Гол',
      minute: uniqueMinute(usedMinutes),
      player: scorer?.name || 'Unknown player',
      type: 'GOAL',
    })
  }
  return events
}

function createCardEvents(club, usedMinutes) {
  const events = []
  const yellowCards = Math.floor(randomBetween(0, 4.4))
  const redCards = Math.random() < 0.12 ? 1 : 0

  for (let index = 0; index < yellowCards; index += 1) {
    const player = pickPlayer(club.players, ['CB', 'LB', 'RB', 'CDM', 'CM'])
    events.push({
      clubName: club.name,
      detail: 'Желтая карточка',
      minute: uniqueMinute(usedMinutes),
      player: player?.name || 'Unknown player',
      type: 'YELLOW_CARD',
    })
  }

  for (let index = 0; index < redCards; index += 1) {
    const player = pickPlayer(club.players, ['CB', 'LB', 'RB', 'CDM'])
    events.push({
      clubName: club.name,
      detail: 'Красная карточка',
      minute: uniqueMinute(usedMinutes),
      player: player?.name || 'Unknown player',
      type: 'RED_CARD',
    })
  }

  return events
}

function roundXg(value) {
  return Math.round(value * 100) / 100
}

async function getNextRoundNumber(client) {
  const latestRound = await client.matchRound.findFirst({
    orderBy: { number: 'desc' },
    select: { number: true },
  })

  return (latestRound?.number || 0) + 1
}

function createSimulationData(homeClub, awayClub, matchDate, round = 0, roundId = null) {
  const homePower = calculateTeamPower(homeClub, 3)
  const awayPower = calculateTeamPower(awayClub)
  const homeXg = calculateXg(homePower, awayPower)
  const awayXg = calculateXg(awayPower, homePower)
  const homeScore = generateGoals(homePower, awayPower)
  const awayScore = generateGoals(awayPower, homePower)
  const homeShotStats = generateShots(homeXg, homeScore)
  const awayShotStats = generateShots(awayXg, awayScore)
  const usedMinutes = new Set()
  const events = [
    ...createGoalEvents(homeClub, homeScore, usedMinutes),
    ...createGoalEvents(awayClub, awayScore, usedMinutes),
    ...createCardEvents(homeClub, usedMinutes),
    ...createCardEvents(awayClub, usedMinutes),
  ].sort((a, b) => a.minute - b.minute)

  return {
    data: {
      homeClubId: homeClub.id,
      awayClubId: awayClub.id,
      homeScore,
      awayScore,
      homeShots: homeShotStats.shots,
      awayShots: awayShotStats.shots,
      homeShotsOnTarget: homeShotStats.shotsOnTarget,
      awayShotsOnTarget: awayShotStats.shotsOnTarget,
      homeXg: roundXg(homeXg),
      awayXg: roundXg(awayXg),
      round,
      roundId,
      matchDate: new Date(matchDate),
      events: {
        create: events,
      },
    },
    simulation: {
      awayPower: Math.round(awayPower * 10) / 10,
      homePower: Math.round(homePower * 10) / 10,
    },
  }
}

async function createSimulatedMatch(client, homeClub, awayClub, matchDate, round = 0, roundId = null) {
  const simulationData = createSimulationData(homeClub, awayClub, matchDate, round, roundId)
  const match = await client.match.create({
    data: simulationData.data,
    include: {
      homeClub: true,
      awayClub: true,
      matchRound: true,
      events: {
        orderBy: { minute: 'asc' },
      },
    },
  })

  return {
    ...match,
    simulation: simulationData.simulation,
  }
}

function shuffleClubs(clubs) {
  return [...clubs].sort(() => Math.random() - 0.5)
}

router.get('/', async (req, res) => {
  const matches = await prisma.match.findMany({
    include: {
      homeClub: true,
      awayClub: true,
      matchRound: true,
      events: {
        orderBy: { minute: 'asc' },
      },
    },
    orderBy: [{ round: 'desc' }, { matchDate: 'desc' }, { id: 'desc' }],
  })
  res.json(matches)
})

router.post('/simulate', authMiddleware, async (req, res) => {
  try {
    const { homeClubId, awayClubId, matchDate } = req.body

    if (!homeClubId || !awayClubId || !matchDate) {
      return res.status(400).json({ message: 'Заполните клубы и дату матча' })
    }

    if (Number(homeClubId) === Number(awayClubId)) {
      return res.status(400).json({ message: 'Клубы в матче должны отличаться' })
    }

    const [homeClub, awayClub] = await Promise.all([
      prisma.club.findUnique({
        where: { id: Number(homeClubId) },
        include: { players: true },
      }),
      prisma.club.findUnique({
        where: { id: Number(awayClubId) },
        include: { players: true },
      }),
    ])

    if (!homeClub || !awayClub) {
      return res.status(404).json({ message: 'Один из клубов не найден' })
    }

    const match = await createSimulatedMatch(prisma, homeClub, awayClub, matchDate)

    res.status(201).json(match)
  } catch (error) {
    res.status(500).json({ message: 'Не удалось симулировать матч', error: error.message })
  }
})

router.post('/simulate-round', authMiddleware, async (req, res) => {
  try {
    const { matchDate } = req.body

    if (!matchDate) {
      return res.status(400).json({ message: 'Укажите дату тура' })
    }

    const clubs = await prisma.club.findMany({
      include: { players: true },
      orderBy: { name: 'asc' },
    })

    if (clubs.length < 2) {
      return res.status(400).json({ message: 'Недостаточно клубов для тура' })
    }

    if (clubs.length % 2 !== 0) {
      return res.status(400).json({ message: 'Для тура нужно четное количество клубов' })
    }

    const shuffledClubs = shuffleClubs(clubs)
    const pairings = []

    for (let index = 0; index < shuffledClubs.length; index += 2) {
      const firstClub = shuffledClubs[index]
      const secondClub = shuffledClubs[index + 1]
      const shouldSwapHome = pairings.length % 2 === 1
      pairings.push({
        homeClub: shouldSwapHome ? secondClub : firstClub,
        awayClub: shouldSwapHome ? firstClub : secondClub,
      })
    }

    const matches = await prisma.$transaction(async (tx) => {
      const round = await tx.matchRound.create({
        data: {
          matchDate: new Date(matchDate),
          number: await getNextRoundNumber(tx),
        },
      })
      const createdMatches = []
      for (const pairing of pairings) {
        const match = await createSimulatedMatch(
          tx,
          pairing.homeClub,
          pairing.awayClub,
          matchDate,
          round.number,
          round.id,
        )
        createdMatches.push(match)
      }
      return createdMatches
    })

    res.status(201).json({
      message: `Тур ${matches[0]?.matchRound?.number || matches[0]?.round || ''} сыгран: ${matches.length} матчей`,
      matches,
    })
  } catch (error) {
    res.status(500).json({ message: 'Не удалось симулировать тур', error: error.message })
  }
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
        round: 0,
        matchDate: new Date(matchDate),
      },
      include: {
        homeClub: true,
        awayClub: true,
        matchRound: true,
        events: true,
      },
    })

    res.status(201).json(match)
  } catch (error) {
    res.status(500).json({ message: 'Не удалось добавить матч', error: error.message })
  }
})

export default router
