
import React from 'react';
import { usePiAuth } from '../hooks/usePiAuth';
import { Post } from '../types';
import { ShieldCheck, Check, X, ExternalLink, User as UserIcon, MessageSquare } from 'lucide-react';

interface AdminDashboardProps {
  pendingPosts: Post[];
  onUpdateStatus: (id: string, status: 'active' | 'rejected') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ pendingPosts, onUpdateStatus }) => {
  const { isAdmin } = usePiAuth();

  if (!isAdmin) {
    return (
      <div className="text-center py-20 glass rounded-3xl p-12 max-w-lg mx-auto border-red-500/10">
        <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-gray-400">This area is reserved for ecosystem moderators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Moderation Queue</h1>
          <p className="text-gray-400">Review and verify community submissions</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl border-white/10 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${pendingPosts.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-sm font-medium">{pendingPosts.length} Pending Submission{pendingPosts.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {pendingPosts.length === 0 ? (
        <div className="text-center py-24 glass rounded-[3rem] border-white/5 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-green-500 opacity-50" />
          </div>
          <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
          <p className="text-gray-500">There are no links waiting for review right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingPosts.map(post => (
            <div key={post.id} className="glass rounded-[2rem] overflow-hidden flex flex-col md:flex-row border-white/10 hover:border-white/20 transition-all group">
              <div className="w-full md:w-72 h-48 md:h-auto shrink-0 relative">
                <img src={post.thumbnail_image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                  {post.category}
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                        {post.pi_username[0]}
                      </div>
                      <span>@{post.pi_username}</span>
                    </div>
                    <span className="text-gray-700 text-xs">•</span>
                    <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                    {post.title}
                    <a href={post.original_url} target="_blank" rel="noreferrer" className="p-1.5 glass rounded-lg hover:text-[#F4B63C] transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </h3>
                  
                  <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-2">
                    {post.description}
                  </p>

                  {post.comment && (
                    <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl mb-6 border border-white/5">
                      <MessageSquare className="w-4 h-4 text-[#F4B63C] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">User Comment</span>
                        <p className="text-sm italic text-gray-300">"{post.comment}"</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => onUpdateStatus(post.id, 'active')}
                    className="flex-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-[#0F0F1A] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-green-500/20 active:scale-95"
                  >
                    <Check className="w-5 h-5" />
                    Approve Link
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(post.id, 'rejected')}
                    className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-[#0F0F1A] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-red-500/20 active:scale-95"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
