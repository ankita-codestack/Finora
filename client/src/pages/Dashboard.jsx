
import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Sparkles,
  ChartNoAxesCombined,
  Settings,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  Wallet,
  Clock3,
  CircleCheck,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

import {
  getStoredInvoices,
  formatMoney,
  formatInvoiceDate,
} from "../lib/invoiceStorage";

const navigation = [
  { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Invoices", icon: FileText, path: "/invoices" },
  { name: "Payments", icon: CreditCard, path: "/payments" },
  { name: "Clients", icon: Users, path: "/clients" },
  { name: "AI Assistant", icon: Sparkles, path: "/assistant" },
  { name: "Insights", icon: ChartNoAxesCombined, path: "/insights" },
];

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getInvoiceStatus = (invoice) => {
  if (
    invoice.status === "Pending" &&
    invoice.dueDate &&
    invoice.dueDate < getToday()
  ) {
    return "Overdue";
  }

  return invoice.status || "Pending";
};

export default function Dashboard() {
  const [invoices] = useState(() => getStoredInvoices());

  const availableCurrencies = useMemo(() => {
    const currencies = [
      ...new Set(invoices.map((invoice) => invoice.currency).filter(Boolean)),
    ];

    return currencies.length ? currencies : ["USD"];
  }, [invoices]);

  const [currency, setCurrency] = useState(availableCurrencies[0]);

  const currencyInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.currency === currency),
    [invoices, currency]
  );

  const summary = useMemo(() => {
    const paid = currencyInvoices.filter(
      (invoice) => getInvoiceStatus(invoice) === "Paid"
    );

    const pending = currencyInvoices.filter(
      (invoice) => getInvoiceStatus(invoice) === "Pending"
    );

    const overdue = currencyInvoices.filter(
      (invoice) => getInvoiceStatus(invoice) === "Overdue"
    );

    const paidRevenue = paid.reduce(
      (total, invoice) => total + invoice.totalCents,
      0
    );

    const pendingAmount = [...pending, ...overdue].reduce(
      (total, invoice) => total + invoice.totalCents,
      0
    );

    const totalInvoiced = currencyInvoices.reduce(
      (total, invoice) => total + invoice.totalCents,
      0
    );

    return {
      paid,
      pending,
      overdue,
      paidRevenue,
      pendingAmount,
      totalInvoiced,
      total: currencyInvoices.length,
    };
  }, [currencyInvoices]);

  const recentInvoices = useMemo(() => {
    return [...currencyInvoices]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.issueDate || 0).getTime();
        const dateB = new Date(b.createdAt || b.issueDate || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [currencyInvoices]);

  const monthlyRevenue = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: 12 }, (_, month) => {
      const amount = summary.paid
        .filter((invoice) => {
          if (!invoice.issueDate) return false;

          const date = new Date(`${invoice.issueDate}T00:00:00`);
          return (
            date.getFullYear() === currentYear &&
            date.getMonth() === month
          );
        })
        .reduce((total, invoice) => total + invoice.totalCents, 0);

      return {
        month: new Date(currentYear, month, 1).toLocaleString("en-US", {
          month: "short",
        }),
        amount,
      };
    });
  }, [summary.paid]);

  const maxRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.amount),
    1
  );

  const paidCount = summary.paid.length;
  const pendingCount = summary.pending.length;
  const overdueCount = summary.overdue.length;

  const paidPercentage =
    summary.total > 0 ? (paidCount / summary.total) * 100 : 0;

  const pendingPercentage =
    summary.total > 0 ? (pendingCount / summary.total) * 100 : 0;

  const overduePercentage =
    summary.total > 0 ? (overdueCount / summary.total) * 100 : 0;

  const stats = [
    {
      title: "Collected Revenue",
      value: formatMoney(summary.paidRevenue, currency),
      icon: Wallet,
      note: "From paid invoices",
    },
    {
      title: "Total Invoices",
      value: summary.total,
      icon: FileText,
      note: "Invoices created",
    },
    {
      title: "Outstanding Payments",
      value: formatMoney(summary.pendingAmount, currency),
      icon: Clock3,
      note: "Pending + overdue",
    },
    {
      title: "Paid Invoices",
      value: paidCount,
      icon: CircleCheck,
      note: "Successfully paid",
    },
  ];

  const statusStyle = (status) => {
    if (status === "Paid") {
      return "bg-emerald-50 text-[#2E7D5B]";
    }

    if (status === "Overdue") {
      return "bg-rose-50 text-rose-600";
    }

    return "bg-[#DFE6F3] text-[#24407A]";
  };

  return (
    <div className="min-h-screen bg-[#F3F5F8] text-[#101A2B] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[250px] bg-white border-r border-slate-200 flex-col fixed inset-y-0 left-0 z-20">
        <Link
          to="/"
          className="flex items-center gap-2 px-7 h-[76px] border-b border-slate-100"
        >
          <div className="w-9 h-9 bg-[#24407A] rounded-xl flex items-center justify-center">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Finora</span>
        </Link>

        <div className="px-4 pt-7">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-[#DFE6F3] text-[#24407A]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#101A2B]"
                    }`
                  }
                >
                  <Icon size={19} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="bg-[#F3F5F8] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-[#24407A] mb-2">
              <Sparkles size={17} />
              <span className="text-sm font-semibold">Finora AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-5 mb-3">
              Let AI help you manage invoices and understand your finances.
            </p>
            <Link
              to="/assistant"
              className="text-xs font-semibold text-[#24407A] flex items-center gap-1"
            >
              Explore assistant <ArrowUpRight size={14} />
            </Link>
          </div>

          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-50">
            <Settings size={19} className="text-slate-500" />
            <span className="text-sm text-slate-600 font-medium">
              Settings
            </span>
          </button>

          <div className="border-t border-slate-100 pt-4 mt-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#DFE6F3] text-[#24407A] flex items-center justify-center font-semibold text-sm">
              AS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Ankita Sharma</p>
              <p className="text-xs text-slate-400">Free Workspace</p>
            </div>
            <MoreHorizontal size={19} className="text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[250px] min-w-0">
        {/* Topbar */}
        <header className="h-[76px] bg-white border-b border-slate-200 px-5 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <p className="text-sm text-slate-400 hidden sm:block">
              Workspace / Overview
            </p>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 bg-[#F3F5F8] rounded-lg px-3 py-2 text-sm text-slate-400">
              <Search size={16} />
              Search
              <span className="text-xs border border-slate-200 rounded px-1.5 py-0.5">
                /
              </span>
            </button>

            <button className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
              <Bell size={18} />
            </button>

            <button className="flex items-center gap-2 text-sm font-medium">
              <div className="w-8 h-8 rounded-full bg-[#DFE6F3] text-[#24407A] flex items-center justify-center">
                AS
              </div>
              <ChevronDown size={15} className="text-slate-400" />
            </button>
          </div>
        </header>

        <div className="p-5 md:p-8 max-w-[1500px] mx-auto">
          {/* Welcome */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Welcome back, Ankita
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Here's what's happening with your business today.
              </p>
            </div>

            <Link
              to="/create-invoice"
              className="inline-flex items-center justify-center gap-2 bg-[#24407A] hover:bg-[#1B3261] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              <Plus size={17} />
              Create invoice
            </Link>
          </div>

          {/* Currency selector */}
          <div className="flex justify-end mb-4">
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none focus:border-[#24407A]"
            >
              {availableCurrencies.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="bg-white border border-slate-200 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <div className="w-9 h-9 rounded-lg bg-[#DFE6F3] text-[#24407A] flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold tracking-tight break-words">
                    {stat.value}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2">{stat.note}</p>
                </div>
              );
            })}
          </div>

          {/* Revenue + Summary */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
            <section className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h3 className="font-semibold">Revenue overview</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Paid invoice value by issue month · {new Date().getFullYear()}
                  </p>
                </div>
                <span className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-2">
                  {currency}
                </span>
              </div>

              <div className="flex items-end gap-2 mb-6">
                <span className="text-3xl font-semibold">
                  {formatMoney(summary.paidRevenue, currency)}
                </span>
                <span className="text-xs text-slate-400 mb-1">
                  Total collected
                </span>
              </div>

              <div className="h-[190px] flex items-end gap-2 sm:gap-4 border-b border-slate-100 pb-2">
                {monthlyRevenue.map((item) => {
                  const height =
                    item.amount > 0
                      ? Math.max((item.amount / maxRevenue) * 100, 4)
                      : 0;

                  return (
                    <div
                      key={item.month}
                      className="flex-1 h-full flex items-end group relative"
                      title={`${item.month}: ${formatMoney(item.amount, currency)}`}
                    >
                      <div
                        style={{ height: `${height}%` }}
                        className={`w-full rounded-t-md transition ${
                          item.amount > 0
                            ? "bg-[#24407A] group-hover:bg-[#9BAED2]"
                            : "bg-[#DFE6F3]"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-xs text-slate-400 mt-3">
                {monthlyRevenue.map((item) => (
                  <span key={item.month}>{item.month}</span>
                ))}
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">
              <h3 className="font-semibold">Invoice summary</h3>
              <p className="text-xs text-slate-400 mt-1 mb-7">
                Current invoice status
              </p>

              <div className="flex justify-center mb-7">
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      summary.total === 0
                        ? "#DFE6F3"
                        : `conic-gradient(
                          #2E7D5B 0% ${paidPercentage}%,
                          #9BAED2 ${paidPercentage}% ${paidPercentage + pendingPercentage}%,
                          #101A2B ${paidPercentage + pendingPercentage}% 100%
                        )`,
                  }}
                >
                  <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
                    <p className="text-3xl font-semibold">{summary.total}</p>
                    <p className="text-xs text-slate-400">Total invoices</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D5B]" />
                    Paid
                  </span>
                  <span className="font-semibold">{paidCount}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9BAED2]" />
                    Pending
                  </span>
                  <span className="font-semibold">{pendingCount}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#101A2B]" />
                    Overdue
                  </span>
                  <span className="font-semibold">{overdueCount}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Recent Invoices */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 md:p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Recent invoices</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your latest saved invoices
                </p>
              </div>

              <Link
                to="/invoices"
                className="text-sm font-semibold text-[#24407A] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F8F9FB] text-slate-400 text-xs">
                  <tr>
                    <th className="px-6 py-3 font-medium">Invoice ID</th>
                    <th className="px-6 py-3 font-medium">Client</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentInvoices.length > 0 ? (
                    recentInvoices.map((invoice) => {
                      const status = getInvoiceStatus(invoice);

                      return (
                        <tr
                          key={invoice.id}
                          className="hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4 font-medium text-[#24407A] whitespace-nowrap">
                            {invoice.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {invoice.client}
                          </td>
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                            {formatInvoiceDate(invoice.issueDate)}
                          </td>
                          <td className="px-6 py-4 font-semibold whitespace-nowrap">
                            {formatMoney(invoice.totalCents, currency)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center"
                      >
                        <FileText
                          size={28}
                          className="mx-auto text-slate-300 mb-3"
                        />
                        <p className="text-sm font-medium text-slate-600">
                          No invoices yet
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Create your first invoice to see your dashboard
                          statistics.
                        </p>
                        <Link
                          to="/create-invoice"
                          className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#24407A] hover:underline"
                        >
                          <Plus size={15} />
                          Create invoice
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
              Showing {recentInvoices.length} of {summary.total} invoices
            </div>
          </section>

          <p className="text-center text-xs text-slate-400 mt-8">
            Finora dashboard · Live local invoice data
          </p>
        </div>
      </main>
    </div>
  );
}
