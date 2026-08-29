"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { GiveKudosModal } from "@/components/kudos/GiveKudosModal";
import { KudosFeed } from "@/components/kudos/KudosFeed";
import { MyRecognition } from "@/components/kudos/MyRecognition";
import { RecognitionStats } from "@/components/kudos/RecognitionStats";
import { RecognitionLeaderboard } from "@/components/kudos/RecognitionLeaderboard";

export default function KudosPage() {
  const { getToken } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [feedData, setFeedData] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  
  const [myStats, setMyStats] = useState(null);
  const [myStatsLoading, setMyStatsLoading] = useState(true);
  
  const [globalStats, setGlobalStats] = useState(null);
  const [globalStatsLoading, setGlobalStatsLoading] = useState(true);
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Fetch Feed
      setFeedLoading(true);
      fetch(`${baseUrl}/api/v1/kudos/`, { headers })
        .then(r => r.json())
        .then(data => { setFeedData(data); setFeedLoading(false); })
        .catch(() => setFeedLoading(false));

      // Fetch My Stats
      setMyStatsLoading(true);
      fetch(`${baseUrl}/api/v1/kudos/my`, { headers })
        .then(r => r.json())
        .then(data => { setMyStats(data); setMyStatsLoading(false); })
        .catch(() => setMyStatsLoading(false));

      // Fetch Global Stats
      setGlobalStatsLoading(true);
      fetch(`${baseUrl}/api/v1/kudos/stats`, { headers })
        .then(r => r.json())
        .then(data => { setGlobalStats(data); setGlobalStatsLoading(false); })
        .catch(() => setGlobalStatsLoading(false));

      // Fetch Leaderboard
      setLeaderboardLoading(true);
      fetch(`${baseUrl}/api/v1/kudos/leaderboard`, { headers })
        .then(r => r.json())
        .then(data => { setLeaderboard(data); setLeaderboardLoading(false); })
        .catch(() => setLeaderboardLoading(false));

    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-slate-50 min-h-full">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kudos & Recognition</h1>
            <p className="text-slate-500 mt-1">Appreciate your teammates, celebrate their contributions, and spread positivity.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-brand-green text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-[#00c575] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Give Kudos
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Feed */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Recognition</h2>
            <KudosFeed kudos={feedData} isLoading={feedLoading} />
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-6">
            <MyRecognition stats={myStats} isLoading={myStatsLoading} />
            <RecognitionStats stats={globalStats} isLoading={globalStatsLoading} />
            <RecognitionLeaderboard leaderboard={leaderboard} isLoading={leaderboardLoading} />
          </div>

        </div>
      </div>

      <GiveKudosModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchAllData()}
      />
    </div>
  );
}
