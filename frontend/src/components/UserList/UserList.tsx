'use client';

import { User } from '../../../../shared/types/user';

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  return (
    <div className="w-64 border-l border-gray-300 p-4 bg-gray-50">
      <h2 className="font-bold text-lg mb-4">オンラインユーザー ({users.length})</h2>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2 p-2 bg-white rounded-md">
            <div
              className={`w-2 h-2 rounded-full ${
                user.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className="text-sm text-gray-800">{user.name}</span>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">ユーザーがいません</p>
        )}
      </div>
    </div>
  );
}
