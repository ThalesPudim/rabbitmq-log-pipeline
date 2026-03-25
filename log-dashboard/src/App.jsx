import { useState, useEffect } from 'react'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const echo = new Echo({
  broadcaster: 'reverb',
  key: 'afyqerjgqba7yabcfjpu',
  wsHost: '127.0.0.1',
  wsPort: 8081,
  wssPort: 8081,
  forceTLS: false,
  enabledTransports: ['ws'],
})

const LEVEL_STYLES = {
  info:    { bg: '#e0f2fe', color: '#0369a1', label: 'INFO' },
  warning: { bg: '#fef9c3', color: '#a16207', label: 'WARNING' },
  error:   { bg: '#fee2e2', color: '#dc2626', label: 'ERROR' },
}

function LogBadge({ level }) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.info
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      padding: '2px 10px',
      borderRadius: '999px',
      fontWeight: 700,
      fontSize: '12px',
      letterSpacing: '0.5px',
    }}>
      {style.label}
    </span>
  )
}

function App() {
  const [logs, setLogs] = useState([])
  const [connected, setConnected] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {

    // Carrega histórico ao iniciar
    fetch('http://localhost:8002/api/logs')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error('Erro ao carregar histórico:', err))

    echo.connector.pusher.connection.bind('connected', () => setConnected(true))
    echo.connector.pusher.connection.bind('disconnected', () => setConnected(false))

    echo.channel('logs').listen('LogReceived', (data) => {
      setLogs((prev) => [data, ...prev].slice(0, 100))
    })

    return () => echo.leaveChannel('logs')
  }, [])

  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter)

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'monospace' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>
              📡 Log Dashboard
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Pipeline: Producer → RabbitMQ → Consumer → Reverb → React
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: connected ? '#14532d' : '#450a0a',
            padding: '6px 14px', borderRadius: '999px', fontSize: '13px',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: connected ? '#4ade80' : '#f87171',
            }} />
            {connected ? 'Conectado' : 'Desconectado'}
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['all', 'info', 'warning', 'error'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 16px', borderRadius: '999px', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '13px',
              background: filter === f ? '#6366f1' : '#1e293b',
              color: filter === f ? '#fff' : '#94a3b8',
            }}>
              {f === 'all' ? 'Todos' : f.toUpperCase()}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '13px', alignSelf: 'center' }}>
            {filtered.length} log{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Lista de logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px', color: '#475569',
              background: '#1e293b', borderRadius: '12px',
            }}>
              Aguardando logs...
            </div>
          ) : (
            filtered.map((log, i) => (
              <div key={i} style={{
                background: '#1e293b', borderRadius: '10px',
                padding: '14px 18px', display: 'flex',
                alignItems: 'flex-start', gap: '12px',
                borderLeft: `3px solid ${LEVEL_STYLES[log.level]?.color || '#6366f1'}`,
              }}>
                <LogBadge level={log.level} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '13px' }}>
                      {log.service}
                    </span>
                    <span style={{ color: '#475569', fontSize: '12px' }}>
                      {new Date(log.logged_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px' }}>
                    {log.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App