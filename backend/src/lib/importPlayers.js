import { readFile } from 'node:fs/promises'

function parseCsv(content) {
  const rows = []
  let cell = ''
  let row = []
  let insideQuotes = false

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    const nextChar = content[index + 1]

    if (char === '"' && nextChar === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      insideQuotes = !insideQuotes
    } else if (char === ',' && !insideQuotes) {
      row.push(cell.trim())
      cell = ''
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell || row.length) {
    row.push(cell.trim())
    if (row.some(Boolean)) rows.push(row)
  }

  const [headers, ...dataRows] = rows
  return dataRows.map((dataRow) =>
    Object.fromEntries(headers.map((header, index) => [header, dataRow[index] || ''])),
  )
}

function toNumber(value) {
  return Number(String(value).replace(/[^\d]/g, '')) || 0
}

function calculateRating(marketValue, age) {
  const valueScore = Math.min(36, Math.round(Math.log10(Math.max(marketValue, 1)) * 4))
  const ageScore = age >= 23 && age <= 29 ? 10 : age < 23 ? 8 : age <= 32 ? 6 : 2
  return Math.max(55, Math.min(99, 48 + valueScore + ageScore))
}

function calculateClubRating(players) {
  if (!players.length) return 70
  const averageRating =
    players.reduce((sum, player) => sum + calculateRating(player.marketValue, player.age), 0) /
    players.length
  return Math.max(65, Math.min(99, Math.round(averageRating)))
}

export async function importPlayersFromCsv(prisma, csvPath) {
  const file = await readFile(csvPath, 'utf8')
  const rows = parseCsv(file).map((row) => ({
    name: row.name,
    age: toNumber(row.age),
    position: row.position,
    marketValue: toNumber(row.marketValue),
    club: row.club,
    city: row.city,
  }))

  const validRows = rows.filter(
    (row) => row.name && row.age && row.position && row.marketValue && row.club,
  )

  const rowsByClub = new Map()
  for (const row of validRows) {
    rowsByClub.set(row.club, [...(rowsByClub.get(row.club) || []), row])
  }
  const clubMap = new Map()

  for (const [clubName, clubPlayers] of rowsByClub.entries()) {
    const existingClub = await prisma.club.findFirst({ where: { name: clubName } })
    const budget = Math.max(
      50000000,
      Math.round(clubPlayers.reduce((sum, player) => sum + player.marketValue, 0) * 1.4),
    )
    const rating = calculateClubRating(clubPlayers)
    const city = clubPlayers.find((player) => player.city)?.city || 'Unknown'

    const club =
      existingClub ||
      (await prisma.club.create({
        data: {
          name: clubName,
          city,
          budget,
          rating,
        },
      }))

    if (existingClub) {
      await prisma.club.update({
        where: { id: existingClub.id },
        data: { city, budget, rating },
      })
    }

    clubMap.set(clubName, club)
  }

  let created = 0
  let updated = 0

  for (const row of validRows) {
    const club = clubMap.get(row.club)
    const rating = calculateRating(row.marketValue, row.age)
    const existingPlayer = await prisma.player.findFirst({ where: { name: row.name } })
    let savedPlayerId

    if (existingPlayer) {
      const savedPlayer = await prisma.player.update({
        where: { id: existingPlayer.id },
        data: {
          age: row.age,
          position: row.position,
          rating,
          price: row.marketValue,
          clubId: club.id,
        },
      })
      savedPlayerId = savedPlayer.id
      updated += 1
    } else {
      const savedPlayer = await prisma.player.create({
        data: {
          name: row.name,
          age: row.age,
          position: row.position,
          rating,
          price: row.marketValue,
          clubId: club.id,
        },
      })
      savedPlayerId = savedPlayer.id
      created += 1
    }

    await prisma.player.deleteMany({
      where: {
        name: row.name,
        id: { not: savedPlayerId },
      },
    })
  }

  return {
    clubs: clubMap.size,
    created,
    skipped: rows.length - validRows.length,
    updated,
  }
}
