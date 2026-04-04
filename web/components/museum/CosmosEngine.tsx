import { useRef, useEffect, useCallback } from 'react';
import { useMuseumCamera } from '../../hooks/useMuseumCamera';
import type { GraphNode, GraphEdge } from '../../lib/api';
import { getDirectionForType, DIRECTIONS, type Direction } from './directions';

const ORBIT_SPEED_MIN = 0.00003;
const ORBIT_SPEED_MAX = 0.00012;
const BASE_OPACITY = 0.15;
const VISITED_OPACITY = 0.35;
const DRIFT_LERP = 0.02; // How fast related nodes drift toward focus

interface OrbitEl {
  el: HTMLDivElement;
  nodeKey: string; // type:id
  rx: number;
  ry: number;
  cx: number;
  cy: number;
  targetCx: number; // for graph-reactive drift
  targetCy: number;
  angle: number;
  speed: number;
  tilt: number;
  direction: number;
  baseOpacity: number;
}

function hashSeed(i: number): number {
  const h = (i + 1) * 2654435761;
  return Math.abs(h | 0) % 10000;
}

interface CosmosEngineProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
  onDirectionClick: (direction: Direction) => void;
  activeDirection: string | null;
  seasonalDirection: string;
  focusedNode: GraphNode | null;
  visitedIds: Set<string>;
}

