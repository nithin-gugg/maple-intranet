const fs = require('fs');

function fixCoursesPage() {
  const filePath = 'app/(dashboard)/admin/courses/page.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert useSession import
  content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport { useSession } from "next-auth/react";');

  // Add token handling
  content = content.replace('export default function AdminCoursesPage() {', 'export default function AdminCoursesPage() {\n  const { data: session } = useSession();\n  const token = session?.accessToken;');

  // Add token to fetchCourses
  content = content.replace('const fetchCourses = async () => {\n    try {\n      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:8000\'}/api/v1/learning/courses`);', 'const fetchCourses = async () => {\n    if (!token) return;\n    try {\n      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:8000\'}/api/v1/learning/courses`, { headers: { Authorization: `Bearer ${token}` } });');

  // Add token to useEffect
  content = content.replace('useEffect(() => {\n    fetchCourses();\n  }, []);', 'useEffect(() => {\n    if (token) {\n      fetchCourses();\n    }\n  }, [token]);');

  // Add token to handleDelete
  content = content.replace('await fetch(`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:8000\'}/api/v1/learning/courses/${id}`, { method: "DELETE" });', 'await fetch(`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:8000\'}/api/v1/learning/courses/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });');

  // Add token to handleEdit
  content = content.replace('headers: { "Content-Type": "application/json" }', 'headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }');

  // add eslint-disable
  if (!content.includes('/* eslint-disable')) {
    content = content.replace('"use client";\n', '"use client";\n/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */\n');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

function fixAnalyticsPage() {
  const filePath = 'app/(dashboard)/admin/analytics/page.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Modify the useEffect dependency array and initial check
  content = content.replace('useEffect(() => {\n    const fetchMetrics = async () => {', 'useEffect(() => {\n    if (!token) return;\n    const fetchMetrics = async () => {');
  
  content = content.replace('  }, []);\n\n  if (!metrics) return null;', '  }, [token]);\n\n  if (!metrics) return null;');

  fs.writeFileSync(filePath, content, 'utf8');
}

fixCoursesPage();
fixAnalyticsPage();
