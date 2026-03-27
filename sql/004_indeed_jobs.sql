-- ============================================================================
-- MatchPoint AI — Migration 004: Real market jobs from Indeed
-- Run in Supabase SQL Editor
-- ============================================================================

-- Add columns for external job source
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apply_url  TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source     TEXT NOT NULL DEFAULT 'internal';

-- ============================================================================
-- Seed: Real jobs sourced from Indeed Switzerland (March 2026)
-- First element of required_skills[] = sector key for filtering
-- ============================================================================

INSERT INTO jobs (id, title, company, location, remote_policy, description, required_skills, experience_years, salary_min, salary_max, salary_currency, status, source, apply_url, employer_email, created_at)
VALUES

-- ─── TECHNOLOGY ──────────────────────────────────────────────────────────────
('b1000001-0000-4000-a000-000000000001',
 'Software Engineer — Compilers & Virtual Machines', 'deCircle', 'Zürich, ZH', 'hybrid',
 'Build the compiler and VM infrastructure powering deCircle''s next-generation data platform. You will design IR transformations, implement optimisation passes, and own the runtime that executes queries at scale.',
 ARRAY['technology','Compilers','LLVM','Rust','C++','Virtual Machines'], 4,
 110000, 150000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aaqr26xzkptc', NULL,
 NOW() - INTERVAL '122 days'),

('b1000001-0000-4000-a000-000000000002',
 'System Engineer — Digital Solution Development', 'Winterthur Gas & Diesel Ltd', 'Winterthur, ZH', 'hybrid',
 'Design and validate embedded software and digital solutions for large-bore engine control systems used in marine and power-plant applications worldwide.',
 ARRAY['technology','Embedded C','MATLAB','CAN Bus','Systems Engineering','ISO 26262'], 3,
 95000, 130000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aa8y87jjj8jr', NULL,
 NOW() - INTERVAL '1 days'),

('b1000001-0000-4000-a000-000000000003',
 'Software Test Engineer', 'Stadler Rail Group', 'Wallisellen, ZH', 'onsite',
 'Own functional and regression testing for safety-critical rail vehicle software. Write test plans, automate test execution, and coordinate with systems engineers across multiple product lines.',
 ARRAY['technology','Test Automation','Python','ISTQB','CI/CD','Rail Software'], 2,
 85000, 115000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aasl4dt7v9h2', NULL,
 NOW() - INTERVAL '2 days'),

('b1000001-0000-4000-a000-000000000004',
 'Software Engineer — AI SuperIntelligence Team', 'Microsoft', 'Zürich, ZH', 'hybrid',
 'Join Microsoft''s MAI SuperIntelligence team in Zürich to build the infrastructure and tooling that powers next-generation AI systems. Work with world-class researchers on model training, evaluation, and deployment at scale.',
 ARRAY['technology','Python','Distributed Systems','PyTorch','Kubernetes','LLMs'], 5,
 150000, 200000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aadvcjbtwwtz', NULL,
 NOW() - INTERVAL '63 days'),

('b1000001-0000-4000-a000-000000000005',
 'Software Engineer — Network Security', 'Open Systems AG', 'Zürich, ZH', 'hybrid',
 'Develop the platform that manages secure networking for Open Systems'' global SASE product. You will build scalable microservices, own CI/CD pipelines, and collaborate with security researchers.',
 ARRAY['technology','Go','Kubernetes','Network Security','Linux','Microservices'], 3,
 100000, 140000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aaxqyc2qvtqm', NULL,
 NOW() - INTERVAL '147 days'),

('b1000001-0000-4000-a000-000000000006',
 'Software Developer 80–100% (f/m/x)', 'comparis Gruppe', 'Zürich, ZH', 'hybrid',
 'Build and maintain the comparison platform serving millions of Swiss users monthly. Own full-stack features from database to React UI, participate in architecture decisions, and drive technical quality.',
 ARRAY['technology','TypeScript','React','Node.js','PostgreSQL','AWS'], 2,
 90000, 125000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aawk8j24g4js', NULL,
 NOW() - INTERVAL '126 days'),

