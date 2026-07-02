import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Flame, Brain, Target, Plus, LogOut, Sparkles } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const TOPICS = ['Arrays', 'Strings', 'Graphs', 'Trees', 'DP', 'Greedy', 'Heaps', 'Hashmaps', 'Stacks', 'Queues', 'Other'];
const PLATFORMS = ['LeetCode', 'Codeforces', 'AlgoZenith', 'GFG', 'Other'];

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [aiPlan, setAiPlan] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);
    const [formData, setFormData] = useState({
        title: '', platform: 'LeetCode', difficulty: 'Easy', topic: 'Arrays', timeTaken: 0, notes: ''
    });

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/problems', formData);
            setShowForm(false);
            setFormData({ title: '', platform: 'LeetCode', difficulty: 'Easy', topic: 'Arrays', timeTaken: 0, notes: '' });
            fetchStats();
        } catch (err) {
            console.error(err);
        }
    };

    const generateStudyPlan = async () => {
        setLoadingAi(true);
        try {
            const res = await axios.get('http://localhost:5001/api/ai/study-plan');
            setAiPlan(res.data.plan);
        } catch (err) {
            console.error(err);
            setAiPlan("Failed to generate study plan. Please try again or check API Key.");
        }
        setLoadingAi(false);
    };

    if (!stats) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;

    const topicData = Object.entries(stats.byTopic).map(([name, value]) => ({ name, value }));

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            {/* Navbar */}
            <nav className="bg-slate-800 border-b border-slate-700 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Brain className="text-blue-500 h-8 w-8" />
                        <span className="text-xl font-bold text-white">DevLog</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">Welcome, {user.username}</span>
                        <button onClick={logout} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Top Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
                        <div className="p-4 bg-blue-500/10 rounded-xl text-blue-500"><Target className="h-8 w-8" /></div>
                        <div>
                            <p className="text-slate-400 text-sm">Total Solved</p>
                            <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
                        </div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
                        <div className="p-4 bg-orange-500/10 rounded-xl text-orange-500"><Flame className="h-8 w-8" /></div>
                        <div>
                            <p className="text-slate-400 text-sm">Current Streak</p>
                            <h3 className="text-3xl font-bold text-white">{stats.streak} Days</h3>
                        </div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Quick Actions</p>
                            <div className="flex gap-2">
                                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                    <Plus className="h-4 w-4" /> Log Problem
                                </button>
                                <button onClick={generateStudyPlan} disabled={loadingAi} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                    <Sparkles className="h-4 w-4" /> {loadingAi ? 'Thinking...' : 'AI Plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Study Plan Result */}
                {aiPlan && (
                    <div className="bg-purple-900/20 p-6 rounded-2xl border border-purple-500/30 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                            <h3 className="text-lg font-semibold text-purple-100">Personalized AI Study Plan</h3>
                        </div>
                        <div className="prose prose-invert prose-purple max-w-none text-slate-300 whitespace-pre-wrap">
                            {aiPlan}
                        </div>
                    </div>
                )}

                {/* Add Problem Form */}
                {showForm && (
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Log New Problem</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Problem Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Topic</label>
                                <select value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Platform</label>
                                <select value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Difficulty</label>
                                <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Time Taken (mins)</label>
                                <input type="number" min="0" value={formData.timeTaken} onChange={e => setFormData({...formData, timeTaken: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Save</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Topic Distribution */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-6">Topic Distribution</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topicData}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{fill: '#334155'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc'}} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Weekly Activity */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-6">Activity (Last 14 Days)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.last14Days}>
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                    <Tooltip cursor={{fill: '#334155'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc'}} />
                                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
