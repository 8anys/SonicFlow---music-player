import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, loginWithGoogleCredential, logoutUser, registerUser } from '@/api/auth';

const SonicAuthContext = createContext(null);

export function SonicAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login: async (credentials) => {
      const data = await loginUser(credentials);
      setUser(data.user);
      return data.user;
    },
    register: async (credentials) => {
      const data = await registerUser(credentials);
      setUser(data.user);
      return data.user;
    },
    loginWithGoogle: async (credential) => {
      const data = await loginWithGoogleCredential(credential);
      setUser(data.user);
      return data.user;
    },
    logout: async () => {
      await logoutUser();
      setUser(null);
    },
  }), [user, isLoading]);

  return (
    <SonicAuthContext.Provider value={value}>
      {children}
    </SonicAuthContext.Provider>
  );
}

export function useSonicAuth() {
  const context = useContext(SonicAuthContext);
  if (!context) {
    throw new Error('useSonicAuth must be used within SonicAuthProvider');
  }
  return context;
}
