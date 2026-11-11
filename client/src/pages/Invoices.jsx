
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Wallet,
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Sparkles,
  ChartNoAxesCombined,
  Bell,
  Search,
  Plus,
  Download,
  Filter,
  MoreHorizontal,
  CalendarDays,
  ArrowUpRight,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  getStoredInvoices,
  formatMoney,
  formatInvoiceDate,
} from "../lib/invoiceStorage";
import { apiRequest } from "../lib/api";

const sampleInvoices = [
  {
    id: "INV-2026-001",
    client: "Olivia Rhye",
    email: "olivia@example.com",
    issueDate: "2026-10-24",
    dueDate: "2026-11-07",
    currency: "USD",
    totalCents: 240000,
    status: "Paid",
  },
  {
    id: "INV-2026-002",
    client: "Phoenix Baker",
    email: "phoenix@example.com",
    issueDate: "2026-10-22",
    dueDate: "2026-11-08",
    currency: "USD",
    totalCents: 185000,
    status: "Pending",
  },
  {
    id: "INV-2026-003",
    client: "Lana Steiner",
    email: "lana@example.com",
    issueDate: "2026-10-19",
    dueDate: "2026-10-30",
    currency: "USD",
    totalCents: 320000,
    status: "Paid",
  },
  {
    id: "INV-2026-004",
    client: "Demi Wilkinson",
    email: "demi@example.com",
    issueDate: "2026-10-12",
    dueDate: "2026-10-25",
    currency: "USD",
    totalCents: 95000,
    status: "Overdue",
  },
  {
    id: "INV-2026-005",
    client: "Candice Wu",
    email: "candice@example.com",
    issueDate: "2026-10-10",
    dueDate: "2026-11-10",
    currency: "USD",
    totalCents: 150000,
    status: "Pending",
  },
  {
    id: "INV-2026-006",
    client: "Natali Craig",
    email: "natali@example.com",
    issueDate: "2026-10-08",
    dueDate: "2026-10-28",
    currency: "USD",
    totalCents: 210000,
    status: "Paid",
  },
];

const navigation = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Invoices", path: "/invoices", icon: FileText },
  { label: "Payments", path: "/payments", icon: CreditCard },
  { label: "Clients", path: "/clients", icon: Users },
  { label: "AI Assistant", path: "/assistant", icon: Sparkles },
  { label: "Insights", path: "/insights", icon: ChartNoAxesCombined },
];

function getInvoiceStatus(invoice) {
  if (
    invoice.status === "Pending" &&
    invoice.dueDate &&
    new Date(invoice.dueDate) < new Date(new Date().toDateString())
  ) {
    return "Overdue";
  }

  return invoice.status;
}

function escapeCSV(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function exportInvoices(invoices) {
  if (!invoices.length) return;

  const headers = [
    "Invoice ID",
    "Client",
    "Email",
    "Issue Date",
    "Due Date",
    "Currency",
    "Amount",
    "Status",
  ];

  const rows = invoices.map((invoice) => [
    invoice.id,
    invoice.client,
    invoice.email,
    invoice.issueDate,
    invoice.dueDate,
    invoice.currency,
    (invoice.totalCents / 100).toFixed(2),
    getInvoiceStatus(invoice),
  ]);

  const csv = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "finora-invoices.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function mapMongoInvoice(invoice) {
  return {
    ...invoice,
    id: invoice.invoiceNumber || invoice._id,
    mongoId: invoice._id,
    client: invoice.client?.name || "Unknown Client",
    email: invoice.client?.email || "",
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    currency: invoice.currency || "USD",
    totalCents: Math.round(Number(invoice.total || 0) * 100),
    status: invoice.status || "Draft",
  };
}

export default function Invoices() {
  const location = useLocation();

  const [storedInvoices, setStoredInvoices] = useState(() => getStoredInvoices());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalType, setModalType] = useState("");
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    dueDate: "",
    status: "Draft",
    notes: "",
    paymentTerms: "",
  });

  async function loadInvoices() {
    try {
      const response = await apiRequest("/invoices");
      const mongoInvoices = (response.invoices || []).map(mapMongoInvoice);

      setStoredInvoices(mongoInvoices);
      setLoadError("");
    } catch (error) {
      setLoadError(error.message || "Unable to load invoices.");
    } finally {
      setLoading(false);
    }
  }


