import './Header.css'

const navItems = [
  { id: 'home', label: 'Главная' },
  { id: 'myClub', label: 'Мой клуб' },
  { id: 'clubs', label: 'Клубы' },
  { id: 'players', label: 'Игроки' },
  { id: 'transfers', label: 'Трансферы' },
  { id: 'matches', label: 'Матчи' },
  { id: 'table', label: 'Таблица' },
  { id: 'admin', label: 'Админ' },
]

function Header({ activePage, isAuthenticated, user, onNavigate, onLogout }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" type="button" onClick={() => onNavigate('home')}>
          <span className="brand-mark">ESL</span>
          <span>
            European Super League
            <small>League office</small>
          </span>
        </button>

        <nav className="nav-list" aria-label="Основная навигация">
          {navItems.map((item) => (
            <button
              className={activePage === item.id ? 'nav-link active' : 'nav-link'}
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="auth-actions">
          {isAuthenticated ? (
            <>
              <span className="user-chip">{user?.username || 'Менеджер'}</span>
              <button className="secondary" type="button" onClick={onLogout}>
                Выйти
              </button>
            </>
          ) : (
            <button type="button" onClick={() => onNavigate('auth')}>
              Войти
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
