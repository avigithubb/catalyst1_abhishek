import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '@elderly-care/shared-types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  sharedProfileId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  login: (token: string, user: User, sharedProfileId: string, isNew?: boolean) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sharedProfileId, setSharedProfileId] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on application bootstrap
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedSharedId = localStorage.getItem('sharedProfileId');
    const storedIsNew = localStorage.getItem('isNewUser') === 'true';

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setSharedProfileId(storedSharedId || 'pat_101');
        setIsNewUser(storedIsNew);
      } catch (e) {
        console.error('Failed to parse cached auth state', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User, newSharedId: string, isNew: boolean = false) => {
    setToken(newToken);
    setUser(newUser);
    setSharedProfileId(newSharedId);
    setIsNewUser(isNew);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('sharedProfileId', newSharedId);
    localStorage.setItem('isNewUser', String(isNew));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSharedProfileId(null);
    setIsNewUser(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sharedProfileId');
    localStorage.removeItem('isNewUser');
  }, []);

  const updateUser = useCallback((updatedFields: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Memoize the context value object to prevent unnecessary re-renders of subscribers
  const contextValue = useMemo(() => ({
    user,
    token,
    sharedProfileId,
    isAuthenticated: !!token && !!user,
    isLoading,
    isNewUser,
    login,
    logout,
    updateUser,
  }), [user, token, sharedProfileId, isLoading, isNewUser, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
