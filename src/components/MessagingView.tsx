import React, { useState, useRef, useEffect } from 'react';
import { Conversation, ChatMessage, UserProfile, Connection } from '../types';
import { 
  Search, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  ShieldCheck, 
  Circle, 
  CheckCheck, 
  Check, 
  MoreVertical, 
  Edit3, 
  Sparkles, 
  User, 
  ArrowLeft,
  X,
  Plus
} from 'lucide-react';

interface MessagingViewProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string, attachmentName?: string) => void;
  currentUser: UserProfile;
  connections: Connection[];
  allUsers: Record<string, UserProfile>;
  onViewProfile?: () => void;
  onMarkAsRead?: (conversationId: string) => void;
  onStartChat?: (userId: string, name: string, headline: string, avatar: string, verified: boolean) => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  currentUser,
  connections,
  allUsers,
  onViewProfile,
  onMarkAsRead,
  onStartChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [messageInput, setMessageInput] = useState('');
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [composeSearch, setComposeSearch] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active conversation resolution
  const activeConversation = 
    conversations.find((c) => c.id === activeConversationId) || 
    conversations[0] || 
    null;

  useEffect(() => {
    if (activeConversation && onMarkAsRead && activeConversation.unreadCount > 0) {
      onMarkAsRead(activeConversation.id);
    }
  }, [activeConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = 
      c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participant.headline.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'unread') {
      return matchesSearch && c.unreadCount > 0;
    }
    return matchesSearch;
  });

  const totalUnread = conversations.reduce((acc, curr) => acc + curr.unreadCount, 0);

  const handleSend = () => {
    if (!messageInput.trim() || !activeConversation) return;
    onSendMessage(activeConversation.id, messageInput.trim());
    setMessageInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConv = (id: string) => {
    onSelectConversation(id);
    setMobileShowThread(true);
  };

  // Quick clinical prompt suggestions
  const clinicalPrompts = [
    'Could you share the rehab protocol document?',
    'What is your target range of motion criteria?',
    'Happy to review the EMG report and MRI findings.',
    'Available for a quick case discussion today.',
  ];

  // Candidates for New Message
  const availableRecipients = [
    ...Object.values(allUsers).filter((u) => u.id !== currentUser.id).map((u) => ({
      id: u.id,
      name: u.name,
      headline: u.headline,
      avatar: u.avatar,
      verified: u.verifiedStatus === 'verified',
    })),
    ...connections.filter((c) => c.status === 'connected').map((c) => ({
      id: c.id,
      name: c.name,
      headline: c.headline,
      avatar: c.avatar,
      verified: c.verified,
    })),
  ].filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

  const filteredRecipients = availableRecipients.filter((r) =>
    r.name.toLowerCase().includes(composeSearch.toLowerCase()) ||
    r.headline.toLowerCase().includes(composeSearch.toLowerCase())
  );

  const handleStartNewChat = (recipient: { id: string; name: string; headline: string; avatar: string; verified?: boolean }) => {
    // Check if conversation already exists
    const existing = conversations.find((c) => c.participantIds.includes(recipient.id));
    if (existing) {
      onSelectConversation(existing.id);
    } else {
      // Open an empty chat; it is saved once the first message is sent
      onStartChat?.(recipient.id, recipient.name, recipient.headline, recipient.avatar, !!recipient.verified);
    }
    setIsComposeModalOpen(false);
    setMobileShowThread(true);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] min-h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm flex overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
        mobileShowThread ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Sidebar Header */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 font-display">Messaging</h1>
            {totalUnread > 0 && (
              <span className="bg-teal-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {totalUnread} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsComposeModalOpen(true)}
              className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Compose New Message"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="p-3 bg-white border-b border-slate-100 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs pl-9 pr-3 py-2 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setFilterType('unread')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'unread'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Unread</span>
              {totalUnread > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              )}
            </button>
          </div>
        </div>

        {/* Conversations List Scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs">No conversations found.</p>
              <button
                onClick={() => setIsComposeModalOpen(true)}
                className="mt-3 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Start a clinical discussion
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConversation?.id === conv.id;
              const hasUnread = conv.unreadCount > 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-4 border-blue-700'
                      : 'hover:bg-slate-100/70 bg-white'
                  }`}
                >
                  {/* Avatar & Online status */}
                  <div className="relative shrink-0">
                    <img
                      src={conv.participant.avatar}
                      alt={conv.participant.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    {conv.participant.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  {/* Content snippet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 truncate">
                        <span className={`text-xs truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                          {conv.participant.name}
                        </span>
                        {conv.participant.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {conv.lastMessage.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {conv.participant.headline}
                    </p>

                    <div className="flex items-center justify-between mt-1 gap-2">
                      <p className={`text-xs truncate ${hasUnread ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                        {conv.lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                        {conv.lastMessage.text}
                      </p>

                      {hasUnread && (
                        <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 2. RIGHT PANEL: Active Chat Thread */}
      {activeConversation ? (
        <div className={`flex-1 flex flex-col bg-white ${
          mobileShowThread ? 'flex' : 'hidden md:flex'
        }`}>
          
          {/* Thread Header */}
          <div className="p-3.5 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileShowThread(false)}
                className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={activeConversation.participant.avatar}
                  alt={activeConversation.participant.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                {activeConversation.participant.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900">
                    {activeConversation.participant.name}
                  </h2>
                  {activeConversation.participant.verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                  {activeConversation.participant.headline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onViewProfile && (
                <button
                  onClick={onViewProfile}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
            
            {/* Connection Banner Note */}
            <div className="text-center py-4 px-6 max-w-md mx-auto bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <img
                src={activeConversation.participant.avatar}
                alt=""
                className="w-12 h-12 rounded-full mx-auto object-cover mb-2 border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <p className="text-xs font-bold text-slate-900">
                Connected with {activeConversation.participant.name}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeConversation.participant.headline}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-[10px] font-semibold text-teal-800 border border-teal-100">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                <span>Verified Peer-to-Peer Clinical Messaging</span>
              </div>
            </div>

            {/* Date divider */}
            <div className="flex items-center justify-center my-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100/90 px-3 py-1 rounded-full">
                Encrypted Clinical Channel
              </span>
            </div>

            {/* Messages */}
            {activeConversation.messages.map((msg, index) => {
              const isMe = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-blue-700 text-white rounded-br-xs font-normal'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Attachment preview if present */}
                    {msg.attachmentName && (
                      <div className={`mt-2.5 p-2.5 rounded-xl flex items-center gap-2.5 border ${
                        isMe
                          ? 'bg-blue-800/80 border-blue-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}>
                        <div className="w-8 h-8 rounded-lg bg-teal-600/20 text-teal-300 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-teal-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[11px] truncate">{msg.attachmentName}</p>
                          <span className="text-[9px] opacity-75">Clinical Protocol PDF</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Read Receipts */}
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {msg.timestamp}
                    </span>
                    {isMe && (
                      msg.isRead ? (
                        <span title="Read"><CheckCheck className="w-3 h-3 text-teal-600" /></span>
                      ) : (
                        <span title="Sent"><Check className="w-3 h-3 text-slate-400" /></span>
                      )
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Clinical Prompts Bar */}
          <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Quick Replies:
            </span>
            {clinicalPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setMessageInput(prompt)}
                className="text-[11px] bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Composer Dock */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Write a message to ${activeConversation.participant.name}...`}
                rows={2}
                className="flex-1 bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 resize-none focus:outline-none p-1"
              />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMessageInput((prev) => prev ? `${prev} [Attached Case Reference]` : '[Attached Case Reference]');
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  title="Attach clinical document"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                  className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    messageInput.trim()
                      ? 'bg-blue-700 text-white shadow-sm hover:bg-blue-800'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
              <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line</span>
              <span>PhysioLink Direct Messenger</span>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-white">
          <p className="text-sm font-semibold text-slate-700">No active conversation</p>
          <p className="text-xs text-slate-500 mt-1">Select a peer or colleague from the list to start chatting.</p>
        </div>
      )}

      {/* 3. COMPOSE NEW MESSAGE MODAL */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 font-display">New Message</h3>
              <button
                onClick={() => setIsComposeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Type a name or clinical specialty..."
                  value={composeSearch}
                  onChange={(e) => setComposeSearch(e.target.value)}
                  className="w-full bg-slate-50 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                Suggested Connections
              </p>
              {filteredRecipients.map((recipient) => (
                <div
                  key={recipient.id}
                  onClick={() => handleStartNewChat(recipient)}
                  className="p-2.5 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={recipient.avatar}
                      alt={recipient.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900">{recipient.name}</span>
                        {recipient.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[240px]">
                        {recipient.headline}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100">
                    Chat
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
