export interface BookmarkList {
  id: number;
  name: string;
  description?: string | null;
  privacy: 'private' | 'public';
  creator: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  followCount: number;
  isProjectInList?: boolean; // 当前项目是否在此列表中
}

export interface CreateListRequest {
  name: string;
  description?: string;
  privacy: 'private' | 'public';
}
