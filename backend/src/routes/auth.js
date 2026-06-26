import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    clubId: user.clubId,
    club: user.club || null,
  }
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Заполните username, email и password' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль должен быть не короче 6 символов' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким email уже существует' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER',
      },
      include: { club: true },
    })

    res.status(201).json({ token: createToken(user), user: publicUser(user) })
  } catch (error) {
    res.status(500).json({ message: 'Не удалось зарегистрироваться', error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Заполните email и password' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { club: true },
    })
    const isValidPassword = user ? await bcrypt.compare(password, user.password) : false

    if (!user || !isValidPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }

    res.json({ token: createToken(user), user: publicUser(user) })
  } catch (error) {
    res.status(500).json({ message: 'Не удалось войти', error: error.message })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { club: true },
    })

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    res.json(publicUser(user))
  } catch (error) {
    res.status(500).json({ message: 'Не удалось получить профиль', error: error.message })
  }
})

router.put('/me/club', authMiddleware, async (req, res) => {
  try {
    const { clubId } = req.body

    if (!clubId) {
      return res.status(400).json({ message: 'Выберите клуб' })
    }

    const club = await prisma.club.findUnique({ where: { id: Number(clubId) } })
    if (!club) {
      return res.status(404).json({ message: 'Клуб не найден' })
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { clubId: Number(clubId) },
      include: { club: true },
    })

    res.json(publicUser(user))
  } catch (error) {
    res.status(500).json({ message: 'Не удалось назначить клуб', error: error.message })
  }
})

export default router
