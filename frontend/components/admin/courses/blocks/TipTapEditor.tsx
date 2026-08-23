"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2, Code } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TipTapEditor({ block, onUpdate }: { block: any, onUpdate: (data: any) => void }) {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: block.content || '<p>Start typing...</p>',
    onUpdate: ({ editor }) => {
      onUpdate({ content: editor.getHTML() });
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  if (!editor) return null;

  return (
    <div className={`transition-colors ${isFocused ? 'ring-1 ring-brand-green border-transparent' : 'border-transparent'}`}>
      <div className={`flex items-center gap-1 p-2 border-b border-hairline bg-surface transition-opacity ${isFocused ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden py-0 border-none'}`}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('bold') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('italic') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('heading') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('bulletList') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('orderedList') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('codeBlock') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <Code className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 prose prose-slate max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4 focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
