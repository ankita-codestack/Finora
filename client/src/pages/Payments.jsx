
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Bot,
  ChartNoAxesCombined,
  Search,
  Download,
  ArrowDownLeft,
  CheckCircle2,
  Clock3,
  AlertCircle,
  MoreHorizontal,
  Wallet,
} from "lucide-react";

import {
  formatMoney,
  formatInvoiceDate,
} from "../lib/invoiceStorage";

import { apiRequest } from "../lib/api";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Invoices", icon: FileText, path: "/invoices" },
  { label: "Payments", icon: CreditCard, path: "/payments" },
  { label: "Clients", icon: Users, path: "/clients" },
  { label: "AI Assistant", icon: Bot, path: "/assistant" },
  { label: "Insights", icon: ChartNoAxesCombined, path: "/insights" },
];

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getStatus = (invoice) => {
  if (
    invoice.status === "Pending" &&
    invoice.dueDate &&
    invoice.dueDate < getToday()
  ) {
    return "Overdue";
  }

  return invoice.status || "Pending";
};

const statusStyles = {
  Paid: "bg-[#E7F2EC] text-[#2E7D5B]",
  Pending: "bg-[#FFF4DF] text-[#A66B13]",
  Overdue: "bg-[#FCEAEA] text-[#C04444]",
};

