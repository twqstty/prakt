import './Home.css'

function Home({ clubs, players, matches, leagueTable = [] }) {
  const stats = [
    { label: 'Клубов', value: clubs.length },
    { label: 'Игроков', value: players.length },
    { label: 'Матчей', value: matches.length },
  ]
  const topClubs = leagueTable.slice(0, 5)

  return (
    <section className="home-page">
      <div className="home-hero">
        <div>
          <p className="eyebrow">European Super League</p>
          <h1>Центр управления футбольной лигой</h1>
          <p>
            Современная web-платформа для клубной аналитики, трансферной
            работы, матчей и турнирной динамики в едином интерфейсе.
          </p>
        </div>
        <div className="scoreboard" aria-label="Панель статистики">
          {stats.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="home-standings">
        <div className="home-standings-header">
          <div>
            <p className="eyebrow">Топ-5</p>
            <h2>Лидеры лиги</h2>
          </div>
          <span>{matches.length} матчей сыграно</span>
        </div>

        {topClubs.length ? (
          <div className="home-table-wrap">
            <table className="home-table">
              <thead>
                <tr>
                  <th>Клуб</th>
                  <th>Игры</th>
                  <th>Очки</th>
                </tr>
              </thead>
              <tbody>
                {topClubs.map((club) => (
                  <tr key={club.clubId}>
                    <td>
                      <span>{club.place}</span>
                      {club.club}
                    </td>
                    <td>{club.games}</td>
                    <td>{club.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">Турнирные данные отсутствуют.</div>
        )}
      </div>

      <div className="home-features">
        <article>
          <span>01</span>
          <h3>Составы и бюджеты</h3>
          <p>Рейтинги клубов, бюджеты, стоимость игроков и структура составов.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Трансферный рынок</h3>
          <p>Оформление сделок между клубами и полная история переходов.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Лига в динамике</h3>
          <p>Матчи автоматически формируют таблицу побед, ничьих и очков.</p>
        </article>
      </div>
    </section>
  )
}

export default Home
