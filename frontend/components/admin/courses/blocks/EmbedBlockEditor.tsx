"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon } from "lucide-react";

export default function EmbedBlockEditor({ block, onUpdate }: { block: any, onUpdate: (data: any) => void }) {
  const [metadata, setMetadata] = useState(() => {
    const json = block.metadata_json || {};
    return {
      url: json.url || "",
      title: json.title || ""
    };
  });

  const handleChange = (key: string, value: string) => {
    const newMetadata = { ...metadata, [key]: value };
    setMetadata(newMetadata);
    onUpdate({ metadata_json: newMetadata });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-slate-500">Embed URL (e.g. PDF, SlideShare, etc.)</label>
          <input
            type="text"
            value={metadata.url || ""}
            onChange={(e) => handleChange("url", e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-input bg-surface focus:border-brand-green outline-none"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-slate-500">Link Title (Optional)</label>
          <input
            type="text"
            value={metadata.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Document Title"
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-input bg-surface focus:border-brand-green outline-none"
          />
        </div>
      </div>

      {metadata.url ? (
        <div className="p-4 border border-hairline rounded-lg bg-slate-50 flex items-center gap-3">
          <div className="p-2 bg-white rounded shadow-sm">
            <LinkIcon className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">{metadata.title || "Embedded Content"}</p>
            <a href={metadata.url} target="_blank" rel="noreferrer" className="text-xs text-brand-green hover:underline">
              {metadata.url}
            </a>
          </div>
        </div>
      ) : (
        <div className="p-4 border border-dashed border-input rounded-lg bg-canvas text-center text-sm text-slate-400">
          Enter a URL above to create an embed link.
        </div>
      )}
    </div>
  );
}
