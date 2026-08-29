"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Server, Info, ListTree, Bug } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/nextjs";

export default function AttemptTrackingDetail() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = await getToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/tracking/attempts/${id}`, { headers });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8">Loading attempt {id}...</div>;
  if (!data) return <div className="p-8">Attempt not found</div>;

  const { overview, state, timeline, processing_inbox } = data;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/tracking">
          <Button variant="outline" size="sm">← Back to Tracking</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attempt #{overview.id} Details</h1>
          <p className="text-muted-foreground text-sm">User: {overview.user_name || overview.user_id} | Standard: {overview.standard.toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> Attempt State
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <Badge variant={overview.status === 'completed' || overview.status === 'passed' ? 'default' : 'secondary'}>
                {overview.status}
              </Badge>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1">Progress</div>
              <div className="flex items-center gap-2">
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all" 
                    style={{ width: `${overview.progress_percent || 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{overview.progress_percent || 0}%</span>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Score</div>
              <div className="text-xl font-semibold">{overview.score !== null ? overview.score : 'N/A'}</div>
            </div>
            
            {overview.completion_source && (
              <div className="bg-muted/50 p-3 rounded-md mt-4 border border-border/50 text-sm">
                <div className="font-medium text-foreground mb-1">Completion Source</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standard:</span>
                  <span>{overview.completion_source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <span>{overview.completion_reason}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" /> Standard-Specific Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overview.standard.startsWith('scorm') ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border rounded p-3">
                  <div className="text-xs text-muted-foreground uppercase">Lesson Status</div>
                  <div className="font-medium">{state.lesson_status || 'N/A'}</div>
                </div>
                <div className="bg-card border rounded p-3">
                  <div className="text-xs text-muted-foreground uppercase">Location / Bookmark</div>
                  <div className="font-medium">{state.lesson_location || 'N/A'}</div>
                </div>
                <div className="bg-card border rounded p-3">
                  <div className="text-xs text-muted-foreground uppercase">Total Time</div>
                  <div className="font-medium">{state.total_time || 'N/A'}</div>
                </div>
                <div className="bg-card border rounded p-3">
                  <div className="text-xs text-muted-foreground uppercase">Suspend Data Size</div>
                  <div className="font-medium">{state.suspend_data_length} bytes</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-card border rounded p-3">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Stable Registration UUID</div>
                  <code className="bg-muted px-2 py-1 rounded text-xs break-all">{overview.registration}</code>
                  <p className="text-xs text-muted-foreground mt-2">All incoming xAPI statements are deterministically matched against this UUID.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none pb-0 h-auto">
          <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-2">
            <ListTree className="w-4 h-4 mr-2" />
            Learning Event Timeline ({timeline.length})
          </TabsTrigger>
          <TabsTrigger value="inbox" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-2">
            <Activity className="w-4 h-4 mr-2" />
            Processing Inbox ({processing_inbox.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="pt-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">Event Type</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {timeline.map((event: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(event.timestamp), "MMM d, yyyy HH:mm:ss")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{event.event_type}</Badge>
                      </td>
                      <td className="px-4 py-3">{event.progress ?? '-'}</td>
                      <td className="px-4 py-3">{event.score ?? '-'}</td>
                    </tr>
                  ))}
                  {timeline.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">No processed learning events found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbox" className="pt-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Event ID</th>
                    <th className="px-4 py-3 font-medium">Received At</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Retries</th>
                    <th className="px-4 py-3 font-medium">Processed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {processing_inbox.map((inbox: any) => (
                    <tr key={inbox.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {inbox.id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {format(new Date(inbox.created_at), "MMM d, HH:mm:ss")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] uppercase">{inbox.source}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          inbox.status === 'processed' ? 'default' : 
                          inbox.status === 'dead_letter' ? 'destructive' : 
                          inbox.status === 'retrying' ? 'outline' : 'secondary'
                        }>
                          {inbox.status}
                        </Badge>
                        {inbox.last_error && (
                          <div className="mt-1 flex items-start text-xs text-destructive gap-1 bg-destructive/10 p-1 rounded">
                            <Bug className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span className="truncate max-w-[150px]" title={inbox.last_error}>{inbox.last_error}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">{inbox.retry_count}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {inbox.processed_at ? format(new Date(inbox.processed_at), "MMM d, HH:mm:ss") : "-"}
                      </td>
                    </tr>
                  ))}
                  {processing_inbox.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No raw tracking events found in inbox.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
