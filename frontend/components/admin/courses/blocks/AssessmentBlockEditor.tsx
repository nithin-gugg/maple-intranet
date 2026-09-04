"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function AssessmentBlockEditor({ block, onUpdate }: { block: any, onUpdate: (data: any) => void }) {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assessments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter to only published or show all, let's show all for now
          setAssessments(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, [getToken]);

  const handleChange = (assessmentId: string) => {
    onUpdate({
      metadata_json: { ...block.metadata_json, assessment_id: parseInt(assessmentId) }
    });
  };

  const selectedId = block.metadata_json?.assessment_id?.toString();

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>Select Assessment</Label>
        {loading ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading assessments...
          </div>
        ) : (
          <Select value={selectedId || ""} onValueChange={handleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an assessment..." />
            </SelectTrigger>
            <SelectContent>
              {assessments.length === 0 ? (
                <SelectItem value="none" disabled>No assessments available</SelectItem>
              ) : (
                assessments.map(a => (
                  <SelectItem key={a.id} value={a.id.toString()}>{a.title} ({a.status})</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        When an assessment is added, learners must pass it to complete the lesson.
      </p>
    </div>
  );
}
