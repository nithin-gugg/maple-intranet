"use client";

import { useState, useEffect } from "react";
import { Upload, Loader2, PlaySquare, Video as VideoIcon } from "lucide-react";
import Player from 'next-video/player';

export default function VideoBlockEditor({ block, onUpdate }: { block: any, onUpdate: (data: any) => void }) {
  const [isUploading, setIsUploading] = useState(false);
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
  
  const handleProviderChange = (provider: string) => {
    const newMetadata = { provider, url: "" };
    setMetadata(newMetadata);
    onUpdate({
      metadata_json: newMetadata
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/upload`, {
          method: "POST",
          body: formData
        });
        
        if (res.ok) {
          const data = await res.json();
          const newMetadata = { ...metadata, url: data.url, provider: "MP4" };
          setMetadata(newMetadata);
          onUpdate({
            metadata_json: newMetadata
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = metadata.provider === "YOUTUBE" && metadata.url ? extractYoutubeId(metadata.url) : null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="p-4 space-y-4">
      {/* Provider Toggle */}
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => handleProviderChange("YOUTUBE")}
          className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${metadata.provider === "YOUTUBE" ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-ink"}`}
        >
          <PlaySquare className="w-4 h-4" /> YouTube
        </button>
        <button 
          onClick={() => handleProviderChange("MP4")}
          className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${metadata.provider === "MP4" ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-ink"}`}
        >
          <VideoIcon className="w-4 h-4" /> Upload MP4
        </button>
      </div>

      {metadata.provider === "YOUTUBE" ? (
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
      ) : (
        <div className="space-y-4">
          {metadata.url ? (
             <div className="space-y-1">
               <label className="text-xs font-medium text-slate-500">Replace Video</label>
               <div className="relative">
                 <input 
                   type="file" 
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                   accept="video/mp4"
                   onChange={handleFileChange}
                   disabled={isUploading}
                 />
                 <button className="px-4 py-1.5 text-sm font-medium border border-input rounded-lg hover:bg-canvas">
                   Choose MP4 File
                 </button>
               </div>
             </div>
          ) : (
            <div className="border-2 border-dashed border-input rounded-xl p-8 text-center bg-surface hover:bg-canvas transition-colors">
              <input 
                type="file" 
                id={`video-upload-${block.id}`}
                className="hidden" 
                accept="video/mp4"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <label htmlFor={`video-upload-${block.id}`} className="cursor-pointer flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                  {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                </div>
                <div>
                  <span className="font-semibold text-brand-teal-deep">Click to upload MP4</span>
                </div>
                <p className="text-xs text-slate-400">MP4 Video Format</p>
              </label>
            </div>
          )}
        </div>
      )}
      
      {/* Preview Area */}
      {metadata.provider === "YOUTUBE" ? (
        videoId ? (
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
        )
      ) : (
        metadata.url ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black flex justify-center border border-hairline-strong">
            <Player src={`${baseUrl}${metadata.url}`} style={{ width: '100%', height: '100%' }} />
          </div>
        ) : null
      )}
    </div>
  );
}
