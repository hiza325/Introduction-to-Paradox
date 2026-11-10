import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const glowVertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const glowFragment = `varying vec2 vUv; void main(){float d=length(vUv-0.5);float a=exp(-d*d*22.0)*0.38;smoothstep(0.5,0.0,d);gl_FragColor=vec4(0.04,0.65,0.95,a*smoothstep(0.5,0.2,d));}`;

function NeuralCore({ reduced, lowPower, onContextLost }) {
  const rotation = useRef(null);
  const crystal = useRef(null);
  const nodes = useRef(null);
  const dust = useRef(null);
  const time = useRef(0);
  const { gl, invalidate } = useThree();
  const count = lowPower ? 12 : 22;
  const data = useMemo(() => {
    const base = Array.from({ length: count }, (_, index) => {
      const y = 1 - index / (count - 1) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = index * Math.PI * (3 - Math.sqrt(5));
      const distance = 2.0 + Math.sin(index * 7.2) * .18;
      return new THREE.Vector3(Math.cos(angle) * radius * distance, y * distance, Math.sin(angle) * radius * distance);
    });
    const pairs = [];
    base.forEach((point, a) => base.forEach((other, b) => {
      if (b > a && point.distanceTo(other) < 1.8) pairs.push([a, b]);
    }));
    const linePositions = new Float32Array(pairs.length * 6);
    const current = base.map(point => point.clone());
    const dummy = new THREE.Object3D();
    const particlePositions = new Float32Array((lowPower ? 18 : 42) * 3);
    for (let index = 0; index < particlePositions.length; index += 3) {
      particlePositions[index] = Math.sin(index * 23.4 + 2.2) * 5.1;
      particlePositions[index + 1] = Math.cos(index * 7.3 + .4) * 3.5;
      particlePositions[index + 2] = -1.5 - (Math.sin(index * 9.1) + 1) * 2;
    }
    return { base, pairs, linePositions, current, dummy, particlePositions };
  }, [count, lowPower]);
  const lineGeometry = useRef(null);
  const updateNetwork = t => {
    data.base.forEach((point, index) => {
      data.current[index].copy(point).multiplyScalar(1 + Math.sin(t * .5 + index * 1.7) * .035);
      data.dummy.position.copy(data.current[index]);
      data.dummy.scale.setScalar(index % 4 === 0 ? 1.5 : 1);
      data.dummy.updateMatrix();
      nodes.current.setMatrixAt(index, data.dummy.matrix);
    });
    nodes.current.instanceMatrix.needsUpdate = true;
    data.pairs.forEach(([a, b], index) => {
      data.current[a].toArray(data.linePositions, index * 6);
      data.current[b].toArray(data.linePositions, index * 6 + 3);
    });
    if (lineGeometry.current) lineGeometry.current.attributes.position.needsUpdate = true;
  };
  useLayoutEffect(() => { updateNetwork(0); invalidate(); }, [data, invalidate]);
  useEffect(() => {
    const lost = event => { event.preventDefault(); onContextLost(); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onContextLost]);
  useFrame(({ pointer }, delta) => {
    if (reduced || lowPower) return;
    time.current += Math.min(delta, .05);
    const t = time.current;
    const smoothing = 1 - Math.exp(-Math.min(delta, .05) * 2);
    rotation.current.rotation.y += Math.min(delta, .05) * .085;
    rotation.current.rotation.x = THREE.MathUtils.lerp(rotation.current.rotation.x, pointer.y * .12, smoothing);
    rotation.current.position.x = THREE.MathUtils.lerp(rotation.current.position.x, pointer.x * .13, smoothing);
    rotation.current.position.y = Math.sin(t * .45) * .06;
    crystal.current.rotation.y = -t * .13;
    crystal.current.rotation.z = .22 + Math.sin(t * .22) * .07;
    dust.current.rotation.z = t * .008;
    updateNetwork(t);
  });
  return <>
    <ambientLight intensity={.7}/>
    <pointLight position={[2, 3, 4]} color="#a5f8ff" intensity={24}/>
    <pointLight position={[-3, -1, 2]} color="#8b5cf6" intensity={18}/>
    <pointLight position={[0, 0, 1.5]} color="#22d3ee" intensity={8}/>
    <mesh position={[0, 0, -1.8]}><planeGeometry args={[7.6, 7.6]}/><shaderMaterial vertexShader={glowVertex} fragmentShader={glowFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>
    <group ref={rotation} rotation={[.1, .35, -.12]}>
      <group ref={crystal} rotation={[.12, .2, .22]}>
        <mesh scale={[1, 1.2, 1]}><icosahedronGeometry args={[.91, 0]}/><meshStandardMaterial color="#127893" emissive="#075768" emissiveIntensity={.6} metalness={.68} roughness={.27} flatShading/></mesh>
        <mesh scale={[1.03, 1.23, 1.03]}><icosahedronGeometry args={[.91, 0]}/><meshBasicMaterial color="#8ef8ff" wireframe transparent opacity={.7}/></mesh>
        <mesh rotation={[.25, .6, .2]} scale={[1, 1.15, 1]}><octahedronGeometry args={[1.25, 0]}/><meshPhysicalMaterial color="#66deed" emissive="#058aa4" emissiveIntensity={.25} metalness={.3} roughness={.15} transparent opacity={.16} depthWrite={false} side={THREE.DoubleSide}/></mesh>
      </group>
      <mesh rotation={[1.15, .3, -.4]}><torusGeometry args={[1.65, .008, 5, lowPower ? 70 : 120]}/><meshBasicMaterial color="#53d8ea" transparent opacity={.6}/></mesh>
      <mesh rotation={[.6, 1.25, .9]}><torusGeometry args={[2.25, .005, 5, lowPower ? 70 : 120, Math.PI * 1.4]}/><meshBasicMaterial color="#9774ed" transparent opacity={.45}/></mesh>
      <instancedMesh key={count} ref={nodes} args={[null, null, count]} frustumCulled={false}><sphereGeometry args={[.032, 8, 6]}/><meshBasicMaterial color="#82efff"/></instancedMesh>
      <lineSegments frustumCulled={false}><bufferGeometry ref={lineGeometry}><bufferAttribute attach="attributes-position" args={[data.linePositions, 3]}/></bufferGeometry><lineBasicMaterial color="#43b3d2" transparent opacity={.2} depthWrite={false}/></lineSegments>
    </group>
    <points ref={dust}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.particlePositions, 3]}/></bufferGeometry><pointsMaterial color="#74deed" size={.022} transparent opacity={.55} sizeAttenuation depthWrite={false}/></points>
  </>;
}

