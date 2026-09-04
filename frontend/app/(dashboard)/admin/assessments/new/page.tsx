"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "../../../../../hooks/use-toast";
import Link from "next/link";

export default function NewAssessment() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    passing_score: 70,
    time_limit_minutes: "",
    attempts_allowed: "",
    status: "Draft",
    questions: [] as any[]
  });

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          id: Date.now(),
          question_type: "MULTIPLE_CHOICE",
          question_text: "",
          explanation: "",
          marks: 10,
          sort_order: formData.questions.length,
          options: [
            { option_text: "Option 1", is_correct: true },
            { option_text: "Option 2", is_correct: false }
          ]
        }
      ]
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQs = [...formData.questions];
    newQs[index] = { ...newQs[index], [field]: value };
    setFormData({ ...formData, questions: newQs });
  };

  const removeQuestion = (index: number) => {
    const newQs = [...formData.questions];
    newQs.splice(index, 1);
    setFormData({ ...formData, questions: newQs });
  };

  const addOption = (qIndex: number) => {
    const newQs = [...formData.questions];
    newQs[qIndex].options.push({ option_text: "", is_correct: false });
    setFormData({ ...formData, questions: newQs });
  };

  const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
    const newQs = [...formData.questions];
    
    // If it's multiple choice and setting true, unset others
    if (newQs[qIndex].question_type === "MULTIPLE_CHOICE" && field === "is_correct" && value === true) {
      newQs[qIndex].options = newQs[qIndex].options.map((o: any, i: number) => ({
        ...o,
        is_correct: i === oIndex
      }));
    } else {
      newQs[qIndex].options[oIndex] = { ...newQs[qIndex].options[oIndex], [field]: value };
    }
    
    setFormData({ ...formData, questions: newQs });
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQs = [...formData.questions];
    newQs[qIndex].options.splice(oIndex, 1);
    setFormData({ ...formData, questions: newQs });
  };

  const handleSubmit = async () => {
    if (!formData.title) return toast({ title: "Title is required", variant: "destructive" });
    if (formData.questions.length === 0) return toast({ title: "Add at least one question", variant: "destructive" });
    
    setLoading(true);
    try {
      const token = await getToken();
      
      const payload = {
        ...formData,
        time_limit_minutes: formData.time_limit_minutes ? parseInt(formData.time_limit_minutes) : null,
        attempts_allowed: formData.attempts_allowed ? parseInt(formData.attempts_allowed) : null,
        questions: formData.questions.map(q => ({
          ...q,
          options: ["MULTIPLE_CHOICE", "MULTIPLE_ANSWER", "TRUE_FALSE", "SHORT_ANSWER"].includes(q.question_type) 
            ? q.options.map((o: any, i: number) => ({ ...o, sort_order: i })) 
            : []
        }))
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: "Assessment created successfully" });
        router.push("/admin/assessments");
      } else {
        const err = await res.json();
        toast({ title: "Failed to create", description: err.detail, variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error creating assessment", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Assessment</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFormData({...formData, status: "Draft"})}>
            Save Draft
          </Button>
          <Button onClick={() => { setFormData({...formData, status: "Published"}); setTimeout(handleSubmit, 100); }} disabled={loading}>
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Workplace Safety Assessment" 
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Brief overview of this assessment..." 
                />
              </div>
              <div className="space-y-2">
                <Label>Instructions for Learners</Label>
                <Textarea 
                  value={formData.instructions} 
                  onChange={e => setFormData({...formData, instructions: e.target.value})} 
                  placeholder="e.g. Answer all questions. You need 70% to pass." 
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Questions</h3>
            {formData.questions.map((q, qIndex) => (
              <Card key={q.id} className="relative">
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-semibold">Question {qIndex + 1}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={q.question_type} onValueChange={(v) => updateQuestion(qIndex, "question_type", v)}>
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                          <SelectItem value="MULTIPLE_ANSWER">Multiple Answer</SelectItem>
                          <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                          <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                          <SelectItem value="PARAGRAPH">Paragraph</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)} className="h-8 w-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea 
                      value={q.question_text} 
                      onChange={e => updateQuestion(qIndex, "question_text", e.target.value)} 
                      placeholder="What is..." 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Marks</Label>
                    <Input 
                      type="number" 
                      className="w-32" 
                      value={q.marks} 
                      onChange={e => updateQuestion(qIndex, "marks", parseInt(e.target.value))} 
                    />
                  </div>

                  {["MULTIPLE_CHOICE", "MULTIPLE_ANSWER"].includes(q.question_type) && (
                    <div className="space-y-3 pt-2">
                      <Label>Options</Label>
                      {q.options.map((o: any, oIndex: number) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <Switch 
                            checked={o.is_correct} 
                            onCheckedChange={(c) => updateOption(qIndex, oIndex, "is_correct", c)} 
                          />
                          <Input 
                            value={o.option_text} 
                            onChange={e => updateOption(qIndex, oIndex, "option_text", e.target.value)} 
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeOption(qIndex, oIndex)}>
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addOption(qIndex)} className="mt-2">
                        <Plus className="w-4 h-4 mr-2" /> Add Option
                      </Button>
                    </div>
                  )}

                  {q.question_type === "TRUE_FALSE" && (
                    <div className="space-y-3 pt-2">
                      <Label>Correct Answer</Label>
                      <Select 
                        value={q.options.find((o: any) => o.is_correct && o.option_text === "True") ? "true" : "false"} 
                        onValueChange={(v) => {
                          updateQuestion(qIndex, "options", [
                            { option_text: "True", is_correct: v === "true" },
                            { option_text: "False", is_correct: v === "false" }
                          ]);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {q.question_type === "SHORT_ANSWER" && (
                    <div className="space-y-3 pt-2">
                      <Label>Acceptable Answers (One per line)</Label>
                      <Textarea 
                        value={q.options.map((o: any) => o.option_text).join("\n")}
                        onChange={e => {
                          const lines = e.target.value.split("\n").filter(l => l.trim());
                          updateQuestion(qIndex, "options", lines.map(l => ({ option_text: l, is_correct: true })));
                        }}
                        placeholder="Type each acceptable answer on a new line..."
                      />
                    </div>
                  )}

                  {q.question_type === "PARAGRAPH" && (
                    <div className="p-4 bg-muted/30 rounded-md text-sm text-muted-foreground border">
                      Paragraph questions require manual evaluation.
                    </div>
                  )}

                </CardContent>
              </Card>
            ))}
            
            <Button variant="outline" className="w-full py-8 border-dashed" onClick={addQuestion}>
              <Plus className="w-5 h-5 mr-2" />
              Add New Question
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Passing Score (%)</Label>
                <Input 
                  type="number" 
                  value={formData.passing_score} 
                  onChange={e => setFormData({...formData, passing_score: parseInt(e.target.value)})} 
                  min="0" max="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Attempts Allowed</Label>
                <Input 
                  type="number" 
                  value={formData.attempts_allowed} 
                  onChange={e => setFormData({...formData, attempts_allowed: e.target.value})} 
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label>Time Limit (minutes)</Label>
                <Input 
                  type="number" 
                  value={formData.time_limit_minutes} 
                  onChange={e => setFormData({...formData, time_limit_minutes: e.target.value})} 
                  placeholder="Leave empty for no limit"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
