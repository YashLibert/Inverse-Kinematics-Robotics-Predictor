import { useState } from 'react'

const DEFAULT = {
  x: -80.9148, y: -121.7499, z: 1896.4867,
  yaw: -0.6941, pitch: 0.9229, roll: -1.4411,
  q1_in: -2.2407, q2_in: -0.7975, q3_in: 0.6551,
  q4_in: -3.2989, q5_in: 1.1212, q6_in: 5.7052
}

const Field = ({ label, name, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
      {label}
    </label>
    <input
      type="number"
      step="any"
      value={value}
      onChange={e => onChange(name, parseFloat(e.target.value))}
      style={{
        background: '#1e293b', border: '1px solid #334155',
        borderRadius: 6, padding: '6px 10px', color: '#f1f5f9',
        fontSize: 13, width: '100%', outline: 'none'
      }}
    />
  </div>
)

export default function IKInputPanel({ onPredict, loading, onLoadConfig }) {
  const [form, setForm] = useState(DEFAULT)

  const handleChange = (name, val) => setForm(prev => ({ ...prev, [name]: val }))

  const handleSubmit = () => onPredict(form)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>TARGET POSE</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {['x','y','z'].map(k => <Field key={k} label={k} name={k} value={form[k]} onChange={handleChange} />)}
          {['yaw','pitch','roll'].map(k => <Field key={k} label={k} name={k} value={form[k]} onChange={handleChange} />)}
        </div>
      </div>

      <div>
        <p style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>CURRENT JOINTS</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {['q1_in','q2_in','q3_in','q4_in','q5_in','q6_in'].map(k =>
            <Field key={k} label={k} name={k} value={form[k]} onChange={handleChange} />
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          background: loading ? '#334155' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
          border: 'none', borderRadius: 8, padding: '12px',
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.2s'
        }}
      >
        {loading ? 'Predicting...' : 'Predict Joint Angles'}
      </button>
    </div>
  )
}