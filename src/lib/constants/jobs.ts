// ============================================================================
// MatchPoint AI — Job sector constants (plain module, no 'use server')
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

/** Suggested skills per sector for the job posting form */
export const SECTOR_SKILLS: Record<SectorKey, string[]> = {
  technology: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL',
    'Docker', 'AWS', 'Git', 'REST APIs', 'GraphQL', 'PostgreSQL', 'CI/CD',
  ],
  finance: [
    'Excel', 'Bloomberg', 'Financial Modeling', 'Risk Management', 'VBA',
    'SQL', 'Compliance', 'Accounting', 'IFRS', 'Portfolio Management',
  ],
  healthcare: [
    'Patient Care', 'Electronic Health Records', 'Clinical Research',
    'Medical Terminology', 'HIPAA', 'Diagnostics', 'Pharmacology',
  ],
  marketing: [
    'SEO', 'SEM', 'Google Ads', 'Meta Ads', 'Content Strategy',
    'CRM', 'HubSpot', 'Salesforce', 'Analytics', 'Copywriting', 'Email Marketing',
  ],
  engineering: [
    'AutoCAD', 'SolidWorks', 'Project Management', 'PLC', 'SCADA',
    'Lean Manufacturing', 'Six Sigma', 'ISO 9001', 'Mechanical Design',
  ],
  construction: [
    'AutoCAD', 'BIM', 'Revit', 'Project Management', 'Cost Estimation',
    'Building Codes', 'Safety Regulations', 'Site Management', 'MS Project',
  ],
  education: [
    'Curriculum Design', 'Classroom Management', 'E-learning', 'Moodle',
    'Assessment Design', 'Student Counseling', 'Special Education',
  ],
  hospitality: [
    'Customer Service', 'Front Desk', 'PMS Systems', 'Food & Beverage',
    'Event Planning', 'Revenue Management', 'Opera PMS', 'Multilingual',
  ],
  logistics: [
    'Supply Chain', 'Warehouse Management', 'SAP WM', 'Route Planning',
    'Customs & Import', 'Inventory Control', 'Forklift', 'ERP Systems',
  ],
  legal: [
    'Contract Law', 'Litigation', 'Corporate Law', 'Compliance', 'Due Diligence',
    'GDPR', 'Legal Research', 'Negotiation', 'Regulatory Affairs',
  ],
};

export const SALARY_PERIODS = [
  { value: 'hourly',  label: { en: 'Per hour',   es: 'Por hora',   de: 'Pro Stunde',   it: "All'ora" } },
  { value: 'daily',   label: { en: 'Per day',    es: 'Por día',    de: 'Pro Tag',       it: 'Al giorno' } },
  { value: 'weekly',  label: { en: 'Per week',   es: 'Por semana', de: 'Pro Woche',     it: 'A settimana' } },
  { value: 'monthly', label: { en: 'Per month',  es: 'Por mes',    de: 'Pro Monat',     it: 'Al mese' } },
  { value: 'annual',  label: { en: 'Per year',   es: 'Por año',    de: 'Pro Jahr',      it: "All'anno" } },
] as const;

export type SalaryPeriod = (typeof SALARY_PERIODS)[number]['value'];