('b1000001-0000-4000-a000-000000000007',
 'Staff Incubation Engineer', 'SNYK', 'Zürich, ZH', 'remote',
 'Lead incubation projects that become SNYK''s next product lines. Prototype fast, validate with customers, and hand off to product engineering when traction is proven. Full-stack, security-aware mindset required.',
 ARRAY['technology','TypeScript','Node.js','Security','Prototyping','Cloud'], 7,
 140000, 190000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aa8kcfqcqfft', NULL,
 NOW() - INTERVAL '101 days'),

('b1000001-0000-4000-a000-000000000008',
 'Software Engineer — Bug Bounty Platform', 'Bug Bounty Switzerland', 'Zürich, ZH', 'hybrid',
 'Build and secure the platform that connects Swiss companies with ethical hackers. Work on vulnerability management workflows, researcher dashboards, and company-side integrations.',
 ARRAY['technology','Ruby on Rails','React','PostgreSQL','Security','Docker'], 3,
 95000, 130000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aart9vkfkt8n', NULL,
 NOW() - INTERVAL '31 days'),

-- ─── TECHNOLOGY / AI & DATA ──────────────────────────────────────────────────
('b1000001-0000-4000-a000-000000000009',
 'Staff Data Scientist — Supply Chain', 'On AG', 'Zürich, ZH', 'hybrid',
 'Drive data science strategy for On''s global supply chain. Build forecasting models, design experimentation frameworks, and partner with operations to reduce lead times and inventory costs.',
 ARRAY['technology','Python','Machine Learning','Supply Chain Analytics','SQL','Spark'], 6,
 130000, 175000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aasmfhn4mhs4', NULL,
 NOW() - INTERVAL '1 days'),

('b1000001-0000-4000-a000-000000000010',
 'Senior ML Research Scientist — Generative AI', 'Apple', 'Zürich, ZH', 'hybrid',
 'Conduct fundamental and applied research in generative AI at Apple''s Zürich AI lab. Publish, prototype, and collaborate with product teams to bring novel capabilities to hundreds of millions of devices.',
 ARRAY['technology','Deep Learning','PyTorch','Generative AI','Research','Python'], 7,
 170000, 230000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aagpycd2wzn8', NULL,
 NOW() - INTERVAL '17 days'),

('b1000001-0000-4000-a000-000000000011',
 'Senior Data Engineer', 'RepRisk', 'Zürich, ZH', 'hybrid',
 'Design and operate the data pipelines that ingest ESG signals from thousands of global sources daily. Own data quality, build CDC pipelines, and enable analyst teams with clean, trusted datasets.',
 ARRAY['technology','Python','Apache Spark','dbt','Airflow','Snowflake'], 5,
 110000, 150000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aasr7mww8mrw', NULL,
 NOW() - INTERVAL '18 days'),

('b1000001-0000-4000-a000-000000000012',
 'Research Engineer / Research Scientist — Pre-training', 'Anthropic', 'Zürich, ZH', 'hybrid',
 'Work on the core pre-training pipeline for frontier AI models. Own experiments, infrastructure, and analysis that directly influence how the next generation of Claude is trained.',
 ARRAY['technology','Python','JAX','Distributed Training','LLMs','Research'], 4,
 160000, 220000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aazjrf4wrzgs', NULL,
 NOW() - INTERVAL '28 days'),

('b1000001-0000-4000-a000-000000000013',
 'ML Delivery Consultant — GenAI, ProServe EMEA', 'Amazon Web Services', 'Zürich, ZH', 'hybrid',
 'Deliver GenAI and machine learning solutions for AWS enterprise clients across EMEA. Lead workshops, architect solutions on AWS AI services, and own delivery from kickoff to go-live.',
 ARRAY['technology','AWS SageMaker','Generative AI','MLOps','Python','Consulting'], 4,
 120000, 160000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aas4h2xt9n7y', NULL,
 NOW() - INTERVAL '1 days'),

-- ─── FINANCE ─────────────────────────────────────────────────────────────────
('b1000001-0000-4000-a000-000000000014',
 'Junior Portfolio Manager / Investment Analyst', 'Tramondo Investment Partners AG', 'Zürich, ZH', 'onsite',
 'Support senior PMs in managing quantitative fixed-income strategies. Perform attribution analysis, conduct manager research, and contribute to client reporting for institutional mandates.',
 ARRAY['finance','Fixed Income','Portfolio Management','Bloomberg','Excel','CFA'], 2,
 95000, 130000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aavzzt4fkclg', NULL,
 NOW() - INTERVAL '15 days'),

