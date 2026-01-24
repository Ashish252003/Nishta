import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/utils/authService';
import { useTheme } from '@/contexts/ThemeContext';

interface FocusStats {
    totalFocusMinutes: number;
    totalBreakMinutes: number;
    totalSessions: number;
    completedSessions: number;
    weeklyData: number[];
    focusStreak: number;
}

export default function StudyWithMe() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<any>(null);

    // Timer state
    const [activeMode, setActiveMode] = useState<'work' | 'short' | 'long'>('work');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [taskName, setTaskName] = useState('Focus Session');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Focus stats
    const [focusStats, setFocusStats] = useState<FocusStats>({
        totalFocusMinutes: 0,
        totalBreakMinutes: 0,
        totalSessions: 0,
        completedSessions: 0,
        weeklyData: [0, 0, 0, 0, 0, 0, 0],
        focusStreak: 0
    });

    const modeDurations = {
        work: 25 * 60,
        short: 5 * 60,
        long: 15 * 60
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await authService.getCurrentUser();
                if (data?.user) {
                    setUser(data.user);
                    fetchFocusStats();
                } else {
                    navigate('/login');
                }
            } catch (e) {
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate]);

    const fetchFocusStats = async () => {
        try {
            const res = await fetch('/api/focus-sessions/stats', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setFocusStats(data);
            }
        } catch (e) {
            console.error('Failed to fetch focus stats', e);
        }
    };

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            // Log session completion
            if (activeMode === 'work') {
                logFocusSession();
            }
            // Play notification sound or show alert
            alert(activeMode === 'work' ? 'Focus session complete! Take a break.' : 'Break over! Ready to focus?');
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeLeft, activeMode]);

    const logFocusSession = async () => {
        try {
            await fetch('/api/focus-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    duration: modeDurations.work / 60,
                    type: 'focus'
                })
            });
            fetchFocusStats();
        } catch (e) {
            console.error('Failed to log focus session', e);
        }
    };

    const handleModeChange = (mode: 'work' | 'short' | 'long') => {
        setActiveMode(mode);
        setTimeLeft(modeDurations[mode]);
        setIsRunning(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((modeDurations[activeMode] - timeLeft) / modeDurations[activeMode]) * 100;

    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen flex ${isDark ? 'bg-[#2c2c2c] text-white' : 'bg-white text-gray-900'}`}>
            {/* Sidebar */}
            <aside className={`w-64 border-r flex flex-col h-screen sticky top-0 ${isDark ? 'border-white/10 bg-[#2c2c2c]' : 'border-gray-200 bg-white'}`}>
                <div className="p-6 flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-full bg-[#f27f0d] flex items-center justify-center text-white text-xl">
                            🐌
                        </div>
                        <div className="flex flex-col">
                            <h1 className={`text-lg font-bold leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>Snail Timer</h1>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Slow & Steady</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2 flex-grow">
                        <Link
                            to="/profile"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-[#3a3a3a]' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span>👤</span>
                            <span className="text-sm font-medium">Profile</span>
                        </Link>
                        <button
                            onClick={toggleTheme}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-[#3a3a3a]' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span>{isDark ? '☀️' : '🌙'}</span>
                            <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                        <Link
                            to="/goals"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isDark ? 'bg-[#f27f0d]/20 text-[#f27f0d]' : 'bg-orange-100 text-[#f27f0d]'}`}
                        >
                            <span>➕</span>
                            <span className="text-sm font-medium">Add task</span>
                        </Link>
                        <Link
                            to="/achievements"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-[#3a3a3a]' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span>✅</span>
                            <span className="text-sm font-medium">Achievements</span>
                        </Link>
                        <Link
                            to="/"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-[#3a3a3a]' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span>🏠</span>
                            <span className="text-sm font-medium">Back to Home</span>
                        </Link>
                    </nav>

                    {/* User info */}
                    <div className={`mt-auto pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className={`w-8 h-8 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'Focus User'}</p>
                                <p className={`text-[10px] truncate ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {focusStats.focusStreak} day streak 🔥
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-between p-8 relative">
                {/* Mode Tabs */}
                <div className="w-full max-w-xl">
                    <div className={`flex justify-center border-b gap-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <button
                            onClick={() => handleModeChange('work')}
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 transition-colors ${activeMode === 'work'
                                    ? 'border-[#f27f0d] text-[#f27f0d]'
                                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                                }`}
                        >
                            <p className="text-sm font-bold tracking-wide">Work</p>
                        </button>
                        <button
                            onClick={() => handleModeChange('short')}
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 transition-colors ${activeMode === 'short'
                                    ? 'border-[#f27f0d] text-[#f27f0d]'
                                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                                }`}
                        >
                            <p className="text-sm font-bold tracking-wide">Short Break</p>
                        </button>
                        <button
                            onClick={() => handleModeChange('long')}
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 transition-colors ${activeMode === 'long'
                                    ? 'border-[#f27f0d] text-[#f27f0d]'
                                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                                }`}
                        >
                            <p className="text-sm font-bold tracking-wide">Long Break</p>
                        </button>
                    </div>
                </div>

                {/* Timer Card */}
                <div className="flex-grow flex items-center justify-center w-full">
                    <div className="w-full max-w-md">
                        <div className={`flex flex-col items-center justify-center rounded-xl p-10 shadow-xl border ${isDark ? 'bg-[#3a3a3a] border-white/5' : 'bg-gray-100 border-gray-200'
                            }`}>
                            {/* Time Display */}
                            <div className={`w-full h-48 rounded-lg mb-8 relative overflow-hidden flex items-center justify-center ${isDark ? 'bg-[#2c2c2c]' : 'bg-white'
                                }`}>
                                <p className={`text-[80px] font-black tracking-tighter z-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatTime(timeLeft)}
                                </p>
                            </div>

                            {/* Session Info */}
                            <div className="w-full flex flex-col items-center gap-6">
                                <div className="text-center">
                                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {activeMode === 'work' ? 'Focus Session' : activeMode === 'short' ? 'Short Break' : 'Long Break'}
                                    </h2>
                                    <input
                                        type="text"
                                        value={taskName}
                                        onChange={(e) => setTaskName(e.target.value)}
                                        placeholder="What are you working on?"
                                        className={`mt-2 text-center bg-transparent border-none outline-none text-sm ${isDark ? 'text-gray-400 placeholder-gray-500' : 'text-gray-500 placeholder-gray-400'
                                            }`}
                                    />
                                </div>

                                {/* Control Button */}
                                <button
                                    onClick={() => setIsRunning(!isRunning)}
                                    className="w-full py-4 px-8 bg-[#f27f0d] hover:bg-[#f27f0d]/90 text-white rounded-xl text-lg font-bold tracking-widest transition-all shadow-lg shadow-[#f27f0d]/20 active:scale-95"
                                >
                                    {isRunning ? 'PAUSE' : 'START'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Snail Progress Tracker */}
                <div className="w-full max-w-3xl mb-8">
                    <div className={`flex flex-col gap-4 p-6 rounded-2xl border shadow-lg ${isDark ? 'bg-[#3a3a3a] border-white/5' : 'bg-gray-100 border-gray-200'
                        }`}>
                        <div className="flex items-center justify-between">
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {isRunning ? "Focus time! Stay productive 🚀" : "Time to be productive. Let's start!"}
                            </p>
                            <span className="text-[#f27f0d] font-bold">{Math.round(progress)}%</span>
                        </div>

                        {/* Progress Bar with Snail */}
                        <div className={`relative h-4 w-full rounded-full overflow-visible ${isDark ? 'bg-[#2c2c2c]' : 'bg-white'}`}>
                            {/* Progress Fill */}
                            <div
                                className="absolute left-0 top-0 h-full bg-[#f27f0d]/30 rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>

                            {/* Snail Character */}
                            <div
                                className="absolute -top-5 transition-all duration-500 flex flex-col items-center"
                                style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                            >
                                <span className="text-3xl select-none">🐌</span>
                            </div>

                            {/* Track Lines */}
                            <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none opacity-20">
                                <div className={`w-px h-2 ${isDark ? 'bg-gray-400' : 'bg-gray-600'}`}></div>
                                <div className={`w-px h-2 ${isDark ? 'bg-gray-400' : 'bg-gray-600'}`}></div>
                                <div className={`w-px h-2 ${isDark ? 'bg-gray-400' : 'bg-gray-600'}`}></div>
                                <div className={`w-px h-2 ${isDark ? 'bg-gray-400' : 'bg-gray-600'}`}></div>
                                <div className={`w-px h-2 ${isDark ? 'bg-gray-400' : 'bg-gray-600'}`}></div>
                            </div>
                        </div>

                        {/* Labels */}
                        <div className={`flex justify-between items-center text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            <span>Start</span>
                            <span className="text-[#f27f0d]/60 italic lowercase font-medium">"Slow and steady wins the race"</span>
                            <span>Finish</span>
                        </div>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className={`fixed top-0 right-0 p-8 pointer-events-none ${isDark ? 'opacity-5' : 'opacity-5'}`}>
                    <span className="text-[200px]">⏱️</span>
                </div>
            </main>
        </div>
    );
}
