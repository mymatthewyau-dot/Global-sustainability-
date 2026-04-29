'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function AuthButton() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push('/auth')}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 hidden sm:inline">
        {user.email}
      </span>
      <button
        onClick={signOut}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#6B8FAF',
          fontSize: 11,
          cursor: 'pointer',
          padding: '4px 8px',
          textDecoration: 'underline',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

