
import React from 'react';
import { Post } from '../types';
import PostCard from './PostCard';

interface FeedProps {
  posts: Post[];
}

const Feed: React.FC<FeedProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20 opacity-50 italic">
        No links found in this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[220px]">
      {posts.map((post, index) => {
        // Create variations in the bento grid
        const isWide = index % 5 === 0;
        const isTall = index % 3 === 0 && !isWide;

        return (
          <div 
            key={post.id} 
            className={`transition-all duration-500 hover:-translate-y-1 ${
              isWide ? 'md:col-span-2' : ''
            } ${
              isTall ? 'md:row-span-2' : ''
            }`}
          >
            <PostCard post={post} />
          </div>
        );
      })}
    </div>
  );
};

export default Feed;
