"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function QuizBlockEditor({ block, onUpdate }: { block: any, onUpdate: (data: any) => void }) {
  const defaultOptions = [
    { id: 1, text: "", is_correct: true },
    { id: 2, text: "", is_correct: false }
  ];

  const [metadata, setMetadata] = useState(() => {
    const json = block.metadata_json || {};
    return {
      question: json.question || "",
      options: json.options || defaultOptions,
      type: json.type || "MULTIPLE_CHOICE"
    };
  });

  const updateQuestion = (question: string) => {
    const newMetadata = { ...metadata, question };
    setMetadata(newMetadata);
    onUpdate({ metadata_json: newMetadata });
  };

  const updateOptionText = (id: number, text: string) => {
    const newOptions = metadata.options.map((o: any) => o.id === id ? { ...o, text } : o);
    const newMetadata = { ...metadata, options: newOptions };
    setMetadata(newMetadata);
    onUpdate({ metadata_json: newMetadata });
  };

  const setCorrectOption = (id: number) => {
    const newOptions = metadata.options.map((o: any) => ({ ...o, is_correct: o.id === id }));
    const newMetadata = { ...metadata, options: newOptions };
    setMetadata(newMetadata);
    onUpdate({ metadata_json: newMetadata });
  };

  const addOption = () => {
    const newId = Math.max(...metadata.options.map((o: any) => o.id), 0) + 1;
    const newMetadata = { 
      ...metadata, 
      options: [...metadata.options, { id: newId, text: "", is_correct: false }] 
    };
    setMetadata(newMetadata);
    onUpdate({ metadata_json: newMetadata });
  };

  const removeOption = (id: number) => {
    if (metadata.options.length <= 2) return; // Minimum 2 options
    const newOptions = metadata.options.filter((o: any) => o.id !== id);
    // If we deleted the correct one, make the first one correct
    if (!newOptions.some((o: any) => o.is_correct)) {
      newOptions[0].is_correct = true;
    }
    const newMetadata = { ...metadata, options: newOptions };
    setMetadata(newMetadata);
    onUpdate({ metadata_json: newMetadata });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-500">Question Text</label>
        <textarea
          rows={2}
          value={metadata.question || ""}
          onChange={(e) => updateQuestion(e.target.value)}
          placeholder="What is the main objective of..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-surface focus:border-brand-green outline-none resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-500 flex justify-between items-center">
          <span>Options</span>
          <span className="text-slate-400">Select the correct answer</span>
        </label>
        
        <div className="space-y-2">
          {metadata.options.map((option: any) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
                type="radio"
                name={`quiz-correct-${block.id}`}
                checked={option.is_correct}
                onChange={() => setCorrectOption(option.id)}
                className="w-4 h-4 text-brand-green focus:ring-brand-green"
              />
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOptionText(option.id, e.target.value)}
                placeholder="Option text..."
                className={`flex-1 px-3 py-1.5 text-sm rounded-lg border outline-none ${
                  option.is_correct 
                    ? "border-brand-green bg-brand-green/5" 
                    : "border-input bg-surface focus:border-brand-green"
                }`}
              />
              <button 
                onClick={() => removeOption(option.id)}
                disabled={metadata.options.length <= 2}
                className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        <button 
          onClick={addOption}
          className="mt-2 text-xs font-medium text-brand-green hover:text-brand-teal flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add Option
        </button>
      </div>
    </div>
  );
}
