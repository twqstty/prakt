import { useMemo, useState } from 'react'
import './Players.css'

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function statusLabel(player) {
  const now = new Date()
  if (player.injuredUntil && new Date(player.injuredUntil) >= now) return 'Травма'
  if (player.suspendedUntil && new Date(player.suspendedUntil) >= now) return 'Дискв.'
  return 'Готов'
}

const statSorts = {
  appearances: 'Матчи',
  assists: 'А',
  goals: 'Г',
  redCards: 'КК',
  yellowCards: 'ЖК',
}

function SortButton({ active, direction, label, onClick }) {
  const marker = active ? (direction === 'desc' ? '↓' : '↑') : ''

  return (
    <button className={active ? 'sort-header active' : 'sort-header'} type="button" onClick={onClick}>
      {label}
      {marker && <span>{marker}</span>}
    </button>
  )
}

function Players({ players }) {
  const [filters, setFilters] = useState({
    ageMax: '',
    ageMin: '',
    club: '',
    name: '',
    position: '',
    priceMax: '',
    priceMin: '',
    ratingMax: '',
    ratingMin: '',
  })
  const [sort, setSort] = useState({ direction: null, field: null })

  const positions = useMemo(
    () => [...new Set(players.map((player) => player.position).filter(Boolean))].sort(),
    [players],
  )

  const clubs = useMemo(
    () => [...new Set(players.map((player) => player.club?.name).filter(Boolean))].sort(),
    [players],
  )

  const filteredPlayers = useMemo(() => {
    const result = players.filter((player) => {
        const clubName = player.club?.name || 'Свободный агент'
        const normalizedName = player.name.toLowerCase()

        return (
          (!filters.name || normalizedName.includes(filters.name.toLowerCase())) &&
          (!filters.position || player.position === filters.position) &&
          (!filters.club || clubName === filters.club) &&
          (!filters.ageMin || player.age >= Number(filters.ageMin)) &&
          (!filters.ageMax || player.age <= Number(filters.ageMax)) &&
          (!filters.ratingMin || player.rating >= Number(filters.ratingMin)) &&
          (!filters.ratingMax || player.rating <= Number(filters.ratingMax)) &&
          (!filters.priceMin || player.price >= Number(filters.priceMin)) &&
          (!filters.priceMax || player.price <= Number(filters.priceMax))
        )
      })

    if (!sort.field || !sort.direction) return result

    return [...result].sort((firstPlayer, secondPlayer) => {
      const firstValue = firstPlayer[sort.field] || 0
      const secondValue = secondPlayer[sort.field] || 0
      const diff = firstValue - secondValue

      if (diff === 0) return firstPlayer.name.localeCompare(secondPlayer.name)
      return sort.direction === 'asc' ? diff : -diff
    })
  }, [filters, players, sort])

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const resetFilters = () => {
    setFilters({
      ageMax: '',
      ageMin: '',
      club: '',
      name: '',
      position: '',
      priceMax: '',
      priceMin: '',
      ratingMax: '',
      ratingMin: '',
    })
  }

  const toggleSort = (field) => {
    setSort((current) => {
      if (current.field !== field) return { direction: 'desc', field }
      if (current.direction === 'desc') return { direction: 'asc', field }
      return { direction: null, field: null }
    })
  }

  return (
    <section className="section players-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Игроки</p>
          <h2>Скаутский список</h2>
          <p>Возраст, позиция, рейтинг, цена и текущий клуб каждого футболиста.</p>
        </div>
        <span className="players-count">
          {filteredPlayers.length} / {players.length}
        </span>
      </div>

      {players.length ? (
        <>
          <div className="panel players-filters">
            <label>
              Имя
              <input
                name="name"
                value={filters.name}
                onChange={updateFilter}
                placeholder="Поиск игрока"
              />
            </label>
            <label>
              Позиция
              <select name="position" value={filters.position} onChange={updateFilter}>
                <option value="">Все позиции</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Клуб
              <select name="club" value={filters.club} onChange={updateFilter}>
                <option value="">Все клубы</option>
                {clubs.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Возраст от
              <input name="ageMin" type="number" value={filters.ageMin} onChange={updateFilter} />
            </label>
            <label>
              Возраст до
              <input name="ageMax" type="number" value={filters.ageMax} onChange={updateFilter} />
            </label>
            <label>
              Рейтинг от
              <input
                max="100"
                min="1"
                name="ratingMin"
                type="number"
                value={filters.ratingMin}
                onChange={updateFilter}
              />
            </label>
            <label>
              Рейтинг до
              <input
                max="100"
                min="1"
                name="ratingMax"
                type="number"
                value={filters.ratingMax}
                onChange={updateFilter}
              />
            </label>
            <label>
              Цена от
              <input
                min="0"
                name="priceMin"
                type="number"
                value={filters.priceMin}
                onChange={updateFilter}
                placeholder="10000000"
              />
            </label>
            <label>
              Цена до
              <input
                min="0"
                name="priceMax"
                type="number"
                value={filters.priceMax}
                onChange={updateFilter}
                placeholder="100000000"
              />
            </label>
            <button className="secondary" type="button" onClick={resetFilters}>
              Сбросить
            </button>
          </div>

          {filteredPlayers.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Возраст</th>
                    <th>Позиция</th>
                    <th>Рейтинг</th>
                    <th>Цена</th>
                    {Object.entries(statSorts).map(([field, label]) => (
                      <th key={field}>
                        <SortButton
                          active={sort.field === field}
                          direction={sort.direction}
                          label={label}
                          onClick={() => toggleSort(field)}
                        />
                      </th>
                    ))}
                    <th>Статус</th>
                    <th>Клуб</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.id}>
                      <td className="player-name">{player.name}</td>
                      <td>{player.age}</td>
                      <td>
                        <span className="position-pill">{player.position}</span>
                      </td>
                      <td>{player.rating}</td>
                      <td>{money.format(player.price)}</td>
                      <td>{player.appearances || 0}</td>
                      <td>{player.goals || 0}</td>
                      <td>{player.assists || 0}</td>
                      <td>{player.yellowCards || 0}</td>
                      <td>{player.redCards || 0}</td>
                      <td>
                        <span className={`status-pill ${statusLabel(player) === 'Готов' ? 'ready' : 'blocked'}`}>
                          {statusLabel(player)}
                        </span>
                      </td>
                      <td>{player.club?.name || 'Свободный агент'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">По заданным фильтрам игроки не найдены.</div>
          )}
        </>
      ) : (
        <div className="empty-state">Игроки отсутствуют.</div>
      )}
    </section>
  )
}

export default Players
