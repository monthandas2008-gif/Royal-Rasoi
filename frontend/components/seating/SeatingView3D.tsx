'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import api from '@/lib/api';

// ──────────────────────────────────────────────────────────────────────────────
// TYPES & DATA
// ──────────────────────────────────────────────────────────────────────────────

export interface Table3DItem {
  id: number;
  name: string;
  capacity: number;
  zone: 'main_hall' | 'outdoor' | 'private' | 'bar';
  x: number;
  y: number;
  z: number;
  status: 'available' | 'booked' | 'waiting' | 'maintenance';
}

export const ARCHITECTURAL_TABLES: Table3DItem[] = [
  // ── Main Hall (Tables 1–10)
  { id: 1,  name: 'Table 1',  capacity: 2, zone: 'main_hall', x: -1.0,  y: 0.35, z: -1.2, status: 'booked'    },
  { id: 2,  name: 'Table 2',  capacity: 4, zone: 'main_hall', x: -1.0,  y: 0.35, z:  1.5, status: 'booked'    },
  { id: 3,  name: 'Table 3',  capacity: 4, zone: 'main_hall', x:  2.2,  y: 0.35, z: -1.2, status: 'available' },
  { id: 4,  name: 'Table 4',  capacity: 6, zone: 'main_hall', x:  2.2,  y: 0.35, z:  1.5, status: 'waiting'   },
  { id: 5,  name: 'Table 5',  capacity: 6, zone: 'main_hall', x: -4.5,  y: 0.35, z: -1.2, status: 'available' },
  { id: 6,  name: 'Table 6',  capacity: 8, zone: 'main_hall', x: -4.5,  y: 0.35, z:  1.5, status: 'available' },
  { id: 7,  name: 'Table 7',  capacity: 2, zone: 'main_hall', x: -2.0,  y: 0.35, z:  4.2, status: 'booked'    },
  { id: 8,  name: 'Table 8',  capacity: 4, zone: 'main_hall', x:  1.5,  y: 0.35, z:  4.2, status: 'available' },
  { id: 9,  name: 'Table 9',  capacity: 4, zone: 'main_hall', x:  4.8,  y: 0.35, z: -3.5, status: 'available' },
  { id: 10, name: 'Table 10', capacity: 6, zone: 'main_hall', x:  5.2,  y: 0.35, z:  1.2, status: 'booked'    },

  // ── Outdoor Terrace Garden (Tables 11–14)
  { id: 11, name: 'Table 11 (Terrace)', capacity: 4, zone: 'outdoor', x: -7.0,  y: 0.85, z: -6.5, status: 'available' },
  { id: 12, name: 'Table 12 (Terrace)', capacity: 4, zone: 'outdoor', x: -4.5,  y: 0.85, z: -6.5, status: 'available' },
  { id: 13, name: 'Table 13 (Terrace)', capacity: 6, zone: 'outdoor', x: -2.0,  y: 0.85, z: -6.5, status: 'booked'    },
  { id: 14, name: 'Table 14 (Terrace)', capacity: 2, zone: 'outdoor', x:  0.8,  y: 0.85, z: -6.5, status: 'available' },

  // ── Royal Darbar Private Dining (Tables 15–17)
  { id: 15, name: 'Table 15 (Darbar Suite)',  capacity: 8,  zone: 'private', x: -7.5,  y: 0.35, z:  4.0, status: 'available' },
  { id: 16, name: 'Table 16 (Darbar Grand)',  capacity: 10, zone: 'private', x: -7.5,  y: 0.35, z:  7.0, status: 'booked'    },
  { id: 17, name: 'Table 17 (Darbar Majlis)', capacity: 6,  zone: 'private', x: -4.2,  y: 0.35, z:  7.0, status: 'available' },

  // ── Cocktail Lounge & Bar (Tables 18–20)
  { id: 18, name: 'Table 18 (Bar Stool)', capacity: 2, zone: 'bar', x: 4.8,  y: 0.6,  z: -5.0, status: 'available' },
  { id: 19, name: 'Table 19 (Bar Stool)', capacity: 2, zone: 'bar', x: 7.2,  y: 0.6,  z: -5.0, status: 'booked'    },
  { id: 20, name: 'Table 20 (Bar Lounge)', capacity: 4, zone: 'bar', x: 7.5,  y: 0.35, z: -2.2, status: 'available' },
];

export const DEFAULT_DEMO_TABLES = ARCHITECTURAL_TABLES;

// ──────────────────────────────────────────────────────────────────────────────
// MATERIALS (shared, memoized)
// ──────────────────────────────────────────────────────────────────────────────

