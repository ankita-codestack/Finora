
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Bot,
  ChartNoAxesCombined,
  Plus,
  Send,
  Sparkles,
  ArrowUpRight,
  FilePlus2,
  BarChart3,
  Clock3,
  Lightbulb,
  User,
  MessageSquare,
  Trash2,
  History,
} from "lucide-react";
import { apiRequest } from "../lib/api";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Invoices", icon: FileText, path: "/invoices" },
  { label: "Payments", icon: CreditCard, path: "/payments" },
  { label: "Clients", icon: Users, path: "/clients" },
  { label: "AI Assistant", icon: Bot, path: "/assistant" },
  { label: "Insights", icon: ChartNoAxesCombined, path: "/insights" },
];

const suggestions = [
  {
    icon: FilePlus2,
    title: "Create an invoice",
    description: "Generate an invoice from a simple description.",
    prompt: "I want to create an invoice",
  },
  {
    icon: BarChart3,
    title: "Analyze revenue",
    description: "Get a summary of your saved invoices.",
    prompt: "Give me a summary of my revenue",
  },
  {
    icon: Clock3,
    title: "Check pending payments",
    description: "Find invoices that still need to be paid.",
    prompt: "Show me my pending payments",
  },
];

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-4 text-xl font-bold text-[#101A2B]">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-lg font-bold text-[#101A2B]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-base font-semibold text-[#101A2B]">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-sm leading-7 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[#101A2B]">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 ml-5 list-disc space-y-2 text-sm leading-6">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-5 list-decimal space-y-2 text-sm leading-6">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-[#B7C7E2] pl-4 text-sm text-[#697586]">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-[#E5E9F0]" />,
  table: ({ children }) => (
    <div className="my-4 w-full overflow-x-auto rounded-lg border border-[#E5E9F0]">
      <table className="w-full min-w-[420px] border-collapse text-left text-xs">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#F3F5F8] text-[#101A2B]">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-[#E5E9F0] px-3 py-3 font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-[#EDF0F4] px-3 py-3 text-[#465367]">
      {children}
    </td>
  ),
  code: ({ children, className }) => (
    <code
      className={`rounded bg-[#F3F5F8] px-1.5 py-1 text-xs text-[#24407A] ${
        className || ""
      }`}
    >
      {children}
    </code>
  ),
};

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[250px] border-r border-[#E5E9F0] bg-white px-5 py-7 lg:block">
      <Link to="/" className="mb-10 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#24407A] text-white">
          <CreditCard size={19} />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#101A2B]">
          finora
        </span>
      </Link>

      <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#98A2B3]">
        Workspace
      </p>

      <nav className="space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => (
          <Link
            key={label}
            to={path}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              path === "/assistant"
                ? "bg-[#DFE6F3] text-[#24407A]"
                : "text-[#697586] hover:bg-[#F3F5F8] hover:text-[#101A2B]"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-7 left-5 right-5 rounded-xl bg-[#F3F5F8] p-4">
        <p className="text-sm font-semibold text-[#101A2B]">Need help?</p>
        <p className="mt-1 text-xs leading-5 text-[#697586]">
          Visit our help center for assistance.
        </p>
        <Link
          to="/dashboard"
          className="mt-3 inline-block text-xs font-semibold text-[#24407A]"
        >
          Back to workspace →
        </Link>
      </div>
    </aside>
  );
}

