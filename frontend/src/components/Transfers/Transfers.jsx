import { useState } from 'react'
import './Transfers.css'

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function Transfers({ clubs, players, transfers, apiRequest, reloadData, isAuthenticated, user }) {
  const [form, setForm] = useState({ playerId: '', toClubId: user?.clubId || '', price: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => {
      if (name === 'playerId') {
        const player = players.find((item) => item.id === Number(value))
        return { ...current, playerId: value, price: player?.price || '' }
      }

      return { ...current, [name]: value }
    })
  }

  const selectedClub = clubs.find((club) => club.id === Number(form.toClubId))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!isAuthenticated) {
      setError('Оформление трансферов доступно только авторизованным клубам.')
      return
    }

    if (selectedClub && Number(form.price) > selectedClub.budget) {
      setError('Бюджета клуба недостаточно для этой сделки.')
      return
    }

    setSubmitting(true)
    try {
      await apiRequest('/api/transfers', {
        method: 'POST',
        body: JSON.stringify({
          playerId: Number(form.playerId),
          toClubId: Number(form.toClubId),
          price: Number(form.price),
        }),
      })
      setForm({ playerId: '', toClubId: '', price: '' })
      setMessage('Трансфер успешно оформлен.')
      await reloadData()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section transfers-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Трансферы</p>
          <h2>Покупка игроков и история сделок</h2>
          <p>Операции рынка фиксируют игрока, клуб-покупатель и сумму сделки.</p>
        </div>
      </div>

      <div className="transfer-layout">
        <form className="panel form-stack" onSubmit={handleSubmit}>
          <label>
            Игрок
            <select name="playerId" value={form.playerId} onChange={handleChange} required>
              <option value="">Игрок трансфера</option>
              {players
                .filter((player) => player.clubId !== Number(form.toClubId))
                .map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} - {player.club?.name || 'Свободный агент'}
                </option>
              ))}
            </select>
          </label>
          <label>
            Новый клуб
            <select name="toClubId" value={form.toClubId} onChange={handleChange} required>
              <option value="">Клуб-покупатель</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Цена
            <input
              min="0"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="75000000"
              required
            />
          </label>
          {selectedClub && (
            <div className="transfer-budget">
              <span>Бюджет покупателя</span>
              <strong>{money.format(selectedClub.budget)}</strong>
            </div>
          )}
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Оформление...' : 'Купить игрока'}
          </button>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Игрок</th>
                <th>Из клуба</th>
                <th>В клуб</th>
                <th>Цена</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td>{transfer.player?.name}</td>
                  <td>{transfer.fromClub?.name || 'Свободный агент'}</td>
                  <td>{transfer.toClub?.name}</td>
                  <td>{money.format(transfer.price)}</td>
                  <td>{new Date(transfer.transferDate).toLocaleDateString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!transfers.length && <div className="empty-state">История трансферов пуста.</div>}
        </div>
      </div>
    </section>
  )
}

export default Transfers
