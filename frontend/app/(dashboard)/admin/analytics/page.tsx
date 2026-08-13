"use client";

import { useEffect, useState } from "react";
import { Users, FileText, PlayCircle, Bot } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // In a real app, we would fetch from /api/v1/analytics/metrics
    // For now we will use mock data that matches the API structure
    setMetrics({
        activeUsers: 245,
        coursesCompleted: 1892,
        documentsViewed: 5430,
        aiQueries: 892,
        courseCompletionRate: [
            { month: "Jan", rate: 45 },
            { month: "Feb", rate: 52 },
            { month: "Mar", rate: 58 },
            { month: "Apr", rate: 65 },
            { month: "May", rate: 72 },
            { month: "Jun", rate: 81 },
        ],
        departmentEngagement: [
            { name: "Engineering", value: 85 },
            { name: "Sales", value: 72 },
            { name: "Marketing", value: 64 },
            { name: "HR", value: 92 },
        ]
    });
  }, []);

  if (!metrics) return null;

  const statCards = [
    { title: "Active Users", value: metrics.activeUsers, icon: Users, color: "text-brand-green", bg: "bg-brand-green/10" },
    { title: "Courses Completed", value: metrics.coursesCompleted, icon: PlayCircle, color: "text-accent-purple", bg: "bg-accent-purple/10" },
    { title: "Docs Viewed", value: metrics.documentsViewed, icon: FileText, color: "text-accent-orange", bg: "bg-accent-orange/10" },
    { title: "AI Queries", value: metrics.aiQueries, icon: Bot, color: "text-brand-teal", bg: "bg-brand-teal/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display-lg font-heading tracking-tight text-ink">Dashboard Overview</h1>
        <p className="mt-2 text-subtitle text-slate-500">Monitor engagement and platform analytics across the organization.</p>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-canvas p-6 rounded-lg border border-hairline shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-display-md font-semibold text-ink mt-2">{stat.value.toLocaleString()}</h3>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <div className="bg-canvas p-6 rounded-lg border border-hairline shadow-sm">
          <h3 className="text-heading-5 font-semibold text-ink mb-6">Course Completion Trend</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.courseCompletionRate} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ED64" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ED64" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E9E8" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#5C6C75'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#5C6C75'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C2D38', borderColor: '#1C2D38', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#00ED64' }}
                />
                <Area type="monotone" dataKey="rate" stroke="#00ED64" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-canvas p-6 rounded-lg border border-hairline shadow-sm">
          <h3 className="text-heading-5 font-semibold text-ink mb-6">Department Engagement Score</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.departmentEngagement} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E3E9E8" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#5C6C75'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1C2D38', fontWeight: 500}} width={100} />
                <Tooltip 
                  cursor={{fill: '#F9FBFA'}}
                  contentStyle={{ backgroundColor: '#1C2D38', borderColor: '#1C2D38', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#016EE9' }}
                />
                <Bar dataKey="value" fill="#016EE9" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