const statusIcons = {
  Paid: CheckCircle2,
  Pending: Clock3,
  Overdue: AlertCircle,
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
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[#DFE6F3] text-[#24407A]"
                  : "text-[#697586] hover:bg-[#F3F5F8] hover:text-[#101A2B]"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-7 left-5 right-5 rounded-xl bg-[#F3F5F8] p-4">
        <p className="text-sm font-semibold text-[#101A2B]">Need help?</p>
        <p className="mt-1 text-xs leading-5 text-[#697586]">
          Visit our AI assistant for help with your invoices.
        </p>
        <Link
          to="/assistant"
          className="mt-3 inline-block text-xs font-semibold text-[#24407A]"
        >
          Ask Finora AI →
        </Link>
      </div>
    </aside>
  );
}

function StatCard({ title, amount, note, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="rounded-xl border border-[#E8ECF2] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#697586]">{title}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
      <h2 className="mt-4 break-words text-2xl font-semibold tracking-tight text-[#101A2B]">
        {amount}
      </h2>
      <p className="mt-2 text-xs text-[#8993A3]">{note}</p>
    </div>
  );
}

export default function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await apiRequest("/invoices");

        const mongoInvoices = (response.invoices || []).map((invoice) => {
          const client =
            typeof invoice.client === "object" ? invoice.client : null;

          return {
            id: invoice.invoiceNumber || invoice._id,
            mongoId: invoice._id,
            client: client?.name || "Unknown Client",
            email: client?.email || "",
            issueDate: invoice.issueDate
              ? String(invoice.issueDate).slice(0, 10)
              : "",
            dueDate: invoice.dueDate
              ? String(invoice.dueDate).slice(0, 10)
              : "",
            createdAt: invoice.createdAt,
            paidAt: invoice.paidAt,
            paymentDate:
              invoice.paidAt || invoice.createdAt || invoice.issueDate,
            currency: invoice.currency || "USD",
            totalCents: Math.round(Number(invoice.total || 0) * 100),
            status: invoice.status || "Pending",
            paymentMethod:
              invoice.paypalCaptureId || invoice.paypalOrderId
                ? "PayPal"
                : "Not recorded",
            paypalOrderId: invoice.paypalOrderId || null,
            paypalCaptureId: invoice.paypalCaptureId || null,
          };
        });

        setInvoices(mongoInvoices);
      } catch (error) {
        console.error("Payments loading failed:", error);
        setLoadError(error.message || "Unable to load payment records.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const currencies = useMemo(() => {
    const values = [
      ...new Set(invoices.map((invoice) => invoice.currency).filter(Boolean)),
    ];

    return values.length ? values : ["USD"];
  }, [invoices]);

  const selectedCurrency = currencies.includes(currency)
    ? currency
    : currencies[0];

  const currencyInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.currency === selectedCurrency),
    [invoices, selectedCurrency]
  );

  const records = useMemo(() => {
    return currencyInvoices.map((invoice) => ({
      ...invoice,
      paymentStatus: getStatus(invoice),
    }));
  }, [currencyInvoices]);

  const summary = useMemo(() => {
    const paid = records.filter((item) => item.paymentStatus === "Paid");
    const pending = records.filter((item) => item.paymentStatus === "Pending");
    const overdue = records.filter((item) => item.paymentStatus === "Overdue");

    return {
      received: paid.reduce((sum, item) => sum + item.totalCents, 0),
      awaiting: [...pending, ...overdue].reduce(
        (sum, item) => sum + item.totalCents,
        0
      ),
      successfulCount: paid.length,
      overdueCount: overdue.length,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records
      .filter((item) => {
        const matchesFilter =
          activeFilter === "All" || item.paymentStatus === activeFilter;

        const matchesSearch =
          !query ||
          [
            item.id,
            item.client,
            item.email,
            item.paymentStatus,
            item.paymentMethod,
            item.paypalOrderId,
          ].some((value) =>
            String(value || "").toLowerCase().includes(query)
          );

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.paymentDate || 0).getTime();
        const dateB = new Date(b.paymentDate || 0).getTime();
        return dateB - dateA;
      });
  }, [records, search, activeFilter]);

  const exportCSV = () => {
    const headers = [
      "Invoice ID",
      "Client",
      "Email",
      "Date",
      "Currency",
      "Amount",
      "Status",
      "Payment Method",
      "PayPal Order ID",
      "PayPal Capture ID",
    ];

    const rows = filteredRecords.map((item) => [
      item.id,
      item.client,
      item.email,
      item.paymentDate || "",
      selectedCurrency,
      (item.totalCents / 100).toFixed(2),
      item.paymentStatus,
      item.paymentMethod,
      item.paypalOrderId || "",
      item.paypalCaptureId || "",
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finora-payments-${selectedCurrency.toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const filters = ["All", "Paid", "Pending", "Overdue"];

  return (
    <div className="min-h-screen bg-[#F3F5F8] text-[#101A2B]">
      <Sidebar />

      <main className="min-h-screen lg:ml-[250px]">
        <header className="flex flex-col gap-4 border-b border-[#E5E9F0] bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-9">
          <div>
            <p className="text-xs text-[#8993A3]">Workspace / Payments</p>
            <h1 className="mt-1 text-xl font-semibold">Payments</h1>
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

        <div className="space-y-7 px-6 py-8 lg:px-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Payment overview
              </h2>
              <p className="mt-1 text-sm text-[#8993A3]">
                Monitor invoice payment status and outstanding amounts.
              </p>
            </div>

            <select
              value={selectedCurrency}
              onChange={(event) => setCurrency(event.target.value)}
              className="rounded-lg border border-[#E5E9F0] bg-white px-3 py-2 text-sm text-[#465367] outline-none focus:border-[#24407A]"
            >
              {currencies.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {loadError && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm text-rose-600">
              {loadError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total received"
              amount={isLoading ? "Loading..." : formatMoney(summary.received, selectedCurrency)}
              note="From paid invoices"
              icon={ArrowDownLeft}
              iconBg="bg-[#E7F2EC]"
              iconColor="text-[#2E7D5B]"
            />

            <StatCard
              title="Awaiting payment"
              amount={isLoading ? "Loading..." : formatMoney(summary.awaiting, selectedCurrency)}
              note="Pending + overdue"
              icon={Clock3}
              iconBg="bg-[#FFF4DF]"
              iconColor="text-[#A66B13]"
            />

            <StatCard
              title="Successful"
              amount={isLoading ? "..." : summary.successfulCount}
              note="Paid invoices"
              icon={CheckCircle2}
              iconBg="bg-[#E7F2EC]"
              iconColor="text-[#2E7D5B]"
            />

            <StatCard
              title="Overdue invoices"
              amount={isLoading ? "..." : summary.overdueCount}
              note="Require follow-up"
              icon={AlertCircle}
              iconBg="bg-[#FCEAEA]"
              iconColor="text-[#C04444]"
            />
          </div>

          <section className="overflow-hidden rounded-xl border border-[#E8ECF2] bg-white">
            <div className="flex flex-col gap-4 border-b border-[#E8ECF2] p-5">
              <div>
                <h3 className="font-semibold">Payment records</h3>
                <p className="mt-1 text-xs text-[#8993A3]">
                  Payment status and details from your saved invoices
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                        activeFilter === filter
                          ? "bg-[#24407A] text-white"
                          : "border border-[#E5E9F0] text-[#697586] hover:bg-[#F3F5F8]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 rounded-lg border border-[#E5E9F0] px-3 py-2">
                    <Search size={15} className="text-[#8993A3]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search payments"
                      className="w-32 bg-transparent text-xs outline-none sm:w-40"
                    />
                  </div>

                  <button
                    onClick={exportCSV}
                    disabled={filteredRecords.length === 0}
                    className="flex items-center gap-2 rounded-lg border border-[#E5E9F0] px-3 py-2 text-xs font-medium text-[#465367] hover:bg-[#F3F5F8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Download size={15} />
                    Export
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead className="bg-[#F8F9FB]">
                  <tr className="text-[11px] uppercase tracking-wider text-[#8993A3]">
                    <th className="px-5 py-4 font-semibold">Client</th>
                    <th className="px-5 py-4 font-semibold">Invoice</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Method</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF0F4]">
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="px-5 py-14 text-center text-sm text-[#8993A3]">
                        Loading payment records...
                      </td>
                    </tr>
                  ) : filteredRecords.length > 0 ? (
                    filteredRecords.map((payment) => {
                      const StatusIcon =
                        statusIcons[payment.paymentStatus] || Clock3;

                      return (
                        <tr
                          key={payment.mongoId}
                          className="transition hover:bg-[#FAFBFC]"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold">
                              {payment.client}
                            </p>
                            <p className="mt-1 text-xs text-[#8993A3]">
                              {payment.email || "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-xs font-medium text-[#24407A]">
                            {payment.id}
                          </td>

                          <td className="px-5 py-4 text-xs text-[#697586]">
                            {formatInvoiceDate(
                              payment.paymentStatus === "Paid"
                                ? payment.paidAt || payment.issueDate
                                : payment.issueDate
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold">
                            {formatMoney(payment.totalCents, selectedCurrency)}
                          </td>

                          <td className="px-5 py-4 text-xs text-[#697586]">
                            {payment.paymentMethod}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                statusStyles[payment.paymentStatus] ||
                                statusStyles.Pending
                              }`}
                            >
                              <StatusIcon size={12} />
                              {payment.paymentStatus}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <button
                              aria-label="More options"
                              title="More options"
                              className="rounded-md p-1.5 text-[#8993A3] hover:bg-[#F3F5F8]"
                            >
                              <MoreHorizontal size={17} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-5 py-14 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F5F8] text-[#8993A3]">
                          <Wallet size={23} />
                        </div>
                        <p className="text-sm font-semibold text-[#465367]">
                          {records.length === 0
                            ? "No payment records yet"
                            : "No matching payments"}
                        </p>
                        <p className="mt-1 text-xs text-[#8993A3]">
                          {records.length === 0
                            ? "Create an invoice to start tracking payment activity."
                            : "Try changing your search or status filter."}
                        </p>

                        {records.length === 0 && (
                          <Link
                            to="/create-invoice"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#24407A] hover:underline"
                          >
                            Create invoice
                          </Link>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[#E8ECF2] px-5 py-4">
              <p className="text-xs text-[#8993A3]">
                Showing {filteredRecords.length} of {records.length} records
              </p>
              <span className="text-xs text-[#8993A3]">{selectedCurrency}</span>
            </div>
          </section>

          <p className="text-center text-[11px] text-[#A0A8B5]">
            Finora payment records · MongoDB synced
          </p>
        </div>
      </main>
    </div>
  );
}
