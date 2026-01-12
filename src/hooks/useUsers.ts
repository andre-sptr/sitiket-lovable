import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/ticket';
import { mockUsers } from '@/lib/mockData';

const STORAGE_KEY = 'app_users';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUsers(JSON.parse(stored));
    } else {
      setUsers(mockUsers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers));
    }
    setIsLoaded(true);
  }, []);

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    saveUsers([...users, newUser]);
    return newUser;
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const updated = users.map(user =>
      user.id === id ? { ...user, ...userData } : user
    );
    saveUsers(updated);
  };

  const deleteUser = (id: string) => {
    const filtered = users.filter(user => user.id !== id);
    saveUsers(filtered);
  };

  const toggleUserActive = (id: string) => {
    const updated = users.map(user =>
      user.id === id ? { ...user, isActive: !user.isActive } : user
    );
    saveUsers(updated);
  };

  const getUserById = (id: string) => users.find(user => user.id === id);

  const resetToDefault = () => {
    saveUsers(mockUsers);
  };

  return {
    users,
    isLoaded,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    getUserById,
    resetToDefault,
  };
};
