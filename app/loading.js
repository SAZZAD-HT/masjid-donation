// app/loading.js
export default function Loading() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    }}>
      {/* Animated crescent */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '4px solid var(--parchment)',
          borderTopColor: 'var(--emerald)',
          borderRightColor: 'var(--gold)',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem',
        }}>☪</div>
      </div>

      <p style={{ color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem' }}>
        Loading…
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