export default function AICore({ reduced, lowPower }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const [available, setAvailable] = useState(null);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  useEffect(() => {
    let context;
    try {
      const canvas = document.createElement('canvas');
      context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setAvailable(Boolean(context));
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { setAvailable(false); }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .01 });
    observer.observe(ref.current);
    const visibility = () => setTabVisible(!document.hidden);
    const media = window.matchMedia('(max-width: 760px)');
    const resize = () => setMobile(media.matches);
    document.addEventListener('visibilitychange', visibility);
    media.addEventListener('change', resize);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); media.removeEventListener('change', resize); };
  }, []);
  const animate = visible && tabVisible && !reduced && !lowPower;
  return <div ref={ref} className="core-canvas" aria-hidden="true">
    {available ? <Canvas dpr={mobile || lowPower ? 1 : [1, 1.4]} camera={{ position: [0, 0, 7.8], fov: mobile ? 43 : 42 }} frameloop={animate ? 'always' : 'demand'} gl={{ antialias: !mobile && !lowPower, alpha: true, powerPreference: 'high-performance' }} fallback={<div className="core-fallback"><div className="fallback-halo"/><div className="fallback-crystal"/></div>}><NeuralCore reduced={reduced} lowPower={lowPower} onContextLost={() => setAvailable(false)}/></Canvas> : <div className="core-fallback"><div className="fallback-halo"/><div className="fallback-crystal"/></div>}
  </div>;
}
