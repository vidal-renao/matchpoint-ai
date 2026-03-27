-- ============================================================================
-- MatchPoint AI — Multi-Sector Job Seed
-- sql/003_seed_jobs_multisector.sql
--
-- 30 realistic jobs across 10 sectors.
-- Sector key is injected as the FIRST element in required_skills[]
-- so listJobs() can filter by sector with .contains(['sector_key'])
-- ============================================================================

insert into jobs (title, company, location, remote_policy, description, required_skills, experience_years, company_culture, salary_min, salary_max, salary_currency, status) values

-- ────────────────────────────── TECHNOLOGY ──────────────────────────────────
(
  'Senior Full-Stack Engineer',
  'Fluxion Labs',
  'Barcelona, Spain',
  'hybrid',
  'We are building the next generation of real-time data infrastructure. You will own end-to-end delivery of features from architecture to production, working closely with product and data teams.

Responsibilities:
• Design and implement scalable REST and GraphQL APIs (Node.js / TypeScript)
• Build performant React/Next.js frontends
• Own CI/CD pipelines and Kubernetes deployments
• Mentor junior engineers and lead technical design reviews',
  ARRAY['technology','TypeScript','React','Node.js','PostgreSQL','Kubernetes','CI/CD'],
  5,
  'Flat hierarchy, async-first, quarterly offsites. We ship every week and celebrate learning from failure.',
  75000, 100000, 'EUR', 'active'
),
(
  'Machine Learning Engineer',
  'Neurova AI',
  'Zurich, Switzerland',
  'remote',
  'Join our applied ML team building production models for healthcare diagnostics. You will take models from research to deployment, ensuring reliability and performance at scale.

Stack: Python, PyTorch, MLflow, AWS SageMaker, FastAPI.',
  ARRAY['technology','Python','PyTorch','MLflow','AWS','Machine Learning','FastAPI'],
  4,
  'Research-driven culture. Every engineer spends 20% time on open-ended projects. Remote-first with optional Zurich hub.',
  95000, 130000, 'CHF', 'active'
),
(
  'DevOps / Platform Engineer',
  'CloudStack GmbH',
  'Berlin, Germany',
  'hybrid',
  'Own our cloud infrastructure across three regions. Drive reliability improvements, cost optimisation and developer experience for 80+ engineers.',
  ARRAY['technology','Terraform','Kubernetes','AWS','GCP','Docker','Python'],
  3,
  'On-call rotation, generous PTO, strong feedback culture.',
  70000, 90000, 'EUR', 'active'
),

-- ────────────────────────────── FINANCE ─────────────────────────────────────
(
  'Quantitative Analyst',
  'Meridian Capital',
  'London, UK',
  'onsite',
  'Develop and maintain quantitative models for equity and fixed income strategies. Work closely with portfolio managers to translate research into actionable signals.

You will use Python, R and SQL daily. Prior experience in factor modelling or statistical arbitrage is a strong plus.',
  ARRAY['finance','Python','R','Statistics','Financial Modelling','SQL','Bloomberg'],
  3,
  'Meritocratic, performance-driven. Significant bonus opportunity. Annual research allowance.',
  80000, 120000, 'GBP', 'active'
),
(
  'Risk Analyst — Credit',
  'Helvetica Bank',
  'Geneva, Switzerland',
  'hybrid',
  'Assess credit risk for corporate lending portfolio (€2B AUM). Build and validate internal rating models, prepare regulatory reports (IFRS 9, Basel IV).',
  ARRAY['finance','Credit Risk','IFRS 9','Basel III','SQL','Excel','Python'],
  2,
  'Structured, highly regulated environment. Excellent work-life balance. Strong learning path to VP.',
  75000, 95000, 'CHF', 'active'
),
(
  'Financial Controller',
  'Artex Group',
  'Madrid, Spain',
  'onsite',
  'Oversee month-end close, group consolidation and internal audit for a pan-European manufacturing group (12 entities). Lead a team of 4 accountants.',
  ARRAY['finance','IFRS','Consolidation','SAP','Financial Reporting','Excel','Team Leadership'],
  6,
  'International team, annual progression reviews, generous pension scheme.',
  60000, 80000, 'EUR', 'active'
),

-- ────────────────────────────── HEALTHCARE ──────────────────────────────────
(
  'Clinical Data Scientist',
  'MedAnalytics AG',
  'Basel, Switzerland',
  'hybrid',
  'Analyse real-world clinical trial data to support drug development decisions. Work with biostatisticians, regulatory affairs and medical directors.

Primary tools: R, Python, SAS, REDCap.',
  ARRAY['healthcare','R','Python','SAS','Clinical Trials','Biostatistics','GDPR'],
  3,
  'Purpose-driven. Flexible hours. Strong internal mobility.',
  90000, 115000, 'CHF', 'active'
),
(
  'Registered Nurse — ICU',
  'Clínica Universitaria Navarra',
  'Pamplona, Spain',
  'onsite',
  'Full-time ICU nurse position in a 32-bed critical care unit. Night and day rotation. Support junior nursing staff and medical residents.',
  ARRAY['healthcare','ICU Nursing','Critical Care','ACLS','Patient Monitoring','Team Leadership'],
  2,
  'Teaching hospital. Continuous training budget. Relocation support available.',
  38000, 48000, 'EUR', 'active'
),
(
  'Health Informatics Specialist',
  'eHealth Solutions',
  'Amsterdam, Netherlands',
  'remote',
  'Implement and optimise HL7 FHIR integrations across hospital information systems. Bridge clinical and IT teams.',
  ARRAY['healthcare','HL7 FHIR','Interoperability','SQL','Python','Project Management'],
  4,
  'Fully remote, async-first. International team. Impact at scale.',
  65000, 85000, 'EUR', 'active'
),

