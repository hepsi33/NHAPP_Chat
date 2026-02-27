export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  status?: string;
  isOnline?: boolean;
  lastSeen?: number;
}

export interface Message {
  _id: string;
  text: string;
  createdAt: number;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  image?: string;
  video?: string;
  audio?: string;
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'document';
  metadata?: any;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: number;
  type: 'private' | 'group';
  name?: string;
  avatar?: string;
  admins?: string[];
}

export interface StatusUpdate {
  id: string;
  userId: string;
  mediaUrl: string;
  type: 'image' | 'video';
  createdAt: number;
  expiresAt: number;
  views: string[];
}
