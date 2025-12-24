
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
  thumbnail_image?: string; // DB에 값이 없을 경우를 대비해 선택 사항으로 변경
  comment?: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
}

export interface BrandConfig {
  color: string;
  gradient: string;
  localAsset: string;
}
