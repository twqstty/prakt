import { useMemo, useState } from 'react'
import './MyClub.css'

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function MyClub({ clubs, players, user, apiRequest, reloadData, onUserUpdate }) {
  const [selectedClubId, setSelectedClubId] = useState(user?.clubId || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const myClub = clubs.find((club) => club.id === user?.clubId)
  const squad = players.filter((player) => player.clubId === user?.clubId)

  const squadStats = useMemo(() => {
    const totalValue = squad.reduce((sum, player) => sum + player.price, 0)
    const averageAge = squad.length
      ? Math.round((squad.reduce((sum, player) => sum + player.age, 0) / squad.length) * 10) / 10
      : 0
    const averageRating = squad.length
      ? Math.round(squad.reduce((sum, player) => sum + player.rating, 0) / squad.length)
      : 0

    return { averageAge, averageRating, totalValue }
  }, [squad])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setSaving(true)

    try {
      const updatedUser = await apiRequest('/api/auth/me/club', {
        method: 'PUT',
        body: JSON.stringify({ clubId: Number(selectedClubId) }),
      })
      onUserUpdate(updatedUser)
      await reloadData()
      setMessage('Клуб назначен профилю менеджера.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="section my-club-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Мой клуб</p>
          <h2>{myClub ? myClub.name : 'Выбор клуба'}</h2>
          <p>Персональный кабинет менеджера с бюджетом, составом и рыночной стоимостью.</p>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form className="panel club-select-panel" onSubmit={handleSubmit}>
        <label>
          Клуб менеджера
          <select
            value={selectedClubId}
            onChange={(event) => setSelectedClubId(event.target.value)}
            required
          >
            <option value="">Назначить клуб</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={saving}>
          {saving ? 'Сохранение...' : myClub ? 'Сменить клуб' : 'Выбрать клуб'}
        </button>
      </form>

      {myClub ? (
        <>
          <div className="my-club-stats">
            <article className="card">
              <span>Бюджет</span>
              <strong>{money.format(myClub.budget)}</strong>
            </article>
            <article className="card">
              <span>Рейтинг клуба</span>
              <strong>{myClub.rating}</strong>
            </article>
            <article className="card">
              <span>Стоимость состава</span>
              <strong>{money.format(squadStats.totalValue)}</strong>
            </article>
            <article className="card">
              <span>Средний рейтинг</span>
              <strong>{squadStats.averageRating || '-'}</strong>
            </article>
            <article className="card">
              <span>Средний возраст</span>
              <strong>{squadStats.averageAge || '-'}</strong>
            </article>
          </div>

          {squad.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Игрок</th>
                    <th>Возраст</th>
                    <th>Позиция</th>
                    <th>Рейтинг</th>
                    <th>Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {squad.map((player) => (
                    <tr key={player.id}>
                      <td>{player.name}</td>
                      <td>{player.age}</td>
                      <td>{player.position}</td>
                      <td>{player.rating}</td>
                      <td>{money.format(player.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">Состав клуба пуст.</div>
          )}
        </>
      ) : (
        <div className="empty-state">Клуб менеджера еще не назначен.</div>
      )}
    </section>
  )
}

export default MyClub