const MAT = {
  darkWood:    new THREE.MeshStandardMaterial({ color: '#3D1F0D', roughness: 0.75, metalness: 0.04 }),
  lightWood:   new THREE.MeshStandardMaterial({ color: '#7C4A1E', roughness: 0.7,  metalness: 0.0  }),
  chairFabric: new THREE.MeshStandardMaterial({ color: '#1A3A28', roughness: 0.9,  metalness: 0.0  }),
  chairBack:   new THREE.MeshStandardMaterial({ color: '#1E2E20', roughness: 0.85, metalness: 0.0  }),
  metalDark:   new THREE.MeshStandardMaterial({ color: '#1C1C1C', roughness: 0.4,  metalness: 0.85 }),
  metalBright: new THREE.MeshStandardMaterial({ color: '#8C8C8C', roughness: 0.3,  metalness: 0.9  }),
  marble:      new THREE.MeshStandardMaterial({ color: '#CEC9BE', roughness: 0.25, metalness: 0.08 }),
  marbleDark:  new THREE.MeshStandardMaterial({ color: '#252525', roughness: 0.2,  metalness: 0.1  }),
  terraceWood: new THREE.MeshStandardMaterial({ color: '#6B3A1F', roughness: 0.65, metalness: 0.0  }),
  wall:        new THREE.MeshStandardMaterial({ color: '#E8E0D0', roughness: 0.9,  metalness: 0.0  }),
  ceilingDark: new THREE.MeshStandardMaterial({ color: '#1A1008', roughness: 1.0,  metalness: 0.0  }),
  greenPlant:  new THREE.MeshStandardMaterial({ color: '#1A5C22', roughness: 0.85, metalness: 0.0  }),
  terracotta:  new THREE.MeshStandardMaterial({ color: '#8C4A25', roughness: 0.8,  metalness: 0.0  }),
  concrete:    new THREE.MeshStandardMaterial({ color: '#B0ABAB', roughness: 0.6,  metalness: 0.05 }),
  skinLight:   new THREE.MeshStandardMaterial({ color: '#D4956A', roughness: 0.6,  metalness: 0.0  }),
  skinMid:     new THREE.MeshStandardMaterial({ color: '#A0522D', roughness: 0.6,  metalness: 0.0  }),
  clothBlue:   new THREE.MeshStandardMaterial({ color: '#1E3A8A', roughness: 0.7,  metalness: 0.0  }),
  clothGreen:  new THREE.MeshStandardMaterial({ color: '#1A3D2B', roughness: 0.7,  metalness: 0.0  }),
  hairDark:    new THREE.MeshStandardMaterial({ color: '#1A1008', roughness: 0.8,  metalness: 0.0  }),
  barGlass:    new THREE.MeshStandardMaterial({ color: '#A7C8D8', roughness: 0.0,  metalness: 0.05, transparent: true, opacity: 0.5 }),
  goldEmissive:new THREE.MeshStandardMaterial({ color: '#D4AF37', emissive: '#D4AF37', emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.7 }),
};

// Emissive ring materials - created dynamically by status
const RING_MAT_CACHE: Record<string, THREE.MeshStandardMaterial> = {};

function makeRingMaterial(color: string, selected: boolean) {
  const key = color + '_' + (selected ? '1' : '0');
  if (!RING_MAT_CACHE[key]) {
    RING_MAT_CACHE[key] = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: selected ? 1.3 : 0.55,
      transparent: true,
      opacity: selected ? 0.9 : 0.65,
      side: THREE.DoubleSide,
    });
  }
  return RING_MAT_CACHE[key];
}

// ──────────────────────────────────────────────────────────────────────────────
// SINGLE DINING CHAIR (dark teal/forest green upholstered)
// ──────────────────────────────────────────────────────────────────────────────

function DiningChair({ position, rotY }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY ?? 0, 0]}>
      {/* Seat cushion (thick, clearly visible) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.09, 0.42]} />
        <meshStandardMaterial color="#1A3A28" roughness={0.88} />
      </mesh>
      {/* Seat frame (visible underside) */}
      <mesh position={[0, -0.065, 0]} castShadow>
        <boxGeometry args={[0.40, 0.04, 0.38]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Back rest — main panel */}
      <mesh position={[0, 0.30, -0.19]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.50, 0.07]} />
        <meshStandardMaterial color="#162E1F" roughness={0.85} />
      </mesh>
      {/* Back rest — fabric face */}
      <mesh position={[0, 0.30, -0.15]} castShadow>
        <boxGeometry args={[0.36, 0.42, 0.038]} />
        <meshStandardMaterial color="#1A3A28" roughness={0.9} />
      </mesh>
      {/* Back vertical posts (connect seat to backrest) */}
      <mesh position={[-0.16, 0.08, -0.18]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.20, 8]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0.16, 0.08, -0.18]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.20, 8]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* 4 legs */}
      <mesh position={[-0.17, -0.22, -0.16]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.32, 8]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0.17, -0.22, -0.16]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.32, 8]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[-0.17, -0.22, 0.16]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.32, 8]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0.17, -0.22, 0.16]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.32, 8]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Front stretcher rung */}
      <mesh position={[0, -0.30, 0.16]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.32, 6]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.5} metalness={0.7} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// BAR STOOL (metal, with padded seat)
// ──────────────────────────────────────────────────────────────────────────────

function BarStool({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} material={MAT.chairFabric} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.06, 16]} />
      </mesh>
      <mesh position={[0, -0.03, 0]} material={MAT.metalBright} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
      </mesh>
      {/* stem */}
      <mesh position={[0, -0.32, 0]} material={MAT.metalBright} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 0.55, 10]} />
      </mesh>
      {/* Foot ring */}
      <mesh position={[0, -0.5, 0]} material={MAT.metalBright} castShadow>
        <torusGeometry args={[0.17, 0.015, 8, 24]} />
      </mesh>
      {/* 4 foot prongs */}
      {[0, Math.PI/2, Math.PI, 3*Math.PI/2].map((a, i) => (
        <mesh key={i} position={[Math.sin(a)*0.14, -0.63, Math.cos(a)*0.14]} material={MAT.metalBright} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.25, 8]} />
        </mesh>
      ))}
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SEATED AVATAR (placed at booked seats)
// ──────────────────────────────────────────────────────────────────────────────