useEffect(() => {
  let isMounted = true;

  const fetchInvoices = async () => {
    try {
      const response = await apiRequest("/invoices");
      const mongoInvoices = (response.invoices || []).map(mapMongoInvoice);

      if (isMounted) {
        setStoredInvoices(mongoInvoices);
        setLoadError("");
      }
    } catch (error) {
      if (isMounted) {
        setLoadError(error.message || "Unable to load invoices.");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchInvoices();

  return () => {
    isMounted = false;
  };
}, []);


  const allInvoices = useMemo(() => {
    const saved = storedInvoices.map((invoice) => ({
      ...invoice,
      status: getInvoiceStatus(invoice),
    }));

    return [...saved, ...sampleInvoices];
  }, [storedInvoices]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allInvoices.filter((invoice) => {
      const matchesSearch =
        String(invoice.id || "").toLowerCase().includes(query) ||
        String(invoice.client || "").toLowerCase().includes(query) ||
        String(invoice.email || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allInvoices, search, statusFilter]);

  const paidInvoices = allInvoices.filter(
    (invoice) => invoice.status === "Paid"
  );

  const outstandingInvoices = allInvoices.filter(
    (invoice) =>
      invoice.status === "Pending" || invoice.status === "Overdue"
  );

  const paidTotal = paidInvoices.reduce(
    (sum, invoice) => sum + invoice.totalCents,
    0
  );

  const outstandingTotal = outstandingInvoices.reduce(
    (sum, invoice) => sum + invoice.totalCents,
    0
  );

  const stats = [
    {
      label: "Total invoices",
      value: allInvoices.length,
      note: "Across all records",
      icon: FileText,
    },
    {
      label: "Paid amount",
      value: formatMoney(paidTotal, "USD"),
      note: `${paidInvoices.length} paid invoices`,
      icon: ArrowUpRight,
    },
    {
      label: "Outstanding",
      value: formatMoney(outstandingTotal, "USD"),
      note: `${outstandingInvoices.length} unpaid invoices`,
      icon: CalendarDays,
    },
  ];

  const statusStyles = {
    Paid: "bg-[#E8F3ED] text-[#2E7D5B]",
    Pending: "bg-[#FFF5E5] text-[#A66B16]",
    Overdue: "bg-[#FCECEC] text-[#B54747]",
    Draft: "bg-slate-100 text-slate-600",
    Cancelled: "bg-slate-100 text-slate-600",
  };

  function openView(invoice) {
    setSelectedInvoice(invoice);
    setModalType("view");
    setActiveMenu(null);
    setActionError("");
  }

  function openEdit(invoice) {
    setSelectedInvoice(invoice);
    setEditForm({
      title: invoice.title || "",
      dueDate: invoice.dueDate
        ? String(invoice.dueDate).slice(0, 10)
        : "",
      status: invoice.status || "Draft",
      notes: invoice.notes || "",
      paymentTerms: invoice.paymentTerms || "",
    });
    setModalType("edit");
    setActiveMenu(null);
    setActionError("");
  }

  function closeModal() {
    if (saving) return;
    setModalType("");
    setSelectedInvoice(null);
    setActionError("");
  }

  async function handleUpdateInvoice(e) {
    e.preventDefault();

    if (!selectedInvoice?.mongoId) return;

    try {
      setSaving(true);
      setActionError("");

      await apiRequest(`/invoices/${selectedInvoice.mongoId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title,
          dueDate: editForm.dueDate,
          status: editForm.status,
          notes: editForm.notes,
          paymentTerms: editForm.paymentTerms,
        }),
      });

      setSuccessMessage("Invoice updated successfully.");
      setModalType("");
      setSelectedInvoice(null);

      await loadInvoices();
    } catch (error) {
      setActionError(error.message || "Unable to update invoice.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteInvoice(invoice) {
    if (!invoice.mongoId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete invoice ${invoice.id}?`
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setSuccessMessage("");

      await apiRequest(`/invoices/${invoice.mongoId}`, {
        method: "DELETE",
      });

      setSuccessMessage("Invoice deleted successfully.");
      setActiveMenu(null);

      await loadInvoices();
    } catch (error) {
      setActionError(error.message || "Unable to delete invoice.");
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F5F8] text-[#101A2B]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#E5EAF2] bg-white px-5 py-7 lg:flex">
        <Link to="/" className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101A2B] text-white">
            <Wallet size={21} />
          </div>
          <span className="text-xl font-semibold tracking-tight">finora</span>
        </Link>

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#DFE6F3] text-[#24407A]"
                      : "text-slate-500 hover:bg-[#F3F5F8] hover:text-[#101A2B]"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-[#F3F5F8] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Sparkles size={16} className="text-[#24407A]" />
            Finora AI
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Your financial workflow, made simpler.
          </p>
          <Link
            to="/assistant"
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#24407A]"
          >
            Open assistant <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="flex items-center justify-between border-b border-[#E5EAF2] bg-white px-5 py-5 sm:px-8">
          <div>
            <p className="text-xs text-slate-400">Workspace / Invoices</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              Invoices
            </h1>
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="rounded-xl border border-[#E5EAF2] p-2.5 text-slate-500 hover:bg-[#F3F5F8]"
          >
            <Bell size={18} />
          </button>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Invoice management
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create, track and manage your invoices.
              </p>
            </div>

            <Link
              to="/create-invoice"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#24407A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B3262]"
            >
              <Plus size={17} />
              Create invoice
            </Link>
          </div>

          {location.state?.message && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-[#BBDCCB] bg-[#E8F3ED] px-4 py-3 text-sm font-medium text-[#2E7D5B]"
            >
              {location.state.message}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-[#BBDCCB] bg-[#E8F3ED] px-4 py-3 text-sm font-medium text-[#2E7D5B]"
            >
              {successMessage}
              <button
                type="button"
                onClick={() => setSuccessMessage("")}
                className="ml-3 font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {(loadError || actionError) && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {loadError || actionError}
            </div>
          )}

          <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#E5EAF2] bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <div className="rounded-xl bg-[#DFE6F3] p-2.5 text-[#24407A]">
                      <Icon size={18} />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{stat.note}</p>
                </div>
              );
            })}
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E5EAF2] p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold">All invoices</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {loading
                    ? "Loading invoices..."
                    : `${filteredInvoices.length} records found`}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search invoices..."
                    className="w-full rounded-xl border border-[#DFE6F3] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#24407A] sm:w-56"
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#DFE6F3] bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-[#24407A] sm:w-36"
                    aria-label="Filter by status"
                  >
                    <option value="All">All status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Draft">Draft</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => exportInvoices(filteredInvoices)}
                  disabled={filteredInvoices.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DFE6F3] px-4 py-2.5 text-sm font-medium text-[#24407A] hover:bg-[#F3F5F8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#F8F9FB] text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Invoice</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Issue date</th>
                    <th className="px-6 py-4">Due date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EEF1F5]">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-14 text-center text-sm text-slate-400">
                        Loading invoices from MongoDB...
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredInvoices.map((invoice) => (
                      <tr
                        key={invoice.mongoId || invoice.id}
                        className="transition hover:bg-[#FAFBFC]"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-[#24407A]">
                            {invoice.id}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-medium">
                            {invoice.client}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {invoice.email}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatInvoiceDate(invoice.issueDate)}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatInvoiceDate(invoice.dueDate)}
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold">
                          {formatMoney(invoice.totalCents, invoice.currency || "USD")}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[invoice.status] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>

                        <td className="relative px-6 py-4 text-right">
                          <button
                            type="button"
                            title="Invoice actions"
                            aria-label={`More actions for ${invoice.id}`}
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === invoice.id ? null : invoice.id
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-[#F3F5F8]"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {activeMenu === invoice.id && (
                            <div className="absolute right-8 top-12 z-10 w-40 rounded-xl border border-[#E5EAF2] bg-white p-1.5 text-left shadow-lg">
                              <button
                                type="button"
                                onClick={() => openView(invoice)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-[#F3F5F8]"
                              >
                                <Eye size={15} />
                                View details
                              </button>

                              {invoice.mongoId && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openEdit(invoice)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-[#F3F5F8]"
                                  >
                                    <Pencil size={15} />
                                    Edit invoice
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteInvoice(invoice)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 size={15} />
                                    Delete invoice
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}

                  {!loading && filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F5F8] text-slate-400">
                          <FileText size={22} />
                        </div>
                        <p className="mt-3 text-sm font-semibold">
                          No invoices found
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Try another search or change the status filter.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 border-t border-[#E5EAF2] px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredInvoices.length} of {allInvoices.length} invoices
              </span>
              <span>MongoDB records and demo records</span>
            </div>
          </section>
        </div>
      </main>

      {modalType && selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101A2B]/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Invoice management</p>
                <h2 className="mt-1 text-xl font-semibold">
                  {modalType === "view" ? "Invoice details" : "Edit invoice"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedInvoice.id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-[#F3F5F8]"
              >
                <X size={20} />
              </button>
            </div>

            {modalType === "view" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-[#F8F9FB] p-4">
                    <p className="text-xs text-slate-400">Client</p>
                    <p className="mt-1 text-sm font-semibold">
                      {selectedInvoice.client}
                    </p>
                    <p className="mt-1 break-all text-xs text-slate-500">
                      {selectedInvoice.email}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F8F9FB] p-4">
                    <p className="text-xs text-slate-400">Total amount</p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatMoney(
                        selectedInvoice.totalCents,
                        selectedInvoice.currency || "USD"
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedInvoice.status}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Issue date</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatInvoiceDate(selectedInvoice.issueDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Due date</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatInvoiceDate(selectedInvoice.dueDate)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold">Invoice items</p>
                  {selectedInvoice.items?.length ? (
                    <div className="divide-y divide-[#EEF1F5] rounded-xl border border-[#E5EAF2] px-4">
                      {selectedInvoice.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between gap-3 py-3 text-sm"
                        >
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              Qty: {item.quantity} × {formatMoney(
                                Math.round(Number(item.unitPrice || 0) * 100),
                                selectedInvoice.currency || "USD"
                              )}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatMoney(
                              Math.round(Number(item.amount || 0) * 100),
                              selectedInvoice.currency || "USD"
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No item details available.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#F8F9FB] p-4">
                  <div>
                    <p className="text-xs text-slate-400">Subtotal</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatMoney(
                        Math.round(Number(selectedInvoice.subtotal || 0) * 100),
                        selectedInvoice.currency || "USD"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Tax</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatMoney(
                        Math.round(Number(selectedInvoice.tax || 0) * 100),
                        selectedInvoice.currency || "USD"
                      )}
                    </p>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <p className="text-xs text-slate-400">Notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {selectedInvoice.notes}
                    </p>
                  </div>
                )}

                {selectedInvoice.paymentTerms && (
                  <div>
                    <p className="text-xs text-slate-400">Payment terms</p>
                    <p className="mt-1 text-sm">
                      {selectedInvoice.paymentTerms}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full rounded-xl bg-[#24407A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1B3262]"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateInvoice} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Invoice title
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DFE6F3] px-4 py-3 text-sm outline-none focus:border-[#24407A]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Due date
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.dueDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dueDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DFE6F3] px-4 py-3 text-sm outline-none focus:border-[#24407A]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DFE6F3] bg-white px-4 py-3 text-sm outline-none focus:border-[#24407A]"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DFE6F3] px-4 py-3 text-sm outline-none focus:border-[#24407A]"
                    placeholder="Add invoice notes..."
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Payment terms
                  </label>
                  <input
                    type="text"
                    value={editForm.paymentTerms}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        paymentTerms: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#DFE6F3] px-4 py-3 text-sm outline-none focus:border-[#24407A]"
                    placeholder="e.g. Payment due within 15 days"
                  />
                </div>

                {actionError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {actionError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="flex-1 rounded-xl border border-[#DFE6F3] px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-[#F3F5F8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-[#24407A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1B3262] disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
