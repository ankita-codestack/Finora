
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Bot,
  ChartNoAxesCombined,
  TrendingUp,
  ArrowUpRight,
  Download,
  Wallet,
  Receipt,
  CircleDollarSign,
  Clock3,
  Lightbulb,
} from "lucide-react";
import { formatMoney } from "../lib/invoiceStorage";
import { apiRequest } from "../lib/api";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Invoices", icon: FileText, path: "/invoices" },
  { label: "Payments", icon: CreditCard, path: "/payments" },
  { label: "Clients", icon: Users, path: "/clients" },
  { label: "AI Assistant", icon: Bot, path: "/assistant" },
  { label: "Insights", icon: ChartNoAxesCombined, path: "/insights" },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
              path === "/insights"
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
          Visit your AI Assistant for help with finances.
        </p>
        <Link
          to="/assistant"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#24407A]"
        >
          Open assistant <ArrowUpRight size={13} />
        </Link>
      </div>
    </aside>
  );
}

function StatCard({ title, value, note, icon: Icon }) {
  return (
    <div className="rounded-xl border border-[#E8ECF2] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#697586]">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DFE6F3] text-[#24407A]">
          <Icon size={18} />
        </div>
      </div>

      <h2 className="mt-4 break-words text-2xl font-semibold tracking-tight text-[#101A2B]">
        {value}
      </h2>

      <p className="mt-2 text-xs text-[#8993A3]">{note}</p>
    </div>
  );
}