const SKIN_TONES = ['#D4956A', '#A0522D', '#C68642', '#E8B89A', '#7B4C28'];
const CLOTH_COLORS = ['#1E3A8A', '#1A3D2B', '#6B21A8', '#7C1D1D', '#1A3D60', '#4A2540'];
const HAIR_COLORS  = ['#1A1008', '#3D1F0D', '#5C4A1E', '#1A1A1A', '#8B5E3C'];

let avatarSeed = 0;

function SeatedAvatar({ position, rotY = 0, tableStatus }: {
  position: [number, number, number];
  rotY?: number;
  tableStatus: 'booked' | 'waiting';
}) {
  const seed = (avatarSeed++) % 5;
  const skin  = SKIN_TONES[seed];
  const cloth = CLOTH_COLORS[seed % CLOTH_COLORS.length];
  const hair  = HAIR_COLORS[seed % HAIR_COLORS.length];
  const skinMat  = new THREE.MeshStandardMaterial({ color: skin,  roughness: 0.6 });
  const clothMat = new THREE.MeshStandardMaterial({ color: cloth, roughness: 0.7 });
  const hairMat  = new THREE.MeshStandardMaterial({ color: hair,  roughness: 0.8 });
  // Waitlist avatars slightly transparent
  if (tableStatus === 'waiting') {
    skinMat.opacity = 0.7; skinMat.transparent = true;
    clothMat.opacity = 0.7; clothMat.transparent = true;
    hairMat.opacity = 0.7; hairMat.transparent = true;
  }
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} material={clothMat} castShadow>
        <cylinderGeometry args={[0.14, 0.15, 0.35, 10]} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.52, 0]} material={skinMat} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.1, 8]} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.66, 0]} material={skinMat} castShadow>
        <sphereGeometry args={[0.12, 14, 14]} />
      </mesh>
      {/* Hair cap */}
      <mesh position={[0, 0.71, -0.01]} material={hairMat} castShadow>
        <sphereGeometry args={[0.123, 12, 12]} />
      </mesh>
      {/* Arms */}
      <mesh position={[0.16, 0.32, 0.08]} rotation={[0.3, 0, -0.2]} material={clothMat} castShadow>
        <capsuleGeometry args={[0.04, 0.2, 4, 8]} />
      </mesh>
      <mesh position={[-0.16, 0.32, 0.08]} rotation={[0.3, 0, 0.2]} material={clothMat} castShadow>
        <capsuleGeometry args={[0.04, 0.2, 4, 8]} />
      </mesh>
    </group>
  );
}

// Compute avatar positions around a table
function chairPositions(capacity: number, tableW: number, tableD: number): Array<{ pos: [number,number,number]; rotY: number }> {
  const gap = 0.40;
  const cy = -0.04; // seat y relative to table group origin
  if (capacity === 2) return [
    { pos: [0, cy, tableD/2 + gap] as [number,number,number], rotY: Math.PI },
    { pos: [0, cy, -(tableD/2 + gap)] as [number,number,number], rotY: 0 },
  ];
  if (capacity === 4) return [
    { pos: [0, cy,  tableD/2 + gap] as [number,number,number], rotY: Math.PI },
    { pos: [0, cy, -(tableD/2 + gap)] as [number,number,number], rotY: 0 },
    { pos: [ tableW/2 + gap, cy, 0] as [number,number,number], rotY: -Math.PI/2 },
    { pos: [-(tableW/2 + gap), cy, 0] as [number,number,number], rotY: Math.PI/2 },
  ];
  if (capacity === 6) return [
    { pos: [0, cy,  tableD/2 + gap] as [number,number,number], rotY: Math.PI },
    { pos: [0, cy, -(tableD/2 + gap)] as [number,number,number], rotY: 0 },
    { pos: [ tableW/2 + gap, cy,  tableD/3] as [number,number,number], rotY: -Math.PI/2 },
    { pos: [ tableW/2 + gap, cy, -tableD/3] as [number,number,number], rotY: -Math.PI/2 },
    { pos: [-(tableW/2 + gap), cy,  tableD/3] as [number,number,number], rotY: Math.PI/2 },
    { pos: [-(tableW/2 + gap), cy, -tableD/3] as [number,number,number], rotY: Math.PI/2 },
  ];
  if (capacity === 8) return [
    { pos: [0, cy,  tableD/2 + gap] as [number,number,number], rotY: Math.PI },
    { pos: [0, cy, -(tableD/2 + gap)] as [number,number,number], rotY: 0 },
    { pos: [ tableW/2 + gap, cy,  tableD*0.35] as [number,number,number], rotY: -Math.PI/2 },
    { pos: [ tableW/2 + gap, cy,  0] as [number,number,number], rotY: -Math.PI/2 },
    { pos: [ tableW/2 + gap, cy, -tableD*0.35] as [number,number,number], rotY: -Math.PI/2 },
    { pos: [-(tableW/2 + gap), cy,  tableD*0.35] as [number,number,number], rotY: Math.PI/2 },
    { pos: [-(tableW/2 + gap), cy,  0] as [number,number,number], rotY: Math.PI/2 },
    { pos: [-(tableW/2 + gap), cy, -tableD*0.35] as [number,number,number], rotY: Math.PI/2 },
  ];
  if (capacity >= 10) return [
    { pos: [0, cy,  tableD/2 + gap] as [number,number,number], rotY: Math.PI },
    { pos: [0, cy, -(tableD/2 + gap)] as [number,number,number], rotY: 0 },
    { pos: [ tableW/2 + gap, cy,  tableD*0.42] as [number,number,number], rotY: -Math.PI/2 },
    { pos: [ tableW/2 + gap, cy,  tableD*0.14] as [number,number,number], rotY: -Math.PI/2 },
    { pos: [ tableW/2 + gap, cy, -tableD*0.14] as [number,number,number], rotY: -Math.PI/2 },
    { pos: [ tableW/2 + gap, cy, -tableD*0.42] as [number,number,number], rotY: -Math.PI/2 },
    { pos: [-(tableW/2 + gap), cy,  tableD*0.42] as [number,number,number], rotY: Math.PI/2 },
    { pos: [-(tableW/2 + gap), cy,  tableD*0.14] as [number,number,number], rotY: Math.PI/2 },
    { pos: [-(tableW/2 + gap), cy, -tableD*0.14] as [number,number,number], rotY: Math.PI/2 },
    { pos: [-(tableW/2 + gap), cy, -tableD*0.42] as [number,number,number], rotY: Math.PI/2 },
  ];
  return [];
}

