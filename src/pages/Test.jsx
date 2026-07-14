export default function Test() {
  const blocks = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: i % 2 === 0 ? '#ffffff' : '#181818',
    label: i % 2 === 0 ? `WHITE BLOCK ${i + 1}` : `DARK BLOCK ${i + 1}`
  }));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'monospace',
      fontSize: '12px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    }}>
      {blocks.map(b => (
        <div
          key={b.id}
          style={{
            height: '100vh',
            background: b.color,
            color: b.color === '#ffffff' ? '#000' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(128,128,128,0.2)',
          }}
        >
          {b.label}
        </div>
      ))}
    </div>
  );
}