-- ────────────────────────────── MARKETING ───────────────────────────────────
(
  'Growth Marketing Manager',
  'Bloom Commerce',
  'Barcelona, Spain',
  'hybrid',
  'Own all paid and organic acquisition channels. Target: €5M ARR by Q4. Manage a €400k/quarter budget across Google, Meta, TikTok and influencer.

KPIs: CAC, LTV, ROAS, blended payback.',
  ARRAY['marketing','Paid Acquisition','Google Ads','Meta Ads','Analytics','SQL','A/B Testing'],
  4,
  'High-autonomy, performance-bonus culture. Work hard, play hard.',
  55000, 75000, 'EUR', 'active'
),
(
  'Content Strategist — B2B SaaS',
  'Stackify',
  'Remote — Europe',
  'remote',
  'Own the content programme for a developer-tools company. Build thought leadership, SEO pipeline and product-led content that drives signups.',
  ARRAY['marketing','Content Strategy','SEO','B2B','CMS','Analytics','Copywriting'],
  3,
  'Fully remote. Async Slack culture. 4-day week option.',
  45000, 60000, 'EUR', 'active'
),
(
  'Brand & Communications Director',
  'Solaris Energy',
  'Frankfurt, Germany',
  'hybrid',
  'Lead brand strategy, PR and executive communications for a leading renewable energy company. Manage a team of 6 and agency relationships.',
  ARRAY['marketing','Brand Strategy','PR','Executive Communications','Team Leadership','Sustainability'],
  8,
  'Purpose-driven, sustainability-first. Excellent benefits package.',
  90000, 120000, 'EUR', 'active'
),

-- ────────────────────────────── ENGINEERING ─────────────────────────────────
(
  'Mechanical Engineer — R&D',
  'Precision Dynamics',
  'Stuttgart, Germany',
  'onsite',
  'Design and prototype precision mechanical components for aerospace applications. Work with FEA tools (ANSYS, Abaqus) and manage supplier relationships.',
  ARRAY['engineering','Mechanical Design','FEA','ANSYS','CAD','Aerospace','Prototyping'],
  4,
  'Engineering-first culture. Strong career ladder to Principal Engineer.',
  65000, 85000, 'EUR', 'active'
),
(
  'Electrical Engineer — Power Systems',
  'Volterra Grid',
  'Madrid, Spain',
  'hybrid',
  'Design MV/LV grid connection studies for utility-scale solar and wind projects across Spain and Portugal.',
  ARRAY['engineering','Power Systems','AutoCAD','ETAP','Grid Connection','Solar','IEC Standards'],
  3,
  'Growing fast. Project ownership from day one.',
  50000, 70000, 'EUR', 'active'
),
(
  'Robotics Engineer',
  'AUTOmata Labs',
  'Munich, Germany',
  'onsite',
  'Develop motion planning and control algorithms for collaborative robots in automotive manufacturing lines. ROS 2, C++, Python.',
  ARRAY['engineering','Robotics','ROS 2','C++','Python','Motion Planning','Computer Vision'],
  5,
  'Cutting-edge research culture. Patent incentive programme.',
  80000, 110000, 'EUR', 'active'
),

-- ────────────────────────────── CONSTRUCTION ────────────────────────────────
(
  'Project Manager — Infrastructure',
  'Iberconstrucción',
  'Valencia, Spain',
  'onsite',
  'Manage civil infrastructure projects (roads, bridges) valued €10M–€50M. Coordinate subcontractors, budget and schedule for public-sector clients.',
  ARRAY['construction','Civil Engineering','Project Management','AutoCAD Civil 3D','Budget Control','PMP'],
  7,
  'Stable pipeline, annual bonus, company car.',
  55000, 75000, 'EUR', 'active'
),
(
  'BIM Coordinator',
  'Alpine Build Group',
  'Zurich, Switzerland',
  'hybrid',
  'Coordinate BIM models across design and construction teams for large-scale commercial projects. Revit, Navisworks, ISO 19650.',
  ARRAY['construction','BIM','Revit','Navisworks','ISO 19650','Coordination','AutoCAD'],
  3,
  'Collaborative, Swiss-quality standards. Training budget.',
  70000, 90000, 'CHF', 'active'
),

