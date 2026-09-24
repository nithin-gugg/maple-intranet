import { DocumentsLayout } from "@/components/documents/DocumentsLayout";

export default function DocumentsDirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocumentsLayout>{children}</DocumentsLayout>;
}
