import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

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

  const login = useCallback((username: string, password: string): boolean => {
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
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('adminUser');
  }, []);

  const extendSession = useCallback(() => {
    if (user) {
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + 1); // Add 1 hour
      
      const updatedUser: AdminUser = {
        ...user,
        expiresAt: newExpiresAt,
        loginTime: user.loginTime // Keep original login time
      };
      
      setUser(updatedUser);
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
    }
  }, [user]);

  // Check if session is still valid
  const isSessionValid = useCallback((user: AdminUser | null): boolean => {
    if (!user) return false;
    const now = new Date();
    const expiresAt = new Date(user.expiresAt);
    // Check if expiresAt is a valid date
    if (isNaN(expiresAt.getTime())) {
      return false;
    }
    return expiresAt > now;
  }, []);

  const isAuthenticated = !!user && isSessionValid(user);

  // Auto-logout when session expires
  React.useEffect(() => {
    if (user && !isSessionValid(user)) {
      logout();
    }
  }, [user, logout, isSessionValid]);

  // Update remaining time every minute
  React.useEffect(() => {
    const updateRemainingTime = () => {
      try {
        if (user && isSessionValid(user)) {
          const now = new Date();
          const expiresAt = new Date(user.expiresAt);
          if (isNaN(expiresAt.getTime())) {
            setRemainingTime(0);
            return;
          }
          const remainingMs = expiresAt.getTime() - now.getTime();
          const remainingMinutes = Math.max(0, Math.floor(remainingMs / (1000 * 60)));
          setRemainingTime(remainingMinutes);
        } else {
          setRemainingTime(0);
        }
      } catch (error) {
        console.error('Error updating remaining time:', error);
        setRemainingTime(0);
      }
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user, isSessionValid]);

  // Check for existing session on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Convert date strings back to Date objects
        let isValidUser = true;
        
        if (parsedUser.loginTime) {
          const loginTime = new Date(parsedUser.loginTime);
          if (isNaN(loginTime.getTime())) {
            console.error('Invalid loginTime date format');
            isValidUser = false;
          } else {
            parsedUser.loginTime = loginTime;
          }
        }
        
        if (parsedUser.expiresAt) {
          const expiresAt = new Date(parsedUser.expiresAt);
          if (isNaN(expiresAt.getTime())) {
            console.error('Invalid expiresAt date format');
            isValidUser = false;
          } else {
            parsedUser.expiresAt = expiresAt;
          }
        }
        
        if (!isValidUser) {
          localStorage.removeItem('adminUser');
          return;
        }
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
  }, [isSessionValid]);

  return (
    <AuthContext.Provider value={{ user, login, logout, extendSession, isAuthenticated, remainingTime }}>
      {children}
    </AuthContext.Provider>
  );
};
