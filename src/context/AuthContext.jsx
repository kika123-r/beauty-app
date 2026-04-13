// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, getUserProfile } from '../firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile,  setUserProfile]  = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);

      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    firebaseUser,
    userProfile,
    loading,
    isAdmin:  userProfile?.role === 'admin',
    isClient: userProfile?.role === 'client',
    salonId:  userProfile?.salonId ?? null,
    refreshProfile: async () => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      }
    },
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth musí byť použitý vnútri <AuthProvider>');
  return ctx;
};