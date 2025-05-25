"use client";

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { GLTFLoader } from 'three-stdlib'
import { DRACOLoader } from 'three-stdlib'

function Car({ bodyColor, detailsColor, glassColor } : { bodyColor: string, detailsColor: string, glassColor: string } ) {
  const carRef = useRef(null)
  const gltf = useLoader(GLTFLoader, '/models/gltf/ferrari.glb', loader => {
    const draco = new DRACOLoader()
    draco.setDecoderPath('/jsm/libs/draco/gltf/')
    loader.setDRACOLoader(draco)
  })
  const shadowTexture = useLoader(THREE.TextureLoader, '/models/gltf/ferrari_ao.png')

  const [sceneClone, wheelMeshes] = useMemo(() => {
    const scene = gltf.scene.clone(true)

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(bodyColor),
      metalness: 1,
      roughness: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
    })

    const detailsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(detailsColor),
      metalness: 1,
      roughness: 0.5,
    })

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(glassColor),
      metalness: 0.25,
      roughness: 0,
      transmission: 1,
    })

    const body = scene.getObjectByName('body')
    if (body) body.material = bodyMat;

    ['rim_fl', 'rim_fr', 'rim_rr', 'rim_rl', 'trim'].forEach(name => {
      const mesh = scene.getObjectByName(name)
      if (mesh) mesh.material = detailsMat
    })

    const glass = scene.getObjectByName('glass')
    if (glass) glass.material = glassMat

    const wheels = ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr']
      .map(name => scene.getObjectByName(name))
      .filter(Boolean)

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        blending: THREE.MultiplyBlending,
        toneMapped: false,
        transparent: true,
      })
    )
    plane.rotation.x = -Math.PI / 2
    plane.renderOrder = 2
    scene.add(plane)

    return [scene, wheels]
  }, [gltf, bodyColor, detailsColor, glassColor, shadowTexture])

  useFrame(state => {
    const t = -state.clock.getElapsedTime()
    wheelMeshes.forEach(wheel => {
      if (wheel) {
        wheel.rotation.x = t * Math.PI * 0.7
      }
    })
  })

  return <primitive ref={carRef} object={sceneClone} />
}

function AnimatedGrid() {
  const gridRef = useRef(null)
  useFrame(state => {
    const t = -state.clock.getElapsedTime()
    if (gridRef.current) {
      gridRef.current.position.z = -(t % 1)
    }
  })
  return <gridHelper ref={gridRef} args={[20, 40, 'white', 'white']} />
}

export default function Page() {
  const bodyColor = '#ff0000';
  const detailsColor = '#ffffff';
  const glassColor = '#ffffff';

  return (
    <>
      <Canvas
        style={{ height: '100%', width: '100%', position: 'absolute', top: '0', left: '0' }}
        camera={{ position: [4.25, 1.4, -4.5], fov: 40 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.85 }}
      >
        <color attach="background" args={[0xcccccc]} />
        <fog attach="fog" args={[0xcccccc, 10, 15]} />
        <Environment files="/textures/equirectangular/venice_sunset_1k.hdr" />
        <Car bodyColor={bodyColor} detailsColor={detailsColor} glassColor={glassColor} />
        <AnimatedGrid />
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
    </>
  )
}