function downloadCSV(rows, currency) {
  const headers = [
    "Month",
    "Paid Revenue",
    "Paid Invoices",
    "Pending Invoices",
    "Overdue Invoices",
  ];

  const csvRows = rows.map((row) => [
    row.month,
    (row.revenue / 100).toFixed(2),
    row.paidCount,
    row.pendingCount,
    row.overdueCount,
  ]);

  const csv = [headers, ...csvRows]
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `finora-insights-${currency}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getInvoiceStatus(invoice) {
  if (
    invoice.status === "Pending" &&
    invoice.dueDate &&
    invoice.dueDate < new Date().toISOString().slice(0, 10)
  ) {
    return "Overdue";
  }

  return invoice.status;
}

export default function Insights() {
  const [allInvoices, setAllInvoices] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await apiRequest("/invoices");

        const mongoInvoices = (response.invoices || []).map((invoice) => {
          const client =
            typeof invoice.client === "object" ? invoice.client : null;

          return {
            id: invoice._id,
            client: client?.name || "Unknown Client",
            email: client?.email || "",
            currency: invoice.currency || "USD",
            totalCents: Math.round(Number(invoice.total || 0) * 100),
            status: invoice.status || "Pending",
            issueDate: invoice.issueDate
              ? String(invoice.issueDate).slice(0, 10)
              : "",
            dueDate: invoice.dueDate
              ? String(invoice.dueDate).slice(0, 10)
              : "",
            paidAt: invoice.paidAt || null,
          };
        });

        setAllInvoices(mongoInvoices);
      } catch (error) {
        console.error("Insights loading failed:", error);
        setLoadError(error.message || "Unable to load insights.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const currencies = useMemo(
    () => [
      ...new Set(
        allInvoices.map((invoice) => invoice.currency).filter(Boolean)
      ),
    ],
    [allInvoices]
  );

  const availableCurrencies = currencies.length ? currencies : ["USD"];

  const years = useMemo(
    () =>
      [
        ...new Set(
          allInvoices
            .map((invoice) => invoice.issueDate?.slice(0, 4))
            .filter((value) => /^\d{4}$/.test(value || ""))
        ),
      ].sort((a, b) => b.localeCompare(a)),
    [allInvoices]
  );

  const availableYears = [
    ...new Set([String(new Date().getFullYear()), ...years]),
  ].sort((a, b) => b.localeCompare(a));

  const selectedCurrency = availableCurrencies.includes(currency)
    ? currency
    : availableCurrencies[0];

  const selectedYear = availableYears.includes(year)
    ? year
    : availableYears[0];

  const filteredInvoices = allInvoices.filter(
  (invoice) =>
    invoice.currency === selectedCurrency &&
    invoice.issueDate?.startsWith(selectedYear)
);

  const stats = useMemo(() => {
    const paid = filteredInvoices.filter(
      (invoice) => getInvoiceStatus(invoice) === "Paid"
    );

    const overdue = filteredInvoices.filter(
      (invoice) => getInvoiceStatus(invoice) === "Overdue"
    );

    const pending = filteredInvoices.filter(
      (invoice) => getInvoiceStatus(invoice) === "Pending"
    );

    const revenue = paid.reduce(
      (sum, invoice) => sum + invoice.totalCents,
      0
    );

    const outstanding = [...pending, ...overdue].reduce(
      (sum, invoice) => sum + invoice.totalCents,
      0
    );

    const totalInvoiced = filteredInvoices.reduce(
      (sum, invoice) => sum + invoice.totalCents,
      0
    );

    return {
      revenue,
      outstanding,
      totalInvoiced,
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      average: filteredInvoices.length
        ? Math.round(totalInvoiced / filteredInvoices.length)
        : 0,
      totalCount: filteredInvoices.length,
    };
  }, [filteredInvoices]);

  const monthlyData = useMemo(() => {
    return MONTHS.map((month, index) => {
      const monthInvoices = filteredInvoices.filter(
        (invoice) =>
          Number(invoice.issueDate?.slice(5, 7)) === index + 1
      );

      const paid = monthInvoices.filter(
        (invoice) => getInvoiceStatus(invoice) === "Paid"
      );

      return {
        month,
        revenue: paid.reduce(
          (sum, invoice) => sum + invoice.totalCents,
          0
        ),
        paidCount: paid.length,
        pendingCount: monthInvoices.filter(
          (invoice) => getInvoiceStatus(invoice) === "Pending"
        ).length,
        overdueCount: monthInvoices.filter(
          (invoice) => getInvoiceStatus(invoice) === "Overdue"
        ).length,
      };
    });
  }, [filteredInvoices]);

  const maxRevenue = Math.max(
    ...monthlyData.map((item) => item.revenue),
    1
  );

  const topClients = useMemo(() => {
    const grouped = {};

    filteredInvoices.forEach((invoice) => {
      const email = invoice.email?.toLowerCase() || invoice.client;

      if (!grouped[email]) {
        grouped[email] = {
          name: invoice.client,
          email: invoice.email,
          total: 0,
          count: 0,
        };
      }

      grouped[email].count += 1;

      if (getInvoiceStatus(invoice) === "Paid") {
        grouped[email].total += invoice.totalCents;
      }
    });

    return Object.values(grouped)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredInvoices]);

  const paymentTotal =
    stats.paidCount + stats.pendingCount + stats.overdueCount;

  const paidPercent = paymentTotal
    ? (stats.paidCount / paymentTotal) * 100
    : 0;

  const pendingPercent = paymentTotal
    ? (stats.pendingCount / paymentTotal) * 100
    : 0;

  const insights = [
    {
      icon: TrendingUp,
      title: "Collected revenue",
      description:
        stats.paidCount > 0
          ? `You have collected ${formatMoney(stats.revenue, selectedCurrency)} across ${stats.paidCount} paid invoice(s) in ${selectedYear}.`
          : "No paid invoices are recorded for this currency and year yet.",
      color: "text-[#2E7D5B]",
    },
    {
      icon: Clock3,
      title: "Outstanding payments",
      description:
        stats.outstanding > 0
          ? `${formatMoney(stats.outstanding, selectedCurrency)} is still outstanding. Review pending and overdue invoices.`
          : "There are no outstanding amounts in the selected records.",
      color: "text-[#A66B13]",
    },
    {
      icon: Lightbulb,
      title: "Invoice activity",
      description:
        stats.totalCount > 0
          ? `You created ${stats.totalCount} invoice(s) in ${selectedYear}. Your average invoice value is ${formatMoney(stats.average, selectedCurrency)}.`
          : "Create an invoice to start building your financial overview.",
      color: "text-[#24407A]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3F5F8] text-[#101A2B]">
      <Sidebar />

      <main className="min-h-screen lg:ml-[250px]">
        <header className="flex flex-col gap-4 border-b border-[#E5E9F0] bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-9">
          <div>
            <p className="text-xs text-[#8993A3]">Workspace / Insights</p>
            <h1 className="mt-1 text-xl font-semibold">Financial Insights</h1>
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Business performance
              </h2>
              <p className="mt-1 text-sm text-[#8993A3]">
                Financial metrics calculated from your MongoDB invoices.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={selectedCurrency}
                onChange={(event) => setCurrency(event.target.value)}
                className="rounded-lg border border-[#E1E6ED] bg-white px-3 py-2.5 text-xs font-medium text-[#465367] outline-none"
              >
                {availableCurrencies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(event) => setYear(event.target.value)}
                className="rounded-lg border border-[#E1E6ED] bg-white px-3 py-2.5 text-xs font-medium text-[#465367] outline-none"
              >
                {availableYears.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                onClick={() => downloadCSV(monthlyData, selectedCurrency)}
                disabled={isLoading || Boolean(loadError)}
                className="flex items-center gap-2 rounded-lg bg-[#24407A] px-3 py-2.5 text-xs font-medium text-white hover:bg-[#1B3261] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={15} />
                Export report
              </button>
            </div>
          </div>

          {loadError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {isLoading && (
            <div className="rounded-xl border border-[#E8ECF2] bg-white px-5 py-8 text-center text-sm text-[#697586]">
              Loading financial insights from MongoDB...
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Collected revenue"
              value={formatMoney(stats.revenue, selectedCurrency)}
              note={`${stats.paidCount} paid invoices`}
              icon={CircleDollarSign}
            />
            <StatCard
              title="Total invoiced"
              value={formatMoney(stats.totalInvoiced, selectedCurrency)}
              note={`${stats.totalCount} invoices created`}
              icon={Wallet}
            />
            <StatCard
              title="Outstanding"
              value={formatMoney(stats.outstanding, selectedCurrency)}
              note={`${stats.pendingCount + stats.overdueCount} unpaid invoices`}
              icon={Receipt}
            />
            <StatCard
              title="Average invoice"
              value={formatMoney(stats.average, selectedCurrency)}
              note="Average value per invoice"
              icon={FileText}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <section className="rounded-xl border border-[#E8ECF2] bg-white p-5 xl:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Revenue overview</h3>
                  <p className="mt-1 text-xs text-[#8993A3]">
                    Monthly collected revenue · {selectedCurrency} · {selectedYear}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#697586]">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#24407A]" />
                  Paid revenue
                </div>
              </div>

              <div className="mt-8 flex h-[230px] gap-3">
                <div className="flex flex-col justify-between pb-7 text-[10px] text-[#A0A8B5]">
                  <span>{formatMoney(maxRevenue, selectedCurrency)}</span>
                  <span>{formatMoney(maxRevenue * 0.75, selectedCurrency)}</span>
                  <span>{formatMoney(maxRevenue * 0.5, selectedCurrency)}</span>
                  <span>{formatMoney(maxRevenue * 0.25, selectedCurrency)}</span>
                  <span>{formatMoney(0, selectedCurrency)}</span>
                </div>

                <div className="relative flex flex-1 items-end justify-between gap-2 border-b border-[#E8ECF2] pb-0">
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-7">
                    {[0, 1, 2, 3, 4].map((line) => (
                      <div
                        key={line}
                        className="border-t border-dashed border-[#EDF0F4]"
                      />
                    ))}
                  </div>

                  {monthlyData.map((item) => (
                    <div
                      key={item.month}
                      className="relative z-10 flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div
                        title={`${item.month}: ${formatMoney(item.revenue, selectedCurrency)}`}
                        className="w-full max-w-7 rounded-t-md bg-[#24407A] transition hover:opacity-75"
                        style={{
                          height: `${(item.revenue / maxRevenue) * 100}%`,
                          minHeight: item.revenue > 0 ? "3px" : "0px",
                        }}
                      />
                      <span className="absolute -bottom-6 text-[10px] text-[#8993A3]">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {!isLoading && !loadError && stats.totalCount === 0 && (
                <p className="mt-10 text-center text-xs text-[#8993A3]">
                  No invoice data for this selection yet.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-[#E8ECF2] bg-white p-5">
              <h3 className="font-semibold">Payment breakdown</h3>
              <p className="mt-1 text-xs text-[#8993A3]">
                Invoice count by status
              </p>

              <div
                className="mx-auto mt-8 flex h-40 w-40 items-center justify-center rounded-full"
                style={{
                  background: paymentTotal
                    ? `conic-gradient(#2E7D5B 0% ${paidPercent}%, #D9A441 ${paidPercent}% ${paidPercent + pendingPercent}%, #DCE3ED ${paidPercent + pendingPercent}% 100%)`
                    : "#E8ECF2",
                }}
              >
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-2xl font-semibold">
                    {paymentTotal}
                  </span>
                  <span className="text-[10px] text-[#8993A3]">
                    Invoices
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  {
                    label: "Paid",
                    count: stats.paidCount,
                    color: "#2E7D5B",
                  },
                  {
                    label: "Pending",
                    count: stats.pendingCount,
                    color: "#D9A441",
                  },
                  {
                    label: "Overdue",
                    count: stats.overdueCount,
                    color: "#DCE3ED",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-xs text-[#697586]">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </div>
                    <span className="text-sm font-semibold">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <section className="rounded-xl border border-[#E8ECF2] bg-white p-5">
              <h3 className="font-semibold">Top clients</h3>
              <p className="mt-1 text-xs text-[#8993A3]">
                Ranked by collected payments
              </p>

              <div className="mt-5 space-y-4">
                {topClients.length > 0 ? (
                  topClients.map((client, index) => (
                    <div
                      key={client.email || client.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DFE6F3] text-xs font-semibold text-[#24407A]">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {client.name}
                          </p>
                          <p className="text-xs text-[#8993A3]">
                            {client.count} invoices
                          </p>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        {formatMoney(client.total, selectedCurrency)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-[#8993A3]">
                    No client invoice records available yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-[#E8ECF2] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Financial summary</h3>
                  <p className="mt-1 text-xs text-[#8993A3]">
                    Calculated from your invoice records
                  </p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-[#DFE6F3] px-3 py-1.5 text-[11px] font-medium text-[#24407A]">
                  <Bot size={13} /> Insights
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {insights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-lg bg-[#F3F5F8] p-4"
                    >
                      <Icon
                        size={19}
                        className={`${item.color} mt-0.5 shrink-0`}
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#697586]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                to="/assistant"
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#24407A] hover:underline"
              >
                Ask Finora Assistant
                <ArrowUpRight size={14} />
              </Link>
            </section>
          </div>

          <p className="text-center text-[11px] text-[#A0A8B5]">
            Live financial analytics · Synced with MongoDB
          </p>
        </div>
      </main>
    </div>
  );
}