-- ────────────────────────────── EDUCATION ───────────────────────────────────
(
  'Senior Learning Experience Designer',
  'EduVentures',
  'Remote — Worldwide',
  'remote',
  'Design online learning programmes for corporate clients in financial services and tech. Use instructional design, video scripting and LMS management.',
  ARRAY['education','Instructional Design','LMS','Articulate Storyline','Video Production','L&D'],
  4,
  'Fully remote. Flexible hours. Strong purpose mission.',
  50000, 65000, 'USD', 'active'
),
(
  'Head of School — International',
  'Walden International School',
  'Geneva, Switzerland',
  'onsite',
  'Lead a 350-student IB school. Strategic oversight of curriculum, staff (45 FTE) and parent community. Experience in IB PYP/MYP/DP required.',
  ARRAY['education','School Leadership','IB Programme','Curriculum','Staff Management','Multilingual'],
  10,
  'Strong governance, excellent benefits, housing allowance.',
  120000, 150000, 'CHF', 'active'
),

-- ────────────────────────────── HOSPITALITY ─────────────────────────────────
(
  'Revenue Manager — Luxury Hotels',
  'Grand Châlet Collection',
  'Verbier, Switzerland',
  'onsite',
  'Optimise RevPAR across 4 luxury ski properties using data-driven pricing, OTA strategy and direct channel development.',
  ARRAY['hospitality','Revenue Management','OTA Strategy','PMS','Excel','Pricing','Luxury Hotels'],
  4,
  'Seasonal peaks. Accommodation provided. Strong bonus scheme.',
  65000, 85000, 'CHF', 'active'
),
(
  'Executive Chef',
  'Casa Palomar Restaurant Group',
  'Madrid, Spain',
  'onsite',
  'Lead kitchen operations for a 3-restaurant group (250 covers/night total). Develop seasonal menus, manage food cost and mentor a brigade of 18.',
  ARRAY['hospitality','Executive Chef','Menu Development','Food Cost','Kitchen Management','HACCP'],
  8,
  'Creative freedom. Weekly menu tasting. Supplier relationships across Spain.',
  50000, 65000, 'EUR', 'active'
),

-- ────────────────────────────── LOGISTICS ───────────────────────────────────
(
  'Supply Chain Analyst',
  'DistribuNow',
  'Rotterdam, Netherlands',
  'hybrid',
  'Analyse end-to-end supply chain performance, identify bottlenecks and model improvement scenarios. Collaborate with procurement and warehouse teams.',
  ARRAY['logistics','Supply Chain','SQL','Excel','Power BI','ERP','Data Analysis'],
  3,
  'International exposure. Data-first culture.',
  48000, 65000, 'EUR', 'active'
),
(
  'Fleet Operations Manager',
  'Transline Iberia',
  'Zaragoza, Spain',
  'onsite',
  'Manage a fleet of 120 HGVs. Oversee driver compliance, maintenance scheduling, route optimisation and KPI reporting.',
  ARRAY['logistics','Fleet Management','Transport Compliance','Route Optimisation','TMS','Team Leadership'],
  5,
  'Stable company, 30+ years operating. Competitive package.',
  45000, 60000, 'EUR', 'active'
),
(
  'Last-Mile Delivery Operations Lead',
  'Quickdrop',
  'Barcelona, Spain',
  'hybrid',
  'Scale our last-mile operations to 10,000 deliveries/day. Lead a team of 15 dispatchers, manage courier network and SLA compliance.',
  ARRAY['logistics','Last-Mile Delivery','Operations','KPIs','Courier Management','Scaling'],
  4,
  'High-growth startup. Equity package. Fast promotion path.',
  42000, 58000, 'EUR', 'active'
),

-- ────────────────────────────── LEGAL ───────────────────────────────────────
(
  'Corporate M&A Lawyer',
  'Ferrandiz & Partners',
  'Madrid, Spain',
  'onsite',
  'Advise on cross-border M&A transactions across Spain and LatAm. Draft and negotiate SPAs, shareholder agreements and due diligence reports.',
  ARRAY['legal','M&A','Corporate Law','Due Diligence','Contract Drafting','Spanish Law','English'],
  5,
  'Prestigious firm. Partnership track. International deal flow.',
  70000, 100000, 'EUR', 'active'
),
(
  'Data Privacy Counsel (GDPR)',
  'Privacytech',
  'Amsterdam, Netherlands',
  'remote',
  'Advise SaaS clients on GDPR compliance, DPIAs, SCCs and AI Act readiness. Draft privacy notices, processing agreements and incident response plans.',
  ARRAY['legal','GDPR','Data Privacy','AI Act','DPO','Contract Drafting','Compliance'],
  4,
  'Remote-first law firm. Flexible hours. Growing practice area.',
  75000, 100000, 'EUR', 'active'
),
(
  'Employment Lawyer',
  'Lex Europa',
  'Zurich, Switzerland',
  'hybrid',
  'Handle individual and collective labour disputes, restructurings and executive employment contracts. Advise multinational clients on Swiss and EU employment law.',
  ARRAY['legal','Employment Law','Swiss Law','Arbitration','Contract Drafting','French','German'],
  6,
  'Work-life balance culture. Excellent peer learning environment.',
  120000, 160000, 'CHF', 'active'
);

-- Reload schema cache
notify pgrst, 'reload schema';
