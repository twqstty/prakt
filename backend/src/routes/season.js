import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

function createRoundRobin(clubs) {
  if (clubs.length < 2) return []

  const teams = [...clubs]
  if (teams.length % 2 !== 0) teams.push({ id: null, name: 'BYE' })

  const rounds = []
  const totalRounds = teams.length - 1
  const half = teams.length / 2
  let rotation = [...teams]

  for (let roundNumber = 1; roundNumber <= totalRounds; roundNumber += 1) {
    const pairs = []

    for (let index = 0; index < half; index += 1) {
      const home = rotation[index]
      const away = rotation[rotation.length - 1 - index]
      if (home.id && away.id) {
        pairs.push(roundNumber % 2 === 0 ? { home, away } : { home: away, away: home })
      }
    }

    rounds.push({ number: roundNumber, pairs })
    rotation = [rotation[0], rotation[rotation.length - 1], ...rotation.slice(1, -1)]
  }

  return rounds
}

function resultLabel(match) {
  if (match.homeScore > match.awayScore) return `${match.homeClub.name} обыграл ${match.awayClub.name}`
  if (match.homeScore < match.awayScore) return `${match.awayClub.name} обыграл ${match.homeClub.name}`
  return `${match.homeClub.name} и ${match.awayClub.name} сыграли вничью`
}

router.get('/calendar', async (req, res) => {
  const [clubs, matchRounds] = await Promise.all([
    prisma.club.findMany({ orderBy: { name: 'asc' } }),
    prisma.matchRound.findMany({
      include: { matches: true },
      orderBy: { number: 'asc' },
    }),
  ])

  const playedRounds = new Map(matchRounds.map((round) => [round.number, round]))
  const calendar = createRoundRobin(clubs).map((round) => {
    const playedRound = playedRounds.get(round.number)
    return {
      ...round,
      matchDate: playedRound?.matchDate || null,
      played: Boolean(playedRound),
      playedMatches: playedRound?.matches.length || 0,
    }
  })

  res.json(calendar)
})

router.get('/news', async (req, res) => {
  const [matches, transfers] = await Promise.all([
    prisma.match.findMany({
      include: {
        awayClub: true,
        events: true,
        homeClub: true,
        matchRound: true,
      },
      orderBy: [{ id: 'desc' }],
      take: 12,
    }),
    prisma.transfer.findMany({
      include: {
        player: true,
        toClub: true,
      },
      orderBy: { transferDate: 'desc' },
      take: 6,
    }),
  ])

  const matchNews = matches.map((match) => {
    const goals = match.events.filter((event) => event.type === 'GOAL')
    const cards = match.events.filter((event) => event.type === 'RED_CARD')

    return {
      id: `match-${match.id}`,
      title: `${resultLabel(match)} ${match.homeScore}:${match.awayScore}`,
      subtitle: `${match.matchRound ? `Тур ${match.matchRound.number}` : 'Матч'} · голов: ${goals.length} · красных: ${cards.length}`,
      type: 'match',
    }
  })

  const transferNews = transfers.map((transfer) => ({
    id: `transfer-${transfer.id}`,
    title: `${transfer.player.name} перешел в ${transfer.toClub.name}`,
    subtitle: `Сумма сделки: €${transfer.price.toLocaleString('ru-RU')}`,
    type: 'transfer',
  }))

  res.json([...matchNews, ...transferNews].slice(0, 14))
})

router.get('/player-stats', async (req, res) => {
  const players = await prisma.player.findMany({
    include: { club: true },
    orderBy: [{ goals: 'desc' }, { assists: 'desc' }, { rating: 'desc' }],
    take: 50,
  })

  res.json(players)
})

export default router
