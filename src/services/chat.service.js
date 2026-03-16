import { toast } from 'react-toastify';
import api from './api';


const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;
const BATCH_SIZE = 20; // Number of messages to fetch per request
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handleError = (error, retryCount = 0) => {
  console.error('Chat service error:', error);
  const shouldRetry = error.message?.includes('token expired') || 
                     error.message?.includes('network error');
  return {
    shouldRetry,
    retryCount: retryCount + 1
  };
};

const messageCache = new Map();
const conversationCache = new Map();
let fetchConversationsPromise = null;

export const chatService = {
  async checkAuth() {
    const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const rawUser = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null;
    const userData = rawUser ? JSON.parse(rawUser) : null;
    if (!userData) {
      throw new Error('Invalid user data');
    }

    return { user: userData, provider: 'backend' };
  },

  async fetchConversations(options = {}) {
    // Accept either a options object or a simple retry count for backwards compatibility
    const { forceRefresh = false, retryCount = 0 } = typeof options === 'object' ? options : { forceRefresh: false, retryCount: options || 0 };

    const attemptFetch = async (attemptRetryCount) => {
      try {
        const { user } = await this.checkAuth();
        if (!user) return [];

        // Return cached data if still fresh and we are not forcing a refresh
        const cachedData = conversationCache.get('conversations');
        if (!forceRefresh && cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
          console.log('Returning cached conversations');
          return cachedData.conversations;
        }

        console.log('Fetching fresh conversations');

        // Use backend API
        const response = await api.get('/chat/conversations');
        const conversations = response.data?.data || [];

        // Process conversations to ensure last_message is set correctly
        const processedConversations = conversations.map(conv => {
          if (Array.isArray(conv.messages) && conv.messages.length > 0) {
            return {
              ...conv,
              last_message: conv.messages[conv.messages.length - 1]
            };
          }
          return conv;
        });

        // Cache the conversations
        conversationCache.set('conversations', {
          conversations: processedConversations,
          timestamp: Date.now()
        });

        return processedConversations;
      } catch (error) {
        const { shouldRetry, retryCount: newRetryCount } = handleError(error, attemptRetryCount);
        if (shouldRetry && newRetryCount <= MAX_RETRIES) {
          await sleep(RETRY_DELAY * newRetryCount);
          return attemptFetch(newRetryCount);
        }
        throw error;
      }
    };

    if (fetchConversationsPromise) {
      console.log('Reusing in-flight conversations fetch');
      return fetchConversationsPromise;
    }

    fetchConversationsPromise = attemptFetch(retryCount).finally(() => {
      fetchConversationsPromise = null;
    });

    return fetchConversationsPromise;
  },

  async fetchMessages(conversationId, retryCount = 0) {
    try {
      const { user } = await this.checkAuth();
      if (!user) return [];

      // Use backend API
      const response = await api.get(`/chat/messages/${conversationId}`);
      const messages = response.data?.data || [];

      // Update cache with fresh messages
      messageCache.set(conversationId, {
        messages,
        timestamp: Date.now()
      });

      return messages;
    } catch (error) {
      const { shouldRetry, retryCount: newRetryCount } = handleError(error, retryCount);
      if (shouldRetry && newRetryCount <= MAX_RETRIES) {
        await sleep(RETRY_DELAY * newRetryCount);
        return this.fetchMessages(conversationId, newRetryCount);
      }
      throw error;
    }
  },

  async sendMessage(content, conversationId, retryCount = 0) {
    try {
      const { user } = await this.checkAuth();
      if (!user) return null;

      // Use backend API
      const response = await api.post('/chat/messages', {
        conversationId,
        content
      });
      const newMessage = response.data?.data;

      if (newMessage) {
        // Update message cache
        const cachedData = messageCache.get(conversationId);
        if (cachedData?.messages) {
          messageCache.set(conversationId, {
            messages: [...cachedData.messages, newMessage],
            timestamp: Date.now()
          });
        }

        // Update conversation cache
        const conversationsData = conversationCache.get('conversations');
        if (conversationsData?.conversations) {
          const updatedConversations = conversationsData.conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [...(conv.messages || []), newMessage],
                last_message: newMessage, // Set last_message to the new message
                updated_at: new Date().toISOString()
              };
            }
            return conv;
          });

          conversationCache.set('conversations', {
            conversations: updatedConversations,
            timestamp: Date.now()
          });
        }
      }

      return newMessage;
    } catch (error) {
      const { shouldRetry, retryCount: newRetryCount } = handleError(error, retryCount);
      if (shouldRetry && newRetryCount <= MAX_RETRIES) {
        await sleep(RETRY_DELAY * newRetryCount);
        return this.sendMessage(content, conversationId, newRetryCount);
      }
      throw error;
    }
  },

  async searchUsers(query, retryCount = 0) {
    try {
      const { user } = await this.checkAuth();
      if (!user) return [];

      const response = await api.get(`/chat/users/search?query=${encodeURIComponent(query)}`);
      return response.data?.data || [];
    } catch (error) {
      const { shouldRetry, retryCount: newRetryCount } = handleError(error, retryCount);
      if (shouldRetry && newRetryCount <= MAX_RETRIES) {
        await sleep(RETRY_DELAY * newRetryCount);
        return this.searchUsers(query, newRetryCount);
      }
      throw error;
    }
  },

  async startConversation(participant_id, property_id = null, retryCount = 0) {
    try {
      const { user } = await this.checkAuth();
      if (!user) {
        throw new Error('Authentication required');
      }

      if (!participant_id) {
        throw new Error('Participant ID is required');
      }

      // Prevent starting conversation with yourself
      if (participant_id === user.id) {
        throw new Error('Cannot create conversation with yourself');
      }

      // Use backend API
      const response = await api.post('/chat/conversations', {
        participant_id: participant_id,
        property_id: property_id || null
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create conversation');
      }

      const newConversation = response.data?.data;

      if (!newConversation) {
        throw new Error('No conversation data received');
      }

      // Update conversation cache
      const cachedData = conversationCache.get('conversations');
      if (cachedData?.conversations) {
        // Check if conversation already exists in cache
        const exists = cachedData.conversations.some(conv => conv.id === newConversation.id);
        if (!exists) {
          conversationCache.set('conversations', {
            conversations: [newConversation, ...cachedData.conversations],
            timestamp: Date.now()
          });
        }
      }

      return newConversation;
    } catch (error) {
      console.error('Chat service error:', error);
      const { shouldRetry, retryCount: newRetryCount } = handleError(error, retryCount);
      if (shouldRetry && newRetryCount <= MAX_RETRIES) {
        await sleep(RETRY_DELAY * newRetryCount);
        return this.startConversation(participant_id, property_id, newRetryCount);
      }
      throw error;
    }
  },

  async markMessagesAsRead(conversationId, retryCount = 0) {
    try {
      const { user } = await this.checkAuth();
      if (!user) return;

      // Use backend API
      await api.put(`/chat/messages/read/${conversationId}`);
    } catch (error) {
      const { shouldRetry, retryCount: newRetryCount } = handleError(error, retryCount);
      if (shouldRetry && newRetryCount <= MAX_RETRIES) {
        await sleep(RETRY_DELAY * newRetryCount);
        return this.markMessagesAsRead(conversationId, newRetryCount);
      }
      throw error;
    }
  },

  async getUnreadCount(retryCount = 0) {
    try {
      const { user } = await this.checkAuth();
      if (!user) return 0;

      const response = await api.get('/chat/messages/unread/count');
      return response.data?.count || 0;
    } catch (error) {
      const { shouldRetry, retryCount: newRetryCount } = handleError(error, retryCount);
      if (shouldRetry && newRetryCount <= MAX_RETRIES) {
        await sleep(RETRY_DELAY * newRetryCount);
        return this.getUnreadCount(newRetryCount);
      }
      return 0;
    }
  },

  async deleteChatHistory(conversationId, retryCount = 0) {
    try {
      const { user } = await this.checkAuth();
      if (!user) return false;

      await api.delete(`/chat/conversations/${conversationId}`);
      this.clearConversationCache(conversationId);
      return true;
    } catch (error) {
      const { shouldRetry, retryCount: newRetryCount } = handleError(error, retryCount);
      if (shouldRetry && newRetryCount <= MAX_RETRIES) {
        await sleep(RETRY_DELAY * newRetryCount);
        return this.deleteChatHistory(conversationId, newRetryCount);
      }
      throw error;
    }
  },

  clearConversationCache(conversationId) {
    messageCache.delete(conversationId);
    conversationCache.delete('conversations');
  },

  clearAllCache() {
    messageCache.clear();
    conversationCache.clear();
  }
}; 