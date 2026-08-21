"use client";

import { useState } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the Maple AI Assistant powered by Llama 3. How can I help you with your work today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to the server right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-canvas rounded-xl border border-hairline shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-brand-teal-deep text-on-dark p-6 flex items-center gap-4">
        <div className="bg-brand-green h-12 w-12 rounded-xl flex items-center justify-center shadow-md">
          <Bot className="h-6 w-6 text-brand-teal-deep" />
        </div>
        <div>
          <h2 className="text-heading-4 font-semibold tracking-tight text-white">Maple AI</h2>
          <p className="text-sm text-brand-teal-light">Your intelligent intranet companion</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-soft">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-brand-teal text-white' : 'bg-surface border border-hairline text-brand-teal-deep'
              }`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-brand-teal text-white rounded-tr-none' 
                  : 'bg-canvas border border-hairline text-ink rounded-tl-none shadow-subtle'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="h-8 w-8 rounded-full bg-surface border border-hairline text-brand-teal-deep flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-canvas border border-hairline rounded-tl-none shadow-subtle">
                <Loader2 className="h-4 w-4 animate-spin text-brand-green-dark" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-canvas border-t border-hairline">
        <form onSubmit={sendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-brand-green text-on-dark hover:bg-brand-green-dark disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
