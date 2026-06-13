import './Clubs.css'

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function Clubs({ clubs }) {
  return (
    <section className="section clubs-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Клубы</p>
          <h2>Финансы и рейтинг команд</h2>
          <p>Список клубов лиги с городом, бюджетом и спортивной силой.</p>
        </div>
      </div>

      {clubs.length ? (
        <div className="grid">
          {clubs.map((club) => (
            <article className="card club-card" key={club.id}>
              <div className="card-top">
                <div>
                  <h3>{club.name}</h3>
                  <p className="meta">{club.city}</p>
                </div>
                <span className="stat">{club.rating} OVR</span>
              </div>
              <div className="club-budget">{money.format(club.budget)}</div>
              <div className="rating-bar">
                <span style={{ width: `${Math.min(club.rating, 100)}%` }} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">Клубные данные отсутствуют.</div>
      )}
    </section>
  )
}

export default Clubs
