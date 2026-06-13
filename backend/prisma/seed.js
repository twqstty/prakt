import 'dotenv/config'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.transfer.deleteMany()
  await prisma.match.deleteMany()
  await prisma.player.deleteMany()
  await prisma.club.deleteMany()
  await prisma.user.deleteMany()

  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@football.local',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const clubs = await Promise.all([
    prisma.club.create({
      data: { name: 'Manchester City', city: 'Manchester', budget: 250000000, rating: 94 },
    }),
    prisma.club.create({
      data: { name: 'Real Madrid', city: 'Madrid', budget: 280000000, rating: 95 },
    }),
    prisma.club.create({
      data: { name: 'Bayern Munich', city: 'Munich', budget: 220000000, rating: 92 },
    }),
    prisma.club.create({
      data: { name: 'Inter Milan', city: 'Milan', budget: 145000000, rating: 89 },
    }),
  ])

  const [city, real, bayern, inter] = clubs

  await prisma.player.createMany({
    data: [
      { name: 'Erling Haaland', age: 25, position: 'ST', rating: 93, price: 180000000, clubId: city.id },
      { name: 'Phil Foden', age: 26, position: 'CAM', rating: 89, price: 120000000, clubId: city.id },
      { name: 'Jude Bellingham', age: 23, position: 'CM', rating: 92, price: 170000000, clubId: real.id },
      { name: 'Vinicius Junior', age: 25, position: 'LW', rating: 91, price: 160000000, clubId: real.id },
      { name: 'Jamal Musiala', age: 23, position: 'CAM', rating: 90, price: 135000000, clubId: bayern.id },
      { name: 'Harry Kane', age: 32, position: 'ST', rating: 91, price: 95000000, clubId: bayern.id },
      { name: 'Lautaro Martinez', age: 28, position: 'ST', rating: 88, price: 90000000, clubId: inter.id },
      { name: 'Nicolo Barella', age: 29, position: 'CM', rating: 87, price: 75000000, clubId: inter.id },
    ],
  })

  await prisma.match.createMany({
    data: [
      {
        homeClubId: city.id,
        awayClubId: real.id,
        homeScore: 2,
        awayScore: 2,
        matchDate: new Date('2026-02-18'),
      },
      {
        homeClubId: bayern.id,
        awayClubId: inter.id,
        homeScore: 3,
        awayScore: 1,
        matchDate: new Date('2026-02-19'),
      },
      {
        homeClubId: real.id,
        awayClubId: bayern.id,
        homeScore: 1,
        awayScore: 0,
        matchDate: new Date('2026-02-26'),
      },
      {
        homeClubId: inter.id,
        awayClubId: city.id,
        homeScore: 0,
        awayScore: 2,
        matchDate: new Date('2026-02-27'),
      },
    ],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('Seed data created')
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
