import './Players.css'

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function Players({ players }) {
  return (
    <section className="section players-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Игроки</p>
          <h2>Скаутский список</h2>
          <p>Возраст, позиция, рейтинг, цена и текущий клуб каждого футболиста.</p>
        </div>
      </div>

      {players.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Имя</th>
                <th>Возраст</th>
                <th>Позиция</th>
                <th>Рейтинг</th>
                <th>Цена</th>
                <th>Клуб</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id}>
                  <td className="player-name">{player.name}</td>
                  <td>{player.age}</td>
                  <td>
                    <span className="position-pill">{player.position}</span>
                  </td>
                  <td>{player.rating}</td>
                  <td>{money.format(player.price)}</td>
                  <td>{player.club?.name || 'Свободный агент'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">Игроки отсутствуют.</div>
      )}
    </section>
  )
}

export default Players
