"use client";

import { useRouter } from "next/navigation";

export default function Contributors() {
  const router = useRouter();

  const contributorsData = [
    {
      name: "Arnav Deka",
      description:
        "Improved platform functionality by adding user management, authentication enhancements, and grievance form features, while streamlining UI consistency and code quality.",
    },
    {
      name: "Aditi Garud",
      description:
        "Added a feedback and rating system allowing students to evaluate the resolution process and share service quality insights after complaints are resolved.",
    },
    {
      name: "Ajay Gaur",
      description:
        "Implemented analytics to identify recurring complaint patterns from historical data, enabling actionable insights for continuous institutional improvement and made contributions page.",
    },
    {
      name: "Tanmay Gawade",
      description:
        "Enhanced the UI/UX with glassmorphism effects, smooth scrolling, and an animated theme toggle, along with improved authentication error handling for better debugging and reliability.",
    },
    {
      name: "Gayatri Vinod",
      description:
        "Developed an AI-powered complaint assistant, added file upload support in forms, and improved dashboard layout and spacing.",
    },
    {
      name: "Parth Ghadge",
      description:
        "Resolved bugs and improved overall platform stability and reliability in the admin dashboard.",
    },
    {
      name: "Om Jathar",
      description:
        "Implemented an automated complaint escalation mechanism that routes unresolved cases to higher authorities within a defined timeframe.",
    },
    {
      name: "Ranjith Iyer",
      description:
        "Implemented automatic complaint prioritization using keyword and context analysis.",
    },
    {
      name: "Shriya Jedhe",
      description:
        "Resolved bugs and improved overall platform stability in the student dashboard.",
    },
    {
      name: "Shravani Jedhe",
      description:
        "Fixed duplicate complaint detection to improve accuracy.",
    },
    {
      name: "Rishikesh Kanikudiyil",
      description:
        "Enabled anonymous complaint submission for safer reporting.",
    },
  ];

  return (
    <div style={styles.container}>
      
   <div style={styles.topBar}>
  <button style={styles.backBtn} onClick={() => router.push("/")}>
    ← Back
  </button>

  <h1 style={styles.heading}>Contributors</h1>

  <div style={{ width: "80px" }}></div> {/* spacer for centering */}
</div>

      <div style={styles.grid}>
        {contributorsData.map((c, index) => (
          <div
            key={index}
            style={{
              ...styles.card,
              ...styles.cardColors[index % styles.cardColors.length],
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow =
                "0 15px 35px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 10px 25px rgba(0,0,0,0.08)";
            }}
          >
            <h3 style={styles.name}>{c.name}</h3>
            <p style={styles.description}>{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #dbeafe, #e0f2fe, #f0f9ff)", // soft blue gradient
    padding: "40px",
    color: "#1e293b",
  },

  heading: {
    textAlign: "center",
    marginBottom: "40px",
    fontSize: "42px",
    fontWeight: "bold",
    color: "#1d4ed8",
  },

  backBtn: {
    marginBottom: "20px",
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
  },

  card: {
    padding: "22px",
    borderRadius: "18px",
    transition: "all 0.3s ease",
    border: "1px solid rgba(255,255,255,0.4)",
    cursor: "pointer",
  },

  // 🎨 Multiple soft card colors
  cardColors: [
   
     { background: "linear-gradient(135deg, #ffffff, #dcfce7)" },
    { background: "linear-gradient(135deg, #ffffff, #fef9c3)" },
    { background: "linear-gradient(135deg, #ffffff, #dcfce7)" },
    { background: "linear-gradient(135deg, #ffffff, #fce7f3)" },
  ],

  name: {
    color: "#1d4ed8",
    marginBottom: "12px",
    fontSize: "18px",
    fontWeight: "600",
  },

  description: {
    color: "#334155",
    lineHeight: "1.6",
    fontSize: "14.5px",
  },
  topBar: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "40px",
},
}as const;