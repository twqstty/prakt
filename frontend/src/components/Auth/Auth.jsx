import { useState } from 'react'
import './Auth.css'

function Auth({ apiUrl, onAuthSuccess }) {
  const [mode, setMode] = useState('register')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload =
        mode === 'register'
          ? form
          : {
              email: form.email,
              password: form.password,
            }

      const response = await fetch(`${apiUrl}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка авторизации')
      }

      onAuthSuccess(result)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-promo">
        <span className="auth-logo">ESL</span>
        <h1>Операционная система футбольного клуба</h1>
        <p>
          Единая платформа для управления составом, трансферным рынком,
          матчами, финансами и положением клуба в чемпионате.
        </p>
        <div className="auth-promo-grid">
          <span>JWT</span>
          <span>PostgreSQL</span>
          <span>Transfers</span>
        </div>
      </div>
      <div className="auth-card">
        <p className="eyebrow">{mode === 'login' ? 'Авторизация' : 'Регистрация'}</p>
        <h2>{mode === 'login' ? 'Вход в систему' : 'Регистрация клуба'}</h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Имя пользователя
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="coach"
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="manager@club.com"
              required
            />
          </label>
          <label>
            Пароль
            <input
              minLength="6"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="******"
              required
            />
          </label>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Проверяем...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError('')
          }}
        >
          {mode === 'login' ? 'Регистрация нового клуба' : 'Вход для действующего клуба'}
        </button>
      </div>
    </section>
  )
}

export default Auth
