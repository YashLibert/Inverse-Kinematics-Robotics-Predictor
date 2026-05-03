import * as THREE from 'three'

const LINKS = [
  { length: 0.290, radiusTop: 0.038, radiusBottom: 0.044 },
  { length: 0.270, radiusTop: 0.032, radiusBottom: 0.038 },
  { length: 0.070, radiusTop: 0.028, radiusBottom: 0.032 },
  { length: 0.300, radiusTop: 0.024, radiusBottom: 0.028 },
  { length: 0.070, radiusTop: 0.020, radiusBottom: 0.024 },
  { length: 0.100, radiusTop: 0.016, radiusBottom: 0.020 },
]

const AXES = [
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 0),
]

// Palette — lab white theme
const C = {
  linkTop:    0xdce8f5,
  linkBot:    0xb5ceeb,
  joint14:    0x378ADD,
  joint56:    0x1D9E75,
  jointRing:  0xffffff,
  tcp:        0xD85A30,
  base:       0xdce8f5,
  baseRim:    0xb5ceeb,
  floor:      0xe4ecf4,
}

const mat = (color, rough = 0.35, metal = 0.55) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })

export const buildArm = (scene) => {
  const joints = []

  // Floor plane
  const floorGeo = new THREE.CircleGeometry(1.8, 64)
  const floorMat = new THREE.MeshStandardMaterial({
    color: C.floor, roughness: 0.9, metalness: 0.0
  })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.001
  floor.receiveShadow = true
  scene.add(floor)

  // Shadow receiver disc
  const shadowGeo = new THREE.CircleGeometry(0.22, 64)
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x8aaccf, transparent: true, opacity: 0.13
  })
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat)
  shadowDisc.rotation.x = -Math.PI / 2
  shadowDisc.position.y = 0.001
  scene.add(shadowDisc)

  // Base — layered cylinder
  const baseBot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.155, 0.175, 0.028, 48),
    mat(C.baseRim, 0.3, 0.7)
  )
  baseBot.position.y = 0.014
  baseBot.castShadow = true
  baseBot.receiveShadow = true
  scene.add(baseBot)

  const baseMid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.130, 0.155, 0.022, 48),
    mat(C.base, 0.25, 0.65)
  )
  baseMid.position.y = 0.039
  baseMid.castShadow = true
  scene.add(baseMid)

  const baseTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.110, 0.130, 0.018, 48),
    mat(C.baseRim, 0.2, 0.7)
  )
  baseTop.position.y = 0.058
  baseTop.castShadow = true
  scene.add(baseTop)

  // Build joint chain
  let parent  = scene
  let yOffset = 0.067

  LINKS.forEach((link, i) => {
    const isWrist  = i >= 4
    const jColor   = isWrist ? C.joint56 : C.joint14

    // Joint disc group
    const group = new THREE.Group()
    group.position.y = yOffset

    // Outer ring
    const ringGeo = new THREE.TorusGeometry(link.radiusBottom * 1.55, 0.006, 12, 48)
    const ring    = new THREE.Mesh(ringGeo, mat(C.jointRing, 0.15, 0.85))
    ring.castShadow = true
    group.add(ring)

    // Joint sphere
    const jGeo  = new THREE.SphereGeometry(link.radiusBottom * 1.25, 24, 24)
    const jMesh = new THREE.Mesh(jGeo, mat(jColor, 0.2, 0.75))
    jMesh.castShadow = true
    group.add(jMesh)

    // Link — tapered cylinder
    const lGeo  = new THREE.CylinderGeometry(link.radiusTop, link.radiusBottom, link.length, 20)
    const lMesh = new THREE.Mesh(lGeo, mat(C.linkTop, 0.3, 0.5))
    lMesh.position.y = link.length / 2
    lMesh.castShadow = true
    group.add(lMesh)

    // Subtle mid-ring on longer links
    if (link.length > 0.15) {
      const midRing = new THREE.Mesh(
        new THREE.TorusGeometry(
          (link.radiusTop + link.radiusBottom) / 2 * 1.15,
          0.004, 10, 40
        ),
        mat(C.linkBot, 0.2, 0.8)
      )
      midRing.position.y = link.length / 2
      group.add(midRing)
    }

    parent.add(group)
    joints.push(group)
    parent  = group
    yOffset = link.length
  })

  // TCP — coral sphere + small disc
  const tcpGroup = new THREE.Group()
  tcpGroup.position.y = LINKS[5].length

  const tcpSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 20, 20),
    mat(C.tcp, 0.15, 0.6)
  )
  tcpSphere.castShadow = true
  tcpGroup.add(tcpSphere)

  const tcpDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.030, 0.030, 0.006, 32),
    mat(C.tcp, 0.3, 0.5)
  )
  tcpDisc.position.y = -0.012
  tcpGroup.add(tcpDisc)

  joints[5].add(tcpGroup)

  return joints
}

export const updateArmAngles = (joints, angles) => {
  angles.forEach((angle, i) => {
    if (!joints[i]) return
    const axis = AXES[i]
    if (axis.y === 1)      joints[i].rotation.set(0, angle, 0)
    else if (axis.z === 1) joints[i].rotation.set(0, 0, angle)
    else                   joints[i].rotation.set(angle, 0, 0)
  })
}