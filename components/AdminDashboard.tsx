
import React, { useState } from 'react';
import { usePiAuth } from '../hooks/usePiAuth';
import { Post } from '../types';
import { ShieldCheck, Check, X, ExternalLink, MessageSquare, Trash2, RotateCcw, Clock, AlertCircle } from 'lucide-react';

interface AdminDashboardProps {
  pendingPosts: Post[];
  rejectedPosts: Post[];
  onUpdateStatus: (id: string, status: 'active' | 'rejected' | 'pending') => void;
  onDeletePost: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  pendingPosts, 
  rejectedPosts, 
  onUpdateStatus, 
  onDeletePost 
}) => {
  const { isAdmin } = usePiAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'rejected'>('pending');

  if (!isAdmin) {
    return (
      <div className="text-center py-20 glass rounded-3xl p-12 max-w-lg mx-auto border-red-500/10">
        <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-gray-400">This area is reserved for ecosystem moderators.</p>
      </div>
    );
  }

  const currentPosts = activeTab === 'pending' ? pendingPosts : rejectedPosts;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Moderation Hub</h1>
          <p className="text-gray-400">Manage community contributions and maintain quality</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm ${
              activeTab === 'pending' 
                ? 'bg-[#F4B63C] text-[#0F0F1A] shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending ({pendingPosts.length})
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm ${
              activeTab === 'rejected' 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Rejected ({rejectedPosts.length})
          </button>
        </div>
      </div>

      {currentPosts.length === 0 ? (
        <div className="text-center py-24 glass rounded-[3rem] border-white/5 flex flex-col items-center animate-in fade-in zoom-in">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
            {activeTab === 'pending' ? (
              <Check className="w-8 h-8 text-green-500 opacity-50" />
            ) : (
              <Trash2 className="w-8 h-8 text-red-500 opacity-50" />
            )}
          </div>
          <h3 className="text-xl font-bold mb-2">
            {activeTab === 'pending' ? 'All Clear!' : 'No Rejections'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'pending' 
              ? 'Everything is reviewed. Great job!' 
              : 'The rejected list is currently empty.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {currentPosts.map(post => (
            <div key={post.id} className="glass rounded-[2rem] p-8 border-white/10 hover:border-white/20 transition-all group animate-in slide-in-from-bottom-4">
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold border border-white/10">
                          {post.pi_username[0]}
                        </div>
                        <span className="font-bold">@{post.pi_username}</span>
                      </div>
                      <span className="text-gray-800 text-xs">•</span>
                      <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</span>
                    </div>
                    
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      activeTab === 'pending' 
                        ? 'glass-gold text-[#F4B63C] border-[#F4B63C]/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {post.category}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-2xl font-black tracking-tight flex-1">
                      {post.title}
                    </h3>
                    <a 
                      href={post.original_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-2.5 glass rounded-xl hover:text-[#F4B63C] transition-colors border-white/10 flex items-center gap-2 shrink-0 group/link"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover/link:opacity-100 transition-opacity">Visit Link</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  
                  <p className="text-base text-gray-400 leading-relaxed mb-6">
                    {post.description}
                  </p>

                  {post.comment && (
                    <div className="flex items-start gap-4 bg-white/[0.02] p-5 rounded-2xl mb-2 border border-white/5">
                      <MessageSquare className="w-5 h-5 text-[#F4B63C] shrink-0 mt-1" />
                      <div>
                        <span className="text-[11px] uppercase font-black text-gray-500 block mb-1 tracking-widest">User Perspective</span>
                        <p className="text-sm italic text-gray-300 leading-relaxed">"{post.comment}"</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  {activeTab === 'pending' ? (
                    <>
                      <button 
                        onClick={() => onUpdateStatus(post.id, 'active')}
                        className="flex-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-[#0F0F1A] py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all border border-green-500/20 active:scale-95 shadow-lg hover:shadow-green-500/20"
                      >
                        <Check className="w-5 h-5" />
                        Approve Link
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(post.id, 'rejected')}
                        className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-[#0F0F1A] py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all border border-red-500/20 active:scale-95 shadow-lg hover:shadow-red-500/20"
                      >
                        <X className="w-5 h-5" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => onUpdateStatus(post.id, 'pending')}
                        className="flex-[2] bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all border border-white/10 active:scale-95"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Restore to Pending
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Permanently delete this submission?')) {
                            onDeletePost(post.id);
                          }
                        }}
                        className="flex-1 bg-red-900/10 hover:bg-red-600 text-red-500 hover:text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all border border-red-500/20 active:scale-95"
                      >
                        <Trash2 className="w-5 h-5" />
                        Delete Permanently
                      </button>
                    </>
                  )}
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
