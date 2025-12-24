
import React from 'react';
import { usePiAuth } from '../hooks/usePiAuth';
import { LogOut, User as UserIcon } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, login, logout } = usePiAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-4 md:px-8 py-4 backdrop-blur-xl">
      <div className="container mx-auto flex justify-between items-center max-w-6xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 pi-gradient rounded-lg flex items-center justify-center font-bold text-[#0F0F1A]">L</div>
          <span className="text-xl font-bold tracking-tight">The Links</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 glass-gold py-1.5 px-4 rounded-full">
              <UserIcon className="w-4 h-4 text-[#F4B63C]" />
              <span className="text-sm font-medium">{user.pi_username}</span>
              <button 
                onClick={logout}
                className="ml-2 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="pi-gradient text-[#0F0F1A] px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-[#F4B63C]/10 hover:scale-105 transition-transform"
            >
              Connect Pi
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
