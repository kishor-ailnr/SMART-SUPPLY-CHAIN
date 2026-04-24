import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Set a timeout to bypass the loading state if Firebase takes too long (e.g. environment issues)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email, password) => {
    // Intercept demo login instantly to prevent Firebase hitting the network and throwing an HTTP 400 error
    if (email === 'admin@seaways.com' && password === 'admin123') {
      setIsDemo(true);
      setCurrentUser({ email: 'admin@seaways.com', role: 'Admin' });
      return { user: { email: 'admin@seaways.com' } };
    }
    
    // Otherwise try real firebase
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    setIsDemo(false);
    setCurrentUser(null);
    return signOut(auth).catch(() => {}); // Catch and ignore if not actually signed into firebase
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isDemo) {
        setCurrentUser(user);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [isDemo]);

  const value = {
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
