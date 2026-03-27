// ============================================================================
// MatchPoint AI — Job sector constants (plain module, no 'use server')
// Importable from both Server Components and Client Components
// ============================================================================

export const SECTORS = [
  { key: 'technology',   label: 'Technology',        icon: '💻' },
  { key: 'finance',      label: 'Finance & Banking',  icon: '💰' },
  { key: 'healthcare',   label: 'Healthcare',         icon: '🏥' },
  { key: 'marketing',    label: 'Marketing & Sales',  icon: '📊' },
  { key: 'engineering',  label: 'Engineering',        icon: '⚙️' },
  { key: 'construction', label: 'Construction',       icon: '🏗️' },
  { key: 'education',    label: 'Education',          icon: '📚' },
  { key: 'hospitality',  label: 'Hospitality',        icon: '🍽️' },
  { key: 'logistics',    label: 'Logistics',          icon: '🚚' },
  { key: 'legal',        label: 'Legal',              icon: '⚖️' },
] as const;

export type SectorKey = (typeof SECTORS)[number]['key'];
