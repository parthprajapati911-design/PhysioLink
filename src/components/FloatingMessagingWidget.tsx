import React, { useState, useRef, useEffect } from 'react';
import { Conversation, UserProfile } from '../types';
import { 
  MessageSquare, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Send, 
  Maximize2, 
  Search, 
  ShieldCheck, 
  CheckCheck, 
  Check, 
  Paperclip,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface FloatingMessagingWidgetProps {
  conversations: Conversation[];
  currentUser: UserProfile;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onNavigateToMessagingTab: () => void;
  onMarkAsRead?: (conversationId: string) => void;
}

export const FloatingMessagingWidget: React.FC<FloatingMessagingWidgetProps> = ({
  conversations,
  currentUser,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onNavigateToMessagingTab,
  onMarkAsRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMiniConvId, setSelectedMiniConvId] = useState<string | null>(null);
  const [miniMessageInput, setMiniMessageInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalUnread = conversations.reduce((acc, curr) => acc + curr.unreadCount, 0);

  const activeMiniConv = conversations.find((c) => c.id === (selectedMiniConvId || activeConversationId)) || null;

  useEffect(() => {
    if (activeMiniConv && onMarkAsRead && activeMiniConv.unreadCount > 0) {
      onMarkAsRead(activeMiniConv.id);
    }
  }, [activeMiniConv?.id]);

  useEffect(() => {
    if (isOpen && activeMiniConv) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeMiniConv?.messages]);

  const handleSendMini = () => {
    if (!miniMessageInput.trim() || !activeMiniConv) return;
    onSendMessage(activeMiniConv.id, miniMessageInput.trim());
    setMiniMessageInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMini();
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.participant.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.lastMessage.text.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed bottom-0 right-4 sm:right-6 z-40 flex items-end gap-3 pointer-events-none">
      
      {/* Docked Drawer Container */}
      <div className="w-80 sm:w-88 bg-white rounded-t-2xl shadow-2xl border border-slate-300 pointer-events-auto flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Top Header Pill / Bar */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-slate-900 text-white flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-900"></span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-display">Messaging</span>
              {totalUnread > 0 && (
                <span className="bg-teal-500 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToMessagingTab();
              }}
              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
              title="Open full page messaging"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Drawer Body */}
        {isOpen && (
          <div className="h-96 flex flex-col bg-slate-50">
            {selectedMiniConvId && activeMiniConv ? (
              /* Mini Chat Active View */
              <div className="flex-1 flex flex-col bg-white">
                {/* Mini Chat Subheader */}
                <div className="p-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => setSelectedMiniConvId(null)}
                      className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <img
                      src={activeMiniConv.participant.avatar}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {activeMiniConv.participant.name}
                      </span>
                      <span className="text-[9px] text-slate-500 truncate block">
                        {activeMiniConv.participant.isOnline ? 'Online now' : 'PhysioLink Colleague'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectConversation(activeMiniConv.id);
                      onNavigateToMessagingTab();
                    }}
                    className="p-1 text-slate-400 hover:text-blue-700"
                    title="Expand to Full View"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mini Chat History */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/60 text-xs">
                  {activeMiniConv.messages.map((m, idx) => {
                    const isMe = m.senderId === currentUser.id;
                    return (
                      <div
                        key={m.id || idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-snug shadow-2xs ${
                            isMe
                              ? 'bg-blue-700 text-white rounded-br-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          <p>{m.text}</p>
                          {m.attachmentName && (
                            <span className="block mt-1 text-[10px] font-semibold underline opacity-90">
                              📄 {m.attachmentName}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                          {m.timestamp}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Mini Chat Quick Reply Chip */}
                <div className="px-2 py-1 bg-white border-t border-slate-100 flex items-center gap-1 overflow-x-auto text-[10px]">
                  <button
                    onClick={() => setMiniMessageInput('Case protocol looks solid! 👍')}
                    className="bg-slate-100 hover:bg-blue-50 text-slate-700 px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    👍 Looks solid
                  </button>
                  <button
                    onClick={() => setMiniMessageInput('Available for a call today.')}
                    className="bg-slate-100 hover:bg-blue-50 text-slate-700 px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    📞 Available today
                  </button>
                </div>

                {/* Mini Chat Input */}
                <div className="p-2 border-t border-slate-200 bg-white flex items-center gap-1.5">
                  <input
                    type="text"
                    value={miniMessageInput}
                    onChange={(e) => setMiniMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSendMini}
                    disabled={!miniMessageInput.trim()}
                    className={`p-1.5 rounded-lg ${
                      miniMessageInput.trim()
                        ? 'bg-blue-700 text-white hover:bg-blue-800'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Conversation List View inside Drawer */
              <div className="flex-1 flex flex-col">
                <div className="p-2 bg-white border-b border-slate-100">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full bg-slate-100 text-xs pl-8 pr-2 py-1.5 rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {filteredConversations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedMiniConvId(c.id);
                        onSelectConversation(c.id);
                      }}
                      className="p-2.5 hover:bg-slate-50 flex items-start gap-2.5 cursor-pointer transition-colors"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={c.participant.avatar}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        {c.participant.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {c.participant.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {c.lastMessage.timestamp}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate mt-0.5 ${c.unreadCount > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                          {c.lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                          {c.lastMessage.text}
                        </p>
                      </div>

                      {c.unreadCount > 0 && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-teal-600 mt-1.5"></span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
                  <button
                    onClick={onNavigateToMessagingTab}
                    className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    Open Messaging in Full Screen →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
