"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function CourseCompletionStep({ course, onUpdate }: { course: any, onUpdate: () => void }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const rules = course.settings_json?.completion_rules || {};
  
  const [allRequired, setAllRequired] = useState(rules.all_required !== false); // default true
  const [passAssessments, setPassAssessments] = useState(rules.pass_assessments !== false); // default true
  const [requireFeedback, setRequireFeedback] = useState(rules.require_feedback || false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          settings_json: {
            ...course.settings_json,
            completion_rules: {
              all_required: allRequired,
              pass_assessments: passAssessments,
              require_feedback: requireFeedback
            }
          }
        }),
      });

      if (res.ok) {
        toast({ title: "Completion rules saved successfully" });
        onUpdate();
      } else {
        toast({ title: "Failed to save completion rules", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Completion Rules</h2>
        <p className="text-muted-foreground">Define what it takes for a learner to successfully complete this course.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-ink">Course Completion</h3>
            
            <div className="flex items-start space-x-3">
              <Checkbox id="all_required" checked={allRequired} onCheckedChange={(v) => setAllRequired(!!v)} />
              <div className="space-y-1 leading-none">
                <Label htmlFor="all_required" className="text-sm font-medium">Complete all required curriculum items</Label>
                <p className="text-xs text-slate-500">Learners must view or complete all items marked as required.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox id="pass_assessments" checked={passAssessments} onCheckedChange={(v) => setPassAssessments(!!v)} />
              <div className="space-y-1 leading-none">
                <Label htmlFor="pass_assessments" className="text-sm font-medium">Pass required assessments</Label>
                <p className="text-xs text-slate-500">Learners must achieve the passing score on all assessments embedded in the curriculum.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox id="require_feedback" checked={requireFeedback} onCheckedChange={(v) => setRequireFeedback(!!v)} />
              <div className="space-y-1 leading-none">
                <Label htmlFor="require_feedback" className="text-sm font-medium">Require feedback</Label>
                <p className="text-xs text-slate-500">The course will only be marked complete after the post-course feedback form is submitted.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSaving} className="bg-brand-green hover:bg-brand-green/90 text-white min-w-[120px]">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