// ──────────────────────────────────────────────────────────────────────────────
// PENDANT LAMP
// ──────────────────────────────────────────────────────────────────────────────

function PendantLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Ceiling rose */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 10]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Cable */}
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.72, 6]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.6} />
      </mesh>
      {/* Shade outer (dark metal, DoubleSide so visible top-down) */}
      <mesh position={[0, 0.07, 0]}>
        <coneGeometry args={[0.24, 0.30, 16, 1, true]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.4} metalness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Shade inner (warm gold visible from below) */}
      <mesh position={[0, 0.07, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.22, 0.28, 14, 1, true]} />
        <meshStandardMaterial color="#C8892A" roughness={0.5} metalness={0.4} emissive="#8B5E1A" emissiveIntensity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Edison bulb */}
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#FFD880" emissive="#FFB830" emissiveIntensity={4.0} />
      </mesh>
      {/* Warm point light from lamp */}
      <pointLight position={[0, -0.08, 0]} intensity={1.2} color="#FFE088" distance={5.5} decay={2} />
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// POTTED PLANT
// ──────────────────────────────────────────────────────────────────────────────

function PottedPlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.22, 0]} material={MAT.terracotta} castShadow>
        <cylinderGeometry args={[0.22, 0.17, 0.44, 12]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} material={MAT.greenPlant} castShadow>
        <sphereGeometry args={[0.34, 10, 10]} />
      </mesh>
      <mesh position={[0.12, 0.72, 0.05]} material={MAT.greenPlant} castShadow>
        <sphereGeometry args={[0.24, 8, 8]} />
      </mesh>
      <mesh position={[-0.09, 0.68, -0.06]} material={MAT.greenPlant} castShadow>
        <sphereGeometry args={[0.20, 8, 8]} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MARBLE TILE FLOOR (grid of tiles)
// ──────────────────────────────────────────────────────────────────────────────

