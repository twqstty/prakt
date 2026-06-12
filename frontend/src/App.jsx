import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import Header from './components/Header/Header'
import Home from './components/Home/Home'
import Clubs from './components/Clubs/Clubs'
import Players from './components/Players/Players'
import Transfers from './components/Transfers/Transfers'
import Matches from './components/Matches/Matches'
import LeagueTable from './components/LeagueTable/LeagueTable'
import Auth from './components/Auth/Auth'
import AdminPanel from './components/AdminPanel/AdminPanel'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const initialData = {
  clubs: [],
  players: [],
  matches: [],
  transfers: [],
  leagueTable: [],
}

function App() {
  const [activePage, setActivePage] = useState('home')
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const apiRequest = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка запроса к серверу')
      }

      return result
    },
    [token],
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [clubs, players, matches, transfers, leagueTable] = await Promise.all([
        apiRequest('/api/clubs'),
        apiRequest('/api/players'),
        apiRequest('/api/matches'),
        apiRequest('/api/transfers'),
        apiRequest('/api/league-table'),
      ])

      setData({ clubs, players, matches, transfers, leagueTable })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [apiRequest])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAuthSuccess = (authData) => {
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify(authData.user))
    setToken(authData.token)
    setUser(authData.user)
    setActivePage('clubs')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
    setActivePage('home')
  }

  const pageProps = useMemo(
    () => ({
      ...data,
      apiRequest,
      reloadData: loadData,
      isAuthenticated: Boolean(token),
      user,
    }),
    [apiRequest, data, loadData, token, user],
  )

  const pages = {
    home: <Home clubs={data.clubs} players={data.players} matches={data.matches} />,
    auth: <Auth apiUrl={API_URL} onAuthSuccess={handleAuthSuccess} />,
    clubs: <Clubs {...pageProps} />,
    players: <Players {...pageProps} />,
    transfers: <Transfers {...pageProps} />,
    matches: <Matches {...pageProps} />,
    table: <LeagueTable {...pageProps} />,
    admin: <AdminPanel {...pageProps} />,
  }

  return (
    <div className="app-shell">
      <Header
        activePage={activePage}
        isAuthenticated={Boolean(token)}
        user={user}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      />

      <main className="app-main">
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button type="button" onClick={loadData}>
              Повторить
            </button>
          </div>
        )}
        {loading && <div className="loading-line">Загружаем футбольные данные...</div>}
        {pages[activePage]}
      </main>
    </div>
  )
}

export default App
