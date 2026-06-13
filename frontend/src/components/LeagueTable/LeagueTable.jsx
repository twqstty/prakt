import './LeagueTable.css'

function LeagueTable({ leagueTable }) {
  return (
    <section className="section league-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Турнирная таблица</p>
          <h2>Положение клубов</h2>
          <p>Таблица рассчитывается по результатам всех матчей.</p>
        </div>
      </div>

      {leagueTable.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Место</th>
                <th>Клуб</th>
                <th>Игры</th>
                <th>Победы</th>
                <th>Ничьи</th>
                <th>Поражения</th>
                <th>Очки</th>
              </tr>
            </thead>
            <tbody>
              {leagueTable.map((row) => (
                <tr key={row.clubId}>
                  <td className="place-cell">{row.place}</td>
                  <td>{row.club}</td>
                  <td>{row.games}</td>
                  <td>{row.wins}</td>
                  <td>{row.draws}</td>
                  <td>{row.losses}</td>
                  <td className="points-cell">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">Турнирные данные отсутствуют.</div>
      )}
    </section>
  )
}

export default LeagueTable
