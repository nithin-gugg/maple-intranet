"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Award, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Certificate {
  id: number;
  course_id: number;
  course_title: string;
  certificate_number: string;
  generated_file_path: string;
  issued_at: string;
}

export default function MyCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/certificates/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setCertificates(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, [getToken]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Award className="w-8 h-8 text-brand-teal" />
          My Certificates
        </h1>
        <p className="text-muted-foreground mt-2">View and download certificates from completed courses.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>
      ) : certificates.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed rounded-xl text-muted-foreground">
          You haven't earned any certificates yet. Keep learning!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map(cert => (
            <Card key={cert.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b bg-brand-teal/5">
                <CardTitle className="text-lg line-clamp-2 leading-tight h-10">
                  {cert.course_title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span>Issued: {format(new Date(cert.issued_at), 'MMM d, yyyy')}</span>
                  <span className="font-mono text-xs">{cert.certificate_number}</span>
                </div>
                
                <a 
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${cert.generated_file_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-green text-white font-medium rounded-lg hover:bg-brand-teal-deep transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
