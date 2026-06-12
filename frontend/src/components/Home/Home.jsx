import './Home.css'

function Home({ clubs, players, matches }) {
  const stats = [
    { label: 'Клубов', value: clubs.length },
    { label: 'Игроков', value: players.length },
    { label: 'Матчей', value: matches.length },
  ]

  return (
    <section className="home-page">
      <div className="home-hero">
        <div>
          <p className="eyebrow">Football Manager Web</p>
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
