'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { db } from '@/lib/instantdb';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    // Check localStorage for user session
    const storedUser = localStorage.getItem('instantdb_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('instantdb_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Note: db can be null if APP_ID is not configured, but we'll still allow API-based auth
  // The signup/signin will work through API routes even if db is null

  const signIn = async (email: string, password: string) => {
    if (!db) {
      throw new Error('InstantDB is not configured');
    }
    
    // For now, use a simple approach: fetch user by email
    // In production, you'd use InstantDB's magic code auth
    try {
      const response = await fetch(`/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid credentials');
      }

      const data = await response.json();
      const userData = { id: data.user.id, email: data.user.email, name: data.user.name };
      setUser(userData);
      localStorage.setItem('instantdb_user', JSON.stringify(userData));
    } catch (error: any) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Create user profile via API (works even if db is null)
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Provide helpful error message if admin token is missing
      if (errorData.hint) {
        throw new Error(`${errorData.error}\n\n${errorData.hint}`);
      }
      throw new Error(errorData.error || 'Failed to create account');
    }

    const data = await response.json();
    const userData = { id: data.user.id, email: data.user.email, name: data.user.name };
    
    // Set user state and store in localStorage
    setUser(userData);
    localStorage.setItem('instantdb_user', JSON.stringify(userData));
  };

  const signOut = async () => {
    // Clear user state and localStorage
    setUser(null);
    localStorage.removeItem('instantdb_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
