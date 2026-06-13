import './Matches.css'

function Matches({ matches }) {
  return (
    <section className="section matches-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Матчи</p>
          <h2>Результаты тура</h2>
          <p>Список сыгранных матчей с командами, счетом и датой встречи.</p>
        </div>
      </div>

      {matches.length ? (
        <div className="match-list">
          {matches.map((match) => (
            <article className="match-card" key={match.id}>
              <div className="team-name">{match.homeClub?.name}</div>
              <div className="match-score">
                <strong>
                  {match.homeScore}:{match.awayScore}
                </strong>
                <span>{new Date(match.matchDate).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="team-name away">{match.awayClub?.name}</div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">Матчи отсутствуют.</div>
      )}
    </section>
  )
}

export default Matches
