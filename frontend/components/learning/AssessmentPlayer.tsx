"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AssessmentPlayer({ 
  assessmentId, 
  courseId,
  onComplete 
}: { 
  assessmentId: number, 
  courseId: number,
  onComplete: (passed: boolean) => void 
}) {
  const { getToken, userId } = useAuth();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assessments/${assessmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setAssessment(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [assessmentId, getToken]);

  const startAttempt = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assessments/${assessmentId}/attempt?course_id=${courseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttemptId(data.id);
      } else {
        const err = await res.json();
        alert(`Could not start attempt: ${err.detail}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, type: string, value: any, optionId?: number) => {
    setAnswers((prev: any) => {
      const current = prev[questionId] || { question_id: questionId, selected_option_ids: [], answer_text: "" };
      
      if (type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE") {
        current.selected_option_ids = [value];
      } else if (type === "MULTIPLE_ANSWER") {
        if (value) {
          current.selected_option_ids = [...(current.selected_option_ids || []), optionId];
        } else {
          current.selected_option_ids = (current.selected_option_ids || []).filter((id: number) => id !== optionId);
        }
      } else if (type === "SHORT_ANSWER" || type === "PARAGRAPH") {
        current.answer_text = value;
      }
      
      return { ...prev, [questionId]: current };
    });
  };

  const submitAssessment = async () => {
    if (!attemptId) return;
    
    // Check if all questions answered
    if (Object.keys(answers).length < assessment.questions.length) {
      if (!confirm("You haven't answered all questions. Are you sure you want to submit?")) return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const submission = {
        answers: Object.values(answers)
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assessments/${assessmentId}/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(submission)
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        if (data.passed) {
          onComplete(true);
        } else {
          onComplete(false); // They failed, cannot progress
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-green" /></div>;
  if (!assessment) return <div className="p-8 text-center text-red-500">Assessment not found.</div>;

  if (result) {
    return (
      <Card className="max-w-2xl mx-auto my-8 border-brand-green/20 shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {result.passed ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
          </div>
          <h2 className="text-3xl font-bold">{result.passed ? "Assessment Passed!" : "Assessment Failed"}</h2>
          
          <div className="text-4xl font-bold text-ink">{result.percentage}%</div>
          <p className="text-slate-500">Passing score was {assessment.passing_score}%</p>
          
          {!result.passed && (
            <Button onClick={() => { setResult(null); setAttemptId(null); setAnswers({}); }}>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!attemptId) {
    return (
      <Card className="max-w-2xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-2xl">{assessment.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {assessment.description && <p className="text-slate-600">{assessment.description}</p>}
          {assessment.instructions && (
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Instructions</h4>
              <p className="text-sm">{assessment.instructions}</p>
            </div>
          )}
          <div className="flex gap-4 text-sm text-slate-500">
            <div>Passing Score: {assessment.passing_score}%</div>
            {assessment.time_limit_minutes && <div>Time Limit: {assessment.time_limit_minutes} mins</div>}
          </div>
          <Button onClick={startAttempt} className="w-full">Start Assessment</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink">{assessment.title}</h2>
      </div>

      <div className="space-y-8">
        {assessment.questions.map((q: any, i: number) => (
          <Card key={q.id}>
            <CardHeader className="pb-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg leading-snug text-ink">{q.question_text}</h3>
                  <div className="text-xs text-slate-400 mt-1">{q.marks} marks</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-16">
              
              {(q.question_type === "MULTIPLE_CHOICE" || q.question_type === "TRUE_FALSE") && (
                <RadioGroup 
                  value={answers[q.id]?.selected_option_ids?.[0]?.toString() || ""}
                  onValueChange={(val) => handleAnswerChange(q.id, q.question_type, parseInt(val))}
                  className="space-y-3"
                >
                  {q.options.map((o: any) => (
                    <div key={o.id} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-transparent hover:border-slate-200 transition-colors">
                      <RadioGroupItem value={o.id.toString()} id={`q${q.id}-o${o.id}`} />
                      <Label htmlFor={`q${q.id}-o${o.id}`} className="flex-1 cursor-pointer">{o.option_text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {q.question_type === "MULTIPLE_ANSWER" && (
                <div className="space-y-3">
                  {q.options.map((o: any) => (
                    <div key={o.id} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-transparent hover:border-slate-200 transition-colors">
                      <Checkbox 
                        id={`q${q.id}-o${o.id}`}
                        checked={answers[q.id]?.selected_option_ids?.includes(o.id) || false}
                        onCheckedChange={(checked) => handleAnswerChange(q.id, q.question_type, checked, o.id)}
                      />
                      <Label htmlFor={`q${q.id}-o${o.id}`} className="flex-1 cursor-pointer">{o.option_text}</Label>
                    </div>
                  ))}
                </div>
              )}

              {(q.question_type === "SHORT_ANSWER" || q.question_type === "PARAGRAPH") && (
                <Textarea 
                  placeholder="Type your answer here..."
                  className="w-full min-h-[100px]"
                  value={answers[q.id]?.answer_text || ""}
                  onChange={(e) => handleAnswerChange(q.id, q.question_type, e.target.value)}
                />
              )}

            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-6 border-t flex justify-end">
        <Button onClick={submitAssessment} disabled={submitting} size="lg">
          {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Submit Assessment
        </Button>
      </div>
    </div>
  );
}
