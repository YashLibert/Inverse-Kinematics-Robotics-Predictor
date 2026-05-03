import { useState } from 'react'

export default function ConfigPanel({ configs, onSave, onLoad, onDelete }) {
  const [name, setName]   = useState('')
  const [desc, setDesc]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave(name.trim(), desc.trim())
    setName('')
    setDesc('')
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Config name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            flex: 1, background: '#1e293b', border: '1px solid #334155',
            borderRadius: 6, padding: '6px 10px', color: '#f1f5f9', fontSize: 13
          }}
        />
        <input
          placeholder="Description (optional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          style={{
            flex: 2, background: '#1e293b', border: '1px solid #334155',
            borderRadius: 6, padding: '6px 10px', color: '#f1f5f9', fontSize: 13
          }}
        />
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          style={{
            background: '#059669', border: 'none', borderRadius: 6,
            padding: '6px 16px', color: '#fff', fontSize: 13,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          Save
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
        {configs.length === 0 && (
          <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: 16 }}>
            No saved configs
          </p>
        )}
        {configs.map(c => (
          <div key={c._id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#1e293b', borderRadius: 6, padding: '8px 12px'
          }}>
            <div>
              <p style={{ color: '#f1f5f9', fontSize: 13, margin: 0 }}>{c.name}</p>
              {c.description && <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>{c.description}</p>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => onLoad(c)}
                style={{
                  background: '#1d4ed8', border: 'none', borderRadius: 4,
                  padding: '4px 10px', color: '#fff', fontSize: 12, cursor: 'pointer'
                }}
              >
                Load
              </button>
              <button
                onClick={() => onDelete(c._id)}
                style={{
                  background: '#7f1d1d', border: 'none', borderRadius: 4,
                  padding: '4px 10px', color: '#fff', fontSize: 12, cursor: 'pointer'
                }}
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}