import React from 'react';
import { Search, Sun, Moon, Settings, Sparkles, Activity } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header = ({ searchQuery, onSearchChange }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSearchInput = (e) => {
    const value = e.target.value;
    onSearchChange(value);
    
    // Add subtle visual feedback for search
    if (value.length > 0) {
      if (isDarkMode) {
        e.target.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.35)';
        e.target.style.borderColor = 'rgba(129, 140, 248, 0.5)';
      } else {
        e.target.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.2)';
        e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)';
      }
    } else {
      e.target.style.boxShadow = '';
      e.target.style.borderColor = '';
    }
  };

  return (
    <header className="h-16 w-full glass border-b border-white/10 dark:border-white/5 flex items-center justify-between px-6 relative z-50 transition-colors duration-300">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-700 dark:from-white dark:via-indigo-100 dark:to-gray-300 bg-clip-text text-transparent">
            SemanticLens
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400 border border-indigo-500/20">
            AI v2.0
          </span>
        </div>
      </div>
      
      {/* Central Search Input */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-xl px-4">
        <div className="relative flex items-center">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-indigo-500 dark:text-indigo-400">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search by topic, concept, or description... (e.g. 'quarterly financials', 'auth middleware')" 
            value={searchQuery}
            onChange={handleSearchInput}
            className="w-full h-11 pl-11 pr-14 rounded-full glass neon-border text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all duration-300 shadow-sm"
          />
          <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-gray-400 dark:text-gray-400 bg-black/5 dark:bg-white/10 rounded border border-black/5 dark:border-white/10">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>
      
      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Status Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-medium tracking-wide">AI Active</span>
        </div>

        {/* Theme Toggle */}
        <button 
          className="p-2 rounded-xl glass hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 neon-border" 
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 transition-all duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-all duration-300" />
          )}
        </button>

        {/* Settings */}
        <button 
          className="p-2 rounded-xl glass hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </header>
  );
};

export default Header;
