export interface Shortcut {
  id: string;
  name: string;
  icon: string;
  path: string;
  categoryId: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: Date;
}