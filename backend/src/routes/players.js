import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const players = await prisma.player.findMany({
    include: { club: true },
    orderBy: [{ rating: 'desc' }, { price: 'desc' }],
  })
  res.json(players)
})

router.post('/', authMiddleware, async (req, res) => {
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

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.player.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Игрок удален' })
  } catch (error) {
    res.status(404).json({ message: 'Не удалось удалить игрока', error: error.message })
  }
})

export default router
