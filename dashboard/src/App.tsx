import { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// Color palette for charts
const COLORS = ["#1a73e8", "#34a853", "#fbbc04", "#ea4335", "#9334e6", "#00bcd4"];

interface Event {
  type: string;
  folder?: string;
  folderName?: string;
  method?: string;
  trainedAI?: boolean;
  timestamp?: any;
}

function StatCard({ title, value, subtitle }: { title: string; value: number | string; subtitle?: string }) {
  return (
    <div style={{
      backgroundColor: "white", borderRadius: "12px", padding: "24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.1)", flex: 1, minWidth: "160px",
    }}>
      <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>{title}</p>
      <p style={{ margin: "8px 0 4px", fontSize: "32px", fontWeight: 700, color: "#1a73e8" }}>{value}</p>
      {subtitle && <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>{subtitle}</p>}
    </div>
  );
}

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, "events"));
      const data = snapshot.docs.map(doc => doc.data() as Event);
      setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // Calculate stats from events
  const totalInstalls = events.filter(e => e.type === "install").length;
  const totalClassifications = events.filter(e => e.type === "classification").length;
  const totalFoldersCreated = events.filter(e => e.type === "folder_created").length;
  const totalEmailsMoved = events.filter(e => e.type === "email_moved").length;
  const totalKeywordsAdded = events.filter(e => e.type === "keyword_added").length;
  const aiTrainingRate = events.filter(e => e.type === "email_moved" && e.trainedAI).length;

  // Build folder usage chart data
  const folderCounts: Record<string, number> = {};
  events
    .filter(e => e.type === "classification" && e.folder)
    .forEach(e => {
      const folder = e.folder!;
      folderCounts[folder] = (folderCounts[folder] || 0) + 1;
    });
  const folderChartData = Object.entries(folderCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Build classification method chart data
  const keywordCount = events.filter(e => e.type === "classification" && e.method === "keyword").length;
  const geminiCount = events.filter(e => e.type === "classification" && e.method === "gemini").length;
  const methodData = [
    { name: "Keyword Match", value: keywordCount },
    { name: "Gemini AI", value: geminiCount },
  ].filter(d => d.value > 0);

  // Build event type breakdown
  const eventTypeData = [
    { name: "Installs", value: totalInstalls },
    { name: "Classifications", value: totalClassifications },
    { name: "Folders Created", value: totalFoldersCreated },
    { name: "Emails Moved", value: totalEmailsMoved },
    { name: "Keywords Added", value: totalKeywordsAdded },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: "#f8f9fa",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Google Sans, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            border: "4px solid #e8f0fe", borderTop: "4px solid #1a73e8",
            animation: "spin 1s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "#888" }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#f8f9fa",
      fontFamily: "Google Sans, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#1a73e8", padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "white" }}>InboxOS</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
            Analytics Dashboard
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)", border: "none",
            borderRadius: "8px", padding: "8px 16px", color: "white",
            cursor: "pointer", fontSize: "13px",
          }}
        >↻ Refresh</button>
      </div>

      <div style={{ padding: "32px" }}>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
          <StatCard title="Total Installs" value={totalInstalls} subtitle="Users connected Gmail" />
          <StatCard title="Emails Classified" value={totalClassifications} subtitle="Total classifications" />
          <StatCard title="Folders Created" value={totalFoldersCreated} subtitle="Custom folders" />
          <StatCard title="Emails Moved" value={totalEmailsMoved} subtitle="Drag & drop moves" />
          <StatCard title="Keywords Added" value={totalKeywordsAdded} subtitle="AI training signals" />
          <StatCard title="AI Training Rate" value={aiTrainingRate} subtitle="Users who trained AI" />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>

          {/* Folder usage bar chart */}
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "16px", color: "#333" }}>Emails by Folder</h2>
            {folderChartData.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "13px" }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={folderChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1a73e8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Classification method pie chart */}
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "16px", color: "#333" }}>Classification Method</h2>
            {methodData.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "13px" }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={methodData} cx="50%" cy="50%"
                    outerRadius={80} dataKey="value" label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%` 
}
                  >
                    {methodData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* Event breakdown */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "16px", color: "#333" }}>Event Breakdown</h2>
          {eventTypeData.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "13px" }}>No events recorded yet. Use InboxOS to start seeing data here!</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={eventTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {eventTypeData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
} 