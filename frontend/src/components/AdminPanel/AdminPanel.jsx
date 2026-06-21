import { useState } from 'react'
import './AdminPanel.css'

const initialClub = { name: '', city: '', budget: '', rating: '' }
const initialPlayer = { name: '', age: '', position: '', rating: '', price: '', clubId: '' }
const initialMatch = { homeClubId: '', awayClubId: '', homeScore: '', awayScore: '', matchDate: '' }

function AdminPanel({ clubs, players, apiRequest, reloadData, isAuthenticated }) {
  const [clubForm, setClubForm] = useState(initialClub)
  const [playerForm, setPlayerForm] = useState(initialPlayer)
  const [matchForm, setMatchForm] = useState(initialMatch)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const updateForm = (setter) => (event) => {
    setter((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const runAction = async (action, successMessage) => {
    setMessage('')
    setError('')

    if (!isAuthenticated) {
      setError('Админ-действия доступны только после входа.')
      return
    }

    try {
      const actionMessage = await action()
      setMessage(actionMessage || successMessage)
      await reloadData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const addClub = (event) => {
    event.preventDefault()
    runAction(async () => {
      await apiRequest('/api/clubs', {
        method: 'POST',
        body: JSON.stringify({
          ...clubForm,
          budget: Number(clubForm.budget),
          rating: Number(clubForm.rating),
        }),
      })
      setClubForm(initialClub)
    }, 'Клуб добавлен.')
  }

  const addPlayer = (event) => {
    event.preventDefault()
    runAction(async () => {
      await apiRequest('/api/players', {
        method: 'POST',
        body: JSON.stringify({
          ...playerForm,
          age: Number(playerForm.age),
          rating: Number(playerForm.rating),
          price: Number(playerForm.price),
          clubId: Number(playerForm.clubId),
        }),
      })
      setPlayerForm(initialPlayer)
    }, 'Игрок добавлен.')
  }

  const addMatch = (event) => {
    event.preventDefault()
    runAction(async () => {
      await apiRequest('/api/matches', {
        method: 'POST',
        body: JSON.stringify({
          ...matchForm,
          homeClubId: Number(matchForm.homeClubId),
          awayClubId: Number(matchForm.awayClubId),
          homeScore: Number(matchForm.homeScore),
          awayScore: Number(matchForm.awayScore),
        }),
      })
      setMatchForm(initialMatch)
    }, 'Матч добавлен.')
  }

  const deleteClub = (id) => {
    runAction(() => apiRequest(`/api/clubs/${id}`, { method: 'DELETE' }), 'Клуб удален.')
  }

  const deletePlayer = (id) => {
    runAction(() => apiRequest(`/api/players/${id}`, { method: 'DELETE' }), 'Игрок удален.')
  }

  const importPlayers = () => {
    runAction(async () => {
      const result = await apiRequest('/api/import/players', { method: 'POST' })
      return `Импорт завершен: клубов ${result.clubs}, новых игроков ${result.created}, обновлено ${result.updated}.`
    }, 'Импорт игроков завершен.')
  }

  return (
    <section className="section admin-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Админ-панель</p>
          <h2>Управление данными лиги</h2>
          <p>Операционный модуль для ведения клубов, составов и календаря матчей.</p>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="panel import-panel">
        <div>
          <h3>Импорт игроков из датасета</h3>
          <p>
            Загрузка CSV-данных с реальными клубами, позициями и рыночной стоимостью.
          </p>
        </div>
        <button type="button" onClick={importPlayers}>
          Импортировать игроков
        </button>
      </div>

      <div className="admin-grid">
        <form className="panel form-stack" onSubmit={addClub}>
          <h3>Добавить клуб</h3>
          <div className="form-grid">
            <label>
              Название
              <input name="name" value={clubForm.name} onChange={updateForm(setClubForm)} required />
            </label>
            <label>
              Город
              <input name="city" value={clubForm.city} onChange={updateForm(setClubForm)} required />
            </label>
            <label>
              Бюджет
              <input name="budget" type="number" value={clubForm.budget} onChange={updateForm(setClubForm)} required />
            </label>
            <label>
              Рейтинг
              <input max="100" min="1" name="rating" type="number" value={clubForm.rating} onChange={updateForm(setClubForm)} required />
            </label>
          </div>
          <button type="submit">Добавить клуб</button>
        </form>

        <form className="panel form-stack" onSubmit={addPlayer}>
          <h3>Добавить игрока</h3>
          <div className="form-grid">
            <label>
              Имя
              <input name="name" value={playerForm.name} onChange={updateForm(setPlayerForm)} required />
            </label>
            <label>
              Возраст
              <input name="age" type="number" value={playerForm.age} onChange={updateForm(setPlayerForm)} required />
            </label>
            <label>
              Позиция
              <input name="position" value={playerForm.position} onChange={updateForm(setPlayerForm)} placeholder="ST" required />
            </label>
            <label>
              Рейтинг
              <input max="100" min="1" name="rating" type="number" value={playerForm.rating} onChange={updateForm(setPlayerForm)} required />
            </label>
            <label>
              Цена
              <input name="price" type="number" value={playerForm.price} onChange={updateForm(setPlayerForm)} required />
            </label>
            <label>
              Клуб
              <select name="clubId" value={playerForm.clubId} onChange={updateForm(setPlayerForm)} required>
                <option value="">Клуб игрока</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit">Добавить игрока</button>
        </form>

        <form className="panel form-stack" onSubmit={addMatch}>
          <h3>Добавить матч</h3>
          <div className="form-grid">
            <label>
              Клуб 1
              <select name="homeClubId" value={matchForm.homeClubId} onChange={updateForm(setMatchForm)} required>
                <option value="">Хозяева</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Клуб 2
              <select name="awayClubId" value={matchForm.awayClubId} onChange={updateForm(setMatchForm)} required>
                <option value="">Гости</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Счет клуба 1
              <input min="0" name="homeScore" type="number" value={matchForm.homeScore} onChange={updateForm(setMatchForm)} required />
            </label>
            <label>
              Счет клуба 2
              <input min="0" name="awayScore" type="number" value={matchForm.awayScore} onChange={updateForm(setMatchForm)} required />
            </label>
            <label>
              Дата
              <input name="matchDate" type="date" value={matchForm.matchDate} onChange={updateForm(setMatchForm)} required />
            </label>
          </div>
          <button type="submit">Добавить матч</button>
        </form>
      </div>

      <div className="admin-lists">
        <div className="panel">
          <h3>Удаление клубов</h3>
          {clubs.map((club) => (
            <div className="admin-row" key={club.id}>
              <span>{club.name}</span>
              <button className="danger" type="button" onClick={() => deleteClub(club.id)}>
                Удалить
              </button>
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>Удаление игроков</h3>
          {players.map((player) => (
            <div className="admin-row" key={player.id}>
              <span>{player.name}</span>
              <button className="danger" type="button" onClick={() => deletePlayer(player.id)}>
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AdminPanel
