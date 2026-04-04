import type { NodeType } from '../../lib/api';

export interface Direction {
  key: string;
  lakota: string;
  english: string;
  nodeTypes: NodeType[];
  cx: number; // % center X in cosmic overview
  cy: number; // % center Y in cosmic overview
  color: string;
}

export const DIRECTIONS: Direction[] = [
  { key: 'west',   lakota: 'Wiyohpeyata', english: 'West — Stories',       nodeTypes: ['story'],                cx: 15, cy: 50, color: '#C4883A' },
  { key: 'north',  lakota: 'Waziyata',    english: 'North — Wisdom',       nodeTypes: ['value'],                cx: 50, cy: 12, color: '#7A8B6F' },
  { key: 'east',   lakota: 'Wihinanpata', english: 'East — Knowledge',     nodeTypes: ['word'],                 cx: 85, cy: 50, color: '#4ABFBF' },
  { key: 'south',  lakota: 'Itokaga',     english: 'South — Community',    nodeTypes: ['person'],               cx: 50, cy: 88, color: '#D4553A' },
  { key: 'sky',    lakota: 'Wankantanhan', english: 'Sky — Spirit',        nodeTypes: ['ceremony', 'song'],     cx: 75, cy: 20, color: '#F5E6C8' },
  { key: 'earth',  lakota: 'Maka',        english: 'Earth — Land',         nodeTypes: ['place'],                cx: 25, cy: 80, color: '#8B7355' },
  { key: 'center', lakota: 'Cante',       english: 'Center — Heart',       nodeTypes: [],                       cx: 50, cy: 50, color: '#B8A9C9' },
];

export function getDirectionForType(type: NodeType): Direction {
  return DIRECTIONS.find(d => d.nodeTypes.includes(type)) || DIRECTIONS[6]; // default to center
}

export function getSeasonalDirection(season: 'winter' | 'spring' | 'summer' | 'fall'): string {
  switch (season) {
    case 'winter': return 'west';   // Stories
    case 'spring': return 'east';   // Vocabulary
    case 'summer': return 'south';  // Community
    case 'fall':   return 'sky';    // Ceremonies
  }
}
