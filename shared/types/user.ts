export interface User {
  id: string;
  name: string;
  isOnline: boolean;
}

export interface UserWithDetails extends User {
  socketId: string | null;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
