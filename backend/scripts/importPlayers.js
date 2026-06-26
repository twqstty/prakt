import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { importPlayersFromCsv } from '../src/lib/importPlayers.js'

const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const csvPath = resolve(__dirname, '../data/transfermarkt_players.csv')

try {
  const result = await importPlayersFromCsv(prisma, csvPath)
  console.log(`Import completed: ${JSON.stringify(result)}`)
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
