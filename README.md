# ai based grievance redressal system

## project header
- institute: pillai college of engineering
- class: ty comp b
- batch: b1 (12-22)
- project type: ai based grievance redressal system. 

## team members
-Shriya Jedhe, roll no:21

## overview
this repository contains an ai-assisted grievance redressal platform for students, departments, and administrators. it supports grievance submission, automatic category and urgency classification, department routing, role-based dashboards, tracking, and analytics.

## problem statement
many college grievance processes are manual, slow, and hard to track. common issues include delayed responses, poor routing to departments, no centralized timeline of status updates, and lack of institutional insight into recurring problems.

## proposed solution
build a centralized grievance management platform that:
- allows students to submit and track grievances online
- routes grievances to relevant departments using rule-based + ai-assisted classification
- gives departments a queue and communication channel to respond and update case status
- gives admins a complete institutional view with analytics, patterns, and governance controls

## objectives
- reduce grievance resolution time
- improve transparency and accountability
- automate categorization and routing
- provide pattern insights for preventive action
- maintain secure role-based access across users

## key features
- secure sign up and login using nextauth credentials
- role-aware access for student, department, and admin users
- grievance submission with server-side validation
- ai-based category and urgency classification via groq
- auto assignment of grievances to departments
- real-time-like case updates through polling endpoints
- chat-style response thread between stakeholders
- admin analytics and pattern analysis pages
- ai settings page for configuring encrypted fallback model key storage

## user roles and usage flow

### student flow
1. sign up with valid organization email.
2. submit grievance with title, description, and optional category.
3. track status timeline on tracking page.
4. chat on the grievance thread for follow-ups.

### department flow
1. login to department dashboard.
2. review assigned queue.
3. respond to students in chat.
4. update grievance status as work progresses.

### admin flow
1. login to admin dashboard.
2. monitor all grievances and priorities.
3. review analytics and pattern trends.
4. manage ai settings and routing quality.

## ai settings page purpose
the ai settings page is an admin-only configuration screen used to:
- define the active ai provider/model configuration for classification
- store an encrypted fallback api key in database
- support complaint categorization, urgency detection, and recurring issue analysis when environment key usage is not enough

## tech stack used
- frontend: next.js 14 (app router), react 18, typescript
- styling: tailwind css, custom global styles
- charts and visualization: recharts
- animation and interactions: framer motion
- authentication: next-auth (credentials provider)
- validation: zod
- backend runtime: next.js route handlers
- orm and data access: prisma
- database: mongodb
- security utilities: bcryptjs, encrypted ai key handling
- optional real-time foundation: socket.io route scaffold

## data model summary
core prisma models:
- user
- grievance
- response
- attachment
- aisetting

core enums:
- role: student, admin, department
- urgency: low, medium, high, critical
- grievancestatus: submitted, underreview, assigned, inprogress, resolved, closed

## project folder structure
```text
.
|-- app/
|   |-- (auth)/
|   |   |-- login/page.tsx
|   |   `-- signup/page.tsx
|   |-- (dashboard)/
|   |   |-- admin/page.tsx
|   |   |-- analytics/page.tsx
|   |   |-- ai-settings/page.tsx
|   |   |-- department/page.tsx
|   |   |-- department/chat/page.tsx
|   |   |-- patterns/page.tsx
|   |   `-- student/page.tsx
|   |-- api/
|   |   |-- auth/[...nextauth]/route.ts
|   |   |-- auth/signup/route.ts
|   |   |-- grievances/route.ts
|   |   |-- grievances/[id]/route.ts
|   |   |-- grievances/[id]/responses/route.ts
|   |   |-- analytics/route.ts
|   |   |-- ai/classify/route.ts
|   |   `-- ai-settings/route.ts
|   |-- submit-grievance/page.tsx
|   |-- track/[id]/page.tsx
|   `-- layout.tsx
|-- components/
|   |-- dashboard/
|   |-- forms/
|   |-- layout/
|   `-- ui/
|-- lib/
|   |-- auth.ts
|   |-- ai.ts
|   |-- grievances.ts
|   |-- session.ts
|   |-- utils.ts
|   `-- validation.ts
|-- prisma/
|   |-- schema.prisma
|   `-- seed.ts
|-- public/
|-- docker-compose.yml
|-- dockerfile
|-- next.config.mjs
`-- package.json
```

## prerequisites
- node.js 18 or above
- npm 9 or above
- mongodb database url

## local setup
1. clone repository.
2. install dependencies.
3. configure environment variables.
4. generate prisma client.
5. run development server.

```bash
git clone <repo-url>
cd grievance-redressal-system
npm install
npx prisma generate
npm run dev
```

## environment configuration
create `.env` and provide required keys.

```env
database_url=<mongodb-connection-string>
mongodb_uri=<mongodb-connection-string>
nextauth_secret=<secret-value>
nextauth_url=http://localhost:3003
encryption_key=<64-char-hex-key>
groq_api_key=<groq-api-key>
groq_model=llama-3.3-70b-versatile
admin_emails=<comma-separated-admin-emails>
```

note:
- actual runtime key names are read as uppercase in code (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.).
- do not commit real credentials.

## available scripts
```bash
npm run dev              # start next.js dev server
npm run build            # prisma generate + next build
npm run start            # start production server
npm run lint             # run eslint
npm run prisma:generate  # regenerate prisma client
npm run prisma:migrate   # run prisma migration flow
npm run seed             # run seed script
```

## api overview
- `POST /api/auth/signup` create account with organization role rules
- `GET|POST /api/auth/[...nextauth]` authentication session endpoints
- `GET|POST /api/grievances` list and create grievances
- `GET|PATCH /api/grievances/[id]` retrieve/update one grievance
- `GET|POST /api/grievances/[id]/responses` grievance conversation thread
- `GET /api/analytics` admin analytics and trend data
- `GET|POST /api/ai-settings` admin ai provider configuration

## access and role rules
- student emails are expected on student domain
- staff/admin emails are expected on staff domain
- admin users are restricted through `admin_emails` allowlist logic
- dashboard pages redirect users based on active role

## troubleshooting

### issue: `_next/static` files return 404 in dev
possible cause: stale dev process or stale `.next` artifacts.

recommended steps:
```powershell
get-process node -erroraction silentlycontinue | stop-process -force
if (test-path .next) { remove-item -recurse -force .next }
npx next dev --port 3003
```

### issue: auth route vendor chunk not found in dev
ensure `app/api/auth/[...nextauth]/route.ts` keeps:
- `dynamic = "force-dynamic"`
- `runtime = "nodejs"`

## deployment notes

### vercel
1. set all required environment variables.
2. ensure prisma generate runs in build pipeline (already handled in scripts).
3. deploy with `vercel --prod`.

### docker
```bash
docker compose up --build
```

## future scope
- websocket-based real-time notifications instead of polling
- advanced sla tracking and escalation policies
- file upload and attachment management with object storage
- sentiment and intent analysis on grievance text
- multilingual interface support
- automated email/sms updates to stakeholders
- audit logs and advanced admin governance reports
- downloadable reports for accreditation and compliance

## contribution guidelines
- create feature branch from main
- keep commits focused and small
- run lint and build before push
- open pull request with clear summary and test steps

## quick onboarding checklist for team members
- pull latest code
- install dependencies
- configure `.env`
- run `npx prisma generate`
- start with `npm run dev`
- login using role-specific account and validate dashboard routes

## license
for academic and internal project use.
