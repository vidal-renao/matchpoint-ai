# Data Processing Agreement (DPA) Template

**For use when selling MatchPoint AI to recruitment agencies (GDPR Article 28)**

---

## DATA PROCESSING AGREEMENT

Between:

**[AGENCY NAME]**, registered at [address], ("**Controller**")

and

**[YOUR COMPANY NAME]**, registered at [address], ("**Processor**")

Together referred to as the "Parties."

---

### 1. Subject Matter

The Processor provides the Controller with access to the MatchPoint AI recruitment platform ("Service") for the purpose of AI-assisted candidate screening and job matching.

### 2. Nature and Purpose of Processing

The Processor processes personal data on behalf of the Controller solely to provide the Service, including:
- Storing and processing candidate CVs and profile data
- Running AI analysis to generate match scores
- Sending notifications to designated recruiter contacts

### 3. Categories of Data Subjects

- Job candidates who upload their CV to the platform
- Recruiter contacts of the Controller

### 4. Categories of Personal Data

- Identity data: name, email, phone number
- Professional data: work experience, education, skills, certifications
- CV files (PDF or image)
- Application and match score data

### 5. Processor Obligations

The Processor shall:

a) Process personal data only on documented instructions from the Controller

b) Ensure that persons authorized to process personal data are bound by confidentiality

c) Implement appropriate technical and organizational security measures (encryption at rest and in transit, access controls, audit logs)

d) Not engage sub-processors without prior written authorization from the Controller

e) Assist the Controller in responding to data subject rights requests (access, deletion, portability)

f) Delete or return all personal data upon termination of the agreement

g) Provide all information necessary to demonstrate compliance with GDPR Article 28

### 6. Sub-processors

The Processor uses the following sub-processors:

| Sub-processor | Purpose | Location |
|---|---|---|
| Supabase Inc. | Database and file storage | EU (Frankfurt) |
| Anthropic PBC | AI text analysis | USA (Standard Contractual Clauses apply) |
| Resend Inc. | Email delivery | USA (SCC apply) |
| Twilio Inc. | WhatsApp notifications | USA (SCC apply) |
| Vercel Inc. | Application hosting | USA (SCC apply) |

### 7. Security Measures

- Data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Row Level Security (RLS) ensures data isolation between tenants
- Service role credentials stored only in server environment variables, never client-side
- CV files stored in private Supabase Storage buckets

### 8. Data Retention

Personal data is retained for the duration of the contract plus 30 days. Candidates may request deletion at any time via the platform's profile settings (soft-delete via `deleted_at` field).

### 9. Governing Law

This Agreement is governed by the laws of [Spain / Switzerland / EU — choose applicable].

---

*This is a template. Have it reviewed by a qualified lawyer before use.*
