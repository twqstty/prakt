import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

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

    const user = await prisma.user.findUnique({ where: { email } })
    const isValidPassword = user ? await bcrypt.compare(password, user.password) : false

    if (!user || !isValidPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }

    res.json({ token: createToken(user), user: publicUser(user) })
  } catch (error) {
    res.status(500).json({ message: 'Не удалось войти', error: error.message })
  }
})

export default router
