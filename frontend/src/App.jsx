import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

import Navbar from './components/Navbar';
import FloatingHearts from './components/FloatingHearts';
import MusicPlayer from './components/MusicPlayer';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MemoriesPage from './pages/MemoriesPage';
import OurStoryPage from './pages/OurStoryPage';
import LoveNotesPage from './pages/LoveNotesPage';
import TimelinePage from './pages/TimelinePage';
import SecretCornerPage from './pages/SecretCornerPage';
import CountdownsPage from './pages/CountdownsPage';
import SettingsPage from './pages/SettingsPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 text-rose-600">
        <div className="w-12 h-12 rounded-full border-4 border-rose-300 border-t-rose-600 animate-spin mb-4" />
        <h2 className="font-handwriting text-3xl text-burgundy-700 font-bold">
          Infinity ❤️
        </h2>
        <p className="text-xs text-rose-500 font-medium">Opening our private world...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'memories':
        return <MemoriesPage />;
      case 'story':
        return <OurStoryPage />;
      case 'notes':
        return <LoveNotesPage />;
      case 'timeline':
        return <TimelinePage />;
      case 'secret':
        return <SecretCornerPage />;
      case 'events':
        return <CountdownsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative text-rose-950 selection:bg-rose-200">
      {/* Subtle Floating Particles */}
      <FloatingHearts />

      {/* Main Header & Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 relative z-10">
        {renderTabContent()}
      </main>

      {/* Ambient Audio Player */}
      <MusicPlayer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainApp />
      </SettingsProvider>
    </AuthProvider>
  );
}
