import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, UserProfile, TrainingStyle } from '../types';

interface UserContextType {
  activeUser: User | null;
  users: User[];
  loading: boolean;
  saveUserProfile: (profile: UserProfile) => void;
  updateUser: (updatedUser: User) => void;
  setActiveUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  logout: () => void;
  togglePinUser: (userId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'hypertik-users';
const OLD_USER_STORAGE_KEY = 'hypertik-user';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // --- Migration from single user to multi-user ---
      const oldUserStored = localStorage.getItem(OLD_USER_STORAGE_KEY);
      const usersStored = localStorage.getItem(USERS_STORAGE_KEY);

      if (oldUserStored && !usersStored) {
        const parsedOldUser: Omit<User, 'id'> = JSON.parse(oldUserStored);
        const migratedUser: User = { 
          ...parsedOldUser, 
          id: crypto.randomUUID(),
          profile: {
            ...parsedOldUser.profile,
            trainingStyle: parsedOldUser.profile.trainingStyle || TrainingStyle.HYPERTROPHY,
            proteinSupplementName: parsedOldUser.profile.proteinSupplementName || '',
            carbSupplementName: parsedOldUser.profile.carbSupplementName || '',
          },
          dailyDietPlan: parsedOldUser.dailyDietPlan || null,
          pinned: false,
          lastUsed: new Date().toISOString(),
        };
        setUsers([migratedUser]);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([migratedUser]));
        localStorage.removeItem(OLD_USER_STORAGE_KEY);
      } else if (usersStored) {
        const parsedUsers: User[] = JSON.parse(usersStored);
         // Ensure all users have all fields for backward compatibility
        const checkedUsers = parsedUsers.map(u => ({
            ...u,
            id: u.id || crypto.randomUUID(),
            profile: {
                ...u.profile,
                trainingStyle: u.profile.trainingStyle || TrainingStyle.HYPERTROPHY,
                proteinSupplementName: u.profile.proteinSupplementName || '',
                carbSupplementName: u.profile.carbSupplementName || '',
            },
            dailyDietPlan: u.dailyDietPlan || null,
            pinned: u.pinned || false,
            lastUsed: u.lastUsed, // Can be undefined for old profiles
        }));
        setUsers(checkedUsers);
        if (JSON.stringify(checkedUsers) !== JSON.stringify(parsedUsers)) {
             localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(checkedUsers));
        }
      }
    } catch (error) {
      console.error("Failed to load users from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToLocalStorage = useCallback((usersToSave: User[]) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersToSave));
    } catch (error)      {
      console.error("Failed to save users to localStorage", error);
    }
  }, []);
  
  const saveUserProfile = useCallback((profile: UserProfile) => {
    const today = new Date().toISOString();
    const newUser: User = {
      id: crypto.randomUUID(),
      profile: {
        ...profile,
        calorieAdjustment: 0,
      },
      workoutLog: [],
      nutritionLog: [],
      weightHistory: [{ date: today.split('T')[0], weight: profile.weight }],
      bodyMeasurements: profile.bodyFat ? [{ date: today.split('T')[0], bodyFat: profile.bodyFat }] : [],
      weeklyWorkoutPlan: null,
      dailyDietPlan: null,
      lastCheckinDate: undefined,
      pinned: false,
      lastUsed: today,
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setActiveUser(newUser);
    saveToLocalStorage(updatedUsers);
  }, [users, saveToLocalStorage]);
  
  const updateUser = useCallback((updatedUser: User) => {
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      setActiveUser(updatedUser);
      saveToLocalStorage(updatedUsers);
  }, [users, saveToLocalStorage]);

  const setActiveUserById = useCallback((userId: string) => {
    const userToActivate = users.find(u => u.id === userId);
    if(userToActivate) {
        const updatedUser = { ...userToActivate, lastUsed: new Date().toISOString() };
        setActiveUser(updatedUser);
        
        // Also update the list in the state and localStorage
        const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
        setUsers(updatedUsers);
        saveToLocalStorage(updatedUsers);
    }
  }, [users, saveToLocalStorage]);
  
  const deleteUserById = useCallback((userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    if (activeUser?.id === userId) {
      setActiveUser(null);
    }
    saveToLocalStorage(updatedUsers);
  }, [users, activeUser, saveToLocalStorage]);

  const logout = useCallback(() => {
    setActiveUser(null);
  }, []);

  const togglePinUser = useCallback((userId: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, pinned: !u.pinned } : u);
    setUsers(updatedUsers);
    if(activeUser?.id === userId) {
      setActiveUser(updatedUsers.find(u => u.id === userId)!);
    }
    saveToLocalStorage(updatedUsers);
  }, [users, activeUser, saveToLocalStorage]);


  return (
    <UserContext.Provider value={{ 
        activeUser, 
        users, 
        loading, 
        saveUserProfile, 
        updateUser, 
        setActiveUser: setActiveUserById, 
        deleteUser: deleteUserById,
        logout,
        togglePinUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};