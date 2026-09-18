import React from 'react';
import { 
  Heart, 
  Camera, 
  Mail, 
  BookOpen, 
  Clock, 
  Lock, 
  Calendar, 
  Settings, 
  LogOut,
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const { settings } = useSettings();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Heart },
    { id: 'memories', label: 'Memories', icon: Camera },
    { id: 'notes', label: 'Love Notes', icon: Mail },
    { id: 'story', label: 'Our Story', icon: BookOpen },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'secret', label: 'Secret Corner', icon: Lock },
    { id: 'events', label: 'Special Days', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Header & Nav Bar */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-rose-100/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo & Couple Title */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-400 to-burgundy-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 text-white fill-white animate-heartbeat" />
            </div>
            <div>
              <h1 className="font-handwriting text-2xl font-bold text-burgundy-700 leading-none">
                {settings.app_title || 'Our Little World ❤️'}
              </h1>
              <p className="text-xs text-rose-600 font-medium">
                {settings.my_name} & {settings.gf_name}
              </p>
            </div>
          </div>

          {/* Main Navigation Links */}
          <nav className="flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-semibold scale-105'
                      : 'text-rose-800 hover:bg-rose-100/70 hover:text-burgundy-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-rose-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-rose-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-400 to-burgundy-600 flex items-center justify-center shadow-xs">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="font-handwriting text-xl font-bold text-burgundy-700 leading-tight">
              {settings.app_title || 'Our Little World ❤️'}
            </h1>
            <p className="text-[10px] text-rose-500 font-medium">
              {settings.my_name} & {settings.gf_name}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
          title="Log Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-rose-100 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive ? 'text-rose-600 scale-110 font-bold' : 'text-rose-400 hover:text-rose-600'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-rose-100 text-rose-600' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 leading-none">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default Navbar;
