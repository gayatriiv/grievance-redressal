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

- [Youtube](https://youtu.be/X8UBgAFcbUE?si=6EoF674cawjksKr8)

---

## Team Members

| Roll No. | Name                  |
|----------|-----------------------|
| 12       | Arnav Deka            |
| 13       | Aditi Garud           |
| 14       | Ajay Gaur             |
| 15       | Tanmay Gawade         |
| 16       | Gayatri Vinod         |
| 17       | Parth Ghadge          |
| 18       | Ranjith Iyer          |
| 19       | Om Jathar             |
| 20       | Shravani Jedhe        |
| 21       | Shriya Jedhe          |
| 22       | Rishikesh Kanikudiyil |

## github contributions

| Member Name              | Contributions |
|--------------------------|--------------|
| Arnav Deka              | Improved platform functionality by adding user management, authentication enhancements, and grievance form features, while streamlining UI consistency and code quality. |
| Aditi Garud             | Added a feedback and rating system allowing students to evaluate the resolution process and share service quality insights after complaints are resolved. |
| Ajay Gaur               | Implemented analytics to identify recurring complaint patterns from historical data, enabling actionable insights for continuous institutional improvement. |
| Tanmay Gawade           | Enhanced the UI/UX with glassmorphism effects, smooth scrolling, and an animated theme toggle, along with improved authentication error handling for better debugging and reliability. |
| Gayatri Vinod           | Developed an AI-powered complaint assistant, added file upload support in forms, and improved dashboard layout and spacing. |
| Parth Ghadge            | Resolved bugs and improved overall platform stability and reliability in the admin dashboard. |
| Om Jathar               | Implemented an automated complaint escalation mechanism that routes unresolved cases to higher authorities within a defined timeframe, improving accountability and response efficiency. |
| Ranjith Iyer            | Implemented automatic complaint prioritization using keyword and context analysis to classify issues by urgency (Low to Critical). |
| Shriya Jedhe            | Resolved bugs and improved overall platform stability and reliability in the student dashboard. |
| Shravani Jedhe          | Fixed duplicate complaint detection to improve accuracy and reduce redundant submissions. |
| Rishikesh Kanikudiyil   | Enabled anonymous complaint submission so students can report sensitive issues more safely and confidently. |

## references

- [next.js documentation](https://nextjs.org/docs)
- [prisma documentation](https://www.prisma.io/docs)
- [groq api documentation](https://console.groq.com/docs)
- [next-auth documentation](https://next-auth.js.org)
- [recharts documentation](https://recharts.org)
