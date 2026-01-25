import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useTexture } from '@react-three/drei';
import { getPokemonSpriteUrl } from '../utils/helpers';
import * as THREE from 'three';

interface PokemonSpriteProps {
  pokemonId: number;
}

const PokemonSprite: React.FC<PokemonSpriteProps> = ({ pokemonId }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(getPokemonSpriteUrl(pokemonId, 'default'));
  
  // Rotation douce
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[3, 3]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

interface ThreeDViewerProps {
  pokemonId: number;
  className?: string;
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ pokemonId, className = '' }) => {
  return (
    <div className={`w-full h-full min-h-[400px] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        
        {/* Lumières */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        
        {/* Sprite Pokémon */}
        <Suspense
          fallback={
            <mesh>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial color="#f0f0f0" />
            </mesh>
          }
        >
          <PokemonSprite pokemonId={pokemonId} />
        </Suspense>
        
        {/* Contrôles de caméra */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={2}
        />
        
        {/* Environnement */}
        <Environment preset="sunset" />
      </Canvas>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
        Glissez pour faire tourner • Molette pour zoomer
      </div>
    </div>
  );
};

export default ThreeDViewer;
