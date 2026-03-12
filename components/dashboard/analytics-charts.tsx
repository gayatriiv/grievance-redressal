"use client";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type AnalyticsData = {
  total: number;
  open: number;
  resolved: number;
  avgResolutionDays: number;
  byCategory: Array<{ name: string; value: number }>;
  byStatus: Array<{ name: string; value: number }>;
  trend: Array<{ month: string; complaints: number }>;
  insight: string;
};

const chartColors = ["#f8b801", "#a41d31", "#3b82f6", "#10b981", "#f97316", "#8b5cf6"];

export const AnalyticsCharts = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Unable to load analytics");
        }

        if (isMounted) {
          setData(payload);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load analytics");
        }
      }
    };

    void loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return <div className="glass p-6 text-sm text-red-400">{error}</div>;
  }

  if (!data) {
    return <div className="glass p-6 text-sm text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="clean-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p><p className="mt-2 text-2xl font-semibold text-foreground">{data.total}</p></div>
        <div className="clean-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Open</p><p className="mt-2 text-2xl font-semibold text-foreground">{data.open}</p></div>
        <div className="clean-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Resolved</p><p className="mt-2 text-2xl font-semibold text-foreground">{data.resolved}</p></div>
        <div className="clean-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Avg Resolution</p><p className="mt-2 text-2xl font-semibold text-foreground">{data.avgResolutionDays} days</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass h-80 p-5">
          <p className="mb-4 text-sm font-medium text-foreground">Monthly Grievance Trend</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend}>
              <XAxis dataKey="month" stroke="#a3a3a3" />
              <YAxis stroke="#a3a3a3" />
              <Tooltip />
              <Area dataKey="complaints" stroke="#f8b801" fill="#f8b80133" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass h-80 p-5">
          <p className="mb-4 text-sm font-medium text-foreground">Category Distribution</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.byCategory} dataKey="value" nameKey="name" outerRadius={95}>
                {data.byCategory.map((_, index) => (
                  <Cell key={`${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="glass h-80 p-5">
          <p className="mb-4 text-sm font-medium text-foreground">Status Breakdown</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byStatus}>
              <XAxis dataKey="name" stroke="#a3a3a3" />
              <YAxis stroke="#a3a3a3" />
              <Tooltip />
              <Bar dataKey="value" fill="#a41d31" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Pattern Analysis</p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{data.insight}</p>
        </div>
      </div>
    </div>
  );
};