export default function Assistant() {
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeChatId, setActiveChatId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [openingChatId, setOpeningChatId] = useState(null);
  const [historyError, setHistoryError] = useState("");

  const loadConversations = async () => {
    try {
      const data = await apiRequest("/ai/conversations");
      setConversations(data.conversations || []);
      setHistoryError("");
    } catch (error) {
      console.error("Unable to load chat history:", error);
      setHistoryError("Unable to load chat history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (value = input) => {
    const message = value.trim();

    if (!message || loading || openingChatId) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: message,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await apiRequest("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          ...(activeChatId ? { chatId: activeChatId } : {}),
        }),
      });

      setActiveChatId(data.chatId);

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text:
            data.reply ||
            "I couldn't generate a response. Please try again.",
        },
      ]);

      await loadConversations();
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text:
            error.message ||
            "Unable to connect to Finora AI. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    if (loading || openingChatId) return;

    setMessages([]);
    setActiveChatId(null);
    setInput("");
  };

  const openConversation = async (chatId) => {
    if (loading || openingChatId) return;

    setOpeningChatId(chatId);

    try {
      const data = await apiRequest(`/ai/conversations/${chatId}`);
      const conversation = data.conversation;

      setActiveChatId(conversation._id);
      setMessages(
        (conversation.messages || []).map((message) => ({
          id: message._id || crypto.randomUUID(),
          role: message.role,
          text: message.text,
        }))
      );
      setInput("");
    } catch (error) {
      window.alert(error.message || "Unable to open this conversation.");
    } finally {
      setOpeningChatId(null);
    }
  };

  const deleteConversation = async (event, chatId) => {
    event.stopPropagation();

    if (loading || openingChatId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/ai/conversations/${chatId}`, {
        method: "DELETE",
      });

      setConversations((previous) =>
        previous.filter((chat) => chat._id !== chatId)
      );

      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
        setInput("");
      }
    } catch (error) {
      window.alert(error.message || "Unable to delete conversation.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F8] text-[#101A2B]">
      <Sidebar />

      <main className="min-h-screen lg:ml-[250px]">
        <header className="flex flex-col gap-4 border-b border-[#E5E9F0] bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-9">
          <div>
            <p className="text-xs text-[#8993A3]">
              Workspace / AI Assistant
            </p>
            <h1 className="mt-1 text-xl font-semibold">AI Assistant</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DFE6F3] text-sm font-semibold text-[#24407A]">
              AS
            </div>
            <div>
              <p className="text-sm font-semibold">Ankita Sharma</p>
              <p className="text-xs text-[#8993A3]">Workspace admin</p>
            </div>
          </div>
        </header>

        <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row">
          {/* Chat history panel */}
          <aside className="w-full shrink-0 rounded-2xl border border-[#E5E9F0] bg-white p-4 lg:sticky lg:top-6 lg:w-[250px] lg:self-start">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={17} className="text-[#24407A]" />
                <h2 className="text-sm font-semibold">Chat history</h2>
              </div>

              <span className="rounded-full bg-[#F3F5F8] px-2 py-1 text-[10px] text-[#8993A3]">
                {conversations.length}
              </span>
            </div>

            <button
              onClick={startNewChat}
              disabled={loading || Boolean(openingChatId)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#24407A] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1B3261] disabled:opacity-50"
            >
              <Plus size={15} />
              New conversation
            </button>

            <div className="max-h-[360px] space-y-1 overflow-y-auto lg:max-h-[calc(100vh-270px)]">
              {historyLoading ? (
                <p className="px-2 py-5 text-center text-xs text-[#8993A3]">
                  Loading conversations...
                </p>
              ) : conversations.length === 0 ? (
                <div className="px-2 py-6 text-center">
                  <MessageSquare
                    size={22}
                    className="mx-auto mb-2 text-[#B7C7E2]"
                  />
                  <p className="text-xs font-medium text-[#697586]">
                    No previous chats
                  </p>
                  <p className="mt-1 text-[11px] text-[#A0A8B5]">
                    Your conversations will appear here.
                  </p>
                </div>
              ) : (
                conversations.map((chat) => (
                  <div
                    key={chat._id}
                    className={`group flex items-center gap-1 rounded-lg transition ${
                      activeChatId === chat._id
                        ? "bg-[#DFE6F3]"
                        : "hover:bg-[#F3F5F8]"
                    }`}
                  >
                    <button
                      onClick={() => openConversation(chat._id)}
                      disabled={loading || Boolean(openingChatId)}
                      className="min-w-0 flex-1 px-3 py-2.5 text-left disabled:opacity-60"
                    >
                      <p className="truncate text-xs font-medium text-[#465367]">
                        {chat.title || "New Chat"}
                      </p>
                      <p className="mt-1 text-[10px] text-[#A0A8B5]">
                        {chat.updatedAt
                          ? new Date(chat.updatedAt).toLocaleDateString()
                          : ""}
                      </p>
                    </button>

                    {openingChatId === chat._id ? (
                      <span className="px-2 text-[10px] text-[#8993A3]">
                        ...
                      </span>
                    ) : (
                      <button
                        onClick={(event) =>
                          deleteConversation(event, chat._id)
                        }
                        disabled={loading || Boolean(openingChatId)}
                        title="Delete conversation"
                        aria-label="Delete conversation"
                        className="mr-1 rounded-md p-2 text-[#A0A8B5] opacity-100 transition hover:bg-white hover:text-red-500 disabled:opacity-40 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {historyError && (
              <p className="mt-3 text-xs text-red-500">{historyError}</p>
            )}
          </aside>

          {/* Main chat area */}
          <section className="flex min-h-[calc(100vh-180px)] min-w-0 flex-1 flex-col">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Your finance assistant
                </h2>
                <p className="mt-1 text-sm text-[#8993A3]">
                  Manage invoices and understand your finances.
                </p>
              </div>

              <button
                onClick={startNewChat}
                disabled={loading || Boolean(openingChatId)}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-[#E1E6ED] bg-white px-3 py-2 text-xs font-medium text-[#465367] hover:bg-[#F8F9FB] disabled:opacity-50"
              >
                <Plus size={15} /> New chat
              </button>
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center pb-8">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DFE6F3] text-[#24407A]">
                  <Sparkles size={30} />
                </div>

                <p className="mb-2 text-xs font-semibold uppercase tracking-[2px] text-[#24407A]">
                  Finora Intelligence
                </p>

                <h3 className="text-center text-3xl font-semibold tracking-tight">
                  How can I help you today?
                </h3>

                <p className="mt-3 max-w-md text-center text-sm leading-6 text-[#8993A3]">
                  Explore your invoices, check pending payments and manage
                  your financial workspace.
                </p>

                <div className="mt-9 grid w-full gap-3 md:grid-cols-3">
                  {suggestions.map(
                    ({ icon: Icon, title, description, prompt }) => (
                      <button
                        key={title}
                        onClick={() => sendMessage(prompt)}
                        disabled={loading || Boolean(openingChatId)}
                        className="group rounded-xl border border-[#E5E9F0] bg-white p-4 text-left transition hover:border-[#B7C7E2] hover:shadow-sm disabled:opacity-50"
                      >
                        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F5F8] text-[#24407A]">
                          <Icon size={18} />
                        </div>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-[#8993A3]">
                          {description}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-xs font-medium text-[#24407A]">
                          Try this
                          <ArrowUpRight
                            size={15}
                            className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-6 pb-8">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DFE6F3] text-[#24407A]">
                        <Bot size={19} />
                      </div>
                    )}

                    <div
                      className={`min-w-0 max-w-[90%] overflow-hidden rounded-2xl px-4 py-3 sm:max-w-[85%] ${
                        message.role === "user"
                          ? "bg-[#24407A] text-white"
                          : "border border-[#E5E9F0] bg-white text-[#465367]"
                      }`}
                    >
                      <div className="mb-3 flex items-center gap-2 text-xs opacity-70">
                        {message.role === "user" ? (
                          <>
                            <User size={13} /> You
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} /> Finora Assistant
                          </>
                        )}
                      </div>

                      {message.role === "user" ? (
                        <p className="whitespace-pre-line text-sm leading-6">
                          {message.text}
                        </p>
                      ) : (
                        <div className="break-words">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DFE6F3] text-[#24407A]">
                      <Bot size={19} />
                    </div>
                    <div className="rounded-xl border border-[#E5E9F0] bg-white px-4 py-3 text-sm text-[#8993A3]">
                      Finora AI is analyzing your financial data...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="rounded-2xl border border-[#DCE3ED] bg-white p-3 shadow-sm"
            >
              <textarea
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about invoices, payments or your finances..."
                className="w-full resize-none bg-transparent px-3 py-2 text-sm text-[#101A2B] outline-none placeholder:text-[#A0A8B5]"
              />

              <div className="flex items-center justify-between border-t border-[#EDF0F4] pt-3">
                <span className="text-[11px] text-[#A0A8B5]">
                  Powered by Groq AI · Live MongoDB financial data
                </span>

                <button
                  type="submit"
                  disabled={!input.trim() || loading || Boolean(openingChatId)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#24407A] text-white transition hover:bg-[#1B3261] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#A0A8B5]">
              <Lightbulb size={12} />
              Review financial information before taking action.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
