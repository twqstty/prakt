import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const transfers = await prisma.transfer.findMany({
    include: {
      player: true,
      fromClub: true,
      toClub: true,
    },
    orderBy: { transferDate: 'desc' },
  })
  res.json(transfers)
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { playerId, toClubId, price } = req.body

    if (!playerId || !toClubId || price === undefined) {
      return res.status(400).json({ message: 'Заполните playerId, toClubId и price' })
    }

    const player = await prisma.player.findUnique({ where: { id: Number(playerId) } })
    if (!player) {
      return res.status(404).json({ message: 'Игрок не найден' })
    }

    if (player.clubId === Number(toClubId)) {
      return res.status(400).json({ message: 'Игрок уже находится в этом клубе' })
    }

    const transfer = await prisma.$transaction(async (tx) => {
      const createdTransfer = await tx.transfer.create({
        data: {
          playerId: Number(playerId),
          fromClubId: player.clubId,
          toClubId: Number(toClubId),
          price: Number(price),
        },
      })

      await tx.player.update({
        where: { id: Number(playerId) },
        data: { clubId: Number(toClubId), price: Number(price) },
      })

      return createdTransfer
    })

    const transferWithRelations = await prisma.transfer.findUnique({
      where: { id: transfer.id },
      include: {
        player: true,
        fromClub: true,
        toClub: true,
      },
    })

    res.status(201).json(transferWithRelations)
  } catch (error) {
    res.status(500).json({ message: 'Не удалось оформить трансфер', error: error.message })
  }
})

export default router
