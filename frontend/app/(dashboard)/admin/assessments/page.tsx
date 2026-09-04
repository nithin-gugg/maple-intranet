"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../hooks/use-toast";

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const fetchAssessments = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assessments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assessments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "Assessment deleted" });
        fetchAssessments();
      } else {
        toast({ title: "Failed to delete", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground mt-2">Manage standalone assessments for Native Courses.</p>
        </div>
        <Link href="/admin/assessments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map(assessment => (
          <Card key={assessment.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="line-clamp-1">{assessment.title}</CardTitle>
                <Badge variant={assessment.status === 'Published' ? 'default' : 'secondary'}>
                  {assessment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                {assessment.description || "No description provided."}
              </p>
              
              <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Passing Score: {assessment.passing_score}%</span>
                </div>
                {assessment.time_limit_minutes && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Time Limit: {assessment.time_limit_minutes} mins</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-xs text-muted-foreground">
                  Created: {format(new Date(assessment.created_at), 'MMM d, yyyy')}
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(assessment.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {assessments.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            No assessments found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