('b1000001-0000-4000-a000-000000000015',
 'Investment Banking Associate — Corporate Finance', 'Deutsche Bank', 'Zürich, ZH', 'onsite',
 'Execute M&A and capital markets transactions for Swiss and DACH mid-market and large-cap clients. Build financial models, run due diligence processes, and support senior bankers in client relationships.',
 ARRAY['finance','M&A','Financial Modeling','DCF','Capital Markets','Investment Banking'], 3,
 120000, 170000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aah4yjqsmg8s', NULL,
 NOW() - INTERVAL '37 days'),

('b1000001-0000-4000-a000-000000000016',
 'Securities Operations Specialist (m/w/d)', 'ODDO BHF', 'Zürich, ZH', 'onsite',
 'Process and reconcile securities transactions for ODDO BHF''s Swiss private banking clients. Liaise with custodians, manage corporate actions, and ensure STP rates across all asset classes.',
 ARRAY['finance','Securities Operations','Swift','Trade Settlement','Bloomberg','Private Banking'], 3,
 85000, 115000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aajwgl8j2m9s', NULL,
 NOW() - INTERVAL '31 days'),

('b1000001-0000-4000-a000-000000000017',
 'Analyst — Financial Due Diligence', 'Alvarez & Marsal', 'Zürich, ZH', 'hybrid',
 'Join A&M''s Transaction Advisory practice to support buy-side and sell-side financial due diligence engagements. Analyse target financials, identify quality-of-earnings adjustments, and prepare client-ready reports.',
 ARRAY['finance','Financial Due Diligence','M&A','Accounting','Excel','Transaction Advisory'], 2,
 90000, 125000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aatyqtqkxfhv', NULL,
 NOW() - INTERVAL '29 days'),

('b1000001-0000-4000-a000-000000000018',
 'Investment Management Sales Professional', 'Morgan Stanley', 'Zürich, ZH', 'onsite',
 'Drive AUM growth for Morgan Stanley''s wealth and asset management division in Switzerland. Build relationships with family offices, pension funds, and high-net-worth clients.',
 ARRAY['finance','Sales','Asset Management','Wealth Management','CRM','Client Relations'], 5,
 110000, 160000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aa4kd46rjwv7', NULL,
 NOW() - INTERVAL '10 days'),

('b1000001-0000-4000-a000-000000000019',
 'Indexed Investments and Solutions Analyst', 'MSCI', 'Zürich, ZH', 'hybrid',
 'Support MSCI''s indexed investments product team in developing and maintaining equity and fixed-income benchmark strategies. Work closely with clients on custom index design and reporting.',
 ARRAY['finance','Index Products','Quantitative Analysis','Python','Financial Markets','Excel'], 3,
 100000, 135000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aanlgctvpws8', NULL,
 NOW() - INTERVAL '45 days'),

-- ─── MARKETING ───────────────────────────────────────────────────────────────
('b1000001-0000-4000-a000-000000000020',
 'Web Analytics Specialist (80–100%)', 'DERTOUR Group', 'Zürich, ZH', 'hybrid',
 'Own the web analytics stack for DERTOUR''s Swiss digital portfolio. Set up tracking with GA4 and GTM, build dashboards in Looker Studio, and deliver insights that improve conversion and UX.',
 ARRAY['marketing','Google Analytics 4','GTM','Looker Studio','A/B Testing','SQL'], 2,
 75000, 105000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aavkdltrf8b4', NULL,
 NOW() - INTERVAL '15 days'),

('b1000001-0000-4000-a000-000000000021',
 'Digital Marketing Manager', 'Axept Business Software AG', 'Zürich, ZH', 'hybrid',
 'Lead Axept''s demand-generation and content marketing strategy for B2B software products. Manage SEO, paid search, email nurtures, and coordinate with the sales team to drive qualified pipeline.',
 ARRAY['marketing','SEO','Google Ads','Marketing Automation','HubSpot','B2B Marketing'], 3,
 85000, 115000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aacfvybj6xtt', NULL,
 NOW() - INTERVAL '4 days'),

