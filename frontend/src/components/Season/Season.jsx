import './Season.css'

function Season({ calendar, playerStats, seasonNews }) {
  const goalLeaders = playerStats.slice(0, 8)
  const assistLeaders = [...playerStats]
    .sort((firstPlayer, secondPlayer) => secondPlayer.assists - firstPlayer.assists)
    .slice(0, 8)

  return (
    <section className="section season-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Сезон</p>
          <h2>Календарь, новости и статистика</h2>
          <p>Расписание лиги, события последних матчей и лидеры индивидуальной статистики.</p>
        </div>
      </div>

      <div className="season-layout">
        <div className="season-main">
          <div className="panel">
            <div className="block-title">
              <h3>Календарь сезона</h3>
              <span>{calendar.length} туров</span>
            </div>
            <div className="calendar-list">
              {calendar.map((round) => (
                <article className={round.played ? 'calendar-round played' : 'calendar-round'} key={round.number}>
                  <div className="calendar-round-top">
                    <strong>Тур {round.number}</strong>
                    <span>{round.played ? `${round.playedMatches} матчей сыграно` : 'Ожидается'}</span>
                  </div>
                  <div className="calendar-pairs">
                    {round.pairs.slice(0, 5).map((pair) => (
                      <span key={`${round.number}-${pair.home.id}-${pair.away.id}`}>
                        {pair.home.name} - {pair.away.name}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="season-side">
          <div className="panel">
            <div className="block-title">
              <h3>Новости лиги</h3>
            </div>
            <div className="news-list">
              {seasonNews.length ? (
                seasonNews.map((news) => (
                  <article className="news-item" key={news.id}>
                    <strong>{news.title}</strong>
                    <span>{news.subtitle}</span>
                  </article>
                ))
              ) : (
                <div className="empty-state">Новостей пока нет.</div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="block-title">
              <h3>Бомбардиры</h3>
            </div>
            <div className="leader-list">
              {goalLeaders.map((player) => (
                <div className="leader-row" key={player.id}>
                  <span>{player.name}</span>
                  <strong>{player.goals}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="block-title">
              <h3>Ассистенты</h3>
            </div>
            <div className="leader-list">
              {assistLeaders.map((player) => (
                <div className="leader-row" key={player.id}>
                  <span>{player.name}</span>
                  <strong>{player.assists}</strong>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Season