export function CosmosEngine({
  nodes, edges, onNodeClick, onDirectionClick,
  activeDirection, seasonalDirection, focusedNode, visitedIds
}: CosmosEngineProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const orbitsRef = useRef<OrbitEl[]>([]);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const { applyTransform } = useMuseumCamera(canvasRef);

  // Compute connected node keys for the focused node
  const connectedKeysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!focusedNode) {
      connectedKeysRef.current = new Set();
      return;
    }
    const focusKey = focusedNode.type + ':' + focusedNode.id;
    const connected = new Set<string>();
    for (const e of edges) {
      const srcKey = e.source.type + ':' + e.source.id;
      const tgtKey = e.target.type + ':' + e.target.id;
      if (srcKey === focusKey) connected.add(tgtKey);
      if (tgtKey === focusKey) connected.add(srcKey);
    }
    connectedKeysRef.current = connected;
  }, [focusedNode, edges]);

  const buildOrbits = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    orbitsRef.current = [];
    while (canvas.firstChild) canvas.removeChild(canvas.firstChild);

    // Direction labels
    DIRECTIONS.forEach(dir => {
      const label = document.createElement('div');
      label.className = 'museum-direction-label';
      label.setAttribute('data-direction', dir.key);
      label.style.left = dir.cx + '%';
      label.style.top = dir.cy + '%';

      // Seasonal direction pulses
      if (dir.key === seasonalDirection) {
        label.style.opacity = '1';
        label.classList.add('museum-seasonal-pulse');
      } else {
        label.style.opacity = '0.6';
      }

      const lakota = document.createElement('span');
      lakota.className = 'museum-direction-lakota';
      lakota.textContent = dir.lakota;

      const english = document.createElement('span');
      english.className = 'museum-direction-english';
      english.textContent = dir.english;

      const count = document.createElement('span');
      count.className = 'museum-direction-count';
      const nodeCount = nodes.filter(n => getDirectionForType(n.type).key === dir.key).length;
      count.textContent = nodeCount > 0 ? nodeCount + ' items' : '';

      label.appendChild(lakota);
      label.appendChild(english);
      label.appendChild(count);
      canvas.appendChild(label);

      label.addEventListener('click', (e) => {
        e.stopPropagation();
        onDirectionClick(dir);
      });
    });

    // Filter nodes
    const visibleNodes = activeDirection
      ? nodes.filter(n => getDirectionForType(n.type).key === activeDirection)
      : nodes;

    const maxNodes = activeDirection ? visibleNodes.length : Math.min(200, visibleNodes.length);
    const displayed = visibleNodes.slice(0, maxNodes);

    displayed.forEach((node, i) => {
      const dir = getDirectionForType(node.type);
      const nodeKey = node.type + ':' + node.id;
      const isVisited = visitedIds.has(nodeKey);

      const el = document.createElement('div');
      el.className = 'museum-object';
      if (isVisited) el.classList.add('museum-object-visited');
      el.setAttribute('data-type', node.type);

      const lakotaSpan = document.createElement('span');
      lakotaSpan.className = 'museum-object-lakota';
      lakotaSpan.textContent = node.label.lakota || '—';

      const englishSpan = document.createElement('span');
      englishSpan.className = 'museum-object-english';
      englishSpan.textContent = node.label.english;

      el.appendChild(lakotaSpan);
      el.appendChild(englishSpan);
      canvas.appendChild(el);

      const seed = hashSeed(i);
      const orbitRadius = activeDirection ? 25 : 12;
      const homeCx = activeDirection ? 50 : dir.cx;
      const homeCy = activeDirection ? 50 : dir.cy;

      const orbit: OrbitEl = {
        el,
        nodeKey,
        rx: orbitRadius + (seed % 18),
        ry: (orbitRadius * 0.7) + ((seed * 7) % 14),
        cx: homeCx,
        cy: homeCy,
        targetCx: homeCx,
        targetCy: homeCy,
        angle: (i / Math.max(displayed.length, 1)) * Math.PI * 2,
        speed: ORBIT_SPEED_MIN + (seed % 100) / 100 * (ORBIT_SPEED_MAX - ORBIT_SPEED_MIN),
        tilt: ((seed * 3) % 40) - 20,
        direction: seed % 2 === 0 ? 1 : -1,
        baseOpacity: isVisited ? VISITED_OPACITY : BASE_OPACITY,
      };

      orbitsRef.current.push(orbit);

      el.addEventListener('mouseenter', () => { el.style.opacity = '1'; el.style.zIndex = '20'; });
      el.addEventListener('mouseleave', () => { el.style.zIndex = ''; });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onNodeClick(node);
      });
    });

    // Explore hint
    if (!activeDirection) {
      const hint = document.createElement('div');
      hint.className = 'museum-explore-hint';
      hint.textContent = 'drag to explore · scroll to zoom · click a direction to enter';
      canvas.appendChild(hint);
      setTimeout(() => hint.classList.add('faded'), 4000);
      setTimeout(() => { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 6000);
    }
  }, [nodes, activeDirection, seasonalDirection, visitedIds, onNodeClick, onDirectionClick]);

  const animate = useCallback(() => {
    const dt = performance.now() - startTimeRef.current;
    applyTransform();

    const connected = connectedKeysRef.current;
    const hasFocus = connected.size > 0;

    for (const o of orbitsRef.current) {
      // Graph-reactive drift: connected nodes drift toward center (50, 50)
      if (hasFocus && connected.has(o.nodeKey)) {
        o.targetCx = o.cx + (50 - o.cx) * 0.4; // Pull 40% toward center
        o.targetCy = o.cy + (50 - o.cy) * 0.4;
        o.baseOpacity = 0.6; // Brighten connected nodes
      } else if (hasFocus) {
        // Reset non-connected to home positions (they'll lerp back)
        const dir = DIRECTIONS.find(d => {
          // find home direction for this orbit
          return true; // all orbits drift back to their original cx/cy
        });
        // targetCx/Cy already set to home in buildOrbits
      }

      // Smooth lerp current center toward target
      o.cx += (o.targetCx - o.cx) * DRIFT_LERP;
      o.cy += (o.targetCy - o.cy) * DRIFT_LERP;

      const a = o.angle + o.speed * o.direction * dt;
      const cosT = Math.cos(o.tilt * Math.PI / 180);
      const sinT = Math.sin(o.tilt * Math.PI / 180);
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);

      const x = o.cx + (o.rx * cosA * cosT - o.ry * sinA * sinT);
      const y = o.cy + (o.rx * cosA * sinT + o.ry * sinA * cosT);

      const dist = Math.sqrt((x - 50) ** 2 + (y - 50) ** 2);
      const depth = o.baseOpacity + (1 - dist / 50) * 0.06;

      o.el.style.left = x + '%';
      o.el.style.top = y + '%';
      if (!o.el.matches(':hover')) {
        o.el.style.opacity = String(depth);
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }, [applyTransform]);

  // When focus changes, update drift targets
  useEffect(() => {
    const connected = connectedKeysRef.current;
    for (const o of orbitsRef.current) {
      if (connected.has(o.nodeKey)) {
        // Drift connected nodes toward center
        const homeCx = activeDirection ? 50 : getDirectionForType('word').cx; // approximate
        o.targetCx = homeCx + (50 - homeCx) * 0.5;
        o.targetCy = o.cy + (50 - o.cy) * 0.5;
      } else {
        // Reset to home orbit center
        // targetCx/Cy set at build time — no change needed, they'll lerp back naturally
      }
    }
  }, [focusedNode, activeDirection]);

  useEffect(() => {
    buildOrbits();
    startTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [buildOrbits, animate]);

  return (
    <div ref={canvasRef} className="museum-cosmos" />
  );
}