('b1000001-0000-4000-a000-000000000022',
 'B2B SaaS Account Executive', 'Scheer IMC', 'Zürich, ZH', 'hybrid',
 'Drive new business for Scheer IMC''s enterprise learning management platform in the DACH market. Own the full sales cycle from prospecting through contract signature with HR and L&D decision-makers.',
 ARRAY['marketing','B2B Sales','SaaS','Salesforce','MEDDIC','Account Executive'], 3,
 90000, 130000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aaxm68djwknf', NULL,
 NOW() - INTERVAL '30 days'),

('b1000001-0000-4000-a000-000000000023',
 'Digital Manager Programmatic', 'WPP Media', 'Zürich, ZH', 'hybrid',
 'Plan and execute programmatic campaigns for WPP Media''s premium Swiss and international clients. Own DSP setup, audience strategy, and performance reporting across DV360, The Trade Desk, and Amazon DSP.',
 ARRAY['marketing','Programmatic Advertising','DV360','The Trade Desk','Media Planning','Ad Tech'], 3,
 85000, 120000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aazg8hvgjnys', NULL,
 NOW() - INTERVAL '73 days'),

('b1000001-0000-4000-a000-000000000024',
 'Content & Channel Manager (m/w/d) 80–100%', 'Elektro-Material AG', 'Zürich, ZH', 'hybrid',
 'Manage Elektro-Material''s digital content strategy across web, email, and social. Coordinate with the product team to create technical content, run channel performance analysis, and grow organic reach.',
 ARRAY['marketing','Content Marketing','Email Marketing','SEO','Social Media','Analytics'], 2,
 70000, 95000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aasjstf8gsgq', NULL,
 NOW() - INTERVAL '1 days'),

-- ─── ENGINEERING ─────────────────────────────────────────────────────────────
('b1000001-0000-4000-a000-000000000025',
 'CAD Project Engineer', 'Ecolab', 'Witterswil, SO', 'onsite',
 'Own CAD design and engineering documentation for Ecolab''s water treatment equipment. Translate customer requirements into 3D models, prepare technical specifications, and support production throughout the manufacturing lifecycle.',
 ARRAY['engineering','AutoCAD','SolidWorks','GD&T','Technical Documentation','Manufacturing'], 3,
 85000, 115000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aag8hbtqz2pm', NULL,
 NOW() - INTERVAL '1 days'),

('b1000001-0000-4000-a000-000000000026',
 'Medical Device Platform Design Engineer', 'Roche', 'Basel, BS', 'hybrid',
 'Design and validate platform components for Roche''s next-generation diagnostics devices. Lead design reviews, manage risk files, and ensure compliance with IEC 62304, ISO 13485, and FDA 21 CFR Part 820.',
 ARRAY['engineering','Medical Devices','ISO 13485','IEC 62304','SolidWorks','Systems Engineering'], 5,
 110000, 150000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aagvrv29mxgg', NULL,
 NOW() - INTERVAL '1 days'),

('b1000001-0000-4000-a000-000000000027',
 'Cutting Tools Engineer', 'Straumann Group', 'Basel, BS', 'onsite',
 'Optimise cutting processes for Straumann''s dental implant manufacturing lines. Select tooling, define machining parameters, conduct wear analysis, and collaborate with procurement to reduce cycle times.',
 ARRAY['engineering','CNC Machining','Cutting Tools','Manufacturing Engineering','SPC','CAM'], 3,
 90000, 120000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aadxswsl6yqc', NULL,
 NOW() - INTERVAL '136 days'),

('b1000001-0000-4000-a000-000000000028',
 'QM Calibration Engineer (f/m/d)', 'Endress+Hauser Flow Switzerland', 'Reinach, BL', 'onsite',
 'Manage the calibration laboratory for E+H''s flow measurement devices. Maintain measurement traceability, conduct internal audits, and support ISO 17025 accreditation activities.',
 ARRAY['engineering','Calibration','ISO 17025','Measurement Systems','Quality Management','Flow Measurement'], 4,
 95000, 125000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aacwy4twfxwh', NULL,
 NOW() - INTERVAL '139 days'),

