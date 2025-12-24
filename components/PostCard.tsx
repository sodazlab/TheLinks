
import React, { useState } from 'react';
import { Post } from '../types';
import { ExternalLink, Share2, Youtube, Play, X, ArrowRightCircle, Info } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showTheater, setShowTheater] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: post.original_url,
      });
    }
  };

  const domain = new URL(post.original_url).hostname.replace('www.', '');
  const isYoutube = post.category === 'Youtube' || post.original_url.includes('youtube.com') || post.original_url.includes('youtu.be');

  const handleWatchNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(post.original_url, '_blank');
  };

  return (
    <div 
      className={`glass group relative w-full h-full rounded-3xl overflow-hidden flex flex-col border-white/5 transition-all duration-500 ${
        showTheater ? 'ring-2 ring-[#F4B63C]/40 scale-[0.98]' : 'hover:border-white/20'
      }`}
    >
      {/* Media Layer (Static High-Res Thumbnail) */}
      <div className="absolute inset-0 z-0 bg-[#0A0A12]">
        <img 
          src={post.thumbnail_image} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-[#0F0F1A]/40 to-transparent"></div>
      </div>

      {/* Theater Overlay (Optimized for Fixed Height Cards) */}
      {showTheater && (
        <div className="absolute inset-0 z-30 glass bg-black/90 backdrop-blur-2xl flex flex-col animate-in fade-in zoom-in duration-300">
          <button 
            onClick={() => setShowTheater(false)}
            className="absolute top-3 right-3 z-40 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto no-scrollbar">
            <div className="w-12 h-12 mb-3 rounded-xl bg-red-600 flex items-center justify-center shadow-xl shadow-red-600/30 shrink-0">
               <Youtube className="w-6 h-6 text-white" />
            </div>
            
            <h2 className="text-base font-bold text-center mb-1 leading-tight px-2">
              Watch on YouTube
            </h2>
            <p className="text-[11px] text-gray-400 text-center mb-5 max-w-[200px] leading-snug">
              Ensuring the best experience in Pi Browser.
            </p>
            
            <button 
              onClick={handleWatchNow}
              className="pi-gradient text-[#0F0F1A] px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0 text-sm"
            >
              <span>Launch App</span>
              <ArrowRightCircle className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setShowTheater(false)}
              className="mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider hover:text-white transition-colors py-1"
            >
              Back to Feed
            </button>
          </div>
        </div>
      )}

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full p-5 justify-between">
        <div className="flex justify-between items-start">
          <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md border ${
            isYoutube ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/10 border-white/10 text-white'
          }`}>
            {post.category}
          </span>
          <div className="flex gap-1.5">
            <button 
              onClick={handleShare}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <a 
              href={post.original_url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Play Icon Trigger */}
        {isYoutube && !showTheater && (
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer"
            onClick={() => setShowTheater(true)}
          >
            <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl shadow-red-600/50 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <Play className="w-6 h-6 fill-white text-white ml-1" />
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            {isYoutube ? <Youtube className="w-3.5 h-3.5 text-red-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#F4B63C]"></div>}
            <span className="text-[11px] text-[#F4B63C] font-semibold opacity-90">{domain}</span>
          </div>
          <h3 className="text-base font-bold line-clamp-2 mb-1.5 group-hover:text-white transition-colors leading-tight">
            {post.title}
          </h3>
          
          {post.comment && (
             <div className="text-[10px] text-[#F4B63C]/80 italic mb-1.5 line-clamp-1 border-l-2 border-[#F4B63C]/30 pl-2">
               "{post.comment}"
             </div>
          )}

          <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed opacity-70">
            {post.description}
          </p>
          
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-[9px] font-black border border-white/10">
                {post.pi_username[0]}
              </div>
              <span className="text-[10px] text-gray-400 font-medium">@{post.pi_username}</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
              <Info className="w-3 h-3" />
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
