
import React, { useState, useEffect, useMemo } from 'react';
import { ActivityLog, DailyReport, AIRecommendation, Badge, TransportMode, UserProfile, LeaderboardEntry } from './types';
import { INITIAL_LOG, COLORS, MOCK_LEADERBOARD, AVATARS } from './constants';
import { calculateDailyEmissions } from './utils/calculator';
import { getAIRecommendations } from './services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  Leaf, Car, Zap, Wind, Truck, Utensils, Flame, 
  ChevronRight, Brain, Award, Info, History, LayoutDashboard, 
  Settings, Target, ShieldCheck, Globe, Star, TrendingDown,
  Trophy, Medal, CheckCircle2, Lock, ArrowDown, Bike, Footprints,
  Ghost, PackageX, ThermometerSnowflake, ZapOff, Sparkles, LogOut, Users, User
} from 'lucide-react';

// Sub-components
const NavButton = ({ active, onClick, icon: Icon, label, collapsed }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 p-3 w-full rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'group-hover:text-emerald-600'}`} />
    {!collapsed && <span className="text-sm font-semibold tracking-tight">{label}</span>}
  </button>
);

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 ${className}`}>
    {children}
  </div>
);

const BadgeCard = ({ badge }: { badge: Badge }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ghost': return Ghost;
      case 'package-x': return PackageX;
      case 'snow': return ThermometerSnowflake;
      case 'zap-off': return ZapOff;
      case 'sparkles': return Sparkles;
      case 'bike': return Bike;
      case 'trophy': return Trophy;
      case 'medal': return Medal;
      default: return Leaf;
    }
  };
  
  const Icon = getIcon(badge.icon);
  
  return (
    <div className={`relative p-6 rounded-3xl border-2 transition-all duration-500 overflow-hidden ${
      badge.achieved 
        ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-50' 
        : 'bg-slate-50 border-slate-200 opacity-60 grayscale'
    }`}>
      {!badge.achieved && <Lock className="absolute top-4 right-4 w-4 h-4 text-slate-300" />}
      {badge.achieved && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-500" />}
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
        badge.achieved ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'
      }`}>
        <Icon className="w-7 h-7" />
      </div>
      
      <h3 className={`text-lg font-black mb-2 ${badge.achieved ? 'text-slate-900' : 'text-slate-500'}`}>{badge.name}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">{badge.description}</p>
      
      {badge.targetProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Progress</span>
            <span>{Math.min(badge.currentProgress || 0, badge.targetProgress)} / {badge.targetProgress}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${badge.achieved ? 'bg-emerald-500' : 'bg-slate-300'}`} 
              style={{ width: `${((badge.currentProgress || 0) / badge.targetProgress) * 100}%` }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'insights' | 'rewards' | 'impact' | 'leaderboard'>('dashboard');
  const [log, setLog] = useState<ActivityLog>({ ...INITIAL_LOG, timestamp: new Date().toISOString() });
  const [history, setHistory] = useState<DailyReport[]>([]);
  const [recs, setRecs] = useState<AIRecommendation[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Sign-in states
  const [signInName, setSignInName] = useState('');
  const [signInAvatar, setSignInAvatar] = useState(AVATARS[0]);

  const report = useMemo(() => calculateDailyEmissions(log), [log]);

  const avgHistoryEmissions = useMemo(() => {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, h) => acc + h.totalEmissions, 0);
    return sum / history.length;
  }, [history]);

  const hasReduced = useMemo(() => {
    return history.length > 0 && report.totalEmissions < avgHistoryEmissions && report.totalEmissions > 0;
  }, [report.totalEmissions, avgHistoryEmissions, history]);

  const leaderboardData: LeaderboardEntry[] = useMemo(() => {
    // Explicitly define type to allow optional isCurrentUser property
    const entries: LeaderboardEntry[] = [...MOCK_LEADERBOARD.map((m) => ({ ...m, rank: 0 }))];
    entries.push({
      name: user?.name || 'You',
      avatar: user?.avatar || AVATARS[0],
      emissions: report.totalEmissions,
      score: report.score,
      isCurrentUser: true,
      rank: 0
    });

    // Sort: lowest emissions first
    return entries
      .sort((a, b) => a.emissions - b.emissions)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [user, report]);

  const badges: Badge[] = [
    { 
      id: 'vampire-1', 
      name: 'Vampire Slayer', 
      icon: 'ghost', 
      description: 'Reduced standby electricity usage to under 1 kWh per day.', 
      achieved: log.electricityKwh > 0 && log.electricityKwh < 1,
      type: 'category'
    },
    { 
      id: 'package-1', 
      name: 'Package Free', 
      icon: 'package-x', 
      description: 'Avoided all online delivery emissions today.', 
      achieved: log.onlineDeliveries === 0 && report.totalEmissions > 0,
      type: 'milestone'
    },
    { 
      id: 'breathe-1', 
      name: 'Breathe Easy', 
      icon: 'snow', 
      description: 'Maintained a zero-AC day to reduce hydrofluorocarbon potential.', 
      achieved: log.acHours === 0 && report.totalEmissions > 0,
      type: 'category'
    },
    { 
      id: 'grid-1', 
      name: 'Grid Independent', 
      icon: 'zap-off', 
      description: 'Operated without any fossil-fuel generator backup.', 
      achieved: log.generatorHours === 0 && report.totalEmissions > 0,
      type: 'category'
    },
    { 
      id: 'pedal-1', 
      name: 'Pedal Power', 
      icon: 'bike', 
      description: 'Chose cycling as your primary transport mode today.', 
      achieved: log.transportMode === 'bicycle' && log.transportDistance > 0,
      type: 'category'
    },
    { 
      id: 'sage-1', 
      name: 'Master of Efficiency', 
      icon: 'sparkles', 
      description: 'Achieved an Eco-Efficiency score higher than 95%.', 
      achieved: report.score >= 95,
      type: 'milestone'
    },
    { 
      id: 'red-vanguard', 
      name: 'Reduction Vanguard', 
      icon: 'trophy', 
      description: 'Lowered your total footprint below your 7-day average.', 
      achieved: hasReduced,
      type: 'reduction'
    }
  ];

  const handleInputChange = (field: keyof ActivityLog, value: any) => {
    if (field === 'transportDistance' || field === 'acHours' || field === 'electricityKwh' || field === 'lpgUsage' || field === 'generatorHours' || field === 'onlineDeliveries') {
      const numValue = parseFloat(value) || 0;
      setLog(prev => ({ ...prev, [field]: numValue }));
    } else {
      setLog(prev => ({ ...prev, [field]: value }));
    }
  };

  const fetchInsights = async () => {
    setLoadingAI(true);
    const result = await getAIRecommendations(report);
    setRecs(result);
    setLoadingAI(false);
  };

  const saveReport = () => {
    const newReport = { ...report, timestamp: new Date().toISOString() };
    setHistory(prev => [newReport, ...prev].slice(0, 10));
    setActiveTab('dashboard');
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (signInName.trim()) {
      setUser({
        name: signInName,
        avatar: signInAvatar,
        joinedDate: new Date().toISOString()
      });
    }
  };

  const getLevelInfo = (score: number) => {
    if (score > 85) return { name: 'Emerald Tree', color: 'text-emerald-600', bg: 'bg-emerald-100', progress: 100 };
    if (score > 60) return { name: 'Growing Sapling', color: 'text-blue-600', bg: 'bg-blue-100', progress: 75 };
    if (score > 30) return { name: 'Active Sprout', color: 'text-amber-600', bg: 'bg-amber-100', progress: 40 };
    return { name: 'New Seedling', color: 'text-rose-600', bg: 'bg-rose-100', progress: 15 };
  };

  const levelInfo = getLevelInfo(report.score);

  // Constants for Scientific Rating Circle
  const CIRCLE_RADIUS = 80;
  const CIRCLE_CENTER = 96;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  if (!user) {
    return (
      <div className="min-h-screen bg-emerald-900 flex items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <Leaf className="absolute top-10 left-10 w-40 h-40 text-emerald-100" />
          <Globe className="absolute bottom-20 right-20 w-64 h-64 text-emerald-100" />
        </div>
        
        <Card className="max-w-md w-full relative z-10 p-12 shadow-2xl border-none">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-200 mb-6">
              <Leaf className="text-white w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight">EcoTrack</h1>
            <p className="text-slate-500 font-medium mt-2">Personal Climate Intelligence</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Choose Identity</label>
              <input 
                type="text" 
                value={signInName} 
                onChange={(e) => setSignInName(e.target.value)}
                placeholder="Global Citizen Name" 
                className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition-all text-lg font-bold outline-none"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Select Avatar</label>
              <div className="flex justify-between gap-4">
                {AVATARS.map((av) => (
                  <button 
                    key={av} 
                    type="button"
                    onClick={() => setSignInAvatar(av)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-4 transition-all ${signInAvatar === av ? 'border-emerald-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={av} alt="avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3 group">
              Initialize Dashboard <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 font-medium">By entering, you join a global initiative to reach net-zero emissions by 2050.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 z-50 fixed bottom-0 left-0 right-0 md:relative md:h-screen md:flex flex-col ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'}`}>
        <div className="hidden md:flex items-center gap-3 p-8">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Leaf className="text-white w-6 h-6" />
          </div>
          {!isSidebarCollapsed && (
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">EcoTrack</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Carbon Monitor</span>
            </div>
          )}
        </div>

        <nav className="flex md:flex-col justify-around md:justify-start gap-2 p-4 flex-1">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Overview" collapsed={isSidebarCollapsed} />
          <NavButton active={activeTab === 'input'} onClick={() => setActiveTab('input')} icon={Zap} label="Activity Logger" collapsed={isSidebarCollapsed} />
          <NavButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={Users} label="Leaderboard" collapsed={isSidebarCollapsed} />
          <NavButton active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} icon={Brain} label="AI Strategy" collapsed={isSidebarCollapsed} />
          <NavButton active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} icon={Trophy} label="Achievements" collapsed={isSidebarCollapsed} />
          <NavButton active={activeTab === 'impact'} onClick={() => setActiveTab('impact')} icon={Globe} label="Impact Report" collapsed={isSidebarCollapsed} />
        </nav>

        <div className="hidden md:block p-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 p-3 mb-2 rounded-xl bg-slate-50 transition-all duration-200`}>
            <img src={user.avatar} className="w-8 h-8 rounded-lg" alt="profile" />
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Pro Citizen</p>
              </div>
            )}
          </div>
          <button onClick={() => setUser(null)} className="flex items-center gap-3 p-3 w-full text-slate-400 hover:text-rose-600 transition-all font-medium text-sm">
            <LogOut className="w-5 h-5" />
            {!isSidebarCollapsed && "Logout Session"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-emerald-600 font-bold text-sm tracking-wide mb-1">REAL-TIME FOOTPRINT AUDIT</p>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome, {user.name.split(' ')[0]}</h2>
                </div>
                <div className="flex gap-3">
                  {hasReduced && (
                    <div className="bg-emerald-500 px-5 py-2.5 rounded-2xl text-white shadow-lg shadow-emerald-200 flex items-center gap-3 animate-bounce">
                      <ArrowDown className="w-4 h-4" />
                      <span className="text-sm font-bold">Reduction Achievement Unlocked</span>
                    </div>
                  )}
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="flex flex-col justify-center items-center text-center">
                      <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6">Eco-Efficiency Score</h4>
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                          <circle cx={CIRCLE_CENTER} cy={CIRCLE_CENTER} r={CIRCLE_RADIUS} stroke="#F1F5F9" strokeWidth="12" fill="none" />
                          <circle 
                            cx={CIRCLE_CENTER} cy={CIRCLE_CENTER} r={CIRCLE_RADIUS} stroke="currentColor" strokeWidth="12" fill="none"
                            strokeDasharray={CIRCLE_CIRCUMFERENCE}
                            strokeDashoffset={CIRCLE_CIRCUMFERENCE - (report.score / 100) * CIRCLE_CIRCUMFERENCE}
                            strokeLinecap={report.score === 0 ? "butt" : "round"}
                            className={`transition-all duration-1000 ${report.score > 70 ? 'text-emerald-500' : report.score > 40 ? 'text-amber-500' : 'text-rose-500'}`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-black text-slate-900">{report.score}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Scientific Rating</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="flex flex-col justify-between">
                      <div>
                        <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Current Status</h4>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2.5 rounded-xl ${levelInfo.bg} ${levelInfo.color}`}>
                            <Medal className="w-6 h-6" />
                          </div>
                          <h3 className={`text-2xl font-black ${levelInfo.color}`}>{levelInfo.name}</h3>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                          <p className="text-[11px] font-black text-slate-400 uppercase mb-1">Global Ranking Context</p>
                          <p className="text-sm text-slate-700 font-bold">
                            You currently rank #{leaderboardData.find(e => e.isCurrentUser)?.rank} in the community.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">NEXT TIER</span>
                          <span className="text-slate-900">{levelInfo.progress}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 bg-emerald-500`} style={{ width: `${levelInfo.progress}%` }} />
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-white p-8 rounded-[2rem] border-2 border-emerald-500 shadow-xl shadow-emerald-50 flex flex-col items-center text-center">
                    <Trophy className="w-12 h-12 text-emerald-600 mb-4" />
                    <h4 className="text-xl font-black text-slate-900 mb-2">Achievement Hub</h4>
                    <p className="text-slate-500 text-sm mb-6">You've unlocked {badges.filter(b => b.achieved).length} environmental milestones.</p>
                    <button onClick={() => setActiveTab('rewards')} className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-all text-sm">
                      View Wall of Fame
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard View */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <header className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black uppercase tracking-widest mb-4">
                  <Globe className="w-4 h-4" /> Global Community Ranking
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Eco Vanguard</h2>
                <p className="text-slate-500 mt-2">Ranked by individual net-daily carbon emissions. Lower emissions yield higher status.</p>
              </header>

              <div className="space-y-4">
                {leaderboardData.map((entry) => (
                  <div 
                    key={entry.name} 
                    className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${entry.isCurrentUser ? 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-100' : 'bg-white border-slate-100 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 flex items-center justify-center text-xl font-black ${entry.rank === 1 ? 'text-amber-500' : entry.rank === 2 ? 'text-slate-400' : entry.rank === 3 ? 'text-amber-700' : 'text-slate-300'}`}>
                        {entry.rank === 1 ? <Trophy className="w-8 h-8" /> : entry.rank}
                      </div>
                      <img src={entry.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt={entry.name} />
                      <div>
                        <h4 className={`text-lg font-black ${entry.isCurrentUser ? 'text-emerald-900' : 'text-slate-900'}`}>{entry.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{entry.score}/100 Score</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900">{entry.emissions} <span className="text-xs font-bold text-slate-400 ml-1">kg CO₂</span></p>
                      <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md inline-block ${entry.emissions < 5 ? 'bg-emerald-100 text-emerald-600' : entry.emissions < 10 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                        {entry.emissions < 5 ? 'Optimal' : entry.emissions < 10 ? 'Moderate' : 'Alert'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Logger */}
          {activeTab === 'input' && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
              <Card>
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Audit Input</h2>
                      <p className="text-slate-500 text-sm">Quantify today's activities</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">LIVE FOOTPRINT</p>
                    <p className={`text-3xl font-black transition-colors ${report.totalEmissions > avgHistoryEmissions && history.length > 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                      {report.totalEmissions}
                      <span className="text-sm font-medium text-slate-400 ml-1">kg CO₂</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Car className="w-4 h-4 text-rose-500" /> Transit Data
                    </h3>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">TRANSPORT MODE</label>
                      <div className="relative">
                        <select 
                          value={log.transportMode} 
                          onChange={e => handleInputChange('transportMode', e.target.value as TransportMode)}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition-all text-lg font-bold outline-none appearance-none cursor-pointer"
                        >
                          <option value="car">Private Car (Gasoline)</option>
                          <option value="public">Public Transport (Bus/Train)</option>
                          <option value="bicycle">Bicycle (Eco)</option>
                          <option value="walking">Walking (Eco)</option>
                        </select>
                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">TOTAL DISTANCE (KM)</label>
                      <div className="relative flex items-center">
                        {log.transportMode === 'car' && <Car className="absolute left-4 w-5 h-5 text-slate-400" />}
                        {log.transportMode === 'public' && <Globe className="absolute left-4 w-5 h-5 text-slate-400" />}
                        {log.transportMode === 'bicycle' && <Bike className="absolute left-4 w-5 h-5 text-slate-400" />}
                        {log.transportMode === 'walking' && <Footprints className="absolute left-4 w-5 h-5 text-slate-400" />}
                        <input 
                          type="number" 
                          value={log.transportDistance || ''} 
                          onChange={e => handleInputChange('transportDistance', e.target.value)} 
                          placeholder="0.0" 
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition-all text-lg font-bold outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Wind className="w-4 h-4 text-indigo-500" /> Energy Usage
                    </h3>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">GRID ELECTRICITY (KWH)</label>
                      <input type="number" value={log.electricityKwh || ''} onChange={e => handleInputChange('electricityKwh', e.target.value)} placeholder="0.0" className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition-all text-lg font-bold outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">AC OPERATION (HOURS)</label>
                      <input type="number" value={log.acHours || ''} onChange={e => handleInputChange('acHours', e.target.value)} placeholder="0.0" className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition-all text-lg font-bold outline-none" />
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-end gap-4">
                  <button onClick={saveReport} className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-2xl font-black shadow-xl transition-all flex items-center gap-3">
                    Submit Record <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Tab logic for remaining sections omitted for brevity but they remain active */}
          {activeTab === 'insights' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
             <header className="max-w-xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black uppercase tracking-widest mb-4">
                 <Brain className="w-4 h-4" /> Neural Strategy Engine
               </div>
               <h2 className="text-3xl font-black text-slate-900">Optimization Roadmap</h2>
               <p className="text-slate-500 mt-2">Dynamic analysis of your behavior patterns to identify peak reduction potential.</p>
             </header>
             <button onClick={fetchInsights} disabled={loadingAI} className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black shadow-xl flex items-center gap-4 transition-all active:scale-95">
               {loadingAI ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Brain className="w-6 h-6" />}
               GENERATE NEXT STEPS
             </button>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {recs.map((rec, i) => (
                 <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col hover:border-emerald-200 transition-all group">
                   <span className={`text-[10px] font-black uppercase tracking-widest mb-4 px-3 py-1 rounded-full w-fit ${rec.impact === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                     {rec.impact} Impact
                   </span>
                   <h3 className="text-2xl font-black text-slate-900 mb-4">{rec.title}</h3>
                   <p className="text-slate-500 text-sm leading-relaxed flex-1">{rec.description}</p>
                 </div>
               ))}
             </div>
           </div>
          )}

          {activeTab === 'rewards' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
             <header className="flex flex-col md:flex-row justify-between items-end gap-6">
               <div className="max-w-xl">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-black uppercase tracking-widest mb-4">
                   <Trophy className="w-4 h-4" /> Environmental Hall of Fame
                 </div>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your Achievements</h2>
                 <p className="text-slate-500 mt-2">Earn specialized milestones by adopting sustainable consumption patterns.</p>
               </div>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {badges.map(badge => <BadgeCard key={badge.id} badge={badge} />)}
             </div>
           </div>
          )}

          {activeTab === 'impact' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
             <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div>
                   <h2 className="text-5xl font-black tracking-tight mb-6">Scientific Alignment</h2>
                   <p className="text-slate-400 text-lg leading-relaxed mb-8">EcoTrack calculations are based on the GHG Protocol Corporate Standard and align with IPCC climate mitigation pathways.</p>
                 </div>
                 <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600" className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000" alt="Planet Earth" />
               </div>
             </div>
           </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