('b1000001-0000-4000-a000-000000000029',
 'Mechanical Discipline Leader', 'Capgemini', 'Basel, BS', 'hybrid',
 'Lead a team of mechanical engineers delivering industrial and pharma-sector projects for Capgemini Engineering clients across Switzerland and Germany. Define technical standards, conduct design reviews, and own project delivery.',
 ARRAY['engineering','Mechanical Engineering','Team Leadership','CATIA','Pharma Engineering','Project Management'], 8,
 120000, 160000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aa7mswjmld7q', NULL,
 NOW() - INTERVAL '9 days'),

('b1000001-0000-4000-a000-000000000030',
 'Robotics Engineer', 'Thermo Fisher Scientific', 'Basel, BS', 'onsite',
 'Design and integrate robotic systems for Thermo Fisher''s laboratory automation platforms. Programme robot arms, develop vision-guided pick-and-place routines, and validate against GMP requirements.',
 ARRAY['engineering','Robotics','ROS','Python','Lab Automation','GMP'], 4,
 100000, 140000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aamnhtx7hktv', NULL,
 NOW() - INTERVAL '18 days'),

-- ─── LEGAL ───────────────────────────────────────────────────────────────────
('b1000001-0000-4000-a000-000000000031',
 'Legal Counsel', 'SIX Group AG', 'Zürich, ZH', 'hybrid',
 'Advise SIX Group''s securities and payments divisions on Swiss and EU financial market law, regulatory requirements (FINMIA, FMIA, PSD2), and commercial contracts. Support regulatory change projects.',
 ARRAY['legal','Swiss Financial Law','FINMIA','Commercial Contracts','GDPR','Regulatory Affairs'], 4,
 130000, 170000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aazw4yvdr28l', NULL,
 NOW() - INTERVAL '29 days'),

('b1000001-0000-4000-a000-000000000032',
 'Legal Counsel — Corporate & M&A', 'ABB', 'Zürich, ZH', 'hybrid',
 'Support ABB''s group legal team on global M&A transactions, joint ventures, and corporate governance matters. Draft and negotiate transaction documents, advise on regulatory filings, and coordinate external counsel.',
 ARRAY['legal','M&A','Corporate Law','Contract Negotiation','Due Diligence','International Law'], 5,
 140000, 185000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aatfntsb9mf6', NULL,
 NOW() - INTERVAL '30 days'),

('b1000001-0000-4000-a000-000000000033',
 'Legal Counsel Asset Management (80–100%)', 'Vontobel', 'Zürich, ZH', 'hybrid',
 'Provide legal support across Vontobel''s asset management and structured products businesses. Advise on Swiss and EU fund law (CISA, AIFMD, UCITS), distribution agreements, and regulatory change projects.',
 ARRAY['legal','Asset Management Law','CISA','AIFMD','Fund Law','Regulatory Compliance'], 4,
 125000, 165000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aazsnfw76rvj', NULL,
 NOW() - INTERVAL '57 days'),

('b1000001-0000-4000-a000-000000000034',
 'Lead — Employment Law', 'On AG', 'Zürich, ZH', 'hybrid',
 'Own all employment law matters for On''s global workforce of 3,000+ employees. Draft employment contracts, advise on restructurings and works-council relations, and build scalable HR-legal processes for a hypergrowth environment.',
 ARRAY['legal','Employment Law','Labour Law','HR Legal','International Employment','Swiss OR'], 6,
 140000, 185000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aas697hgjj2j', NULL,
 NOW() - INTERVAL '44 days'),

-- ─── HEALTHCARE ──────────────────────────────────────────────────────────────
('b1000001-0000-4000-a000-000000000035',
 'Registered Nurse — Intensive Care Unit', 'Universitätsspital Zürich', 'Zürich, ZH', 'onsite',
 'Provide advanced nursing care for critically ill patients in a 28-bed mixed ICU. Collaborate with a multidisciplinary team of intensivists, physiotherapists, and pharmacists. SBK membership and Swiss nursing diploma required.',
 ARRAY['healthcare','Intensive Care Nursing','ICU','Patient Care','ACLS','Swiss Nursing Diploma'], 2,
 75000, 100000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '5 days'),

