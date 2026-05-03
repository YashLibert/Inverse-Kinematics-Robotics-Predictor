import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { buildArm, updateArmAngles } from '../three/ArmScene.js'

export default function ArmViewer({ angles }) {
  const mountRef = useRef(null)
  const sceneRef = useRef({})

  useEffect(() => {
    const el = mountRef.current
    const W  = el.clientWidth
    const H  = el.clientHeight

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap
    renderer.toneMapping       = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.outputColorSpace  = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f4f8)
    scene.fog        = new THREE.FogExp2(0xf0f4f8, 0.18)

    // Camera
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 40)
    camera.position.set(1.6, 1.4, 1.6)
    camera.lookAt(0, 0.55, 0)

    // Lights — warm professional lab setup
    const ambient = new THREE.AmbientLight(0xf5f0e8, 0.7)
    scene.add(ambient)

    // Key light — warm white from upper right
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.4)
    keyLight.position.set(3, 6, 4)
    keyLight.castShadow             = true
    keyLight.shadow.mapSize.width   = 2048
    keyLight.shadow.mapSize.height  = 2048
    keyLight.shadow.camera.near     = 0.5
    keyLight.shadow.camera.far      = 20
    keyLight.shadow.camera.left     = -2
    keyLight.shadow.camera.right    = 2
    keyLight.shadow.camera.top      = 2
    keyLight.shadow.camera.bottom   = -2
    keyLight.shadow.bias            = -0.001
    keyLight.shadow.radius          = 4       // soft shadow
    scene.add(keyLight)

    // Fill light — cool from left
    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.5)
    fillLight.position.set(-4, 2, -2)
    scene.add(fillLight)

    // Rim light — subtle blue from behind
    const rimLight = new THREE.DirectionalLight(0xdce8f5, 0.3)
    rimLight.position.set(0, 1, -4)
    scene.add(rimLight)

    // Ground hemisphere
    const hemi = new THREE.HemisphereLight(0xdce8f5, 0xe4ecf4, 0.4)
    scene.add(hemi)

    // Subtle grid
    const grid = new THREE.GridHelper(3.6, 24, 0xc8d8e8, 0xd8e4ef)
    grid.material.opacity    = 0.5
    grid.material.transparent = true
    scene.add(grid)

    // Arm
    const joints = buildArm(scene)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping    = true
    controls.dampingFactor    = 0.06
    controls.minDistance      = 0.6
    controls.maxDistance      = 4.5
    controls.maxPolarAngle    = Math.PI / 2.05
    controls.target.set(0, 0.55, 0)
    controls.update()

    sceneRef.current = { renderer, scene, camera, controls, joints }

    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const W = el.clientWidth
      const H = el.clientHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    const { joints } = sceneRef.current
    if (!joints || !angles) return
    updateArmAngles(joints, [
      angles.q1, angles.q2, angles.q3,
      angles.q4, angles.q5, angles.q6
    ])
  }, [angles])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}
      />
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16,
        background: 'rgba(240,244,248,0.88)',
        backdropFilter: 'blur(6px)',
        borderRadius: 8, padding: '8px 12px',
        border: '1px solid #cdd8e6',
        display: 'flex', flexDirection: 'column', gap: 5
      }}>
        {[
          { color: '#378ADD', label: 'Joints 1–4' },
          { color: '#1D9E75', label: 'Joints 5–6 (wrist)' },
          { color: '#D85A30', label: 'End effector' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: color, flexShrink: 0
            }} />
            <span style={{ fontSize: 11, color: '#4a6080' }}>{label}</span>
          </div>
        ))}
      </div>
      {/* Orbit hint */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        fontSize: 10, color: '#8ca0b4',
        background: 'rgba(240,244,248,0.75)',
        padding: '4px 8px', borderRadius: 6,
        border: '1px solid #cdd8e6'
      }}>
        Drag to orbit · Scroll to zoom
      </div>
    </div>
  )
}