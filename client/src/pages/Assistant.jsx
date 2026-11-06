
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  RotateCcw,
} from "lucide-react";
import { getStoredInvoices, formatMoney } from "../lib/invoiceStorage";

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

function getAssistantReply(message, invoices) {
  const text = message.toLowerCase();

  if (
    text.includes("create") ||
    text.includes("new invoice") ||
    text.includes("generate invoice")
  ) {
    return {
      text: "I can help you prepare an invoice. Open the invoice form to enter your client's details, items, tax and due date. You can review everything before saving.",
      action: "Create invoice",
      path: "/create-invoice",
    };
  }

  if (
    text.includes("pending") ||
    text.includes("unpaid") ||
    text.includes("overdue")
  ) {
    const today = new Date().toISOString().slice(0, 10);

    const pending = invoices.filter((invoice) => {
      if (invoice.status === "Paid") return false;
      return (
        invoice.status === "Pending" ||
        invoice.status === "Overdue" ||
        (invoice.dueDate && invoice.dueDate < today)
      );
    });

    const total = pending.reduce(
      (sum, invoice) => sum + invoice.totalCents,
      0
    );

    if (pending.length === 0) {
      return {
        text: "There are no pending or overdue invoices in your saved invoice records.",
      };
    }

    const details = pending
      .slice(0, 5)
      .map(
        (invoice) =>
          `${invoice.id} — ${invoice.client} — ${formatMoney(
            invoice.totalCents,
            invoice.currency
          )}`
      )
      .join("\n");

    return {
      text: `You have ${pending.length} unpaid invoice(s).\n\n${details}\n\nTotal outstanding (mixed currencies, if applicable): ${total} cents. Check each invoice currency before treating this as one combined amount.`,
      action: "View invoices",
      path: "/invoices",
    };
  }

  if (
    text.includes("revenue") ||
    text.includes("financial summary") ||
    text.includes("finance summary") ||
    text.includes("income")
  ) {
    const paid = invoices.filter(
      (invoice) => invoice.status === "Paid"
    );

    const pending = invoices.filter(
      (invoice) =>
        invoice.status === "Pending" || invoice.status === "Overdue"
    );

    const paidCount = paid.length;
    const pendingCount = pending.length;

    const currencies = [...new Set(invoices.map((item) => item.currency))];

    if (invoices.length === 0) {
      return {
        text: "You don't have any saved invoices yet. Create your first invoice to start tracking your revenue and payments.",
        action: "Create invoice",
        path: "/create-invoice",
      };
    }

    const currencySummary = currencies.map((currency) => {
      const paidTotal = paid
        .filter((item) => item.currency === currency)
        .reduce((sum, item) => sum + item.totalCents, 0);

      const pendingTotal = pending
        .filter((item) => item.currency === currency)
        .reduce((sum, item) => sum + item.totalCents, 0);

      return `${currency}: ${formatMoney(paidTotal, currency)} paid · ${formatMoney(
        pendingTotal,
        currency
      )} pending`;
    });

    return {
      text: `Here's your saved invoice summary:\n\nTotal invoices: ${invoices.length}\nPaid invoices: ${paidCount}\nPending invoices: ${pendingCount}\n\n${currencySummary.join("\n")}`,
      action: "View insights",
      path: "/insights",
    };
  }

  if (text.includes("client")) {
    return {
      text: "You can manage your clients, add new client details, update existing records and search your client list from the Clients section.",
      action: "Manage clients",
      path: "/clients",
    };
  }

  if (text.includes("payment")) {
    return {
      text: "You can review your payment records in the Payments section. PayPal Sandbox payment processing will be connected during the backend integration phase.",
      action: "View payments",
      path: "/payments",
    };
  }

  return {
    text: "I can currently help you navigate invoice creation, review saved invoice summaries, find pending payments and manage clients. Full natural-language AI responses will be available after the Groq backend integration.",
  };
}

export default function Assistant() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [invoices] = useState(() => getStoredInvoices());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = (value = input) => {
    const message = value.trim();

    if (!message || loading) return;

    setMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: message,
      },
    ]);

    setInput("");
    setLoading(true);

    // Local data-based response. Replace with Groq API call later.
    setTimeout(() => {
      const reply = getAssistantReply(message, invoices);

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          ...reply,
        },
      ]);

      setLoading(false);
    }, 500);
  };

  const startNewChat = () => {
    setMessages([]);
    setInput("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F5F8] text-[#101A2B]">
      <Sidebar />

      <main className="min-h-screen lg:ml-[250px]">
        <header className="flex flex-col gap-4 border-b border-[#E5E9F0] bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-9">
          <div>
            <p className="text-xs text-[#8993A3]">Workspace / AI Assistant</p>
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

        <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-5xl flex-col px-5 py-8 sm:px-8">
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
              className="flex shrink-0 items-center gap-2 rounded-lg border border-[#E1E6ED] bg-white px-3 py-2 text-xs font-medium text-[#465367] hover:bg-[#F8F9FB]"
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
                      className="group rounded-xl border border-[#E5E9F0] bg-white p-4 text-left transition hover:border-[#B7C7E2] hover:shadow-sm"
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
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DFE6F3] text-[#24407A]">
                      <Bot size={19} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-[#24407A] text-white"
                        : "border border-[#E5E9F0] bg-white text-[#101A2B]"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs opacity-70">
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

                    <p className="whitespace-pre-line text-sm leading-6">
                      {message.text}
                    </p>

                    {message.action && (
                      <button
                        onClick={() => navigate(message.path)}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#DFE6F3] px-3 py-2 text-xs font-semibold text-[#24407A] hover:bg-[#d2ddef]"
                      >
                        {message.action}
                        <ArrowUpRight size={14} />
                      </button>
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
                    Preparing response...
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
                Local demo assistant · Groq integration pending
              </span>

              <button
                type="submit"
                disabled={!input.trim() || loading}
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
        </div>
      </main>
    </div>
  );
}