('b1000001-0000-4000-a000-000000000036',
 'Fachärztin / Facharzt Orthopädische Chirurgie', 'Schulthess Klinik', 'Zürich, ZH', 'onsite',
 'Join Switzerland''s leading orthopaedic clinic to perform elective joint replacement, sports medicine, and trauma surgeries. FMH specialisation in orthopaedic surgery required; German language essential.',
 ARRAY['healthcare','Orthopaedic Surgery','FMH','Surgical Skills','German','Clinical Research'], 6,
 160000, 220000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '12 days'),

('b1000001-0000-4000-a000-000000000037',
 'Clinical Research Associate (CRA)', 'Roche Diagnostics', 'Basel, BS', 'hybrid',
 'Monitor clinical trials for Roche Diagnostics'' IVD portfolio across Swiss and European trial sites. Ensure GCP compliance, manage site relationships, and contribute to regulatory submissions.',
 ARRAY['healthcare','Clinical Research','GCP','ICH Guidelines','Clinical Monitoring','Regulatory Affairs'], 3,
 90000, 125000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '8 days'),

('b1000001-0000-4000-a000-000000000038',
 'Pharmacist — Hospital Pharmacy', 'Kantonsspital Aarau', 'Aarau, AG', 'onsite',
 'Manage drug dispensing, clinical pharmacy rounds, and pharmaceutical care for inpatients across surgical and oncology wards. SwissMedic-registered pharmacist diploma required.',
 ARRAY['healthcare','Hospital Pharmacy','Clinical Pharmacy','Drug Dispensing','Oncology Pharmacy','Patient Safety'], 2,
 85000, 110000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '20 days'),

-- ─── CONSTRUCTION ────────────────────────────────────────────────────────────
('b1000001-0000-4000-a000-000000000039',
 'Project Manager — General Contracting', 'Implenia AG', 'Zürich, ZH', 'hybrid',
 'Lead complex building and civil engineering projects from tender phase through handover. Manage subcontractors, budgets up to CHF 80M, scheduling, and client relationships across German-speaking Switzerland.',
 ARRAY['construction','Project Management','General Contracting','MS Project','Cost Control','SIA 118'], 6,
 110000, 150000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '7 days'),

('b1000001-0000-4000-a000-000000000040',
 'BIM Manager (80–100%)', 'Halter AG', 'Zürich, ZH', 'hybrid',
 'Implement BIM Level 2/3 workflows across Halter''s project portfolio. Set up common data environments (CDE), train project teams, and coordinate federated models between architects, engineers, and contractors.',
 ARRAY['construction','BIM','Revit','Navisworks','IFC','Coordination'], 4,
 95000, 130000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '14 days'),

('b1000001-0000-4000-a000-000000000041',
 'Site Supervisor — Civil Engineering', 'Marti AG', 'Bern, BE', 'onsite',
 'Supervise earthworks, foundation, and civil construction operations for Marti''s infrastructure projects across the Bern region. Coordinate with site engineers, manage daily crew output, and ensure SUVA safety compliance.',
 ARRAY['construction','Civil Engineering','Site Supervision','SUVA Safety','Earthworks','SIA'], 3,
 80000, 105000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '21 days'),

-- ─── EDUCATION ───────────────────────────────────────────────────────────────
('b1000001-0000-4000-a000-000000000042',
 'Mathematics & Computer Science Teacher (80–100%)', 'Kantonsschule Enge', 'Zürich, ZH', 'onsite',
 'Teach mathematics and informatics at Matura level at one of Zürich''s most respected Kantonsschulen. Develop curricula, coach students, and contribute to school-wide digital education initiatives.',
 ARRAY['education','Mathematics','Computer Science','Matura','Curriculum Design','Swiss EDK'], 2,
 80000, 110000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '30 days'),

('b1000001-0000-4000-a000-000000000043',
 'Senior Corporate Trainer — Digital Skills', 'Swisscom AG', 'Bern, BE', 'hybrid',
 'Design and deliver digital upskilling programmes for Swisscom''s 19,000-person workforce. Develop e-learning content, run instructor-led workshops, and measure learning effectiveness with modern L&D analytics.',
 ARRAY['education','Corporate Training','Instructional Design','E-Learning','Articulate','LMS'], 4,
 95000, 128000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '18 days'),

