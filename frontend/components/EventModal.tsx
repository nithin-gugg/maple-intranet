import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export interface EventData {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  start: Date | string;
  end: Date | string;
  allDay: boolean;
  attendees?: string[];
  create_meet?: boolean;
  meet_url?: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventData) => void;
  onDelete?: (id: string) => void;
  initialData?: EventData | null;
  isLoading?: boolean;
}

export function EventModal({ isOpen, onClose, onSave, onDelete, initialData, isLoading }: EventModalProps) {
  const [formData, setFormData] = useState<EventData>({
    title: "",
    description: "",
    location: "",
    start: new Date(),
    end: new Date(),
    allDay: false,
    attendees: [],
    create_meet: false,
  });
  
  const [attendeeInput, setAttendeeInput] = useState("");

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        ...initialData,
        allDay: !!initialData.allDay,
        create_meet: !!initialData.create_meet,
      });
      setAttendeeInput(initialData.attendees?.join(", ") || "");
    } else if (isOpen && !initialData) {
      setFormData({
        title: "",
        description: "",
        location: "",
        start: new Date(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000), // +1 hour
        allDay: false,
        attendees: [],
        create_meet: false,
      });
      setAttendeeInput("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emails = attendeeInput.split(",").map(e => e.trim()).filter(e => e);
    onSave({ ...formData, attendees: emails });
  };

  const formatForInput = (d: Date | string) => {
    if (!d) return "";
    const date = new Date(d);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const formatForDateInput = (d: Date | string) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toISOString().split("T")[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData?.id ? "Edit Event" : "Create Event"}</DialogTitle>
            <DialogDescription>
              {initialData?.id ? "Update event details." : "Add a new event to your Google Calendar."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allDay" className="cursor-pointer">All Day Event</Label>
              <Switch 
                id="allDay" 
                checked={!!formData.allDay} 
                onCheckedChange={(c) => setFormData({...formData, allDay: !!c})} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start</Label>
                <Input 
                  id="start" 
                  type={formData.allDay ? "date" : "datetime-local"} 
                  value={formData.allDay ? formatForDateInput(formData.start) : formatForInput(formData.start)} 
                  onChange={(e) => setFormData({...formData, start: new Date(e.target.value)})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End</Label>
                <Input 
                  id="end" 
                  type={formData.allDay ? "date" : "datetime-local"} 
                  value={formData.allDay ? formatForDateInput(formData.end) : formatForInput(formData.end)} 
                  onChange={(e) => setFormData({...formData, end: new Date(e.target.value)})} 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={formData.location || ""} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
                placeholder="Office, Room, or Address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description || ""} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Event details..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attendees">Attendees (Emails)</Label>
              <Input 
                id="attendees" 
                value={attendeeInput} 
                onChange={(e) => setAttendeeInput(e.target.value)} 
                placeholder="john@example.com, jane@example.com"
              />
              <p className="text-xs text-slate-500">Separate multiple emails with commas</p>
            </div>
            
            {!initialData?.id && (
              <div className="flex items-center justify-between border border-slate-200 p-3 rounded-lg bg-slate-50">
                <div>
                  <Label htmlFor="create_meet" className="cursor-pointer font-medium">Add Google Meet</Label>
                  <p className="text-xs text-slate-500">Automatically generate a video conferencing link</p>
                </div>
                <Switch 
                  id="create_meet" 
                  checked={!!formData.create_meet} 
                  onCheckedChange={(c) => setFormData({...formData, create_meet: !!c})} 
                />
              </div>
            )}
            
            {initialData?.meet_url && (
              <div className="p-3 bg-brand-green/10 border border-brand-green/30 rounded-lg">
                <Label className="text-brand-green font-semibold">Google Meet</Label>
                <a href={initialData.meet_url} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 hover:underline mt-1 break-all">
                  {initialData.meet_url}
                </a>
              </div>
            )}
            
          </div>
          
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            {initialData?.id ? (
              <Button type="button" variant="destructive" onClick={() => onDelete?.(initialData.id!)} disabled={isLoading}>
                Delete
              </Button>
            ) : (
              <div /> // spacer
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" className="bg-brand-green text-black hover:bg-brand-green/90" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
