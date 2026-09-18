import React from 'react';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, fallback }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 text-rose-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-rose-300 border-t-rose-600 animate-spin" />
          <p className="font-handwriting text-2xl text-burgundy-700">Opening Our Little World... ❤️</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;