('b1000001-0000-4000-a000-000000000044',
 'Postdoctoral Researcher — Computational Neuroscience', 'ETH Zürich', 'Zürich, ZH', 'onsite',
 'Conduct independent research in neural coding and brain-machine interfaces within the Neural Control of Movement Lab. Publish in top-tier journals, supervise MSc students, and apply for independent funding.',
 ARRAY['education','Computational Neuroscience','Python','MATLAB','Academic Research','Neuroscience'], 2,
 85000, 105000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '10 days'),

-- ─── HOSPITALITY ─────────────────────────────────────────────────────────────
('b1000001-0000-4000-a000-000000000045',
 'Chef de Partie — Banquet Kitchen (all genders)', 'Widder Hotel', 'Zürich, ZH', 'onsite',
 'Join the award-winning kitchen brigade at Widder Hotel to cook for high-profile banquet events in Zürich''s most storied boutique hotel. Strong classical French technique and a passion for seasonal Swiss produce required.',
 ARRAY['hospitality','Culinary Arts','Banquet Cooking','French Cuisine','HACCP','Kitchen Management'], 2,
 60000, 80000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aavdxfdfh7fp', NULL,
 NOW() - INTERVAL '1 days'),

('b1000001-0000-4000-a000-000000000046',
 'Executive Chef (M/F/D)', 'Mandarin Oriental Hotel Group', 'Zürich, ZH', 'onsite',
 'Lead all culinary operations for the Mandarin Oriental Savoy Zürich — including fine dining, banquets, and room service. Manage a 40-person brigade, set menu direction, and uphold the hotel''s five-star standards.',
 ARRAY['hospitality','Executive Chef','Kitchen Leadership','Fine Dining','Menu Development','Food Cost Management'], 8,
 100000, 135000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aaz22rbtgrtf', NULL,
 NOW() - INTERVAL '4 days'),

('b1000001-0000-4000-a000-000000000047',
 'Sous Chef Barchetta 80–100% (all genders)', 'Storchen Zürich', 'Zürich, ZH', 'onsite',
 'Support the Head Chef at Storchen''s riverfront Barchetta restaurant in delivering an Italian-Mediterranean menu that captures Zürich''s culinary scene. Supervise the kitchen team, manage mise-en-place, and develop seasonal specials.',
 ARRAY['hospitality','Italian Cuisine','Sous Chef','Kitchen Supervision','Menu Planning','HACCP'], 3,
 65000, 85000, 'CHF', 'active', 'indeed', 'https://to.indeed.com/aaz6qgyym9fp', NULL,
 NOW() - INTERVAL '46 days'),

-- ─── LOGISTICS ───────────────────────────────────────────────────────────────
('b1000001-0000-4000-a000-000000000048',
 'Supply Chain Manager — Retail', 'Coop Genossenschaft', 'Basel, BS', 'hybrid',
 'Drive end-to-end supply chain performance for Coop''s dry-goods category. Lead demand planning, S&OP processes, and supplier negotiations. Own inventory KPIs and champion continuous improvement initiatives.',
 ARRAY['logistics','Supply Chain Management','S&OP','Demand Planning','SAP','Lean'], 5,
 100000, 135000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '6 days'),

('b1000001-0000-4000-a000-000000000049',
 'Key Account Manager — Logistics Solutions', 'DHL Express Switzerland', 'Zürich, ZH', 'hybrid',
 'Manage a portfolio of CHF 15M in revenue from key Swiss corporate accounts. Develop customised express and freight solutions, lead RFP responses, and grow share-of-wallet through consultative selling.',
 ARRAY['logistics','Key Account Management','Freight Solutions','CRM','Salesforce','Logistics Sales'], 4,
 90000, 125000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '11 days'),

('b1000001-0000-4000-a000-000000000050',
 'Warehouse Operations Lead', 'Migros Industrie', 'Bern, BE', 'onsite',
 'Run daily warehouse operations for a 25,000 m² Migros distribution centre. Lead a team of 40 operators, manage WMS configuration, optimise pick-pack-ship processes, and drive safety culture.',
 ARRAY['logistics','Warehouse Management','WMS','Team Leadership','Lean','Supply Chain'], 4,
 80000, 108000, 'CHF', 'active', 'internal', NULL, NULL,
 NOW() - INTERVAL '9 days')

ON CONFLICT (id) DO NOTHING;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
