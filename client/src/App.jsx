import { useState } from 'react'
import ArmViewer       from './components/ArmViewer.jsx'
import IKInputPanel    from './components/IKInputPanel.jsx'
import ConfigPanel     from './components/ConfigPanel.jsx'
import PredictionLog   from './components/PredictionLog.jsx'
import { usePredict }  from './hooks/usePredict.js'
import { useConfigs }  from './hooks/useConfigs.js'
import { useHistory }  from './hooks/useHistory.js'

export default function App() {
  const { predict, result, loading, error } = usePredict()
  const { configs, save, remove }           = useConfigs()
  const { history, append }                 = useHistory()
  const [currentForm, setCurrentForm]       = useState(null)

  const handlePredict = async (form) => {
    setCurrentForm(form)
    const data = await predict(form)
    if (data) append(data)
  }

  const handleSaveConfig = async (name, description) => {
    if (!currentForm || !result) return
    await save({
      name,
      description,
      joints: result.output,
      pose: {
        x:     currentForm.x,     y:     currentForm.y,     z:     currentForm.z,
        yaw:   currentForm.yaw,   pitch: currentForm.pitch, roll:  currentForm.roll
      }
    })
  }

  const handleLoadConfig = (config) => {
    // Config loading will pre-fill the form via state lift — handled in IKInputPanel
    console.log('Load config:', config)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1e',
      color: '#f1f5f9',
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
            IK Predictor
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>
            ABB IRB 120 — Neural Inverse Kinematics
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            background: '#052e16', color: '#4ade80', fontSize: 11,
            padding: '4px 10px', borderRadius: 20, border: '1px solid #166534'
          }}>
            R² 0.9956
          </span>
          <span style={{
            background: '#1e1b4b', color: '#a5b4fc', fontSize: 11,
            padding: '4px 10px', borderRadius: 20, border: '1px solid #3730a3'
          }}>
            MAE 5.49°
          </span>
        </div>
      </header>

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, gap: 0, overflow: 'hidden' }}>

        {/* Left panel */}
        <div style={{
          width: 380, minWidth: 380,
          borderRight: '1px solid #1e293b',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0
        }}>
          <Section title="Inverse Kinematics Input">
            <IKInputPanel onPredict={handlePredict} loading={loading} />
            {error && (
              <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>⚠ {error}</p>
            )}
          </Section>

          {result && (
            <Section title="Predicted Joint Angles">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {['q1','q2','q3','q4','q5','q6'].map(k => (
                  <div key={k} style={{
                    background: '#1e293b', borderRadius: 8, padding: '10px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{k}</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#60a5fa' }}>
                      {(result.output[k] * 180 / Math.PI).toFixed(1)}°
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: '#475569' }}>
                      {result.output[k].toFixed(4)} rad
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Saved Configs">
            <ConfigPanel
              configs={configs}
              onSave={handleSaveConfig}
              onLoad={handleLoadConfig}
              onDelete={remove}
            />
          </Section>
        </div>

        {/* Center — Three.js viewer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: 16 }}>
            <ArmViewer angles={result?.output} />
          </div>
        </div>

        {/* Right panel — history */}
        <div style={{
          width: 420, minWidth: 420,
          borderLeft: '1px solid #1e293b',
          overflowY: 'auto'
        }}>
          <Section title={`Prediction History (${history.length})`}>
            <PredictionLog history={history} />
          </Section>
        </div>
      </div>
    </div>
  )
}

const Section = ({ title, children }) => (
  <div style={{ padding: '16px', borderBottom: '1px solid #1e293b' }}>
    <p style={{
      margin: '0 0 12px 0', fontSize: 11, fontWeight: 600,
      color: '#475569', textTransform: 'uppercase', letterSpacing: 1
    }}>
      {title}
    </p>
    {children}
  </div>
)