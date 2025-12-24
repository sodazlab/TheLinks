
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PiAuthProvider, usePiAuth } from './hooks/usePiAuth';
import { Post, Category } from './types';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import SubmissionForm from './components/SubmissionForm';
import AdminDashboard from './components/AdminDashboard';
import { Layout } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading, login, isAdmin } = usePiAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  // 초기 데이터 로드 (시뮬레이션)
  useEffect(() => {
    const initialPosts: Post[] = [
      {
        id: '1',
        user_id: 'u1',
        pi_username: 'MinerKing',
        original_url: 'https://youtube.com/watch?v=123',
        category: 'Youtube',
        title: 'Future of Pi Network Web3',
        description: 'An insightful analysis of how Pi is changing the decentralized landscape.',
        thumbnail_image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ];
    setPosts(initialPosts);
  }, []);

  const handleAddPost = (newPost: Omit<Post, 'id' | 'status' | 'created_at' | 'user_id' | 'pi_username'>) => {
    if (!user) return;
    const post: Post = {
      ...newPost,
      id: Math.random().toString(36).substr(2, 9),
      user_id: user.id,
      pi_username: user.pi_username,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    setPosts(prev => [post, ...prev]);
  };

  const handleUpdateStatus = (id: string, status: 'active' | 'rejected') => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F4B63C]"></div>
    </div>
  );

  const activePosts = posts.filter(p => (activeCategory === 'All' || p.category === activeCategory) && p.status === 'active');
  const pendingPosts = posts.filter(p => p.status === 'pending');

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 max-w-6xl">
        <Routes>
          <Route path="/" element={
            <>
              <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                  Discover the <span className="text-pi-gradient">Links</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  The curated feed of essential links for the Pi Network community.
                  Hand-picked and verified by pioneers.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {['All', 'Web', 'Threads', 'Reddit', 'Youtube', 'X', 'Instagram', 'Notion', 'Other'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat as Category | 'All')}
                    className={`px-5 py-2 rounded-full transition-all duration-300 border text-xs font-bold uppercase tracking-wider ${
                      activeCategory === cat 
                        ? 'pi-gradient text-[#0F0F1A] border-transparent shadow-lg shadow-[#F4B63C]/20' 
                        : 'glass text-gray-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <Feed posts={activePosts} />
            </>
          } />
          
          <Route path="/submit" element={
            user ? <SubmissionForm onAddPost={handleAddPost} /> : (
              <div className="text-center py-20">
                <h2 className="text-2xl mb-4">Please log in to share links</h2>
                <button onClick={login} className="pi-gradient px-8 py-3 rounded-xl font-bold text-[#0F0F1A]">Login with Pi</button>
              </div>
            )
          } />

          <Route path="/admin" element={
            <AdminDashboard 
              pendingPosts={pendingPosts} 
              onUpdateStatus={handleUpdateStatus} 
            />
          } />
        </Routes>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="glass px-6 py-3 rounded-full flex items-center gap-8 shadow-2xl border-white/20">
          <Link to="/" className="hover:text-[#F4B63C] transition-colors flex flex-col items-center">
            <Layout className="w-5 h-5 mb-1" />
            <span className="text-[10px] uppercase tracking-widest">Feed</span>
          </Link>
          <Link to="/submit" className="bg-[#F4B63C] text-[#0F0F1A] p-3 rounded-full hover:scale-110 transition-transform shadow-lg shadow-[#F4B63C]/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
          {isAdmin ? (
             <Link to="/admin" className="hover:text-[#F4B63C] transition-colors flex flex-col items-center">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {pendingPosts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center font-bold">
                      {pendingPosts.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-widest">Admin</span>
             </Link>
          ) : (
             <div className="w-10"></div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <PiAuthProvider>
      <Router>
        <MainApp />
      </Router>
    </PiAuthProvider>
  );
};

export default App;
