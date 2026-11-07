import React from 'react';
import { ViewTab, UserProfile } from '../types';
import { LOGO_URL, BRAND_NAME } from '../data/brand';
import { Avatar } from './Avatar';
import { Home, Users, Briefcase, User, ShieldCheck, Plus, Search, CheckCircle2, MessageSquare } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  currentUser: UserProfile;
  allUsers?: Record<string, UserProfile>;
  onOpenCreateModal: () => void;
  unreadMessagesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenCreateModal,
  unreadMessagesCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Main Top Navigation (Three Zone Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4 lg:gap-8">
          
          {/* Zone 1: Brand Wordmark & Search */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <img
                src={LOGO_URL}
                alt="PhysioLink Emblem"
                className="w-9 h-9 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors font-display leading-none">
                {BRAND_NAME}
              </span>
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center relative w-40 lg:w-52 xl:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search PhysioLink"
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-Line, Text with subtle active underlines) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onSelectTab('home')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'home'
                  ? 'text-blue-700 bg-blue-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Feed</span>
            </button>

            <button
              onClick={() => onSelectTab('network')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'network'
                  ? 'text-blue-700 bg-blue-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Network</span>
            </button>

            <button
              onClick={() => onSelectTab('messaging')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer relative ${
                currentTab === 'messaging'
                  ? 'text-blue-700 bg-blue-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-4 h-4" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-teal-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </div>
              <span>Messaging</span>
            </button>

            <button
              onClick={() => onSelectTab('opportunities')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'opportunities'
                  ? 'text-blue-700 bg-blue-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Opportunities</span>
            </button>


            <button
              onClick={() => onSelectTab('profile')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'profile'
                  ? 'text-blue-700 bg-blue-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            {currentUser.accountType === 'admin' && (
              <button
                onClick={() => onSelectTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'admin'
                    ? 'text-teal-700 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Admin & Verification Console"
              >
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Action & Profile Quick Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Post</span>
              <span className="sm:hidden">Post</span>
            </button>

            {/* Quick Profile Avatar */}
            <button
              onClick={() => onSelectTab('profile')}
              className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              title={`View ${currentUser.name}'s profile`}
            >
              <Avatar src={currentUser.avatar} name={currentUser.name} className="w-9 h-9 rounded-full border-2 border-white shadow-sm" />
              {currentUser.verifiedStatus === 'verified' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 bg-white rounded-full absolute -bottom-0.5 -right-0.5" />
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
