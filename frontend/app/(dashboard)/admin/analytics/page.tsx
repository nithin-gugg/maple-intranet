"use client";

import { useEffect, useState } from "react";
import { Users, FileText, PlayCircle, Bot } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [completions, setCompletions] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/analytics/metrics`);
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
      }
    };
    fetchMetrics();

    const fetchCompletions = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/analytics/completions`;
        const res = await fetch(url);
        const data = await res.json();
        setCompletions(data || []);
      } catch (err) {
        console.error("Failed to fetch completions:", err);
      }
    };
    fetchCompletions();
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

      {/* Completion Leaderboard */}
      <div className="bg-canvas p-6 rounded-lg border border-hairline shadow-sm">
        <h3 className="text-heading-5 font-semibold text-ink mb-6">Course Completions Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline">
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Course Name</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">User ID</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Status</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Progress</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Completed At</th>
              </tr>
            </thead>
            <tbody>
              {completions.length > 0 ? completions.map((comp: any, idx: number) => (
                <tr key={idx} className="border-b border-hairline hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-ink">{comp.course_title}</td>
                  <td className="py-3 px-4 text-slate-600">{comp.user_id}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      comp.status === 'completed' || comp.status === 'passed' 
                        ? 'bg-brand-green/20 text-brand-green' 
                        : comp.status === 'failed'
                        ? 'bg-accent-red/20 text-accent-red'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {comp.status || 'incomplete'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 w-10">{comp.progress_percent || 0}%</span>
                      <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-green h-1.5 transition-all duration-500"
                          style={{ width: `${comp.progress_percent || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{comp.completed_at ? new Date(comp.completed_at).toLocaleDateString() : '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No completion data available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
