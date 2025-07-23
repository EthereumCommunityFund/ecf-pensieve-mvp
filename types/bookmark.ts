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
  isProjectInList?: boolean; // Whether the current project is in this list
}

export interface CreateListRequest {
  name: string;
  description?: string;
  privacy: 'private' | 'public';
}
