import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/utils/authService';
import { useTheme } from '@/contexts/ThemeContext';

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

export default function StudyWithMe() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<any>(null);

    // Timer state
    const [activeMode, setActiveMode] = useState<'work' | 'short' | 'long'>('work');
    const [customMinutes, setCustomMinutes] = useState(25);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [taskName, setTaskName] = useState('Focus Session');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Task state
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [showAddTask, setShowAddTask] = useState(false);

    // Preset durations
    const presets = [25, 30, 45, 60, 90];

    const modeDurations = {
        work: customMinutes * 60,
        short: 5 * 60,
        long: 15 * 60
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await authService.getCurrentUser();
                if (data?.user) {
                    setUser(data.user);
                } else {
                    navigate('/login');
                }
            } catch (e) {
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate]);

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            alert(activeMode === 'work' ? 'Focus session complete! Take a break.' : 'Break over! Ready to focus?');
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeLeft, activeMode]);

    const handleModeChange = (mode: 'work' | 'short' | 'long') => {
        setActiveMode(mode);
        if (mode === 'work') {
            setTimeLeft(customMinutes * 60);
        } else if (mode === 'short') {
            setTimeLeft(5 * 60);
        } else {
            setTimeLeft(15 * 60);
        }
        setIsRunning(false);
    };

    const handlePresetSelect = (mins: number) => {
        setCustomMinutes(mins);
        if (activeMode === 'work') {
            setTimeLeft(mins * 60);
            setIsRunning(false);
        }
    };

    const handleCustomTimeChange = (mins: number) => {
        if (mins >= 1 && mins <= 180) {
            setCustomMinutes(mins);
            if (activeMode === 'work') {
                setTimeLeft(mins * 60);
                setIsRunning(false);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalDuration = activeMode === 'work' ? customMinutes * 60 : modeDurations[activeMode];
    const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

    // Task functions
    const addTask = () => {
        if (newTaskText.trim()) {
            setTasks([...tasks, { id: Date.now().toString(), text: newTaskText.trim(), completed: false }]);
            setNewTaskText('');
        }
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen flex ${isDark ? 'bg-[#2c2c2c] text-white' : 'bg-white text-gray-900'}`}>
            {/* Sidebar */}
            <aside className={`w-64 border-r flex flex-col h-screen sticky top-0 ${isDark ? 'border-white/10 bg-[#2c2c2c]' : 'border-gray-200 bg-white'}`}>
                <div className="p-6 flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-full bg-[#f27f0d] flex items-center justify-center text-white text-xl">
                            ⏱️
                        </div>
                        <div className="flex flex-col">
                            <h1 className={`text-lg font-bold leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>Focus Session</h1>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stay Productive</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2 flex-grow">
                        {/* Preset Timers */}
                        <div className={`mb-4 pb-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Presets
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {presets.map(mins => (
                                    <button
                                        key={mins}
                                        onClick={() => handlePresetSelect(mins)}
                                        className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${customMinutes === mins
                                                ? 'bg-[#f27f0d] text-white'
                                                : isDark ? 'bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {mins}m
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-[#3a3a3a]' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span>{isDark ? '☀️' : '🌙'}</span>
                            <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>

                        {/* Add Task Toggle */}
                        <button
                            onClick={() => setShowAddTask(!showAddTask)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${showAddTask
                                    ? (isDark ? 'bg-[#f27f0d]/20 text-[#f27f0d]' : 'bg-orange-100 text-[#f27f0d]')
                                    : (isDark ? 'text-gray-300 hover:bg-[#3a3a3a]' : 'text-gray-600 hover:bg-gray-100')
                                }`}
                        >
                            <span>➕</span>
                            <span className="text-sm font-medium">Add Task</span>
                        </button>

                        {/* Back to Home */}
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
                            <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold">
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'User'}</p>
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
                            {/* Custom Time Input (only for Work mode) */}
                            {activeMode === 'work' && (
                                <div className="mb-4 flex items-center gap-2">
                                    <button
                                        onClick={() => handleCustomTimeChange(customMinutes - 5)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isDark ? 'bg-[#2c2c2c] text-white hover:bg-[#4a4a4a]' : 'bg-white text-gray-900 hover:bg-gray-200'}`}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={customMinutes}
                                        onChange={(e) => handleCustomTimeChange(parseInt(e.target.value) || 25)}
                                        className={`w-20 text-center py-1 rounded-lg font-bold ${isDark ? 'bg-[#2c2c2c] text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'} border`}
                                        min="1"
                                        max="180"
                                    />
                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>min</span>
                                    <button
                                        onClick={() => handleCustomTimeChange(customMinutes + 5)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isDark ? 'bg-[#2c2c2c] text-white hover:bg-[#4a4a4a]' : 'bg-white text-gray-900 hover:bg-gray-200'}`}
                                    >
                                        +
                                    </button>
                                </div>
                            )}

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
                                        className={`mt-2 text-center bg-transparent border-none outline-none text-sm w-full ${isDark ? 'text-gray-400 placeholder-gray-500' : 'text-gray-500 placeholder-gray-400'
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
                            <div
                                className="absolute left-0 top-0 h-full bg-[#f27f0d]/30 rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                            <div
                                className="absolute -top-5 transition-all duration-500 flex flex-col items-center"
                                style={{ left: `${Math.min(progress, 95)}%`, transform: 'translateX(-50%)' }}
                            >
                                <span className="text-3xl select-none">🐌</span>
                            </div>
                        </div>

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

            {/* Add Task Panel */}
            {showAddTask && (
                <aside className={`w-80 border-l flex flex-col h-screen sticky top-0 ${isDark ? 'border-white/10 bg-[#2c2c2c]' : 'border-gray-200 bg-white'}`}>
                    <div className="p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tasks</h2>
                            <button
                                onClick={() => setShowAddTask(false)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'hover:bg-[#3a3a3a]' : 'hover:bg-gray-100'}`}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Add Task Input */}
                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                                placeholder="Add a task..."
                                className={`flex-1 px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-[#3a3a3a] text-white border-white/10 placeholder-gray-500' : 'bg-gray-100 text-gray-900 border-gray-200 placeholder-gray-400'
                                    } border`}
                            />
                            <button
                                onClick={addTask}
                                className="px-4 py-2 bg-[#f27f0d] text-white rounded-lg font-bold text-sm hover:bg-[#f27f0d]/90"
                            >
                                Add
                            </button>
                        </div>

                        {/* Task List */}
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {tasks.length === 0 ? (
                                <p className={`text-sm text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    No tasks yet. Add one above!
                                </p>
                            ) : (
                                tasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-[#3a3a3a]' : 'bg-gray-100'}`}
                                    >
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${task.completed
                                                    ? 'bg-[#f27f0d] border-[#f27f0d] text-white'
                                                    : isDark ? 'border-gray-500' : 'border-gray-300'
                                                }`}
                                        >
                                            {task.completed && '✓'}
                                        </button>
                                        <span className={`flex-1 text-sm ${task.completed ? 'line-through opacity-50' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {task.text}
                                        </span>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className={`text-xs ${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
}
