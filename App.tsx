
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PiAuthProvider, usePiAuth } from './hooks/usePiAuth';
import { Post, Category } from './types';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import SubmissionForm from './components/SubmissionForm';
import AdminDashboard from './components/AdminDashboard';
import { Layout, DatabaseZap } from 'lucide-react';
import { supabase, isConfigured } from './lib/supabase';

const MainApp: React.FC = () => {
  const { user, loading, login, isAdmin } = usePiAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [fetching, setFetching] = useState(true);

  const fetchPosts = async () => {
    if (!isConfigured) {
      setFetching(false);
      return;
    }
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setPosts(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    if (isConfigured) {
      const channel = supabase
        .channel('db-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
          fetchPosts();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, []);

  const handleAddPost = async (newPost: Omit<Post, 'id' | 'status' | 'created_at' | 'user_id' | 'pi_username'>) => {
    if (!user) return;
    if (!isConfigured) {
      const mock: Post = { ...newPost, id: Math.random().toString(), user_id: user.id, pi_username: user.pi_username, status: 'pending', created_at: new Date().toISOString() };
      setPosts(prev => [mock, ...prev]);
      return;
    }
    const { error } = await supabase.from('posts').insert([{ ...newPost, user_id: user.pi_uid, pi_username: user.pi_username, status: 'pending' }]);
    if (error) alert('Error: ' + error.message);
  };

  const handleUpdateStatus = async (id: string, status: 'active' | 'rejected' | 'pending') => {
    if (!isConfigured) {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      return;
    }
    const { error } = await supabase.from('posts').update({ status }).eq('id', id);
    if (error) alert('Error: ' + error.message);
  };

  const handleDeletePost = async (id: string) => {
    if (!isConfigured) {
      setPosts(prev => prev.filter(p => p.id !== id));
      return;
    }
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
  };

  if (loading || (fetching && posts.length === 0)) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0F0F1A]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F4B63C]"></div>
    </div>
  );

  const activePosts = posts.filter(p => (activeCategory === 'All' || p.category === activeCategory) && p.status === 'active');
  const pendingPosts = posts.filter(p => p.status === 'pending');
  const rejectedPosts = posts.filter(p => p.status === 'rejected');

  return (
    <div className="min-h-screen pb-32">
      <Navbar />
      <main className="container mx-auto px-6 pt-28 max-w-6xl">
        {!isConfigured && (
          <div className="mb-10 p-5 glass rounded-[2rem] border-yellow-500/20 flex items-center gap-4 animate-pulse">
            <DatabaseZap className="text-yellow-500 w-6 h-6" />
            <p className="text-yellow-500 text-sm font-bold uppercase tracking-wider">Mock Mode: Database is not connected.</p>
          </div>
        )}

        <Routes>
          <Route path="/" element={
            <div className="animate-in fade-in duration-700">
              <div className="mb-16 text-center space-y-6">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">THE <span className="text-pi-gradient">LINKS</span></h1>
                <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto font-medium">Verified <span className="text-white">Pi Network</span> ecosystem directory.</p>
              </div>
              <div className="flex flex-wrap gap-3 mb-16 justify-center overflow-x-auto no-scrollbar pb-4">
                {['All', 'Web', 'Threads', 'Reddit', 'Youtube', 'X', 'Instagram', 'Notion', 'Other'].map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat as Category | 'All')}
                    className={`px-8 py-3.5 rounded-2xl transition-all border text-[12px] font-black uppercase tracking-widest whitespace-nowrap ${
                      activeCategory === cat ? 'pi-gradient text-[#0F0F1A] border-transparent shadow-xl scale-105' : 'glass text-gray-500 border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                  > {cat} </button>
                ))}
              </div>
              <Feed posts={activePosts} />
            </div>
          } />
          <Route path="/submit" element={user ? <SubmissionForm onAddPost={handleAddPost} /> : <div className="text-center py-20 glass rounded-[3rem] border-white/5 max-w-2xl mx-auto">
            <h2 className="text-4xl font-black mb-6">Join the Community</h2>
            <button onClick={login} className="pi-gradient px-12 py-5 rounded-[2rem] font-black text-xl text-[#0F0F1A]">Connect Pi</button>
          </div>} />
          <Route path="/admin" element={<AdminDashboard pendingPosts={pendingPosts} rejectedPosts={rejectedPosts} onUpdateStatus={handleUpdateStatus} onDeletePost={handleDeletePost} />} />
        </Routes>
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <div className="glass px-10 py-5 rounded-[2.5rem] flex items-center gap-12 shadow-2xl border-white/10 backdrop-blur-3xl">
          <Link to="/" className="hover:text-[#F4B63C] transition-all flex flex-col items-center group">
            <Layout className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">Feed</span>
          </Link>
          <Link to="/submit" className="bg-[#F4B63C] text-[#0F0F1A] p-5 rounded-[2rem] hover:scale-110 active:scale-90 transition-all shadow-xl -translate-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M12 4v16m8-8H4" /></svg>
          </Link>
          {isAdmin ? (
             <Link to="/admin" className="hover:text-[#F4B63C] transition-all flex flex-col items-center group">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                  {pendingPosts.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse">{pendingPosts.length}</span>}
                </div>
                <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">Admin</span>
             </Link>
          ) : <div className="w-10"></div>}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <PiAuthProvider>
    <Router><MainApp /></Router>
  </PiAuthProvider>
);

export default App;
