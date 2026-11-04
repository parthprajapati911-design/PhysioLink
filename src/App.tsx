import React, { useCallback, useEffect, useState } from 'react';
import {
  ViewTab,
  ViewportMode,
  UserProfile,
  Post,
  Opportunity,
  Connection,
  VerificationRequest,
  Conversation,
  ChatMessage
} from './types';
import { api, errorMessage } from './api';
import type { Bootstrap } from './api';
import { LOGO_URL } from './data/mockData';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { WelcomeAuthScreen } from './components/WelcomeAuthScreen';
import { FeedView } from './components/FeedView';
import { ProfileView } from './components/ProfileView';
import { NetworkView } from './components/NetworkView';
import { MessagingView } from './components/MessagingView';
import { FloatingMessagingWidget } from './components/FloatingMessagingWidget';
import { OpportunitiesView } from './components/OpportunitiesView';
import { ResearchHubView } from './components/ResearchHubView';
import { AdminView } from './components/AdminView';
import { CreatePostModal } from './components/CreatePostModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ApplyModal } from './components/ApplyModal';
import {
  Wifi,
  Battery,
  Monitor,
  PlusCircle,
  LogOut
} from 'lucide-react';

type AuthStatus = 'loading' | 'out' | 'in';

export default function App() {
  // Navigation & Viewport State
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [toast, setToast] = useState<string | null>(null);

  // Data loaded from the server
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileInitialTab, setEditProfileInitialTab] = useState<'general' | 'education' | 'skills'>('general');
  const [selectedOppForApply, setSelectedOppForApply] = useState<Opportunity | null>(null);

  // Only used after sign-in (the app shows the login screen until data is loaded)
  const currentUser = users[currentUserId] as UserProfile;

  const notify = (message: string) => setToast(message);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const applyBootstrap = useCallback((data: Bootstrap) => {
    setUsers(data.users);
    setCurrentUserId(data.me.id);
    setPosts(data.posts);
    setConnections(data.connections);
    setOpportunities(data.opportunities);
    setVerifications(data.verifications);
    setConversations(data.conversations);
    setActiveConversationId((prev) =>
      data.conversations.some((c) => c.id === prev) ? prev : (data.conversations[0]?.id ?? '')
    );
    setAuthStatus('in');
  }, []);

  const refresh = useCallback(async () => {
    applyBootstrap(await api.bootstrap());
  }, [applyBootstrap]);

  // Restore the session on page load
  useEffect(() => {
    refresh().catch(() => setAuthStatus('out'));
  }, [refresh]);

  // Pick up new chat messages every 15 seconds
  useEffect(() => {
    if (authStatus !== 'in') return;
    const timer = setInterval(async () => {
      try {
        const { conversations: fromServer } = await api.conversations();
        setConversations((prev) => {
          const serverIds = new Set(fromServer.map((c) => c.id));
          const localOnly = prev.filter((c) => !serverIds.has(c.id) && c.messages.length === 0);
          return [...localOnly, ...fromServer];
        });
      } catch {
        /* ignore temporary network errors */
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [authStatus]);

  // Run a server call; on failure show a message and re-sync with the server.
  const run = (promise: Promise<unknown>) => {
    promise.catch((e) => {
      notify(errorMessage(e));
      refresh().catch(() => undefined);
    });
  };

  // Resolve conversations dynamically for current user perspective
  const resolvedConversations: Conversation[] = currentUser
    ? conversations.map((conv) => {
        const otherId = conv.participantIds.find((id) => id !== currentUser.id) || conv.participant.id;
        const otherUser = users[otherId];
        const otherConn = connections.find((c) => c.id === otherId);

        const participant = otherUser ? {
          id: otherUser.id,
          name: otherUser.name,
          headline: otherUser.headline,
          avatar: otherUser.avatar,
          verified: otherUser.verifiedStatus === 'verified',
          isOnline: false,
          accountType: otherUser.accountType,
        } : otherConn ? {
          id: otherConn.id,
          name: otherConn.name,
          headline: otherConn.headline,
          avatar: otherConn.avatar,
          verified: otherConn.verified,
          isOnline: false,
          accountType: otherConn.accountType,
        } : conv.participant;

        const unreadCount = conv.messages.filter((m) => m.receiverId === currentUser.id && !m.isRead).length;

        return { ...conv, participant, unreadCount };
      })
    : [];

  const totalUnreadMessages = resolvedConversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // ---------- Auth ----------
  // These return an error message (or null on success) so the login form can show it.
  const handleLogin = async (identifier: string, password: string): Promise<string | null> => {
    try {
      await api.login(identifier, password);
      await refresh();
      return null;
    } catch (e) {
      return errorMessage(e);
    }
  };

  const handleSignUp = async (profile: UserProfile, password: string): Promise<string | null> => {
    try {
      await api.signup(profile, password);
      await refresh();
      return null;
    } catch (e) {
      return errorMessage(e);
    }
  };

  const handleSignOut = async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    setAuthStatus('out');
    setUsers({});
    setCurrentUserId('');
    setCurrentTab('home');
  };

  // ---------- Messaging ----------
  const handleSendMessage = (conversationId: string, text: string, attachmentName?: string) => {
    const existing = conversations.find((c) => c.id === conversationId);
    const otherId = existing?.participantIds.find((id) => id !== currentUser.id);
    if (!otherId) return;

    const tempId = `tmp_${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      senderId: currentUser.id,
      receiverId: otherId,
      text,
      timestamp: 'Just now',
      isRead: false,
      attachmentName,
      attachmentType: attachmentName ? 'document' : undefined,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: { text, timestamp: 'Just now', senderId: currentUser.id, isRead: true },
              messages: [...c.messages, optimistic],
            }
          : c
      )
    );

    api
      .sendMessage(otherId, text, attachmentName)
      .then(({ message }) =>
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, messages: c.messages.map((m) => (m.id === tempId ? message : m)) }
              : c
          )
        )
      )
      .catch((e) => {
        notify(errorMessage(e));
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, messages: c.messages.filter((m) => m.id !== tempId) } : c
          )
        );
      });
  };

  const handleMarkAsRead = (conversationId: string) => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;
    const hasUnread = conv.messages.some((m) => m.receiverId === currentUser.id && !m.isRead);
    if (!hasUnread) return;
    const otherId = conv.participantIds.find((id) => id !== currentUser.id);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              unreadCount: 0,
              messages: c.messages.map((m) => (m.receiverId === currentUser.id ? { ...m, isRead: true } : m)),
            }
          : c
      )
    );
    if (otherId) api.markRead(otherId).catch(() => undefined);
  };

  const handleOpenChatWithUser = (
    userId: string,
    name: string,
    headline: string,
    avatar: string,
    verified: boolean
  ) => {
    const existing = conversations.find((c) => c.participantIds.includes(userId));
    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      // Same id format the server uses, so the chat lines up once the first message is sent.
      const newConvId = `conv_${[currentUser.id, userId].sort().join('__')}`;
      const newConv: Conversation = {
        id: newConvId,
        participantIds: [currentUser.id, userId],
        participant: { id: userId, name, headline, avatar, verified, isOnline: false },
        lastMessage: { text: '', timestamp: '', senderId: currentUser.id, isRead: true },
        unreadCount: 0,
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConvId);
    }
    setCurrentTab('messaging');
  };

  const handleOpenEditProfile = (tab: 'general' | 'education' | 'skills' = 'general') => {
    setEditProfileInitialTab(tab);
    setIsEditProfileOpen(true);
  };

  const handleEndorseSkill = (targetUserId: string, skillName: string, isEndorsing: boolean) => {
    setUsers((prev) => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const updatedSkills = target.skills.map((skill) => {
        if (skill.name === skillName) {
          const delta = isEndorsing ? 1 : -1;
          const currentEndorsers = skill.endorsers || [];
          let updatedEndorsers = currentEndorsers;
          if (isEndorsing) {
            if (!currentEndorsers.some((e) => e.id === currentUser.id)) {
              updatedEndorsers = [
                {
                  id: currentUser.id,
                  name: currentUser.name,
                  headline: currentUser.headline,
                  avatar: currentUser.avatar,
                  verified: currentUser.verifiedStatus === 'verified',
                },
                ...currentEndorsers,
              ];
            }
          } else {
            updatedEndorsers = currentEndorsers.filter((e) => e.id !== currentUser.id);
          }
          return {
            ...skill,
            endorsements: Math.max(0, skill.endorsements + delta),
            endorsers: updatedEndorsers,
          };
        }
        return skill;
      });
      return { ...prev, [targetUserId]: { ...target, skills: updatedSkills } };
    });
    run(api.endorse(targetUserId, skillName, isEndorsing));
  };

  // ---------- Handlers ----------
  const handleToggleViewport = () => {
    setViewportMode((prev) => (prev === 'desktop' ? 'mobile' : 'desktop'));
  };

  const handleLikePost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const isLiked = !post.isLiked;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isLiked, likesCount: Math.max(0, p.likesCount + (isLiked ? 1 : -1)) } : p
      )
    );
    run(api.likePost(postId, isLiked));
  };

  const handleBookmarkPost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const isBookmarked = !post.isBookmarked;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isBookmarked, bookmarksCount: Math.max(0, p.bookmarksCount + (isBookmarked ? 1 : -1)) }
          : p
      )
    );
    run(api.bookmarkPost(postId, isBookmarked));
  };

  const handleAddComment = (postId: string, commentText: string) => {
    api
      .addComment(postId, commentText)
      .then(({ comment }) =>
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, commentsCount: p.commentsCount + 1, comments: [comment, ...p.comments] }
              : p
          )
        )
      )
      .catch((e) => notify(errorMessage(e)));
  };

  const handleCreatePost = (
    newPostData: Omit<
      Post,
      'id' | 'likesCount' | 'isLiked' | 'commentsCount' | 'comments' | 'bookmarksCount' | 'isBookmarked'
    >
  ) => {
    api
      .createPost(newPostData)
      .then(({ post }) => {
        setPosts((prev) => [post, ...prev]);
        setCurrentTab('home');
      })
      .catch((e) => notify(errorMessage(e)));
  };

  const handleSaveProfile = (updatedUser: UserProfile) => {
    setUsers((prev) => ({ ...prev, [updatedUser.id]: updatedUser }));
    api
      .saveProfile(updatedUser)
      .then(({ user }) => setUsers((prev) => ({ ...prev, [user.id]: user })))
      .catch((e) => {
        notify(errorMessage(e));
        refresh().catch(() => undefined);
      });
  };

  const handleAcceptConnection = (connectionId: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === connectionId ? { ...c, status: 'connected' } : c))
    );
    setUsers((prev) => ({
      ...prev,
      [currentUser.id]: { ...currentUser, connectionsCount: currentUser.connectionsCount + 1 },
    }));
    run(api.acceptConnection(connectionId));
  };

  const handleIgnoreConnection = (connectionId: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === connectionId ? { ...c, status: 'suggestion' } : c))
    );
    run(api.removeConnection(connectionId));
  };

  const handleConnectRequest = (connectionId: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === connectionId ? { ...c, status: 'requested' } : c))
    );
    run(api.requestConnection(connectionId));
  };

  const handleApplyOpportunity = (opportunityId: string) => {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === opportunityId
          ? { ...o, hasApplied: true, applicantsCount: o.applicantsCount + 1 }
          : o
      )
    );
    run(api.apply(opportunityId));
  };

  const reviewVerification = (reqId: string, status: 'approved' | 'rejected') => {
    const req = verifications.find((v) => v.id === reqId);
    setVerifications((prev) => prev.map((v) => (v.id === reqId ? { ...v, status } : v)));
    if (req) {
      setUsers((prev) =>
        prev[req.userId]
          ? { ...prev, [req.userId]: { ...prev[req.userId], verifiedStatus: status === 'approved' ? 'verified' : 'unverified' } }
          : prev
      );
    }
    run(status === 'approved' ? api.approveVerification(reqId) : api.rejectVerification(reqId));
  };

  const handleApproveVerification = (reqId: string) => reviewVerification(reqId, 'approved');
  const handleRejectVerification = (reqId: string) => reviewVerification(reqId, 'rejected');

  const isAdmin = currentUser?.accountType === 'admin';

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 text-sm">
        Loading PhysioLink…
      </div>
    );
  }

  if (authStatus === 'out' || !currentUser) {
    return <WelcomeAuthScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Global Modals */}
      <CreatePostModal
        currentUser={currentUser}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      <EditProfileModal
        user={currentUser}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
        initialTab={editProfileInitialTab}
      />

      <ApplyModal
        opportunity={selectedOppForApply}
        currentUser={currentUser}
        isOpen={!!selectedOppForApply}
        onClose={() => setSelectedOppForApply(null)}
        onSubmit={handleApplyOpportunity}
      />

      {/* VIEWPORT MODE 1: DESKTOP PROFESSIONAL WORKSPACE */}
      {viewportMode === 'desktop' ? (
        <div className="flex-1 flex flex-col relative">
          {/* Header */}
          <Header
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            viewportMode={viewportMode}
            onToggleViewport={handleToggleViewport}
            currentUser={currentUser}
            allUsers={users}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onSignOut={handleSignOut}
            unreadMessagesCount={totalUnreadMessages}
          />

          {/* Main Content Area */}
          <main className="flex-1 py-6 px-4 sm:px-6">
            {currentTab === 'home' && (
              <FeedView
                posts={posts}
                currentUser={currentUser}
                onLikePost={handleLikePost}
                onBookmarkPost={handleBookmarkPost}
                onAddComment={handleAddComment}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onViewProfile={() => setCurrentTab('profile')}
                onViewOpportunities={() => setCurrentTab('opportunities')}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                user={currentUser}
                onEditProfile={handleOpenEditProfile}
                onEndorseSkill={(skillName, isEndorsing) => handleEndorseSkill(currentUser.id, skillName, isEndorsing)}
                currentLoggedInUser={currentUser}
                onOpenChat={() => setCurrentTab('messaging')}
              />
            )}

            {currentTab === 'network' && (
              <NetworkView
                connections={connections}
                currentUser={currentUser}
                onAcceptConnection={handleAcceptConnection}
                onIgnoreConnection={handleIgnoreConnection}
                onConnectRequest={handleConnectRequest}
                onOpenChatWithUser={handleOpenChatWithUser}
              />
            )}

            {currentTab === 'messaging' && (
              <MessagingView
                conversations={resolvedConversations}
                activeConversationId={activeConversationId}
                onSelectConversation={setActiveConversationId}
                onSendMessage={handleSendMessage}
                currentUser={currentUser}
                connections={connections}
                allUsers={users}
                onViewProfile={() => setCurrentTab('profile')}
                onMarkAsRead={handleMarkAsRead}
                onStartChat={handleOpenChatWithUser}
              />
            )}

            {currentTab === 'opportunities' && (
              <OpportunitiesView
                opportunities={opportunities}
                currentUser={currentUser}
                onApply={(opp) => setSelectedOppForApply(opp)}
              />
            )}

            {currentTab === 'research' && (
              <ResearchHubView
                currentUser={currentUser}
                onOpenCreateStudy={() => setIsCreateModalOpen(true)}
              />
            )}

            {currentTab === 'admin' && isAdmin && (
              <AdminView
                verifications={verifications}
                onApproveVerification={handleApproveVerification}
                onRejectVerification={handleRejectVerification}
              />
            )}
          </main>

          {/* Persistent Floating LinkedIn-Style Messaging Widget */}
          <FloatingMessagingWidget
            conversations={resolvedConversations}
            currentUser={currentUser}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
            onSendMessage={handleSendMessage}
            onNavigateToMessagingTab={() => setCurrentTab('messaging')}
            onMarkAsRead={handleMarkAsRead}
          />

          {/* Desktop Footer */}
          <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img src={LOGO_URL} alt="" className="w-5 h-5 rounded object-cover" />
                <span className="font-bold text-slate-800">PhysioLink</span>
                <span>— The Network for Every Physiotherapist</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span>Council Verified Registry</span>
                <span>·</span>
                <span>Clinical Ethics & Patient Privacy</span>
                <span>·</span>
                <span>India & International</span>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        /* VIEWPORT MODE 2: MOBILE SMARTPHONE SIMULATOR FRAME */
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 bg-slate-900/90 min-h-screen">
          
          {/* Top Floating Simulator Controls */}
          <div className="mb-4 flex items-center justify-between gap-4 w-full max-w-sm px-2 text-white">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="font-semibold text-slate-200">Mobile Phone Viewport</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleViewport}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5 text-teal-400" />
                <span>Switch to Desktop</span>
              </button>
            </div>
          </div>

          {/* Smartphone Hardware Chassis */}
          <div className="w-full max-w-[410px] h-[840px] max-h-[92vh] bg-white rounded-[44px] shadow-2xl border-[10px] border-slate-800 overflow-hidden flex flex-col relative">
            
            {/* Phone Speaker Notch & Camera Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-36 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
            </div>

            {/* Mobile Status Bar */}
            <div className="bg-white/95 backdrop-blur px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-800 select-none shrink-0 z-40">
              <span>09:41</span>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Mobile Top App Bar */}
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 z-30">
              <div className="flex items-center gap-2">
                <img src={LOGO_URL} alt="" className="w-7 h-7 rounded-lg object-cover" />
                <div>
                  <span className="text-base font-bold text-slate-900 font-display leading-tight block">
                    PhysioLink
                  </span>
                  <span className="text-[9px] text-teal-700 font-semibold uppercase tracking-wider block">
                    Clinical Network
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-sm cursor-pointer"
                  title="Create Post"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                  title="Sign Out / Welcome Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mobile Scrollable View Canvas */}
            <div className="flex-1 overflow-y-auto p-3.5 pb-20 bg-slate-50">
              {currentTab === 'home' && (
                <FeedView
                  posts={posts}
                  currentUser={currentUser}
                  onLikePost={handleLikePost}
                  onBookmarkPost={handleBookmarkPost}
                  onAddComment={handleAddComment}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onViewProfile={() => setCurrentTab('profile')}
                  onViewOpportunities={() => setCurrentTab('opportunities')}
                />
              )}

              {currentTab === 'profile' && (
                <ProfileView
                  user={currentUser}
                  onEditProfile={handleOpenEditProfile}
                  onEndorseSkill={(skillName, isEndorsing) => handleEndorseSkill(currentUser.id, skillName, isEndorsing)}
                  currentLoggedInUser={currentUser}
                  onOpenChat={() => setCurrentTab('messaging')}
                />
              )}

              {currentTab === 'network' && (
                <NetworkView
                  connections={connections}
                  currentUser={currentUser}
                  onAcceptConnection={handleAcceptConnection}
                  onIgnoreConnection={handleIgnoreConnection}
                  onConnectRequest={handleConnectRequest}
                  onOpenChatWithUser={handleOpenChatWithUser}
                />
              )}

              {currentTab === 'messaging' && (
                <MessagingView
                  conversations={resolvedConversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={setActiveConversationId}
                  onSendMessage={handleSendMessage}
                  currentUser={currentUser}
                  connections={connections}
                  allUsers={users}
                  onViewProfile={() => setCurrentTab('profile')}
                  onMarkAsRead={handleMarkAsRead}
                  onStartChat={handleOpenChatWithUser}
                />
              )}

              {currentTab === 'opportunities' && (
                <OpportunitiesView
                  opportunities={opportunities}
                  currentUser={currentUser}
                  onApply={(opp) => setSelectedOppForApply(opp)}
                />
              )}

              {currentTab === 'research' && (
                <ResearchHubView
                  currentUser={currentUser}
                  onOpenCreateStudy={() => setIsCreateModalOpen(true)}
                />
              )}

              {currentTab === 'admin' && isAdmin && (
                <AdminView
                  verifications={verifications}
                  onApproveVerification={handleApproveVerification}
                  onRejectVerification={handleRejectVerification}
                />
              )}
            </div>

            {/* Mobile Native 5-Tab Bottom Navigation Bar */}
            <MobileBottomNav
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              currentUser={currentUser}
              unreadMessagesCount={totalUnreadMessages}
            />

          </div>

        </div>
      )}


      {toast && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw] bg-slate-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl"
        >
          {toast}
        </div>
      )}

    </div>
  );
}
