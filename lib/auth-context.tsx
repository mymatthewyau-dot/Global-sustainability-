'use client';

import { createContext, useContext, ReactNode } from 'react';
import { db } from './instant';

type AuthContextType = {
  user: any;
  isLoading: boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading, user, error } = db.useAuth();

  const signOut = () => {
    db.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

