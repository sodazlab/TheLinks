
import React, { useState } from 'react';
import { Post, Category } from '../types';
import { ExternalLink, Share2, Youtube, Play, X, ArrowRightCircle, Globe, Hash, MessageSquare, Box, PenTool, Link as LinkIcon, Instagram } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

const BRAND_COLORS: Record<Category, string> = {
  'Youtube': 'from-[#FF0000] to-[#282828]',
  'X': 'from-[#000000] to-[#242424]',
  'Threads': 'from-[#000000] via-[#1A1A1A] to-[#000000]',
  'Reddit': 'from-[#FF4500] to-[#FF8717]',
  'Instagram': 'from-[#833AB4] via-[#FD1D1D] to-[#FCB045]',
  'Notion': 'from-[#FFFFFF] to-[#E2E2E2]',
  'Web': 'from-[#3B82F6] to-[#1D4ED8]',
  'Other': 'from-[#F4B63C] to-[#E29E20]'
};

const CategoryIcon = ({ category, className }: { category: Category, className?: string }) => {
  switch (category) {
    case 'Youtube': return <Youtube className={className} />;
    case 'Instagram': return <Instagram className={className} />;
    case 'Web': return <Globe className={className} />;
    case 'X': return <Hash className={className} />;
    case 'Threads': return <MessageSquare className={className} />;
    case 'Reddit': return <Box className={className} />;
    case 'Notion': return <PenTool className={className} />;
    default: return <LinkIcon className={className} />;
  }
};

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showTheater, setShowTheater] = useState(false);
  const [imageError, setImageError] = useState(false);

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
  const isYoutube = post.category === 'Youtube';
  // 브랜딩이 명확한 카테고리는 도메인 표시를 생략하여 중복 제거
  const showDomain = post.category === 'Web' || post.category === 'Other';

  return (
    <div className={`glass group relative w-full h-full rounded-[2.5rem] overflow-hidden flex flex-col border-white/5 transition-all duration-700 ${
      showTheater ? 'ring-2 ring-[#F4B63C]/40 scale-[0.98]' : 'hover:border-white/20 shadow-xl'
    }`}>
      {/* Background Layer with Object-Cover */}
      <div className="absolute inset-0 z-0 bg-[#0A0A12] overflow-hidden">
        {!imageError ? (
          <img 
            src={post.thumbnail_image} 
            alt={post.title} 
            className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-110 opacity-50 group-hover:opacity-70"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${BRAND_COLORS[post.category]} flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity`}>
             <CategoryIcon category={post.category} className="w-32 h-32 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-[#0F0F1A]/50 to-transparent"></div>
      </div>

      {showTheater && (
        <div className="absolute inset-0 z-30 glass bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in zoom-in duration-500">
          <button onClick={() => setShowTheater(false)} className="absolute top-4 right-4 z-40 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-red-600 flex items-center justify-center shadow-2xl shadow-red-600/40">
               <Youtube className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-black mb-2">Pioneer Cinema</h2>
            <p className="text-sm text-gray-400 mb-8 max-w-[240px]">Ensuring optimized playback within the Pi Browser ecosystem.</p>
            <button 
              onClick={(e) => { e.stopPropagation(); window.open(post.original_url, '_blank'); }}
              className="pi-gradient text-[#0F0F1A] px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <span>Watch Now</span>
              <ArrowRightCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full p-7 justify-between">
        <div className="flex justify-between items-start">
          <span className={`text-[10px] uppercase font-black tracking-[0.2em] px-3.5 py-1.5 rounded-full backdrop-blur-md border ${
            isYoutube ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-white'
          }`}>
            {post.category}
          </span>
          <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5">
              <Share2 className="w-4 h-4" />
            </button>
            <a href={post.original_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {isYoutube && !showTheater && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-700 cursor-pointer" onClick={() => setShowTheater(true)}>
            <div className="w-16 h-16 rounded-3xl bg-red-600/90 flex items-center justify-center shadow-2xl shadow-red-600/40 translate-y-4 group-hover:translate-y-0 transition-all">
              <Play className="w-8 h-8 fill-white text-white ml-1" />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {showDomain && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F4B63C]"></div>
              <span className="text-[11px] text-[#F4B63C] font-black uppercase tracking-widest opacity-80">{domain}</span>
            </div>
          )}
          <h3 className="text-xl font-black line-clamp-2 leading-[1.2] group-hover:text-[#F4B63C] transition-colors">
            {post.title}
          </h3>
          {post.comment && (
             <div className="text-[11px] text-[#F4B63C]/70 italic line-clamp-1 border-l-2 border-[#F4B63C]/30 pl-3 py-0.5">
               "{post.comment}"
             </div>
          )}
          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed opacity-80">
            {post.description}
          </p>
          <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl pi-gradient text-[#0F0F1A] flex items-center justify-center text-[10px] font-black border border-white/10">
                {post.pi_username[0]}
              </div>
              <span className="text-[11px] text-gray-400 font-bold">@{post.pi_username}</span>
            </div>
            <span className="text-[10px] text-gray-600 font-black uppercase tracking-tighter">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
