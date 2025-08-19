
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { User, Settings, FileText, Terminal, LogOut, ChevronDown } from 'lucide-react';
import { User as UserType } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: UserType | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header className="relative z-20 border-b"
            style={{ 
              borderColor: 'hsla(220, 40%, 30%, 0.3)',
              background: 'hsla(230, 30%, 15%, 0.7)',
              backdropFilter: 'blur(20px)'
            }}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ 
                 background: 'linear-gradient(135deg, hsl(195, 100%, 50%), hsl(180, 100%, 60%))',
                 boxShadow: '0 0 20px hsla(195, 100%, 50%, 0.3)'
               }}>
            <span className="text-white font-bold text-sm">XI</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'hsl(0, 0%, 95%)' }}>
            Code-XI
          </h1>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200"
            style={{
              background: dropdownOpen ? 'hsla(195, 100%, 50%, 0.1)' : 'transparent',
              borderColor: 'hsla(220, 40%, 30%, 0.3)',
              color: 'hsl(0, 0%, 95%)'
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="hidden sm:block text-sm">
              {user?.user_metadata?.full_name || user?.email}
            </span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </Button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-2xl z-50"
                 style={{
                   background: 'hsla(230, 30%, 15%, 0.95)',
                   backdropFilter: 'blur(20px)',
                   border: '1px solid hsla(220, 40%, 30%, 0.3)',
                   boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                 }}>
              
              <div className="py-2">
                <div className="px-4 py-2 border-b" style={{ borderColor: 'hsla(220, 40%, 30%, 0.3)' }}>
                  <p className="text-sm font-medium" style={{ color: 'hsl(0, 0%, 95%)' }}>
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs" style={{ color: 'hsl(220, 15%, 70%)' }}>
                    {user?.email}
                  </p>
                </div>

                <button className="w-full text-left px-4 py-2 text-sm flex items-center space-x-3 hover:bg-opacity-50 transition-colors"
                        style={{ color: 'hsl(220, 15%, 70%)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(195, 100%, 50%, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Settings size={16} />
                  <span>LLM Providers</span>
                </button>

                <button className="w-full text-left px-4 py-2 text-sm flex items-center space-x-3 hover:bg-opacity-50 transition-colors"
                        style={{ color: 'hsl(220, 15%, 70%)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(195, 100%, 50%, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <FileText size={16} />
                  <span>Documentation</span>
                </button>

                <button className="w-full text-left px-4 py-2 text-sm flex items-center space-x-3 hover:bg-opacity-50 transition-colors"
                        style={{ color: 'hsl(220, 15%, 70%)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(195, 100%, 50%, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Terminal size={16} />
                  <span>CLI Setup</span>
                </button>

                <button className="w-full text-left px-4 py-2 text-sm flex items-center space-x-3 hover:bg-opacity-50 transition-colors"
                        style={{ color: 'hsl(220, 15%, 70%)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(195, 100%, 50%, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Settings size={16} />
                  <span>Settings</span>
                </button>

                <div className="border-t mt-2 pt-2" style={{ borderColor: 'hsla(220, 40%, 30%, 0.3)' }}>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors"
                    style={{ color: 'hsl(0, 70%, 60%)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(0, 70%, 60%, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
