"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Scorm12Player from "./Scorm12Player";
import Scorm2004Player from "./Scorm2004Player";
import XApiPlayer from "./XApiPlayer";
import Cmi5Player from "./Cmi5Player";

interface LearningPlayerProps {
  packageId: number;
  entryPointUrl: string;
  standard: string;
  userId: string;
}

const LearningPlayer = ({ packageId, entryPointUrl, standard, userId }: LearningPlayerProps) => {
  if (standard === "SCORM_1_2") {
    return <Scorm12Player packageId={packageId} entryPointUrl={entryPointUrl} userId={userId} />;
  }

  if (standard === "SCORM_2004") {
    return <Scorm2004Player packageId={packageId} entryPointUrl={entryPointUrl} userId={userId} />;
  }

  if (standard === "XAPI") {
    return <XApiPlayer packageId={packageId} entryPointUrl={entryPointUrl} userId={userId} />;
  }

  if (standard === "CMI5") {
    return <Cmi5Player packageId={packageId} entryPointUrl={entryPointUrl} userId={userId} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[600px] bg-canvas rounded-xl border border-hairline">
      <p className="mt-4 text-sm text-slate-500 font-medium">Unsupported Package Standard: {standard}</p>
    </div>
  );
};

export default React.memo(LearningPlayer);
