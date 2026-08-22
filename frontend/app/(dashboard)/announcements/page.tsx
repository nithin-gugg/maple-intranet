"use client";

import { Megaphone, AlertCircle, CalendarClock, ChevronRight, Plus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useWebSocket } from "@/hooks/use-websocket";
import { toast } from "sonner";

export default function AnnouncementsPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { lastMessage } = useWebSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'NORMAL' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const role = user?.publicMetadata?.role as string | undefined;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (lastMessage?.type === 'NEW_ANNOUNCEMENT') {
      setAnnouncements(prev => [lastMessage.data, ...prev]);
      // Optional: Play a sound or show a toast if not on the page
    }
  }, [lastMessage]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/announcements`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/announcements`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAnnouncement)
      });
      
      if (res.ok) {
        toast.success("Broadcast sent successfully!");
        setIsModalOpen(false);
        setNewAnnouncement({ title: '', content: '', priority: 'NORMAL' });
        // No need to fetch, WebSocket will push it to us!
      } else {
        toast.error("Failed to send broadcast.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg font-heading tracking-tight text-ink">Announcements</h1>
          <p className="mt-2 text-subtitle text-slate-500">Stay updated with the latest company news and broadcasts.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:inline-flex items-center rounded-full bg-brand-green text-on-dark hover:bg-brand-green-dark px-6 py-2.5 text-sm font-semibold transition-colors shadow-sm shadow-brand-green/20"
          >
            <Plus className="w-4 h-4 mr-2" /> New Broadcast
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-canvas border border-hairline rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-hairline">
              <h2 className="text-xl font-bold text-ink">New Broadcast</h2>
              <p className="text-sm text-slate-500 mt-1">Send a real-time announcement to all employees.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" required
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  className="w-full px-3 py-2 border border-hairline rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green/50 bg-surface"
                  placeholder="e.g., Q3 Town Hall Meeting"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select 
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-hairline rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green/50 bg-surface"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High (Urgent)</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea 
                  required rows={4}
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  className="w-full px-3 py-2 border border-hairline rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green/50 bg-surface"
                  placeholder="Announcement details..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center rounded-md bg-brand-green text-on-dark hover:bg-brand-green-dark px-6 py-2 text-sm font-semibold transition-colors disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Megaphone className="w-4 h-4 mr-2" />}
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-dashed border-hairline">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No Announcements</h3>
          <p className="text-slate-500 text-sm mt-1">There are no active broadcasts at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-canvas p-6 rounded-lg border border-hairline shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  announcement.priority === 'HIGH' ? 'bg-semantic-warning-bg text-semantic-warning-text' : 
                  announcement.priority === 'NORMAL' ? 'bg-brand-green/10 text-brand-green-dark' : 'bg-surface text-slate-500'
                }`}>
                  {announcement.priority === 'HIGH' ? <AlertCircle className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-heading-4 font-semibold text-ink">{announcement.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span className="font-medium">{announcement.author || "Admin"}</span>
                    <span>•</span>
                    <span className="flex items-center"><CalendarClock className="mr-1 h-3 w-3" /> {new Date(announcement.created_at || announcement.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              {announcement.content}
            </p>
            
            <div className="flex items-center justify-end border-t border-hairline-soft pt-4">
              <button className="flex items-center text-sm font-medium text-brand-green-dark hover:underline">
                Read Full Details <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
