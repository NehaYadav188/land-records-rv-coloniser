import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AdminUser {
  username: string;
  role: string;
  loginTime: Date;
  expiresAt: Date;
}

interface AuthContextType {
  user: AdminUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  extendSession: () => void;
  isAuthenticated: boolean;
  remainingTime: number; // in minutes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const login = (username: string, password: string): boolean => {
    // Check default admin credentials
    if (username === 'ryadav' && password === 'yadav@123') {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour from now
      
      const newUser: AdminUser = {
        username,
        role: 'admin',
        loginTime: new Date(),
        expiresAt
      };
      setUser(newUser);
      localStorage.setItem('adminUser', JSON.stringify(newUser));
      return true;
    }
    
    // Check other admin profiles from localStorage
    const adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '[]');
    const admin = adminProfiles.find((admin: any) => admin.username === username && admin.password === password);
    
    if (admin) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour from now
      
      const newUser: AdminUser = {
        username: admin.username,
        role: admin.role || 'admin',
        loginTime: new Date(),
        expiresAt
      };
      setUser(newUser);
      localStorage.setItem('adminUser', JSON.stringify(newUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
  };

  const extendSession = () => {
    if (user) {
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + 1); // Add 1 hour
      
      const updatedUser: AdminUser = {
        ...user,
        expiresAt: newExpiresAt
      };
      
      setUser(updatedUser);
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
    }
  };

  // Check if session is still valid
  const isSessionValid = (user: AdminUser | null): boolean => {
    if (!user) return false;
    const now = new Date();
    return new Date(user.expiresAt) > now;
  };

  const isAuthenticated = !!user && isSessionValid(user);

  // Auto-logout when session expires
  React.useEffect(() => {
    if (user && !isSessionValid(user)) {
      logout();
    }
  }, [user]);

  // Update remaining time every minute
  React.useEffect(() => {
    const updateRemainingTime = () => {
      if (user && isSessionValid(user)) {
        const now = new Date();
        const expiresAt = new Date(user.expiresAt);
        const remainingMs = expiresAt.getTime() - now.getTime();
        const remainingMinutes = Math.max(0, Math.floor(remainingMs / (1000 * 60)));
        setRemainingTime(remainingMinutes);
      } else {
        setRemainingTime(0);
      }
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user]);

  // Check for existing session on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Check if saved session is still valid
        if (isSessionValid(parsedUser)) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('adminUser');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, extendSession, isAuthenticated, remainingTime }}>
      {children}
    </AuthContext.Provider>
  );
};
