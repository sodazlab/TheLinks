
import React, { useState, useCallback } from 'react';
import { usePiAuth } from '../hooks/usePiAuth';
import { Category, Post, BrandConfig } from '../types';
import { Link as LinkIcon, CheckCircle2, Zap, Edit3, Youtube, Instagram, Globe, Hash, MessageSquare, Box, PenTool } from 'lucide-react';

interface SubmissionFormProps {
  onAddPost: (post: Omit<Post, 'id' | 'status' | 'created_at' | 'user_id' | 'pi_username'>) => void;
}

const BRAND_CONFIGS: Record<Category, BrandConfig> = {
  'Youtube': { 
    color: '#FF0000', 
    gradient: 'from-[#FF0000] to-[#282828]', 
    localAsset: '/assets/brands/youtube.jpg' 
  },
  'X': { 
    color: '#000000', 
    gradient: 'from-[#000000] to-[#242424]', 
    localAsset: '/assets/brands/x.jpg' 
  },
  'Threads': { 
    color: '#000000', 
    gradient: 'from-[#000000] via-[#1A1A1A] to-[#000000]', 
    localAsset: '/assets/brands/threads.jpg' 
  },
  'Reddit': { 
    color: '#FF4500', 
    gradient: 'from-[#FF4500] to-[#FF8717]', 
    localAsset: '/assets/brands/reddit.jpg' 
  },
  'Instagram': { 
    color: '#E1306C', 
    gradient: 'from-[#833AB4] via-[#FD1D1D] to-[#FCB045]', 
    localAsset: '/assets/brands/instagram.jpg' 
  },
  'Notion': { 
    color: '#000000', 
    gradient: 'from-[#FFFFFF] to-[#E2E2E2]', 
    localAsset: '/assets/brands/notion.jpg' 
  },
  'Web': { 
    color: '#3B82F6', 
    gradient: 'from-[#3B82F6] to-[#1D4ED8]', 
    localAsset: '/assets/brands/web.jpg' 
  },
  'Other': { 
    color: '#F4B63C', 
    gradient: 'from-[#F4B63C] to-[#E29E20]', 
    localAsset: '/assets/brands/other.jpg' 
  }
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

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onAddPost }) => {
  const { user } = usePiAuth();
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<Category>('Web');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const detectCategory = useCallback((inputUrl: string): Category => {
    const lowUrl = inputUrl.toLowerCase().trim();
    if (!lowUrl) return 'Web';
    if (lowUrl.includes('threads')) return 'Threads';
    if (lowUrl.includes('youtube') || lowUrl.includes('youtu.be')) return 'Youtube';
    if (lowUrl.includes('twitter') || lowUrl.includes('x.com')) return 'X';
    if (lowUrl.includes('instagram')) return 'Instagram';
    if (lowUrl.includes('notion')) return 'Notion';
    if (lowUrl.includes('reddit')) return 'Reddit';
    return 'Web';
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    const detected = detectCategory(val);
    setCategory(detected);
    setImageError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title || !description) return;
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http')) finalUrl = `https://${finalUrl}`;

    onAddPost({
      original_url: finalUrl,
      category,
      title,
      description,
      thumbnail_image: BRAND_CONFIGS[category].localAsset,
      comment
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center glass rounded-[3rem] p-12 border-green-500/20 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-4xl font-black mb-4">Submission Sent</h2>
        <p className="text-gray-400 mb-8 text-lg">Your contribution has been queued for review.</p>
        <button 
          onClick={() => { setSubmitted(false); setUrl(''); setTitle(''); setDescription(''); setComment(''); }}
          className="pi-gradient text-[#0F0F1A] px-10 py-4 rounded-2xl font-black transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-[#F4B63C]/20"
        >
          Post Another Link
        </button>
      </div>
    );
  }

  const brand = BRAND_CONFIGS[category];

  return (
    <div className="max-w-6xl mx-auto pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Form Section */}
      <div className="glass rounded-[3rem] p-10 border-white/10 shadow-2xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-4 glass rounded-2xl bg-[#F4B63C]/10 border-[#F4B63C]/20">
            <LinkIcon className="w-7 h-7 text-[#F4B63C]" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Post Content</h2>
            <p className="text-gray-400 font-medium">Add a new resource to the ecosystem.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] ml-1">Original URL</label>
            <input 
              type="text"
              required
              value={url}
              onChange={handleUrlChange}
              placeholder="Ex: youtube.com/watch?v=..."
              className="w-full glass bg-white/5 rounded-2xl px-6 py-5 outline-none border-white/10 focus:border-[#F4B63C]/50 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] ml-1">Category</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => { setCategory(e.target.value as Category); setImageError(false); }}
                  className="w-full glass bg-[#0F0F1A] rounded-2xl px-6 py-5 outline-none border-white/10 focus:border-[#F4B63C]/50 transition-all cursor-pointer appearance-none font-bold"
                >
                  {Object.keys(BRAND_CONFIGS).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                   <CategoryIcon category={category} className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] ml-1">Reviewer Tip</label>
              <input 
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ex: Top 10 info!"
                className="w-full glass bg-white/5 rounded-2xl px-6 py-5 outline-none border-white/10 focus:border-[#F4B63C]/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] ml-1">Title</label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title"
              className="w-full glass bg-white/5 rounded-2xl px-6 py-5 outline-none border-white/10 focus:border-[#F4B63C]/50 transition-all font-black text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] ml-1">Summary</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why should pioneers click this link?"
              rows={4}
              className="w-full glass bg-white/5 rounded-2xl px-6 py-5 outline-none border-white/10 focus:border-[#F4B63C]/50 transition-all resize-none leading-relaxed"
            />
          </div>

          <button 
            type="submit"
            disabled={!url || !title || !description}
            className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all ${
              url && title && description
                ? 'pi-gradient text-[#0F0F1A] shadow-2xl shadow-[#F4B63C]/30 hover:scale-[1.02] active:scale-95' 
                : 'glass text-gray-600 cursor-not-allowed'
            }`}
          >
            Submit for Approval
          </button>
        </form>
      </div>

      {/* Preview Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">
          <Edit3 className="w-4 h-4" /> Live Identity Preview
        </div>
        
        <div className="glass rounded-[3.5rem] overflow-hidden relative group aspect-square border-white/10 shadow-2xl transition-all duration-1000 hover:border-white/20">
          <div className="absolute inset-0">
            {!imageError ? (
              <img 
                src={brand.localAsset} 
                alt={category} 
                className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${brand.gradient} flex items-center justify-center`}>
                <CategoryIcon category={category} className="w-40 h-40 text-white/10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-[#0F0F1A]/70 to-[#0F0F1A]/30"></div>
          </div>

          <div className="absolute inset-0 p-12 flex flex-col justify-between z-20">
            <div className="flex justify-between items-start">
              <span className="glass px-6 py-2.5 rounded-full text-[12px] font-black uppercase tracking-[0.25em] border-white/20 text-[#F4B63C] flex items-center gap-2">
                <CategoryIcon category={category} className="w-4 h-4" />
                {category}
              </span>
              <div className="glass p-3 rounded-2xl opacity-50">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-[#F4B63C] shadow-[0_0_15px_rgba(244,182,60,0.8)]"></div>
                   <span className="text-[12px] font-black text-[#F4B63C] uppercase tracking-[0.3em]">
                     {url ? (url.includes('.') ? url.split('/')[0].replace('https://', '').replace('www.', '') : url) : 'pi-ecosystem.info'}
                   </span>
                </div>
                <h3 className="text-5xl font-black leading-[1.1] line-clamp-2 tracking-tight">
                  {title || 'Your Link Title'}
                </h3>
                {comment && (
                  <div className="text-lg italic text-[#F4B63C]/80 border-l-4 border-[#F4B63C]/50 pl-6 py-2">
                    "{comment}"
                  </div>
                )}
                <p className="text-lg text-gray-400/90 line-clamp-3 leading-relaxed max-w-md font-medium">
                  {description || 'Fill in the description to preview how your content will be presented to thousands of Pioneers in the main feed.'}
                </p>
              </div>

              <div className="pt-10 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl pi-gradient text-[#0F0F1A] flex items-center justify-center text-lg font-black shadow-lg">
                    {user?.pi_username?.[0] || 'P'}
                  </div>
                  <div>
                    <span className="block text-base font-black">@{user?.pi_username || 'pioneer'}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Global Contributor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionForm;
