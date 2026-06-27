import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { adminMiddleware, authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const clubs = await prisma.club.findMany({ orderBy: { rating: 'desc' } })
  res.json(clubs)
})

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, city, budget, rating } = req.body

    if (!name || !city || budget === undefined || rating === undefined) {
      return res.status(400).json({ message: 'Заполните name, city, budget и rating' })
    }

    const club = await prisma.club.create({
      data: {
        name,
        city,
        budget: Number(budget),
        rating: Number(rating),
      },
    })

    res.status(201).json(club)
  } catch (error) {
    res.status(500).json({ message: 'Не удалось добавить клуб', error: error.message })
  }
})

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.club.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Клуб удален' })
  } catch (error) {
    res.status(404).json({ message: 'Не удалось удалить клуб', error: error.message })
  }
})

export default router
