"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function AdminTrackingDashboard() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [healthRes, attemptsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/tracking/health`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/tracking/attempts?limit=20`, { headers })
      ]);
      
      if (!healthRes.ok || !attemptsRes.ok) {
        throw new Error("Failed to fetch data");
      }
      
      const healthData = await healthRes.json();
      const attemptsData = await attemptsRes.json();
      
      setHealth(healthData);
      setAttempts(Array.isArray(attemptsData) ? attemptsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tracking Engine Health</h1>
          <p className="text-muted-foreground mt-2">Monitor asynchronous background processing and learner attempts.</p>
        </div>
        <Button onClick={fetchData} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Pending Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{health?.received || 0}</div>
            <p className="text-xs text-blue-600/80 mt-1">Waiting in inbox</p>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{health?.processing || 0}</div>
            <p className="text-xs text-amber-600/80 mt-1">Currently picked up by workers</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{health?.processed || 0}</div>
            <p className="text-xs text-emerald-600/80 mt-1">Successfully stored in DB</p>
          </CardContent>
        </Card>

        <Card className="bg-rose-500/10 border-rose-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-600">Dead Letters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-700">{health?.dead_letter || 0}</div>
            <p className="text-xs text-rose-600/80 mt-1">Max retries exceeded</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Learning Attempts</CardTitle>
          <CardDescription>Click on an attempt to view granular SCORM/xAPI timelines.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Attempt ID</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Course/Pkg</th>
                  <th className="px-4 py-3 font-medium">Standard</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last Activity</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attempts.map((attempt) => (
                  <tr 
                    key={attempt.id} 
                    onClick={() => router.push(`/admin/tracking/${attempt.id}`)}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium">#{attempt.id} (Run {attempt.attempt_number})</td>
                    <td className="px-4 py-3 font-medium">{attempt.user_name || attempt.user_id}</td>
                    <td className="px-4 py-3">
                      {attempt.course_name || attempt.package_name ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{attempt.course_name || attempt.package_name}</span>
                          <span className="text-xs text-muted-foreground">ID: {attempt.course_id || attempt.package_id}</span>
                        </div>
                      ) : (
                        attempt.course_id || attempt.package_id
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs uppercase">{attempt.standard}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-secondary h-2 rounded-full max-w-[100px] overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all" 
                            style={{ width: `${attempt.progress_percent || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{attempt.progress_percent || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        attempt.status === 'completed' || attempt.status === 'passed' ? 'default' : 
                        attempt.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {attempt.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {attempt.last_activity_at ? format(new Date(attempt.last_activity_at), "MMM d, HH:mm:ss") : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
