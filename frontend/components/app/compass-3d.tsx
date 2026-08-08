'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import {
  Float,
  Icosahedron,
  OrbitControls,
  Ring,
  Text,
  Torus,
} from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';

export type CompassState =
  | 'disconnected'
  | 'connecting'
  | 'initializing'
  | 'idle'
  | 'listening'
  | 'speaking'
  | 'thinking'
  | 'error';

interface Compass3DProps {
  agentState: CompassState;
  className?: string;
}

function CompassCore({ agentState }: { agentState: CompassState }) {
  // The central ₹ symbol is a Three.js mesh through Drei's <Text />.
  const coreRef = useRef<THREE.Mesh>(null);

  const frameRef = useRef<THREE.Mesh>(null);
  const bezel1Ref = useRef<THREE.Mesh>(null);
  const bezel2Ref = useRef<THREE.Mesh>(null);
  const bezel3Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (
      !coreRef.current ||
      !frameRef.current ||
      !bezel1Ref.current ||
      !bezel2Ref.current ||
      !bezel3Ref.current
    ) {
      return;
    }

    const time = state.clock.elapsedTime;

    // -----------------------------------------
    // Animation settings based on agent state
    // -----------------------------------------

    let rotationSpeed = 0.5;
    let floatSpeed = 1;
    let floatHeight = 0.08;
    let coreScale = 1;

    switch (agentState) {
      case 'idle':
        rotationSpeed = 0.5;
        coreScale = 1;
        floatSpeed = 1;
        break;

      case 'listening':
        rotationSpeed = 1.0;
        coreScale = 1.1;
        floatSpeed = 2;
        floatHeight = 0.12;
        break;

      case 'thinking':
        rotationSpeed = 2.0;
        coreScale = 1.05;
        floatSpeed = 3;
        floatHeight = 0.1;
        break;

      case 'speaking':
        rotationSpeed = 1.2;
        coreScale = 1.2 + Math.sin(time * 10) * 0.1;
        floatSpeed = 1.5;
        floatHeight = 0.15;
        break;

      case 'connecting':
      case 'initializing':
        rotationSpeed = 3.0;
        coreScale = 0.85;
        floatSpeed = 2;
        break;

      case 'disconnected':
      case 'error':
        rotationSpeed = 0.1;
        coreScale = 0.9;
        floatSpeed = 0.2;
        break;
    }

    // -----------------------------------------
    // ₹ symbol animation
    // -----------------------------------------

    // coreRef.current.rotation.y += delta * rotationSpeed;

    // coreRef.current.rotation.x =
    //   Math.sin(time * floatSpeed) * floatHeight;

    // Keep the ₹ facing the user.
// Only give it a subtle floating motion.
    coreRef.current.rotation.x =Math.sin(time * floatSpeed) * floatHeight;

// Very subtle tilt instead of a full rotation
    coreRef.current.rotation.z =Math.sin(time * 0.8) * 0.04;
    // Smooth scale transition
    const currentScale = coreRef.current.scale.x;

    const newScale = THREE.MathUtils.lerp(
      currentScale,
      coreScale,
      0.1
    );

    coreRef.current.scale.setScalar(newScale);

    // -----------------------------------------
    // Inner geometric frame
    // -----------------------------------------

    frameRef.current.rotation.x +=
      delta * rotationSpeed * 1.5;

    frameRef.current.rotation.y +=
      delta * rotationSpeed * 0.5;

    // -----------------------------------------
    // Outer compass bezels
    // -----------------------------------------

    bezel1Ref.current.rotation.x +=
      delta * rotationSpeed * 0.8;

    bezel1Ref.current.rotation.y +=
      delta * rotationSpeed * 1.1;

    bezel2Ref.current.rotation.y -=
      delta * rotationSpeed * 0.9;

    bezel2Ref.current.rotation.z +=
      delta * rotationSpeed * 1.2;

    bezel3Ref.current.rotation.x -=
      delta * rotationSpeed * 0.4;

    bezel3Ref.current.rotation.z -=
      delta * rotationSpeed * 0.7;
  });

  // -----------------------------------------
  // Color based on agent state
  // -----------------------------------------

  const getCoreColor = () => {
    switch (agentState) {
      case 'idle':
        return '#3b82f6';

      case 'listening':
        return '#10b981';

      case 'thinking':
        return '#8b5cf6';

      case 'speaking':
        return '#3b82f6';

      case 'connecting':
      case 'initializing':
        return '#f59e0b';

      case 'error':
        return '#ef4444';

      case 'disconnected':
      default:
        return '#64748b';
    }
  };

  const coreColor = getCoreColor();

  const isActive =
    agentState === 'speaking' ||
    agentState === 'listening';

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.08}
      floatIntensity={0.15}
    >
      <group>
        {/* =========================================
            CENTRAL GLOWING RUPEE SYMBOL
        ========================================= */}

        <Text
          ref={coreRef}
          fontSize={1.35}
          anchorX="center"
          anchorY="middle"
          color={coreColor}
          outlineWidth={0.035}
          outlineColor={coreColor}
          characters="₹"
        >
          ₹

          <meshStandardMaterial
            color={coreColor}
            metalness={0.75}
            roughness={0.2}
            emissive={coreColor}
            emissiveIntensity={isActive ? 2.5 : 1.2}
            side={THREE.DoubleSide}

          />
        </Text>

        {/* =========================================
            INNER GEOMETRIC FRAME
        ========================================= */}

        <Icosahedron
          ref={frameRef}
          args={[1.25, 0]}
        >
          <meshBasicMaterial
            color="#cbd5e1"
            wireframe
            transparent
            opacity={0.35}
          />
        </Icosahedron>

        {/* =========================================
            OUTER PREMIUM COMPASS RING
        ========================================= */}

        <Torus
          ref={bezel1Ref}
          args={[1.5, 0.045, 16, 100]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.9}
            roughness={0.15}
          />
        </Torus>

        {/* =========================================
            SECOND COMPASS RING
        ========================================= */}

        <Torus
          ref={bezel2Ref}
          args={[1.8, 0.025, 16, 100]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={1}
            roughness={0.08}
          />
        </Torus>

        {/* =========================================
            OUTER FLAT RING
        ========================================= */}

        <Ring
          ref={bezel3Ref}
          args={[2.0, 2.025, 64]}
          rotation={[0, 0, 0]}
        >
          <meshBasicMaterial
            color="#64748b"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </Ring>
      </group>
    </Float>
  );
}

export function Compass3D({
  agentState,
  className,
}: Compass3DProps) {
  return (
    <div
      className={`h-full w-full ${
        className || ''
      }`}
    >
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        {/* =========================================
            LIGHTING
        ========================================= */}

        <ambientLight intensity={0.6} />

        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
        />

        <pointLight
          position={[-10, -10, -5]}
          intensity={0.8}
        />

        <pointLight
          position={[0, 0, 3]}
          intensity={1.5}
          color="#3b82f6"
        />

        {/* =========================================
            COMPASS
        ========================================= */}

        <CompassCore agentState={agentState} />

        {/* =========================================
            CAMERA CONTROLS
        ========================================= */}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}