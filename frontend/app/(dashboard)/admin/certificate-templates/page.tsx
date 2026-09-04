"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, FileText, Upload } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { format } from "date-fns";
import { useToast } from "../../../../hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CertificateTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    file: null as File | null,
    config: {
      employee_name: { x: 400, y: 300, font_size: 32, font: "Helvetica-Bold", align: "center" },
      course_name: { x: 400, y: 250, font_size: 24, font: "Helvetica", align: "center" },
      completion_date: { x: 400, y: 200, font_size: 16, font: "Helvetica", align: "center" },
      certificate_id: { x: 400, y: 100, font_size: 12, font: "Helvetica", align: "center" }
    }
  });

  const fetchTemplates = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/certificates/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleUpload = async () => {
    if (!newTemplate.name || !newTemplate.file) {
      toast({ title: "Name and File are required", variant: "destructive" });
      return;
    }
    
    setUploading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("name", newTemplate.name);
      formData.append("file", newTemplate.file);
      formData.append("config_json", JSON.stringify(newTemplate.config));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/certificates/templates`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        toast({ title: "Template uploaded" });
        setIsNewOpen(false);
        fetchTemplates();
        setNewTemplate({ ...newTemplate, name: "", file: null });
      } else {
        toast({ title: "Upload failed", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Upload error", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificate Templates</h1>
          <p className="text-muted-foreground mt-2">Manage PDF templates and configuration for generated certificates.</p>
        </div>
        
        <Button onClick={() => setIsNewOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Template
        </Button>
        
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Certificate Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input 
                      value={newTemplate.name} 
                      onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} 
                      placeholder="e.g. Standard Achievement"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PDF File</Label>
                    <Input 
                      type="file" 
                      accept=".pdf"
                      onChange={e => setNewTemplate({...newTemplate, file: e.target.files?.[0] || null})} 
                    />
                  </div>
                </div>

                <div className="border rounded-md p-4 bg-muted/20 space-y-4">
                  <h3 className="font-semibold text-sm">Dynamic Text Placement</h3>
                  <p className="text-xs text-muted-foreground">Define X/Y coordinates (points from bottom-left). Assume an 800x600 PDF for example.</p>
                  
                  {Object.entries(newTemplate.config).map(([field, config]) => (
                    <div key={field} className="grid grid-cols-5 gap-3 items-end p-2 border-b last:border-0">
                      <div className="col-span-1">
                        <Label className="text-xs capitalize">{field.replace('_', ' ')}</Label>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">X</Label>
                        <Input type="number" className="h-8" value={config.x} onChange={e => {
                          const newConfig = {...newTemplate.config, [field]: {...config, x: parseInt(e.target.value)}};
                          setNewTemplate({...newTemplate, config: newConfig as any});
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Y</Label>
                        <Input type="number" className="h-8" value={config.y} onChange={e => {
                          const newConfig = {...newTemplate.config, [field]: {...config, y: parseInt(e.target.value)}};
                          setNewTemplate({...newTemplate, config: newConfig as any});
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Font Size</Label>
                        <Input type="number" className="h-8" value={config.font_size} onChange={e => {
                          const newConfig = {...newTemplate.config, [field]: {...config, font_size: parseInt(e.target.value)}};
                          setNewTemplate({...newTemplate, config: newConfig as any});
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Align</Label>
                        <Input className="h-8" value={config.align} onChange={e => {
                          const newConfig = {...newTemplate.config, [field]: {...config, align: e.target.value}};
                          setNewTemplate({...newTemplate, config: newConfig as any});
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full" onClick={handleUpload} disabled={uploading}>
                  {uploading ? "Uploading..." : "Save Template"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map(t => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle className="text-lg">{t.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <FileText className="w-4 h-4" />
                <span>{t.file_path.split('/').pop()}</span>
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                Added: {format(new Date(t.created_at), 'MMM d, yyyy')}
              </div>
              <Button variant="outline" size="sm" className="w-full">Edit Configuration</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
