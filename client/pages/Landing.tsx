import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/utils/authService";

export default function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'short' | 'long'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getCurrentUser();
        if (data?.user) {
          setUser(data.user);
        }
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };
    fetchUser();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          const totalTime = activeTab === 'pomodoro' ? 25 * 60 : activeTab === 'short' ? 5 * 60 : 15 * 60;
          setProgress(((totalTime - newTime) / totalTime) * 100);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, activeTab]);

  const handleTabChange = (tab: 'pomodoro' | 'short' | 'long') => {
    setActiveTab(tab);
    setIsRunning(false);
    setProgress(0);
    if (tab === 'pomodoro') setTimeLeft(25 * 60);
    else if (tab === 'short') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at top left, #1f2532, #0e121a 60%)' }}>
      <style>{`
        :root { 
          --bg1: #0f141d; 
          --bg2: #1a1f2b; 
          --card: #232a36; 
          --card-light: #2e3645; 
          --accent: #ff5a1f; 
          --text: #f5f1e9; 
          --muted: #9aa3b2; 
        }
        
        .card-hover:hover { 
          transform: translateY(-8px); 
          box-shadow: 0 20px 40px rgba(255, 90, 31, 0.15); 
        }
        
        .btn-glow:hover { 
          box-shadow: 0 0 30px rgba(255, 90, 31, 0.5); 
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .snail-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-4" style={{ background: 'rgba(15, 20, 29, 0.9)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">🌟 Safar</span>
          </div>
          <div className="flex items-center gap-6">
            {user && (
              <span className="text-[#9aa3b2] text-sm">Welcome, {user.name}</span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-[#9aa3b2] hover:text-white transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Timer Section */}
          <section className="mb-20">
            <div className="flex gap-12 items-start">
              {/* Sidebar Links */}
              <div className="hidden lg:flex flex-col gap-6 pt-8 w-44">
                <Link to="/profile" className="text-[#cfd6e2] opacity-85 hover:opacity-100 transition text-lg">Profile</Link>
                <Link to="/dashboard" className="text-[#cfd6e2] opacity-85 hover:opacity-100 transition text-lg">Dashboard</Link>
                <Link to="/goals" className="text-[#cfd6e2] opacity-85 hover:opacity-100 transition text-lg">Add task</Link>
                <Link to="/achievements" className="text-[#cfd6e2] opacity-85 hover:opacity-100 transition text-lg">Achievements</Link>
              </div>

              {/* Timer Card */}
              <div className="flex-1 flex flex-col items-center gap-12">
                <div
                  className="w-full max-w-[700px] p-10 rounded-[25px]"
                  style={{
                    background: 'linear-gradient(145deg, #232a36, #2e3645)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
                  }}
                >
                  {/* Tabs */}
                  <div className="flex justify-center gap-5 mb-10">
                    <button
                      onClick={() => handleTabChange('pomodoro')}
                      className={`px-6 py-2.5 rounded-full text-[15px] transition-all ${activeTab === 'pomodoro'
                          ? 'text-white'
                          : 'bg-[#1b222d] text-[#9aa3b2] hover:text-white'
                        }`}
                      style={activeTab === 'pomodoro' ? {
                        background: '#ff5a1f',
                        boxShadow: '0 5px 15px rgba(255,90,31,0.4)'
                      } : {}}
                    >
                      Pomodoro
                    </button>
                    <button
                      onClick={() => handleTabChange('short')}
                      className={`px-6 py-2.5 rounded-full text-[15px] transition-all ${activeTab === 'short'
                          ? 'text-white'
                          : 'bg-[#1b222d] text-[#9aa3b2] hover:text-white'
                        }`}
                      style={activeTab === 'short' ? {
                        background: '#ff5a1f',
                        boxShadow: '0 5px 15px rgba(255,90,31,0.4)'
                      } : {}}
                    >
                      Short break
                    </button>
                    <button
                      onClick={() => handleTabChange('long')}
                      className={`px-6 py-2.5 rounded-full text-[15px] transition-all ${activeTab === 'long'
                          ? 'text-white'
                          : 'bg-[#1b222d] text-[#9aa3b2] hover:text-white'
                        }`}
                      style={activeTab === 'long' ? {
                        background: '#ff5a1f',
                        boxShadow: '0 5px 15px rgba(255,90,31,0.4)'
                      } : {}}
                    >
                      Long break
                    </button>
                  </div>

                  {/* Time Display */}
                  <div className="text-center mb-8">
                    <span className="text-[110px] font-light text-[#f5f1e9] tracking-wider">
                      {formatTime(timeLeft)}
                    </span>
                  </div>

                  {/* Start/Pause Button */}
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="block mx-auto px-16 py-4 rounded-full text-[22px] font-semibold text-white btn-glow transition-all active:scale-95"
                    style={{
                      background: 'linear-gradient(145deg, #ff6a2f, #e13c00)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.6), 0 4px 10px rgba(255,90,31,0.5)'
                    }}
                  >
                    {isRunning ? 'PAUSE' : 'START'}
                  </button>
                </div>

                {/* Footer with Snail */}
                <div className="w-full max-w-[700px] flex items-center gap-6">
                  {/* Snail */}
                  <div className="relative w-28 h-16 snail-float">
                    <div
                      className="absolute w-16 h-16 rounded-full left-0 bottom-0"
                      style={{ background: 'radial-gradient(circle at 30% 30%, #ff8c4d, #cc3c00)' }}
                    >
                      <div
                        className="absolute w-8 h-8 rounded-full border-4"
                        style={{ borderColor: 'rgba(255,255,255,0.25)', top: '12px', left: '12px' }}
                      ></div>
                    </div>
                    <div
                      className="absolute w-20 h-8 rounded-full bottom-0"
                      style={{ background: '#f6e7d8', left: '32px' }}
                    >
                      <div
                        className="absolute w-1.5 rounded-sm"
                        style={{ height: '16px', background: '#222', top: '-16px', right: '18px' }}
                      ></div>
                      <div
                        className="absolute w-1.5 rounded-sm"
                        style={{ height: '16px', background: '#222', top: '-16px', right: '30px' }}
                      ></div>
                    </div>
                  </div>

                  <span className="text-[#d2d7df] text-lg whitespace-nowrap">
                    {isRunning ? "Focus time! You got this!" : "Time to be productive. Let's start!"}
                  </span>

                  {/* Progress Bar */}
                  <div
                    className="flex-1 h-2.5 rounded-full relative"
                    style={{ background: '#11151c', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #ff5a1f, #ffb26b)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* App Cards Section */}
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Apps</h2>
              <p className="text-[#9aa3b2]">Your productivity ecosystem. Choose where to begin.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Nishta Card */}
              <Link
                to="/dashboard"
                className="group rounded-3xl overflow-hidden border border-[#2e3645] card-hover transition-all duration-300"
                style={{ background: 'linear-gradient(145deg, #232a36, #2e3645)' }}
              >
                <div className="h-48 overflow-hidden relative bg-gradient-to-br from-teal-900/50 to-emerald-900/50 flex items-center justify-center">
                  <span className="text-7xl">🧘</span>
                  <div className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Wellness
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Nishta</h3>
                  <p className="text-[#9aa3b2] text-sm mb-6">
                    Mental wellness companion with daily mood check-ins, journaling, and emotional tracking.
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-[#2e3645]">
                    <span className="flex items-center gap-2 text-sm font-bold text-[#9aa3b2]">
                      ✨ Daily Check-ins
                    </span>
                    <span className="text-[#ff5a1f] font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Enter →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Focus Timer Card */}
              <Link
                to="/study"
                className="group rounded-3xl overflow-hidden border border-[#2e3645] card-hover transition-all duration-300"
                style={{ background: 'linear-gradient(145deg, #232a36, #2e3645)' }}
              >
                <div className="h-48 overflow-hidden relative bg-gradient-to-br from-orange-900/50 to-red-900/50 flex items-center justify-center">
                  <span className="text-7xl">⏱️</span>
                  <div className="absolute top-4 right-4 bg-[#ff5a1f] text-white px-3 py-1 rounded-full text-xs font-bold">
                    Productivity
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Focus Timer</h3>
                  <p className="text-[#9aa3b2] text-sm mb-6">
                    Advanced Pomodoro timer with focus sessions, achievements, and productivity stats.
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-[#2e3645]">
                    <span className="flex items-center gap-2 text-sm font-bold text-[#9aa3b2]">
                      🔥 Study Sessions
                    </span>
                    <span className="text-[#ff5a1f] font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Enter →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Mehfil Card */}
              <div
                className="group rounded-3xl overflow-hidden border border-[#2e3645] card-hover transition-all duration-300 opacity-70 cursor-not-allowed"
                style={{ background: 'linear-gradient(145deg, #232a36, #2e3645)' }}
              >
                <div className="h-48 overflow-hidden relative bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
                  <span className="text-7xl">👥</span>
                  <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Coming Soon
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Mehfil</h3>
                  <p className="text-[#9aa3b2] text-sm mb-6">
                    Social study rooms where you can focus together with friends and fellow students.
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-[#2e3645]">
                    <span className="flex items-center gap-2 text-sm font-bold text-[#9aa3b2]">
                      🎯 Study Together
                    </span>
                    <span className="text-purple-400 font-bold flex items-center gap-1">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
