"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function CourseSettingsStep({ course, onUpdate }: { course: any, onUpdate: () => void }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const [duration, setDuration] = useState(course.duration_minutes || "");
  const [awardCert, setAwardCert] = useState(!!course.certificate_template_id);
  const [certTemplate, setCertTemplate] = useState(course.certificate_template_id?.toString() || "");
  const [feedback, setFeedback] = useState(course.settings_json?.feedback_required || false);
  const [reminders, setReminders] = useState(course.settings_json?.reminders_enabled || false);
  const [isMandatory, setIsMandatory] = useState(course.is_mandatory || false);
  const [selfEnrollment, setSelfEnrollment] = useState(course.self_enrollment || false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          duration_minutes: duration ? parseInt(duration) : null,
          is_mandatory: isMandatory,
          self_enrollment: selfEnrollment,
          certificate_template_id: awardCert && certTemplate ? parseInt(certTemplate) : null,
          settings_json: {
            ...course.settings_json,
            feedback_required: feedback,
            reminders_enabled: reminders
          }
        }),
      });

      if (res.ok) {
        toast({ title: "Settings saved successfully" });
        onUpdate();
      } else {
        toast({ title: "Failed to save settings", variant: "destructive" });
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
        <h2 className="text-2xl font-bold tracking-tight mb-2">Course Settings</h2>
        <p className="text-muted-foreground">Configure optional settings and behavior for this course.</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6 flex items-start justify-between">
            <div className="space-y-1 max-w-[80%]">
              <Label className="text-base font-semibold">Duration</Label>
              <p className="text-sm text-slate-500">Show learners the expected course duration.</p>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="Minutes" 
                value={duration} 
                onChange={e => setDuration(e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-slate-500">min</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold">Award Certificate</Label>
                <p className="text-sm text-slate-500">Issue a certificate when the learner successfully completes the course.</p>
              </div>
              <Switch checked={awardCert} onCheckedChange={setAwardCert} />
            </div>
            
            {awardCert && (
              <div className="pt-4 border-t border-slate-100">
                <Label className="mb-2 block text-sm">Certificate Template</Label>
                <Select value={certTemplate} onValueChange={setCertTemplate}>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Certificate of Completion (Demo)</SelectItem>
                    <SelectItem value="2">Corporate Learning Certificate (Demo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-start justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Feedback Required</Label>
              <p className="text-sm text-slate-500">Require learners to submit feedback after completing the course.</p>
            </div>
            <Switch checked={feedback} onCheckedChange={setFeedback} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-start justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Reminder Notifications</Label>
              <p className="text-sm text-slate-500">Send reminders to learners who have not completed the course.</p>
            </div>
            <Switch checked={reminders} onCheckedChange={setReminders} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-start justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Mandatory</Label>
              <p className="text-sm text-slate-500">Mark this course as mandatory for assigned learners.</p>
            </div>
            <Switch checked={isMandatory} onCheckedChange={setIsMandatory} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-start justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Self Enrollment</Label>
              <p className="text-sm text-slate-500">Allow employees to discover and enroll themselves.</p>
            </div>
            <Switch checked={selfEnrollment} onCheckedChange={setSelfEnrollment} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSaving} className="bg-brand-green hover:bg-brand-green/90 text-white min-w-[120px]">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
