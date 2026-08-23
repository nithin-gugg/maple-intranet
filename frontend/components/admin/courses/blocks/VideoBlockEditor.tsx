"use client";

import { useState, useEffect } from "react";

export default function VideoBlockEditor({ block, onUpdate }: { block: any, onUpdate: (data: any) => void }) {
  const [metadata, setMetadata] = useState(() => {
    const json = block.metadata_json || {};
    return {
      provider: json.provider || "YOUTUBE",
      url: json.url || ""
    };
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const newMetadata = { ...metadata, url };
    setMetadata(newMetadata);
    onUpdate({
      metadata_json: newMetadata
    });
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = metadata.url ? extractYoutubeId(metadata.url) : null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-slate-500">Video URL (YouTube)</label>
          <input
            type="text"
            value={metadata.url || ""}
            onChange={handleUrlChange}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-input bg-surface focus:border-brand-green outline-none"
          />
        </div>
      </div>
      
      {videoId ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="w-full aspect-video rounded-lg border border-dashed border-input bg-canvas flex items-center justify-center text-slate-400 text-sm">
          Enter a valid YouTube URL to preview
        </div>
      )}
    </div>
  );
}
