import { useMemo, useState } from 'react'
import './Matches.css'

const eventLabels = {
  GOAL: 'Гол',
  RED_CARD: 'Красная карточка',
  YELLOW_CARD: 'Желтая карточка',
}

function Matches({ clubs, matches, apiRequest, reloadData }) {
  const [form, setForm] = useState({
    awayClubId: '',
    homeClubId: '',
    matchDate: new Date().toISOString().slice(0, 10),
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [roundSimulating, setRoundSimulating] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [selectedRoundKey, setSelectedRoundKey] = useState('')
  const rounds = useMemo(() => {
    const groupedMatches = matches.reduce((groups, match) => {
      const roundNumber = match.matchRound?.number || match.round || 0
      const key = match.matchRound?.id ? `round-${match.matchRound.id}` : `single-${roundNumber || 'matches'}`
      const label = roundNumber > 0 ? `Тур ${roundNumber}` : 'Одиночные матчи'

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label,
          order: roundNumber || -1,
          matches: [],
        })
      }

      groups.get(key).matches.push(match)
      return groups
    }, new Map())

    return [...groupedMatches.values()]
      .sort((firstRound, secondRound) => secondRound.order - firstRound.order)
      .map((roundGroup) => ({
        ...roundGroup,
        matches: roundGroup.matches.sort((firstMatch, secondMatch) => firstMatch.id - secondMatch.id),
      }))
  }, [matches])
  const selectedRound = rounds.find((roundGroup) => roundGroup.key === selectedRoundKey) || rounds[0]

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const simulateMatch = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (form.homeClubId === form.awayClubId) {
      setError('Клубы в матче должны отличаться.')
      return
    }

    setSimulating(true)
    try {
      const match = await apiRequest('/api/matches/simulate', {
        method: 'POST',
        body: JSON.stringify({
          awayClubId: Number(form.awayClubId),
          homeClubId: Number(form.homeClubId),
          matchDate: form.matchDate,
        }),
      })
      setMessage(
        `${match.homeClub.name} ${match.homeScore}:${match.awayScore} ${match.awayClub.name}`,
      )
      setSelectedRoundKey('single-matches')
      await reloadData()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSimulating(false)
    }
  }

  const simulateRound = async () => {
    setMessage('')
    setError('')
    setRoundSimulating(true)

    try {
      const result = await apiRequest('/api/matches/simulate-round', {
        method: 'POST',
        body: JSON.stringify({ matchDate: form.matchDate }),
      })
      setMessage(result.message)
      const newRoundId = result.matches?.[0]?.matchRound?.id
      if (newRoundId) setSelectedRoundKey(`round-${newRoundId}`)
      await reloadData()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setRoundSimulating(false)
    }
  }

  return (
    <section className="section matches-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Матчи</p>
          <h2>Результаты тура</h2>
          <p>Список сыгранных матчей с командами, счетом и датой встречи.</p>
        </div>
      </div>

      <form className="panel simulate-panel" onSubmit={simulateMatch}>
        <label>
          Хозяева
          <select name="homeClubId" value={form.homeClubId} onChange={updateForm} required>
            <option value="">Клуб хозяев</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Гости
          <select name="awayClubId" value={form.awayClubId} onChange={updateForm} required>
            <option value="">Клуб гостей</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Дата
          <input name="matchDate" type="date" value={form.matchDate} onChange={updateForm} required />
        </label>
        <button type="submit" disabled={simulating}>
          {simulating ? 'Симуляция...' : 'Симулировать матч'}
        </button>
        <button className="secondary" type="button" onClick={simulateRound} disabled={roundSimulating}>
          {roundSimulating ? 'Симуляция тура...' : 'Симулировать тур'}
        </button>
      </form>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {rounds.length ? (
        <div className="round-results">
          <div className="round-tabs" aria-label="Выбор тура">
            {rounds.map((roundGroup) => (
              <button
                className={roundGroup.key === selectedRound?.key ? 'active' : ''}
                key={roundGroup.key}
                type="button"
                onClick={() => setSelectedRoundKey(roundGroup.key)}
              >
                {roundGroup.label}
              </button>
            ))}
          </div>

          {selectedRound && (
            <section className="selected-round">
              <div className="selected-round-header">
                <h3>{selectedRound.label}</h3>
                <span>{selectedRound.matches.length} матчей</span>
              </div>

              <div className="round-match-list">
                {selectedRound.matches.map((match) => (
                <article className="match-card" key={match.id}>
                  <div className="match-main">
                    <div className="team-name">{match.homeClub?.name}</div>
                    <div className="match-score">
                      <strong>
                        {match.homeScore}:{match.awayScore}
                      </strong>
                      <span>{new Date(match.matchDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="team-name away">{match.awayClub?.name}</div>
                  </div>

                  <div className="match-stats">
                    <div>
                      <strong>{match.homeShots}</strong>
                      <span>Удары</span>
                      <strong>{match.awayShots}</strong>
                    </div>
                    <div>
                      <strong>{match.homeShotsOnTarget}</strong>
                      <span>В створ</span>
                      <strong>{match.awayShotsOnTarget}</strong>
                    </div>
                    <div>
                      <strong>{Number(match.homeXg).toFixed(2)}</strong>
                      <span>xG</span>
                      <strong>{Number(match.awayXg).toFixed(2)}</strong>
                    </div>
                  </div>

                  {match.events?.length ? (
                    <div className="match-events">
                      {match.events.map((event) => (
                        <div className={`match-event ${event.type.toLowerCase()}`} key={event.id}>
                          <span className="event-minute">{event.minute}'</span>
                          <span>{eventLabels[event.type] || event.type}</span>
                          <strong>{event.player}</strong>
                          <small>{event.clubName}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="match-events empty-events">События матча отсутствуют.</div>
                  )}
                </article>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="empty-state">Матчи отсутствуют.</div>
      )}
    </section>
  )
}

export default Matches
