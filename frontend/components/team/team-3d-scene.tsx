'use client'

import React from "react"

import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { TeamPokemon } from '@/hooks/use-team'
import { formatPokemonName } from '@/lib/pokemon'

interface Team3DSceneProps {
  team: TeamPokemon[]
}

function PokemonSprite({ 
  pokemon, 
  meshRef 
}: { 
  pokemon: TeamPokemon
  meshRef: React.RefObject<THREE.Mesh | null>
}) {
  const texture = useLoader(THREE.TextureLoader, pokemon.image)
  
  return (
    <mesh ref={meshRef} castShadow>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
    </mesh>
  )
}

function EmptySlot({ 
  meshRef 
}: { 
  meshRef: React.RefObject<THREE.Mesh | null>
}) {
  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshStandardMaterial 
        color="#6b7280" 
        opacity={0.3} 
        transparent 
        wireframe
      />
    </mesh>
  )
}

function PokemonSlot({
  pokemon,
  position,
  index,
}: {
  pokemon: TeamPokemon | undefined
  position: [number, number, number]
  index: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index * 0.5) * 0.1
    }
  })

  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 1, 0.2, 32]} />
        <meshStandardMaterial 
          color={pokemon ? '#ef4444' : '#374151'} 
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Pokemon sprite or placeholder */}
      {pokemon ? (
        <PokemonSprite pokemon={pokemon} meshRef={meshRef} />
      ) : (
        <EmptySlot meshRef={meshRef} />
      )}

      {/* Pokemon name */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color={pokemon ? '#ffffff' : '#9ca3af'}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
      >
        {pokemon ? formatPokemonName(pokemon.name) : `Slot ${index + 1}`}
      </Text>
    </group>
  )
}

function TeamScene({ team }: Team3DSceneProps) {
  // Arrange Pokemon in a hexagonal pattern
  const positions: [number, number, number][] = [
    [-2, 0.5, 1],
    [0, 0.5, 1.5],
    [2, 0.5, 1],
    [-2, 0.5, -1],
    [0, 0.5, -1.5],
    [2, 0.5, -1],
  ]

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ef4444" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#3b82f6" />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#1f2937" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Pokemon slots */}
      {positions.map((pos, index) => (
        <PokemonSlot
          key={index}
          pokemon={team[index]}
          position={pos}
          index={index}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      <Environment preset="city" />
    </>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="text-foreground text-lg font-medium animate-pulse">
        Loading 3D Scene...
      </div>
    </Html>
  )
}

export function Team3DScene({ team }: Team3DSceneProps) {
  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      <Canvas
        shadows
        camera={{ position: [0, 5, 8], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <TeamScene team={team} />
        </Suspense>
      </Canvas>
    </div>
  )
}
