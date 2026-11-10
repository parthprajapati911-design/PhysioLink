import React from 'react';
import { ViewTab, UserProfile } from '../types';
import { Home, Users, PlusCircle, MessageSquare } from 'lucide-react';
import { Avatar } from './Avatar';

interface MobileBottomNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenCreateModal: () => void;
  currentUser: UserProfile;
  unreadMessagesCount?: number;
  pendingInvitesCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateModal,
  currentUser,
  unreadMessagesCount = 0,
  pendingInvitesCount = 0,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 safe-bottom shadow-lg">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentTab === 'home' ? 'text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </button>

        {/* Tab 2: Network */}
        <button
          onClick={() => onSelectTab('network')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentTab === 'network' ? 'text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {pendingInvitesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1 ring-white">
                {pendingInvitesCount > 9 ? '9+' : pendingInvitesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Network</span>
        </button>

        {/* Tab 3: Create Post Action */}
        <button
          onClick={onOpenCreateModal}
          className="flex flex-col items-center justify-center py-0.5 text-blue-700 hover:text-blue-800 transition-transform active:scale-95 cursor-pointer -mt-3"
          aria-label="Create post"
        >
          <div className="w-11 h-11 rounded-full bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-700/20">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium text-slate-700">Post</span>
        </button>

        {/* Tab 4: Messaging */}
        <button
          onClick={() => onSelectTab('messaging')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
            currentTab === 'messaging' ? 'text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-teal-600 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1 ring-white">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Messages</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentTab === 'profile' ? 'text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              className={`w-5 h-5 rounded-full text-[8px] ${currentTab === 'profile' ? 'ring-2 ring-blue-700' : ''}`}
            />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Profile</span>
        </button>

      </div>
    </nav>
  );
};
