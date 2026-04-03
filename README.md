# ai-based grievance redressal system

## academic details

- **course:** natural language processing
- **class:** semester vi (third year engineering)
- **college:** pillai college of engineering — [www.pce.ac.in](https://www.pce.ac.in/)
- **batch:** ty comp b — batch b1 (roll no. 12–22)

---

## overview

a centralized, ai-assisted grievance redressal platform for students, departments, and administrators. the system supports grievance submission, automatic category and urgency classification, intelligent department routing, role-based dashboards, real-time-like status tracking, and institutional analytics — replacing slow and opaque manual processes with a transparent, accountable digital workflow.

---

## objective

many college grievance processes are manual, slow, and hard to track. common issues include delayed responses, poor routing to departments, no centralized timeline of status updates, and lack of institutional insight into recurring problems.

this platform aims to:
- reduce grievance resolution time
- improve transparency and accountability
- automate categorization and routing
- provide pattern insights for preventive action
- maintain secure role-based access across all users

---

## technologies used

- **frontend:** next.js 14 (app router), react 18, typescript
- **styling:** tailwind css
- **charts:** recharts
- **animations:** framer motion
- **authentication:** next-auth (credentials provider)
- **validation:** zod
- **backend:** next.js route handlers
- **orm:** prisma
- **database:** mongodb
- **ai classification:** groq api (llama-3.3-70b-versatile)
- **security:** bcryptjs, encrypted ai key handling
- **optional real-time:** socket.io scaffold

---

## dataset

- **source:** grievances submitted through the platform by registered college users
- **description:** grievance records include title, description, category, urgency level, department assignment, status timeline, and response threads. data is stored in mongodb and accessed via prisma orm.

---

## installation
```bash
git clone <repo-url>
cd grievance-redressal-system
npm install
npx prisma generate
npm run dev
```

create a `.env` file with the following keys:
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

---

## usage

**student:**
1. sign up with a valid organization email.
2. submit a grievance with title, description, and optional category.
3. track status on the tracking page.
4. follow up via the chat thread.

**department:**
1. log in to the department dashboard.
2. review the assigned grievance queue.
3. respond to students and update grievance status.

**admin:**
1. log in to the admin dashboard.
2. monitor all grievances and priorities.
3. review analytics and pattern trends.
4. manage ai settings and routing configuration.

---

## results

- automatic ai-based classification of grievances by category and urgency using groq
- role-based dashboards for students, departments, and admins
- real-time-like status updates via polling
- admin analytics page with pattern trend visualization using recharts
- encrypted fallback ai key storage for uninterrupted classification

---

## demo video

youtube link here

---

## team members

- arnav deka - roll no.12
- aditi garud — roll no. 13
- ajay gaur - roll no. 14
- tanmay gawade - roll no. 15
- gayatri vinod - roll no. 16
- parth ghadge - roll no. 17
- ranjith iyer - roll no. 18
- om jathar — roll no. 19
- shravani jedhe — roll no. 20
- shriya jedhe — roll no. 21
- rishikesh kanikudiyil - roll no. 22

---

## github contributions

- arnav deka -
- aditi garud –
- ajay gaur -
- tanmay gawade -
- gayatri vinod -
- om jathar – 
- shravani jedhe – 
- shriya jedhe –
- rishikesh kanikudiyil - 
- parth ghadge -
---

## references

- [next.js documentation](https://nextjs.org/docs)
- [prisma documentation](https://www.prisma.io/docs)
- [groq api documentation](https://console.groq.com/docs)
- [next-auth documentation](https://next-auth.js.org)
- [recharts documentation](https://recharts.org)
