export interface OfflineRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
}

const STORAGE_KEY = "lms_offline_queue";

export class OfflineQueue {
  static enqueue(request: Omit<OfflineRequest, "id" | "timestamp">) {
    const queue = this.getQueue();
    const item: OfflineRequest = {
      ...request,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    queue.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    console.log(`[OfflineQueue] Buffered request for ${request.url}. Queue size: ${queue.length}`);
  }

  static getQueue(): OfflineRequest[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static async flush() {
    if (typeof window === "undefined" || !navigator.onLine) return;
    
    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log(`[OfflineQueue] Connection restored. Flushing ${queue.length} pending requests...`);
    
    // Clear queue from storage first to prevent double-flushing. 
    // We will re-add failed ones.
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    
    const failedQueue: OfflineRequest[] = [];

    for (const item of queue) {
      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
          keepalive: true
        });
        
        if (!res.ok) {
           console.error(`[OfflineQueue] Flush failed for ${item.url} with status ${res.status}`);
           failedQueue.push(item);
        } else {
           console.log(`[OfflineQueue] Successfully flushed ${item.url}`);
        }
      } catch (err) {
        console.error(`[OfflineQueue] Network error flushing ${item.url}`, err);
        failedQueue.push(item);
      }
    }
    
    if (failedQueue.length > 0) {
       console.log(`[OfflineQueue] Re-buffering ${failedQueue.length} failed requests.`);
       localStorage.setItem(STORAGE_KEY, JSON.stringify(failedQueue));
    }
  }

  static setupListeners() {
    if (typeof window === "undefined") return;
    window.addEventListener("online", () => {
      this.flush();
    });
    // Also try flushing on load
    this.flush();
  }
}
