
import React, { useState, useEffect, useCallback } from 'react';
import { usePiAuth } from '../hooks/usePiAuth';
import { fetchLinkMetadata } from '../services/geminiService';
import { Category, OGMetadata, Post } from '../types';
import { Link as LinkIcon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface SubmissionFormProps {
  onAddPost: (post: Omit<Post, 'id' | 'status' | 'created_at' | 'user_id' | 'pi_username'>) => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onAddPost }) => {
  const { user } = usePiAuth();
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<Category>('Web');
  const [comment, setComment] = useState('');
  const [preview, setPreview] = useState<OGMetadata | null>(null);
  const [fetching, setFetching] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectCategory = useCallback((inputUrl: string): Category => {
    const lowUrl = inputUrl.toLowerCase();
    if (lowUrl.includes('youtube.com') || lowUrl.includes('youtu.be')) return 'Youtube';
    if (lowUrl.includes('threads.net')) return 'Threads';
    if (lowUrl.includes('reddit.com')) return 'Reddit';
    if (lowUrl.includes('twitter.com') || lowUrl.includes('x.com')) return 'X';
    if (lowUrl.includes('instagram.com')) return 'Instagram';
    if (lowUrl.includes('notion.so') || lowUrl.includes('notion.site')) return 'Notion';
    return 'Web';
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    
    // 사용자가 입력하는 즉시 카테고리 선택기를 업데이트하여 시각적 피드백 제공
    if (val.length > 3) {
      const detected = detectCategory(val);
      setCategory(detected);
    }
  };

  useEffect(() => {
    // 미리보기 패칭 (디바운스 적용하여 API 호출 최적화)
    if (url.length > 8 && (url.includes('.') || url.includes('/'))) {
      const delay = setTimeout(async () => {
        setFetching(true);
        setError(null);
        try {
          const meta = await fetchLinkMetadata(url);
          setPreview(meta);
        } catch (err) {
          console.error("Preview fetch failed", err);
          setError("Platform restricted direct preview. Using link metadata.");
          const domain = url.includes('//') ? url.split('/')[2] : url.split('/')[0];
          setPreview({
            title: `${detectCategory(url)} Post`,
            description: "View the full content by tapping the external link icon.",
            image: `https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80`,
            domain: (domain || 'link').replace('www.', '')
          });
        } finally {
          setFetching(false);
        }
      }, 1000);
      return () => clearTimeout(delay);
    } else {
      setPreview(null);
      setError(null);
    }
  }, [url, detectCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`;
    }

    onAddPost({
      original_url: finalUrl,
      category,
      title: preview?.title || 'Shared Content',
      description: preview?.description || finalUrl,
      thumbnail_image: preview?.image || `https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80`,
      comment: comment
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center glass rounded-3xl p-12 border-green-500/20">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Link Submitted</h2>
        <p className="text-gray-400 mb-8">
          The ecosystem link is being reviewed for community guidelines.
        </p>
        <button 
          onClick={() => { setSubmitted(false); setUrl(''); setPreview(null); setComment(''); }}
          className="pi-gradient text-[#0F0F1A] px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105"
        >
          Share Another Link
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass rounded-[2rem] p-8 border-white/10 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 glass rounded-2xl bg-[#F4B63C]/10 border-[#F4B63C]/20">
            <LinkIcon className="w-6 h-6 text-[#F4B63C]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Post a New Link</h2>
            <p className="text-sm text-gray-400">Add valuable resources to the Pi community feed.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300 ml-1">URL (Threads, Reddit, Web...)</label>
            <div className="relative group">
              <input 
                type="text"
                required
                value={url}
                onChange={handleUrlChange}
                placeholder="threads.net/@user/post/..."
                className="w-full glass bg-white/5 rounded-2xl px-5 py-4 outline-none border-white/10 focus:border-[#F4B63C]/50 transition-all text-lg"
              />
              {fetching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-[#F4B63C]"></div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300 ml-1">Category (Smart Detect)</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full glass bg-[#0F0F1A] rounded-2xl px-5 py-4 outline-none border-white/10 focus:border-[#F4B63C]/50 transition-all cursor-pointer appearance-none"
                >
                  <option value="Web">Website</option>
                  <option value="Threads">Threads</option>
                  <option value="Reddit">Reddit</option>
                  <option value="Youtube">Youtube</option>
                  <option value="X">X (Twitter)</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Notion">Notion</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300 ml-1">Your Remark (Optional)</label>
              <input 
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What is this link about?"
                className="w-full glass bg-white/5 rounded-2xl px-5 py-4 outline-none border-white/10 focus:border-[#F4B63C]/50 transition-all"
              />
            </div>
          </div>

          {preview && (
            <div className="mt-8 border-t border-white/10 pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F4B63C] mb-4">
                <Sparkles className="w-4 h-4" />
                AI Content Analysis
              </div>
              
              <div className="glass rounded-[2rem] overflow-hidden border-white/10 flex flex-col shadow-2xl">
                <div className="aspect-video w-full relative overflow-hidden bg-[#0A0A12]">
                  <img src={preview.image} alt="Preview" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A12] via-transparent to-transparent"></div>
                </div>
                
                <div className="p-6 bg-[#0A0A12]/80">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-[#F4B63C] uppercase">{category}</span>
                    <span className="text-[10px] text-gray-600 truncate max-w-[150px]">{preview.domain}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1 leading-tight group-hover:text-white transition-colors">{preview.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {preview.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-amber-500 text-xs bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={fetching || url.length < 5}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${
              !fetching && url.length >= 5
                ? 'pi-gradient text-[#0F0F1A] shadow-xl shadow-[#F4B63C]/20 hover:scale-[1.01] active:scale-95' 
                : 'glass text-gray-600 cursor-not-allowed border-white/5'
            }`}
          >
            {fetching ? 'AI Processing...' : 'Add to Collection'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;
