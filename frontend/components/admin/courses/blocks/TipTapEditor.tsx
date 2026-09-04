"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Code, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TipTapEditor({ block, onUpdate }: { block: any, onUpdate: (data: any) => void }) {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false })
    ],
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('bold') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('italic') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('bulletList') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('orderedList') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('codeBlock') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <Code className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt('Enter URL');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('link') ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-ink' : 'text-slate-500'}`}
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 prose prose-slate max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4 focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
