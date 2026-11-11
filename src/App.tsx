import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ViewTab,
  UserProfile,
  Post,
  Opportunity,
  NewOpportunity,
  Connection,
  VerificationRequest,
  Conversation,
  ChatMessage,
  AppNotification
} from './types';
import { api, errorMessage } from './api';
import type { Bootstrap, AdminStats } from './api';
import { LOGO_URL, BRAND_NAME, TAGLINE } from './data/brand';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { WelcomeAuthScreen } from './components/WelcomeAuthScreen';
import { FeedView } from './components/FeedView';
import { ProfileView } from './components/ProfileView';
import { NetworkView } from './components/NetworkView';
import { MessagingView } from './components/MessagingView';
import { FloatingMessagingWidget } from './components/FloatingMessagingWidget';
import { OpportunitiesView } from './components/OpportunitiesView';
import { AdminView } from './components/AdminView';
import { CreatePostModal } from './components/CreatePostModal';
import { PhoneVerifyModal } from './components/PhoneVerifyModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ApplyModal } from './components/ApplyModal';
type AuthStatus = 'loading' | 'out' | 'in';

export default function App() {
  // Navigation & Viewport State
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [toast, setToast] = useState<string | null>(null);

  // Data loaded from the server
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const mutationRef = useRef(0); // bumps on every connection action so stale background polls are ignored
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedOppForApply, setSelectedOppForApply] = useState<Opportunity | null>(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);

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
    setAdminStats(data.adminStats ?? null);
    setConversations(data.conversations);
    setNotifications(data.notifications || []);
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

  // Pick up new chat messages every 8 seconds
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
    }, 8000);
    return () => clearInterval(timer);
  }, [authStatus]);

  // Quietly refresh people, posts, requests, notifications and jobs every 20 seconds and when you return to the tab,
  // so new activity shows up without reloading the page.
  useEffect(() => {
    if (authStatus !== 'in') return;
    let busy = false;
    const sync = async () => {
      if (busy || document.hidden) return;
      busy = true;
      const stamp = mutationRef.current;
      try {
        const data = await api.bootstrap();
        if (stamp !== mutationRef.current) return;
        setUsers(data.users);
        setPosts(data.posts);
        setConnections(data.connections);
        setOpportunities(data.opportunities);
        setVerifications(data.verifications);
        setAdminStats(data.adminStats ?? null);
        setNotifications(data.notifications || []);
      } catch {
        /* ignore temporary network errors */
      } finally {
        busy = false;
      }
    };
    const timer = setInterval(sync, 20000);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [authStatus]);

  // Connection requests and notifications: check every 5 seconds (and when you return to the tab),
  // so a request sent by someone else appears on your side almost immediately.
  useEffect(() => {
    if (authStatus !== 'in') return;
    let busy = false;
    let seen: Set<string> | null = null;
    const poll = async () => {
      if (busy || document.hidden) return;
      busy = true;
      const stamp = mutationRef.current;
      try {
        const d = await api.network();
        if (stamp !== mutationRef.current) return;
        setConnections(d.connections);
        setNotifications(d.notifications);
        // Something new happened (a connection posted, accepted, liked...): refresh posts and people right away.
        const ids = new Set(d.notifications.map((n) => n.id));
        const fresh = seen !== null && d.notifications.some((n) => !seen!.has(n.id));
        seen = ids;
        if (fresh) {
          const data = await api.bootstrap();
          setUsers(data.users);
          setPosts(data.posts);
        }
      } catch {
        /* ignore temporary network errors */
      } finally {
        busy = false;
      }
    };
    const timer = setInterval(poll, 5000);
    document.addEventListener('visibilitychange', poll);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', poll); };
  }, [authStatus]);

  // Run a server call; on failure show a message and re-sync with the server.
  // Connection actions: wait for the server, then reload connections, counts and notifications.
  // Background polls that started before the action are ignored so they cannot undo it.
  const afterConnectionChange = async (promise: Promise<unknown>) => {
    mutationRef.current++;
    try {
      await promise;
    } catch (e) {
      notify(errorMessage(e));
    }
    try {
      const d = await api.bootstrap();
      setUsers(d.users);
      setConnections(d.connections);
      setNotifications(d.notifications || []);
    } catch {
      /* the next poll will catch up */
    }
    mutationRef.current++;
  };

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
  const handleLogin = async (email: string, password: string): Promise<string | null> => {
    try {
      await api.login(email, password);
      await refresh();
      return null;
    } catch (e) {
      return errorMessage(e);
    }
  };

  const handleSignUp = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      await api.signup(name, email, password);
      await refresh();
      setCurrentTab('profile');
      return null;
    } catch (e) {
      return errorMessage(e);
    }
  };

  const handleResetPassword = async (phone: string, code: string, password: string): Promise<string | null> => {
    try {
      await api.resetPassword(phone, code, password);
      await refresh();
      return null;
    } catch (e) {
      return errorMessage(e);
    }
  };

  // Link from the reset email: https://site/?reset=<token>
  const [resetToken, setResetToken] = useState<string | null>(() => {
    const t = new URLSearchParams(window.location.search).get('reset');
    return t && /^[a-f0-9]{64}$/.test(t) ? t : null;
  });
  const leaveResetLink = () => {
    setResetToken(null);
    window.history.replaceState({}, '', window.location.pathname);
  };
  const handleResetByLink = async (token: string, password: string): Promise<string | null> => {
    try {
      await api.resetEmail(token, password);
      leaveResetLink();
      await refresh();
      return null;
    } catch (e) {
      return errorMessage(e);
    }
  };

  const handleGoogle = async (credential: string): Promise<string | null> => {
    try {
      await api.googleSignIn(credential);
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
    // Chat is only for accepted connections.
    if (connections.find((c) => c.id === userId)?.status !== 'connected') {
      notify('You can message this person once they accept your connection request.');
      return;
    }
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
    setViewedUserId(null);
    setCurrentTab('messaging');
    window.scrollTo(0, 0);
  };

  const handleOpenEditProfile = () => setIsEditProfileOpen(true);

  // ---------- Handlers ----------
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

  // Returns the promise so the post window can show an error and stay open if it fails.
  const handleCreatePost = (data: { type: string; content: string; imageUrl?: string }) =>
    api.createPost(data).then(({ post }) => {
      setPosts((prev) => [post, ...prev]);
      setCurrentTab('home');
    });

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    run(api.deletePost(postId));
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
    setNotifications((prev) => prev.filter((n) => !(n.type === 'connection_request' && n.actorId === connectionId)));
    afterConnectionChange(api.acceptConnection(connectionId));
  };

  const handleIgnoreConnection = (connectionId: string) => {
    setNotifications((prev) => prev.filter((n) => !(n.type === 'connection_request' && n.actorId === connectionId)));
    setConnections((prev) =>
      prev.map((c) => (c.id === connectionId ? { ...c, status: 'suggestion' } : c))
    );
    afterConnectionChange(api.removeConnection(connectionId));
  };

  // Withdraw a sent request, or remove an existing connection.
  const handleRemoveConnection = (connectionId: string) => {
    const wasConnected = connections.find((c) => c.id === connectionId)?.status === 'connected';
    setConnections((prev) =>
      prev.map((c) => (c.id === connectionId ? { ...c, status: 'suggestion' } : c))
    );
    if (wasConnected) {
      setUsers((prev) => ({
        ...prev,
        [currentUser.id]: { ...currentUser, connectionsCount: Math.max(0, currentUser.connectionsCount - 1) },
      }));
    }
    afterConnectionChange(api.removeConnection(connectionId));
  };

  const handleConnectRequest = (connectionId: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === connectionId ? { ...c, status: 'requested' } : c))
    );
    afterConnectionChange(api.requestConnection(connectionId));
  };

  const handleApplyOpportunity = (opportunityId: string, note: string, phone: string) => {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === opportunityId
          ? { ...o, hasApplied: true, applicantsCount: o.applicantsCount + 1 }
          : o
      )
    );
    run(api.apply(opportunityId, note, phone));
  };

  // Returns the promise so the form can show an error and stay open if it fails.
  const handleCreateOpportunity = (opp: NewOpportunity) =>
    api.createOpportunity(opp).then(() => refresh());

  const handleDeleteOpportunity = (id: string) => {
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    run(api.deleteOpportunity(id));
  };

  // ---------- Notifications ----------
  const handleOpenNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    api.markNotificationsRead().catch(() => undefined);
  };

  const handlePickNotification = (n: AppNotification) => {
    if (n.type === 'connection_request') selectTab('network');
    else if (n.type === 'connection_accepted') openProfile(n.actorId);
    else if (n.type === 'post') openProfile(n.actorId);
    else selectTab('home');
  };

  // ---------- Navigation ----------
  const selectTab = (tab: ViewTab) => {
    setViewedUserId(null);
    setCurrentTab(tab);
    window.scrollTo(0, 0);
  };

  const openProfile = (userId: string) => {
    setViewedUserId(currentUser && userId === currentUser.id ? null : userId);
    setCurrentTab('profile');
    window.scrollTo(0, 0);
  };

  const handleMessageUser = (u: UserProfile) => {
    handleOpenChatWithUser(u.id, u.name, u.headline, u.avatar, u.verifiedStatus === 'verified');
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
  const pendingInvitesCount = connections.filter((c) => c.status === 'pending').length;

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 text-sm">
        Loading PhysioLink…
      </div>
    );
  }

  if (authStatus === 'out' || !currentUser) {
    return <WelcomeAuthScreen onLogin={handleLogin} onSignUp={handleSignUp} onGoogle={handleGoogle} onResetPassword={handleResetPassword} resetToken={resetToken} onResetByLink={handleResetByLink} onLeaveResetLink={leaveResetLink} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      <EditProfileModal
        user={currentUser}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <PhoneVerifyModal
        user={currentUser}
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        onChanged={() => { refresh().catch(() => undefined); }}
      />

      <ApplyModal
        opportunity={selectedOppForApply}
        currentUser={currentUser}
        isOpen={!!selectedOppForApply}
        onClose={() => setSelectedOppForApply(null)}
        onSubmit={handleApplyOpportunity}
      />

      <div className="flex-1 flex flex-col relative">
        <Header
          currentTab={currentTab}
          onSelectTab={selectTab}
          currentUser={currentUser}
          allUsers={users}
          onViewProfile={openProfile}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          unreadMessagesCount={totalUnreadMessages}
          pendingInvitesCount={pendingInvitesCount}
          notifications={notifications}
          onOpenNotifications={handleOpenNotifications}
          onPickNotification={handlePickNotification}
          onAcceptConnection={handleAcceptConnection}
          onIgnoreConnection={handleIgnoreConnection}
        />

        <main className="flex-1 py-6 px-4 sm:px-6 pb-24 md:pb-6">
          {currentTab === 'home' && (
            <FeedView
              posts={posts}
              currentUser={currentUser}
              onLikePost={handleLikePost}
              onBookmarkPost={handleBookmarkPost}
              onAddComment={handleAddComment}
              onDeletePost={handleDeletePost}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onViewProfile={openProfile}
              onEditProfile={() => { setViewedUserId(null); setCurrentTab('profile'); handleOpenEditProfile(); }}
              onVerifyPhone={() => setIsPhoneOpen(true)}
              connections={connections}
              onConnect={handleConnectRequest}
              onOpenNetwork={() => selectTab('network')}
            />
          )}

          {currentTab === 'profile' && (() => {
            const shown = (viewedUserId && users[viewedUserId]) || currentUser;
            const isOwn = shown.id === currentUser.id;
            return (
              <ProfileView
                key={shown.id}
                user={shown}
                currentUser={currentUser}
                isOwn={isOwn}
                posts={posts.filter((p) => p.authorId === shown.id)}
                connectionStatus={connections.find((c) => c.id === shown.id)?.status}
                onEditProfile={handleOpenEditProfile}
                onOpenPhone={() => setIsPhoneOpen(true)}
                onSignOut={handleSignOut}
                onBack={() => selectTab('home')}
                onConnect={handleConnectRequest}
                onAcceptConnection={handleAcceptConnection}
                onMessage={handleMessageUser}
                onLikePost={handleLikePost}
                onBookmarkPost={handleBookmarkPost}
                onAddComment={handleAddComment}
                onDeletePost={handleDeletePost}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
              />
            );
          })()}

          {currentTab === 'network' && (
            <NetworkView
              connections={connections}
              currentUser={currentUser}
              onAcceptConnection={handleAcceptConnection}
              onIgnoreConnection={handleIgnoreConnection}
              onConnectRequest={handleConnectRequest}
              onRemoveConnection={handleRemoveConnection}
              onOpenChatWithUser={(...args) => handleOpenChatWithUser(...args)}
              onViewProfile={openProfile}
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
              onViewProfile={openProfile}
              onMarkAsRead={handleMarkAsRead}
              onStartChat={handleOpenChatWithUser}
            />
          )}

          {currentTab === 'opportunities' && (
            <OpportunitiesView
              opportunities={opportunities}
              currentUser={currentUser}
              onApply={(opp) => setSelectedOppForApply(opp)}
              onCreate={handleCreateOpportunity}
              onDelete={handleDeleteOpportunity}
              onViewProfile={openProfile}
            />
          )}

          {currentTab === 'admin' && isAdmin && (
            <AdminView
              verifications={verifications}
              stats={adminStats}
              onApproveVerification={handleApproveVerification}
              onRejectVerification={handleRejectVerification}
            />
          )}
        </main>

        <div className="hidden md:block">
          <FloatingMessagingWidget
            conversations={resolvedConversations}
            currentUser={currentUser}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
            onSendMessage={handleSendMessage}
            onNavigateToMessagingTab={() => setCurrentTab('messaging')}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>

        <footer className="bg-white border-t border-slate-200 py-5 pb-20 md:pb-5 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-2 text-center flex-wrap">
            <img src={LOGO_URL} alt="" className="w-6 h-6 object-contain" />
            <span className="font-bold text-slate-800">{BRAND_NAME}</span>
            <span>— {TAGLINE}</span>
          </div>
        </footer>

        <MobileBottomNav
          currentTab={currentTab}
          onSelectTab={selectTab}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          currentUser={currentUser}
          unreadMessagesCount={totalUnreadMessages}
          pendingInvitesCount={pendingInvitesCount}
        />
      </div>

      {toast && (
        <div
          role="alert"
          className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw] bg-slate-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
