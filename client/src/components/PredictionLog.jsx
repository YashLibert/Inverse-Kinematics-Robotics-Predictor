const rad2deg = r => (r * 180 / Math.PI).toFixed(2)

export default function PredictionLog({ history }) {
  if (history.length === 0) return (
    <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: 16 }}>
      No predictions yet
    </p>
  )

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155' }}>
            {['Time','q1°','q2°','q3°','q4°','q5°','q6°'].map(h => (
              <th key={h} style={{ padding: '6px 8px', color: '#64748b', textAlign: 'left', fontWeight: 500 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((p, i) => (
            <tr key={p._id || i} style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: '6px 8px', color: '#475569' }}>
                {new Date(p.createdAt).toLocaleTimeString()}
              </td>
              {['q1','q2','q3','q4','q5','q6'].map(k => (
                <td key={k} style={{ padding: '6px 8px', color: '#94a3b8' }}>
                  {rad2deg(p.output[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}