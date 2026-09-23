import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Bot,
  User as UserIcon,
  Search,
  Loader2,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { api } from '../services/api';
import { Conversation, Message } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { DifficultySelector } from '../components/DifficultySelector';
import { useToast } from '../context/ToastContext';

export const TutorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeIdFromUrl = searchParams.get('id');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(activeIdFromUrl);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { success, error } = useToast();

  const topicStarters = [
    'Explain Operating System Process Scheduling',
    'How does Dijkstra\'s Banker\'s Algorithm work?',
    'What is the difference between TCP and UDP?',
    'Explain Paging vs Segmentation in Memory Management',
  ];

  // Fetch all conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
      setSearchParams({ id: activeConversationId });
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const res = await api.getConversations();
      setConversations(res.conversations);
      if (res.conversations.length > 0 && !activeConversationId) {
        setActiveConversationId(res.conversations[0].id);
      }
    } catch (err: any) {
      error('Failed to load conversation history.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (id: string) => {
    try {
      const res = await api.getConversation(id);
      setMessages(res.conversation.messages || []);
    } catch (err: any) {
      error('Failed to load conversation messages.');
    }
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputMessage('');
    setSearchParams({});
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        handleNewConversation();
      }
      success('Conversation deleted.');
    } catch (err: any) {
      error('Failed to delete conversation.');
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversationId || 'pending',
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.sendChatMessage({
        conversationId: activeConversationId || undefined,
        message: textToSend,
        difficulty,
      });

      // Update active conversation ID if newly created
      if (!activeConversationId && res.conversationId) {
        setActiveConversationId(res.conversationId);
        setSearchParams({ id: res.conversationId });
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.userMessage,
        res.assistantMessage,
      ]);

      // Refresh conversations list to update titles/timestamps
      const convListRes = await api.getConversations();
      setConversations(convListRes.conversations);
    } catch (err: any) {
      error(err.message || 'Error processing response from AI Tutor.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    success('Copied response to clipboard!');
  };

  const handleRegenerate = async (lastUserMessageText: string) => {
    await handleSend(lastUserMessageText);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8.5rem)] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Left Conversation Sidebar */}
      <div className="w-72 sm:w-80 border-r border-slate-200/80 dark:border-slate-800 flex flex-col bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
        {/* New Session Button */}
        <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search Conversations */}
        <div className="p-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Loading sessions...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
                  activeConversationId === conv.id
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold border border-primary-200/70 dark:border-primary-800/60 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="truncate">{conv.title}</p>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 transition-opacity"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            /* Empty State & Topic Starters */
            <div className="max-w-2xl mx-auto py-10 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20 mb-4">
                <Bot className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                What are you studying today?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Ask any question, request concept explanations, or click a topic starter below.
              </p>

              {/* Topic Starters Grid */}
              <div className="mt-8 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Topic Starters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {topicStarters.map((starter, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(starter)}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/60 dark:hover:border-primary-500/60 bg-slate-50/50 dark:bg-slate-950/40 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 shadow-xs hover:shadow-sm transition-all"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${
                    isAssistant ? 'justify-start' : 'justify-end'
                  } animate-fade-in`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`relative max-w-2xl rounded-2xl p-4 sm:p-5 text-sm shadow-xs ${
                      isAssistant
                        ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-100'
                        : 'bg-primary-600 text-white rounded-br-xs font-medium'
                    }`}
                  >
                    {isAssistant ? (
                      <div>
                        <MarkdownRenderer content={msg.content} />
                        {/* Action buttons (Copy, Regenerate) */}
                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                          <span className="text-[10px]">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-[11px] text-emerald-500">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">Copy</span>
                                </>
                              )}
                            </button>
                            {index === messages.length - 1 && (
                              <button
                                onClick={() => {
                                  const prevUserMsg = messages
                                    .slice(0, index)
                                    .reverse()
                                    .find((m) => m.role === 'user');
                                  if (prevUserMsg) handleRegenerate(prevUserMsg.content);
                                }}
                                className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                                title="Regenerate response"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Regenerate</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        <p className="text-[10px] text-primary-200 text-right mt-1.5">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-1">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex gap-3 items-center text-xs font-semibold text-slate-400 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                <span>AI Tutor is formulating your explanation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Controls */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto space-y-2.5">
            {/* Difficulty Selector Bar */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tutor Depth Mode:
              </span>
              <div className="w-64">
                <DifficultySelector
                  value={difficulty}
                  onChange={setDifficulty}
                  label=""
                  size="sm"
                />
              </div>
            </div>

            {/* Input Box */}
            <div className="relative flex items-center">
              <textarea
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything about your studies... (e.g. 'Explain Operating System Process Scheduling')"
                className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none shadow-xs"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || isSending}
                className="absolute right-2 p-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-40 transition-all shadow-xs"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
