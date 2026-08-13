"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Scorm12Player from "./Scorm12Player";

interface LearningPlayerProps {
  packageId: number;
  entryPointUrl: string;
  standard: string;
  userId: string;
}

export default function LearningPlayer({ packageId, entryPointUrl, standard, userId }: LearningPlayerProps) {
  
  if (standard === "SCORM_1_2") {
    return <Scorm12Player packageId={packageId} entryPointUrl={entryPointUrl} userId={userId} />;
  }

  if (standard === "SCORM_2004") {
    // Return SCORM 2004 Player once implemented
    return <div className="p-4 bg-yellow-50 text-yellow-800">SCORM 2004 Player (Coming Soon)</div>;
  }

  if (standard === "XAPI") {
    // Return xAPI Player once implemented
    return <div className="p-4 bg-blue-50 text-blue-800">xAPI Player (Coming Soon)</div>;
  }

  if (standard === "CMI5") {
    // Return cmi5 Player once implemented
    return <div className="p-4 bg-purple-50 text-purple-800">cmi5 Player (Coming Soon)</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[600px] bg-canvas rounded-xl border border-hairline">
      <p className="mt-4 text-sm text-slate-500 font-medium">Unsupported Package Standard: {standard}</p>
    </div>
  );
}
