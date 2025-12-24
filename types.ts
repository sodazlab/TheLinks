
export type Category = 'Web' | 'X' | 'Instagram' | 'Threads' | 'Reddit' | 'Notion' | 'Youtube' | 'Other';

export interface User {
  id: string;
  pi_username: string;
  pi_uid: string;
  role: 'user' | 'admin';
}

export interface Post {
  id: string;
  user_id: string;
  pi_username: string;
  original_url: string;
  category: Category;
  title: string;
  description: string;
  thumbnail_image: string; // 로컬 경로 또는 URL
  comment?: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
}

export interface BrandConfig {
  color: string;
  gradient: string;
  localAsset: string;
}