function MarbleFloor() {
  const tileSize = 1.5;
  const cols = 15;
  const rows = 15;
  const startX = -11;
  const startZ = -11;

  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * tileSize + tileSize / 2;
      const z = startZ + r * tileSize + tileSize / 2;
      const alt = (r + c) % 2 === 0;
      tiles.push(
        <mesh key={`${r}-${c}`} position={[x, 0.02, z]} receiveShadow>
          <boxGeometry args={[tileSize - 0.05, 0.09, tileSize - 0.05]} />
          <meshStandardMaterial
            color={alt ? '#D6D0C2' : '#C2BAA8'}
            roughness={0.16}
            metalness={0.15}
          />
        </mesh>
      );
    }
  }
  return (
    <group>
      {/* Grout base slab */}
      <mesh position={[1, -0.02, 1]} receiveShadow>
        <boxGeometry args={[28, 0.06, 28]} />
        <meshStandardMaterial color="#6E685E" roughness={0.95} />
      </mesh>
      {tiles}
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// RESTAURANT TABLE MESH (realistic wood table + chairs + status ring + label)
// ──────────────────────────────────────────────────────────────────────────────

interface TableMeshProps {
  table: Table3DItem;
  isSelected: boolean;
  onSelect: () => void;
}

function TableMesh({ table, isSelected, onSelect }: TableMeshProps) {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);

  const isBar = table.zone === 'bar';
  const tableW = table.capacity >= 10 ? 3.0 : table.capacity >= 8 ? 2.5 : table.capacity >= 6 ? 2.0 : table.capacity === 2 ? 1.0 : 1.55;
  const tableD = table.capacity >= 8 ? 1.15 : table.capacity >= 6 ? 1.0 : table.capacity === 2 ? 0.9 : 1.0;
  const tableH = 0.08;

  const statusColor = {
    available:   '#22C55E',
    booked:      '#EF4444',
    waiting:     '#F59E0B',
    maintenance: '#6B7280',
  }[table.status];

  const ringColor = isSelected ? '#D4AF37' : statusColor;

  const ringMat = makeRingMaterial(ringColor, isSelected);

  // Calm, steady architectural light (no blinking)
  useFrame(() => {
    if (ringRef.current && !isSelected) {
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.55;
      }
    }
  });

  const chairs = chairPositions(table.capacity, tableW, tableD);

  // Avatar y-offset above seat
  const avatarY = 0.12;

  return (
    <group
      position={[table.x, table.y, table.z]}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      {/* ── TABLE TOP */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[tableW, tableH, tableD]} />
        <meshStandardMaterial
          color={hovered ? '#5C2F12' : '#3D1F0D'}
          roughness={0.65}
          metalness={0.04}
        />
      </mesh>
      {/* Edge banding (lighter strip around table top edge) */}
      <mesh position={[0, -tableH/2 - 0.008, 0]}>
        <boxGeometry args={[tableW + 0.02, 0.016, tableD + 0.02]} />
        <meshStandardMaterial color="#6B3A1F" roughness={0.6} />
      </mesh>

      {/* ── TABLE LEGS */}
      {!isBar && [
        [-tableW/2+0.12,  -0.25, -tableD/2+0.10] as [number,number,number],
        [ tableW/2-0.12,  -0.25, -tableD/2+0.10] as [number,number,number],
        [-tableW/2+0.12,  -0.25,  tableD/2-0.10] as [number,number,number],
        [ tableW/2-0.12,  -0.25,  tableD/2-0.10] as [number,number,number],
      ].map((legPos, i) => (
        <mesh key={i} position={legPos} material={MAT.metalDark} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 0.50, 8]} />
        </mesh>
      ))}
      {/* Cross stretcher */}
      {!isBar && (
        <mesh position={[0, -0.38, 0]} material={MAT.metalDark}>
          <boxGeometry args={[tableW - 0.25, 0.016, 0.02]} />
        </mesh>
      )}

      {/* ── BAR TABLE: single thick pedestal */}
      {isBar && (
        <mesh position={[0, -0.15, 0]} material={MAT.metalBright} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.28, 10]} />
        </mesh>
      )}

      {/* ── CHAIRS */}
      {isBar
        ? chairs.map((c, i) => <BarStool key={i} position={[c.pos[0], c.pos[1] - 0.3, c.pos[2]]} />)
        : chairs.map((c, i) => <DiningChair key={i} position={c.pos} rotY={c.rotY} />)
      }

      {/* ── SEATED AVATARS for booked/waiting */}
      {(table.status === 'booked' || table.status === 'waiting') && chairs.map((c, i) => {
        // For waiting, only show some guests (not all seats)
        if (table.status === 'waiting' && i >= Math.ceil(chairs.length / 2)) return null;
        const avatarStatus = table.status as 'booked' | 'waiting';
        return (
          <SeatedAvatar
            key={i}
            position={[c.pos[0], c.pos[1] + avatarY, c.pos[2]]}
            rotY={c.rotY + Math.PI}
            tableStatus={avatarStatus}
          />
        );
      })}

      {/* ── TABLE ITEMS (tablecloth, centrepiece) */}
      {!isBar && (
        <>
          {/* Tablecloth */}
          <mesh position={[0, tableH/2 + 0.005, 0]} receiveShadow>
            <boxGeometry args={[tableW - 0.12, 0.01, tableD - 0.1]} />
            <meshStandardMaterial color="#F8F5EE" roughness={0.95} />
          </mesh>
          {/* Candle centrepiece */}
          <mesh position={[0, tableH/2 + 0.04, 0]}>
            <cylinderGeometry args={[0.025, 0.028, 0.06, 8]} />
            <meshStandardMaterial color="#F5DEB3" roughness={0.9} />
          </mesh>
          <mesh position={[0, tableH/2 + 0.078, 0]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color="#FFE97F" emissive="#FFD060" emissiveIntensity={2.0} />
          </mesh>
        </>
      )}

      {/* ── STATUS RING (floor) */}
      <mesh ref={ringRef} position={[0, -0.42, 0]} rotation={[-Math.PI/2, 0, 0]} material={ringMat}>
        <ringGeometry args={[
          Math.max(tableW, tableD) * 0.6,
          Math.max(tableW, tableD) * 0.8,
          40
        ]} />
      </mesh>

      {/* ── SELECTED GOLD HALO RING */}
      {isSelected && (
        <mesh position={[0, -0.40, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[Math.max(tableW, tableD) * 0.81, Math.max(tableW, tableD) * 0.88, 40]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* ── FLOATING LABEL */}
      <Html
        position={[0, isBar ? 0.85 : 0.95, 0]}
        center
        distanceFactor={12}
        occlude={false}
      >
        <div
          className="pointer-events-none select-none whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] font-bold shadow-lg flex items-center gap-1.5 border"
          style={{
            background: isSelected
              ? 'rgba(28,25,23,0.95)'
              : table.status === 'available'
              ? 'rgba(0,43,25,0.88)'
              : table.status === 'booked'
              ? 'rgba(69,10,10,0.88)'
              : 'rgba(69,26,3,0.88)',
            borderColor: isSelected
              ? '#D4AF37'
              : table.status === 'available'
              ? '#22C55E'
              : table.status === 'booked'
              ? '#EF4444'
              : '#F59E0B',
            color: isSelected
              ? '#FAEEC5'
              : table.status === 'available'
              ? '#86EFAC'
              : table.status === 'booked'
              ? '#FCA5A5'
              : '#FDE68A',
            boxShadow: `0 0 10px ${isSelected ? '#D4AF37' : table.status === 'available' ? '#22C55E' : table.status === 'booked' ? '#EF4444' : '#F59E0B'}44`,
          }}
        >
          <span
            style={{
              width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
              background: table.status === 'available' ? '#22C55E' : table.status === 'booked' ? '#EF4444' : '#F59E0B',
              boxShadow: `0 0 6px ${table.status === 'available' ? '#22C55E' : table.status === 'booked' ? '#EF4444' : '#F59E0B'}`,
            }}
          />
          <span>{table.name}</span>
          <span style={{ opacity: 0.75, fontWeight: 400, fontSize: 9 }}>
            {table.status === 'available' ? '· Free' : table.status === 'booked' ? '· Occupied' : '· Waitlist'}
          </span>
        </div>
      </Html>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// BAR COUNTER
// ──────────────────────────────────────────────────────────────────────────────

function BarCounter() {
  return (
    <group>
      {/* Main counter body — dark stone island */}
      <mesh position={[6.4, 0.52, -7.2]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 1.05, 1.1]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.35} metalness={0.12} side={THREE.DoubleSide} />
      </mesh>
      {/* Marble counter top — light veined */}
      <mesh position={[6.4, 1.08, -7.2]} castShadow receiveShadow>
        <boxGeometry args={[7.0, 0.10, 1.25]} />
        <meshStandardMaterial color="#D0C8BC" roughness={0.16} metalness={0.1} />
      </mesh>
      {/* Counter front face panel (wood veneer) */}
      <mesh position={[6.4, 0.52, -6.64]}>
        <boxGeometry args={[6.8, 1.05, 0.06]} />
        <meshStandardMaterial color="#3D2008" roughness={0.55} />
      </mesh>
      {/* Neon under-glow strip */}
      <mesh position={[6.4, 0.02, -6.62]}>
        <boxGeometry args={[6.8, 0.05, 0.05]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#9D4EDD" emissiveIntensity={4.5} />
      </mesh>
      <pointLight position={[6.4, 0.1, -6.45]} intensity={1.8} color="#9D4EDD" distance={6} decay={2} />

      {/* Open-concept back bar freestanding brass rack — NO SOLID WALLS */}
      {[-3.0, -1.0, 1.0, 3.0].map((px, i) => (
        <mesh key={i} position={[6.4 + px, 1.3, -8.6]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 1.8, 8]} />
          <meshStandardMaterial color="#C59B27" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
      {/* Open floating shelves */}
      {[0.7, 1.3, 1.9].map((shelfy, i) => (
        <mesh key={i} position={[6.4, shelfy, -8.6]}>
          <boxGeometry args={[6.4, 0.03, 0.35]} />
          <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.3} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* Bottle shapes on open shelves */}
      {[-2.5,-1.5,-0.5,0.5,1.5,2.5].map((bx, i) => (
        <React.Fragment key={i}>
          <mesh position={[6.4 + bx, 1.45, -8.6]}>
            <cylinderGeometry args={[0.055, 0.065, 0.45, 10]} />
            <meshStandardMaterial
              color={['#1A3D60','#3D1A5C','#1A5C3D','#5C1A1A','#8B6914','#1A1A5C'][i]}
              roughness={0.15} metalness={0.35} transparent opacity={0.88}
            />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// TERRACE SECTION (Open elevated teak deck — zero wall barriers)
// ──────────────────────────────────────────────────────────────────────────────

function TerraceDeck() {
  return (
    <group>
      {/* Deck platform base (teak-colored slab) */}
      <mesh position={[-3.0, 0.42, -6.5]} receiveShadow castShadow>
        <boxGeometry args={[9.8, 0.84, 5.2]} />
        <meshStandardMaterial color="#5C2D0A" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Deck planks (alternating strips, clearly visible top-down) */}
      {Array.from({ length: 12 }, (_, i) => i - 5.5).map((px, i) => (
        <mesh key={i} position={[px * 0.82, 0.87, -6.5]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.055, 5.0]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#8C5224' : '#7A4418'} roughness={0.62} />
        </mesh>
      ))}
      {/* Warm step edge transition into main hall — open entry */}
      <mesh position={[-3.0, 0.22, -3.9]} castShadow>
        <boxGeometry args={[9.8, 0.42, 0.22]} />
        <meshStandardMaterial color="#4A2208" roughness={0.7} />
      </mesh>

      {/* Canopy poles at outer corners only — no middle railings */}
      {[-7.5, 1.5].map((px, i) => (
        <mesh key={i} position={[px, 2.2, -8.7]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 3.2, 8]} />
          <meshStandardMaterial color="#2A3A4A" metalness={0.75} roughness={0.25} />
        </mesh>
      ))}
      {/* String light wire */}
      <mesh position={[-3.0, 3.6, -8.7]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 9.8, 6]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* Fairy light bulbs */}
      {[-6.5, -5.0, -3.5, -2.0, -0.5, 1.0].map((bx, i) => (
        <group key={i} position={[bx, 3.52, -8.7]}>
          <mesh>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#FFD880" emissive="#FFD060" emissiveIntensity={3.5} />
          </mesh>
          <pointLight intensity={0.5} color="#FFE4A0" distance={3.0} decay={2} />
        </group>
      ))}

      {/* Terrace perimeter lush potted plants */}
      <PottedPlant position={[-7.5, 0.9, -8.6]} scale={0.9} />
      <PottedPlant position={[-5.3, 0.9, -8.6]} scale={0.85} />
      <PottedPlant position={[-3.1, 0.9, -8.6]} scale={0.95} />
      <PottedPlant position={[-0.9, 0.9, -8.6]} scale={0.88} />
      <PottedPlant position={[1.3,  0.9, -8.6]} scale={0.80} />
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SIDE PANEL HUD (HTML overlay, outside Canvas)
// ──────────────────────────────────────────────────────────────────────────────

interface HudProps {
  selectedTable: Table3DItem | null;
  tables: Table3DItem[];
  onClose: () => void;
  onConfirm: () => void;
}

function SeatingHUD({ selectedTable, tables, onClose, onConfirm }: HudProps) {
  const counts = {
    available:   tables.filter(t => t.status === 'available').length,
    booked:      tables.filter(t => t.status === 'booked').length,
    waiting:     tables.filter(t => t.status === 'waiting').length,
    maintenance: tables.filter(t => t.status === 'maintenance').length,
  };

  return (
    <>
      {/* Legend — bottom left */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#0F172A]/90 backdrop-blur-md rounded-xl border border-white/15 px-4 py-3 text-xs shadow-xl">
        <p className="text-[#D4AF37] font-bold tracking-widest uppercase text-[9px] mb-2">Seating Status</p>
        {[
          { color: '#22C55E', label: 'Available', count: counts.available },
          { color: '#EF4444', label: 'Occupied',  count: counts.booked },
          { color: '#F59E0B', label: 'Waitlisted',count: counts.waiting },
          { color: '#6B7280', label: 'Reserved',  count: counts.maintenance },
        ].map(({ color, label, count }) => (
          <div key={label} className="flex items-center gap-2 mb-1.5">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
            <span className="text-white/80 font-medium">{label}</span>
            <span className="text-white/50 ml-auto pl-3">{count}</span>
          </div>
        ))}
      </div>

      {/* Table detail panel — bottom right */}
      {selectedTable && (
        <div className="absolute bottom-4 right-4 z-20 bg-[#0F172A]/95 backdrop-blur-md rounded-xl border border-[#D4AF37]/60 px-5 py-4 text-xs shadow-2xl min-w-[210px]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#D4AF37] font-bold text-sm">{selectedTable.name}</p>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white text-lg leading-none cursor-pointer ml-3"
            >×</button>
          </div>
          <div className="space-y-1 text-white/75">
            <p>Capacity: <span className="text-white font-semibold">{selectedTable.capacity} guests</span></p>
            <p>Zone: <span className="text-white font-semibold capitalize">{selectedTable.zone.replace('_',' ')}</span></p>
            <p>Status: <span
              className="font-semibold"
              style={{ color: selectedTable.status === 'available' ? '#22C55E' : selectedTable.status === 'booked' ? '#EF4444' : '#F59E0B' }}
            >
              {selectedTable.status === 'available' ? 'Available' : selectedTable.status === 'booked' ? 'Occupied' : 'Waitlisted'}
            </span></p>
          </div>
          {selectedTable.status === 'available' && (
            <button
              onClick={onConfirm}
              className="mt-3 w-full py-2 rounded-lg bg-[#D4AF37] text-[#1C1917] text-xs font-bold hover:bg-[#B8941F] transition-colors cursor-pointer"
            >
              Select This Table
            </button>
          )}
          {selectedTable.status === 'waiting' && (
            <button
              onClick={onConfirm}
              className="mt-3 w-full py-2 rounded-lg bg-[#F59E0B]/90 text-[#1C1917] text-xs font-bold hover:bg-[#D97706] transition-colors cursor-pointer"
            >
              Join Waitlist
            </button>
          )}
          {selectedTable.status === 'booked' && (
            <p className="mt-3 text-center text-[#FCA5A5] text-[11px] font-medium">
              Table fully occupied
            </p>
          )}
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN SCENE (inside Canvas)
// ──────────────────────────────────────────────────────────────────────────────

interface SceneProps {
  tables: Table3DItem[];
  selectedTableId?: number | null;
  onTableSelect?: (table: Table3DItem) => void;
}

function RestaurantScene({ tables, selectedTableId, onTableSelect }: SceneProps) {
  const controlsRef = useRef<any>(null);
  return (
    <>
      {/* ── LIGHTING — omnidirectional, works from all camera angles ── */}
      {/* Strong ambient so no face is ever black */}
      <ambientLight intensity={1.1} color="#FFF8F0" />
      {/* Top-down key (ideal for top view) */}
      <directionalLight
        position={[0, 30, 0]}
        intensity={1.6}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      {/* Front fill */}
      <directionalLight position={[0, 12, 25]} intensity={0.75} color="#FFF5E4" />
      {/* Back fill */}
      <directionalLight position={[0, 12, -25]} intensity={0.55} color="#E8F0FF" />
      {/* Left fill */}
      <directionalLight position={[-25, 12, 0]} intensity={0.55} color="#FFF5E4" />
      {/* Right fill */}
      <directionalLight position={[25, 12, 0]} intensity={0.55} color="#FFF5E4" />
      {/* Ground bounce (upward) */}
      <directionalLight position={[0, -10, 0]} intensity={0.25} color="#E8DCC8" />
      {/* Warm overhead area point lights */}
      <pointLight position={[0, 7, 0]}    intensity={2.5} color="#FFE4A0" distance={22} decay={2} />
      <pointLight position={[-5, 6, 2]}   intensity={1.8} color="#FFE4A0" distance={18} decay={2} />
      <pointLight position={[6, 6, 2]}    intensity={1.8} color="#FFE4A0" distance={18} decay={2} />
      <pointLight position={[0, 6, -6]}   intensity={1.5} color="#FFE4A0" distance={16} decay={2} />
      {/* Bar neon accent */}
      <pointLight position={[6.4, 2, -7.5]} intensity={2.0} color="#9D4EDD" distance={9} decay={2} />
      <pointLight position={[6.4, 2, -7.5]} intensity={1.2} color="#06B6D4" distance={7} decay={2} />
      {/* Pendant lamps over main dining */}
      <PendantLamp position={[-1.0, 4.6, -1.2]} />
      <PendantLamp position={[ 2.2, 4.6, -1.2]} />
      <PendantLamp position={[-5.0, 4.6,  0.2]} />
      <PendantLamp position={[ 4.5, 4.6,  3.8]} />
      <PendantLamp position={[ 6.5, 4.6, -2.0]} />

      {/* ── CONTROLS ─────────────────────────────────────────────── */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minPolarAngle={0}
        maxPolarAngle={Math.PI * 0.88}
        minDistance={5}
        maxDistance={52}
        target={[1, 0, 0]}
      />

      {/* ── ENVIRONMENT ─────────────────────────────────────────── */}
      <Environment preset="warehouse" background={false} />

      {/* ── ARCHITECTURE (Open Plan — Zero Walls) ── */}
      <MarbleFloor />
      <TerraceDeck />
      <BarCounter />

      {/* Main hall plants */}
      <PottedPlant position={[-8.4, 0.0, -3.0]} scale={1.1} />
      <PottedPlant position={[-8.4, 0.0,  4.0]} scale={1.0} />
      <PottedPlant position={[10.5, 0.0, -4.0]} scale={0.9} />
      <PottedPlant position={[10.5, 0.0,  4.5]} scale={1.0} />

      {/* ── TABLES ──────────────────────────────────────────────── */}
      {tables.map((table) => (
        <TableMesh
          key={table.id}
          table={table}
          isSelected={selectedTableId === table.id}
          onSelect={() => onTableSelect && onTableSelect(table)}
        />
      ))}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// EXPORTED COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

interface SeatingView3DProps {
  tables?: Table3DItem[];
  selectedTableId?: number | null;
  onTableSelect?: (table: Table3DItem) => void;
  onTablesChange?: (tables: Table3DItem[]) => void;
  date?: string;
  timeSlot?: string;
  waitlistOnly?: boolean;
}

export const SeatingView3D: React.FC<SeatingView3DProps> = ({
  tables: propTables,
  selectedTableId,
  onTableSelect,
  onTablesChange,
  date,
  timeSlot,
  waitlistOnly = false,
}) => {
  const initialTables = propTables ?? ARCHITECTURAL_TABLES;
  const filteredInit = waitlistOnly
    ? initialTables.filter((t) => t.status === 'waiting')
    : initialTables;
  const [tables, setTables] = useState<Table3DItem[]>(filteredInit);
  const [selectedDetail, setSelectedDetail] = useState<Table3DItem | null>(null);
  const controlsRef = useRef<any>(null);

  // Sync if parent passes updated tables
  useEffect(() => {
    if (propTables) {
      setTables(waitlistOnly ? propTables.filter((t) => t.status === 'waiting') : propTables);
    }
  }, [propTables, waitlistOnly]);

  // Sync selected table detail when selectedTableId prop changes (e.g. from 2D view)
  useEffect(() => {
    if (selectedTableId != null) {
      const match = tables.find((t) => t.id === selectedTableId);
      if (match) setSelectedDetail(match);
    } else {
      setSelectedDetail(null);
    }
  }, [selectedTableId, tables]);

  // Live availability polling (every 5s if date + timeSlot provided)
  useEffect(() => {
    if (!date || !timeSlot) return;
    let cancelled = false;

    const fetch = async () => {
      try {
        const res = await api.get(
          `/reservations/availability?date=${date}&time_slot=${timeSlot}&party_size=1`
        );
        if (cancelled) return;
        const liveTables: any[] = res.data?.tables ?? [];
        if (liveTables.length === 0) return;
        setTables((prev) => {
          const updated = prev.map((t) => {
            const live = liveTables.find((lt: any) => lt.id === t.id);
            if (!live) return t;
            return {
              ...t,
              status: live.status === 'available' ? 'available'
                : (live.status === 'waiting' || live.is_waitlist) ? 'waiting'
                : 'booked',
            } as Table3DItem;
          });
          onTablesChange?.(updated);
          return updated;
        });
      } catch {
        // Backend offline — keep demo data
      }
    };

    fetch();
    const interval = setInterval(fetch, 6000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [date, timeSlot]);

  const handleSelect = useCallback((table: Table3DItem) => {
    setSelectedDetail(table);
    onTableSelect?.(table);
  }, [onTableSelect]);

  const handleConfirm = useCallback(() => {
    if (selectedDetail && onTableSelect) {
      onTableSelect(selectedDetail);
    }
  }, [selectedDetail, onTableSelect]);

  const resetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  return (
    <div className="relative w-full h-[640px] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl bg-[#0F0A05]">

      {/* Top control bar */}
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <button
          onClick={resetCamera}
          className="bg-[#0F172A]/85 hover:bg-[#0F172A] text-white/90 hover:text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-lg border border-white/20 backdrop-blur-md transition-all shadow-md cursor-pointer"
        >
          Reset View
        </button>
      </div>

      {/* Live indicator */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-[#0F172A]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#22C55E]" />
        <span className="text-white/80 text-[11px] font-semibold tracking-wide">Live Seating</span>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        shadows
        camera={{ position: [14, 22, 24], fov: 38 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <RestaurantScene
          tables={tables}
          selectedTableId={selectedTableId ?? selectedDetail?.id}
          onTableSelect={handleSelect}
        />
      </Canvas>

      {/* HUD overlays */}
      <SeatingHUD
        selectedTable={selectedDetail}
        tables={tables}
        onClose={() => setSelectedDetail(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default SeatingView3D;
