'use client';

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { GLTFLoader } from 'three-stdlib'
import { DRACOLoader } from 'three-stdlib'
import {
  ACESFilmicToneMapping,
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MultiplyBlending,
  PlaneGeometry,
  TextureLoader,
  Group,
  GridHelper,
} from 'three'
import Colorjs from 'colorjs.io';

interface CarProps {
  carBodyColor: string
  carDetailsColor: string
  carGlassColor: string
}

function Car({ carBodyColor, carDetailsColor, carGlassColor }: CarProps) {
  const carRef = useRef<Group>(null!)

  const gltf = useLoader(GLTFLoader, '/models/gltf/ferrari.glb', loader => {
    const draco = new DRACOLoader()
    draco.setDecoderPath('/jsm/libs/draco/gltf/')
    loader.setDRACOLoader(draco)
  })

  const shadowTexture = useLoader(TextureLoader, '/models/gltf/ferrari_ao.png')

  const [sceneClone, wheelMeshes] = useMemo(() => {
    const scene = gltf.scene.clone(true) as Group

    const bodyMat = new MeshPhysicalMaterial({
      color: new Color(carBodyColor),
      metalness: 1,
      roughness: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
    })
    const detailsMat = new MeshStandardMaterial({
      color: new Color(carDetailsColor),
      metalness: 1,
      roughness: 0.5,
    })
    const glassMat = new MeshPhysicalMaterial({
      color: new Color(carGlassColor),
      metalness: 0.25,
      roughness: 0,
      transmission: 1,
    })

    const body = scene.getObjectByName('body') as Mesh | null
    if (body) body.material = bodyMat

    ;['rim_fl','rim_fr','rim_rr','rim_rl','trim'].forEach(name => {
      const mesh = scene.getObjectByName(name) as Mesh | null
      if (mesh) mesh.material = detailsMat
    })

    const glass = scene.getObjectByName('glass') as Mesh | null
    if (glass) glass.material = glassMat

    const wheels = ['wheel_fl','wheel_fr','wheel_rl','wheel_rr']
      .map(name => scene.getObjectByName(name) as Mesh | null)
      .filter((m): m is Mesh => m !== null)

    const plane = new Mesh(
      new PlaneGeometry(0.655 * 4, 1.3 * 4),
      new MeshBasicMaterial({
        map: shadowTexture,
        blending: MultiplyBlending,
        toneMapped: false,
        transparent: true,
      })
    )
    plane.rotation.x = -Math.PI / 2
    plane.renderOrder = 2
    scene.add(plane)

    return [scene, wheels] as const
  }, [gltf, carBodyColor, carDetailsColor, carGlassColor, shadowTexture])

  useFrame(state => {
    const t = -state.clock.getElapsedTime()
    wheelMeshes.forEach(wheel => {
      wheel.rotation.x = t * Math.PI * 0.7 * 0
    })
  })

  return <primitive ref={carRef} object={sceneClone} />
}

interface AnimatedGridProps {
  size: number;
  divisions: number;
  colorCenterLine: string;
  colorGrid: string;
}

function AnimatedGrid({ size, divisions, colorCenterLine, colorGrid }: AnimatedGridProps) {
  const gridRef = useRef<GridHelper>(null!)

  useFrame(state => {
    const t = -state.clock.getElapsedTime()

    if (gridRef.current) {
      gridRef.current.position.z = -(t % 1) * 0
    }
  })

  return <gridHelper ref={gridRef} args={[size, divisions, colorCenterLine, colorGrid]} />
}

const colorToHex = (color: string) => new Colorjs(color).to('srgb').toString({ format: 'hex' });

export default function Page() {
  const [background, setBackground] = useState('');
  const [foreground, setForeground] = useState('');

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const bgColor = colorToHex(styles.getPropertyValue("--sidebar-ring"));
    const fgColor = colorToHex(styles.getPropertyValue("--muted"));

    setBackground(bgColor);
    setForeground(fgColor);
  }, []);

  const carBodyColor = '#ff0000';
  const carDetailsColor = '#ffffff';
  const carGlassColor = '#ffffff';

  return (
    <Canvas
      style={{ height: '100%', width: '100%', position: 'absolute', top: '0', left: '0' }}
      camera={{ position: [4.25, 1.4, -4.5], fov: 40 }}
      gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 0.85 }}
    >
      <color attach="background" args={[background]} />
      <Environment files="/textures/equirectangular/venice_sunset_1k.hdr" />
      <Car carBodyColor={carBodyColor} carDetailsColor={carDetailsColor} carGlassColor={carGlassColor} />
      <OrbitControls
        autoRotate
        autoRotateSpeed={-2}
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={Math.PI/6}  
        maxPolarAngle={Math.PI/2}
        target={[0, 0.5, 0]}
      />
    </Canvas>
  )
}