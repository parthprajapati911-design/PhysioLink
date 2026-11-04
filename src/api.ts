import type {
  UserProfile, Post, PostComment, Opportunity, Connection,
  VerificationRequest, Conversation, ChatMessage,
} from './types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface Bootstrap {
  me: UserProfile;
  users: Record<string, UserProfile>;
  posts: Post[];
  opportunities: Opportunity[];
  connections: Connection[];
  verifications: VerificationRequest[];
  conversations: Conversation[];
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your internet connection.');
  }
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) throw new ApiError(res.status, data?.error || 'Something went wrong. Please try again.');
  return data as T;
}

export const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : 'Something went wrong. Please try again.';

export const api = {
  // auth
  login: (identifier: string, password: string) =>
    request<{ ok: true }>('POST', '/api/auth/login', { identifier, password }),
  signup: (profile: UserProfile, password: string) =>
    request<{ ok: true }>('POST', '/api/auth/signup', { profile, password }),
  logout: () => request<{ ok: true }>('POST', '/api/auth/logout'),
  bootstrap: () => request<Bootstrap>('GET', '/api/bootstrap'),

  // profile
  saveProfile: (profile: UserProfile) =>
    request<{ user: UserProfile }>('PUT', '/api/me', { profile }),
  endorse: (userId: string, skill: string, value: boolean) =>
    request<{ ok: true }>('POST', `/api/users/${encodeURIComponent(userId)}/endorse`, { skill, value }),

  // posts
  createPost: (post: unknown) => request<{ post: Post }>('POST', '/api/posts', post),
  likePost: (id: string, value: boolean) =>
    request<{ count: number }>('PUT', `/api/posts/${encodeURIComponent(id)}/like`, { value }),
  bookmarkPost: (id: string, value: boolean) =>
    request<{ count: number }>('PUT', `/api/posts/${encodeURIComponent(id)}/bookmark`, { value }),
  addComment: (id: string, content: string) =>
    request<{ comment: PostComment }>('POST', `/api/posts/${encodeURIComponent(id)}/comments`, { content }),

  // network
  requestConnection: (userId: string) =>
    request<{ status: string }>('POST', `/api/connections/${encodeURIComponent(userId)}/request`),
  acceptConnection: (userId: string) =>
    request<{ status: string }>('POST', `/api/connections/${encodeURIComponent(userId)}/accept`),
  removeConnection: (userId: string) =>
    request<{ ok: true }>('DELETE', `/api/connections/${encodeURIComponent(userId)}`),

  // messages
  conversations: () => request<{ conversations: Conversation[] }>('GET', '/api/conversations'),
  sendMessage: (receiverId: string, text: string, attachmentName?: string) =>
    request<{ message: ChatMessage }>('POST', '/api/messages', { receiverId, text, attachmentName }),
  markRead: (userId: string) =>
    request<{ ok: true }>('POST', `/api/conversations/${encodeURIComponent(userId)}/read`),

  // opportunities & admin
  apply: (opportunityId: string) =>
    request<{ ok: true }>('POST', `/api/opportunities/${encodeURIComponent(opportunityId)}/apply`),
  approveVerification: (id: string) =>
    request<{ userId: string }>('POST', `/api/admin/verifications/${encodeURIComponent(id)}/approve`),
  rejectVerification: (id: string) =>
    request<{ userId: string }>('POST', `/api/admin/verifications/${encodeURIComponent(id)}/reject`),
};
