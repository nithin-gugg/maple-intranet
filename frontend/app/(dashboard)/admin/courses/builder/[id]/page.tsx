"use client";

import { useParams } from "next/navigation";
import CourseBuilderWizard from "@/components/admin/courses/builder/CourseBuilderWizard";

export default function CourseBuilderPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  return <CourseBuilderWizard courseId={courseId} />;
}
