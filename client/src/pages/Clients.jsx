
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
  Plus,
  Mail,
  MoreHorizontal,
  ArrowUpRight,
  X,
  Pencil,
  Trash2,
  Building2,
  UserRound,
} from "lucide-react";

import { getStoredClients } from "../lib/clientStorage";
import { getStoredInvoices } from "../lib/invoiceStorage";
import { apiRequest } from "../lib/api";

const MIGRATION_KEY = "finora.clients.migrated.v1";

const navigation = [
  { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { name: "Invoices", path: "/invoices", icon: FileText },
  { name: "Payments", path: "/payments", icon: CreditCard },
  { name: "Clients", path: "/clients", icon: Users },
  { name: "AI Assistant", path: "/assistant", icon: Bot },
  { name: "Insights", path: "/insights", icon: ChartNoAxesCombined },
];

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount / 100);

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

function mapApiClient(client) {
  return {
    id: client._id,
    name: client.name || "",
    email: client.email || "",
    company: client.company || "",
    phone: client.phone || "",
    address: client.address || "",
    notes: client.notes || "",
    status: client.status || "Active",
  };
}

function getMigrationMap() {
  try {
    return JSON.parse(localStorage.getItem(MIGRATION_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveMigrationMap(map) {
  localStorage.setItem(MIGRATION_KEY, JSON.stringify(map));
}

function getClientInvoiceStats(client, invoices) {
  const clientInvoices = invoices.filter(
    (invoice) =>
      invoice.email?.toLowerCase() === client.email.toLowerCase()
  );

  const today = new Date().toISOString().slice(0, 10);

  const spent = clientInvoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + (invoice.totalCents || 0), 0);

  const due = clientInvoices
    .filter((invoice) => {
      const isUnpaid =
        invoice.status === "Pending" || invoice.status === "Overdue";

      return (
        isUnpaid ||
        (invoice.status !== "Paid" && invoice.dueDate < today)
      );
    })
    .reduce((sum, invoice) => sum + (invoice.totalCents || 0), 0);

  return {
    invoiceCount: clientInvoices.length,
    spent,
    due,
  };
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [invoices] = useState(() => getStoredInvoices());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    status: "Active",
  });

  useEffect(() => {
    let cancelled = false;

    const loadClients = async () => {
      try {
        setLoading(true);
        setPageError("");

        const result = await apiRequest("/clients");

        let remoteClients = (result.clients || []).map(mapApiClient);
        const legacyClients = getStoredClients();
        const migrationMap = getMigrationMap();

        for (const legacy of legacyClients) {
          if (
            migrationMap[legacy.id] &&
            remoteClients.some(
              (client) => client.id === migrationMap[legacy.id]
            )
          ) {
            continue;
          }

          const existingClient = remoteClients.find(
            (client) =>
              client.email.toLowerCase() === legacy.email.toLowerCase()
          );

          if (existingClient) {
            migrationMap[legacy.id] = existingClient.id;
            saveMigrationMap(migrationMap);
            continue;
          }

          const createdResult = await apiRequest("/clients", {
            method: "POST",
            body: JSON.stringify({
              name: legacy.name,
              email: legacy.email,
              company: legacy.company,
              status: legacy.status,
              isActive: true,
            }),
          });

          const newClient = mapApiClient(createdResult.client);

          remoteClients = [newClient, ...remoteClients];

          migrationMap[legacy.id] = newClient.id;
          saveMigrationMap(migrationMap);
        }

        if (!cancelled) {
          setClients(remoteClients);
        }
      } catch (err) {
        if (!cancelled) {
          setPageError(
            err.message || "Unable to load clients from the server."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadClients();

    return () => {
      cancelled = true;
    };
  }, []);

  const allClients = clients;

  const clientRows = useMemo(() => {
    return allClients.map((client) => ({
      ...client,
      ...getClientInvoiceStats(client, invoices),
    }));
  }, [allClients, invoices]);

  const filteredClients = clientRows.filter((client) => {
    const query = search.toLowerCase();

    const matchesSearch =
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.company.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = allClients.filter(
    (client) => client.status === "Active"
  ).length;

  const openAddModal = () => {
    setEditingClient(null);
    setForm({
      name: "",
      email: "",
      company: "",
      status: "Active",
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email,
      company: client.company,
      status: client.status,
    });
    setError("");
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const company = form.company.trim();

    if (!name || !email || !company) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const duplicate = allClients.some(
      (client) =>
        client.email.toLowerCase() === email &&
        client.id !== editingClient?.id
    );

    if (duplicate) {
      setError("A client with this email already exists.");
      return;
    }

    const payload = {
      name,
      email,
      company,
      status: form.status,
      isActive: true,
    };

    try {
      setSaving(true);

      if (editingClient) {
        const result = await apiRequest(
          `/clients/${editingClient.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        const updatedClient = mapApiClient(result.client);

        setClients((previous) =>
          previous.map((client) =>
            client.id === updatedClient.id ? updatedClient : client
          )
        );
      } else {
        const result = await apiRequest("/clients", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const newClient = mapApiClient(result.client);

        setClients((previous) => [newClient, ...previous]);
      }

      setShowModal(false);
      setEditingClient(null);
    } catch (err) {
      setError(err.message || "Unable to save client.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    setActiveMenu(null);

    const confirmed = window.confirm(
      `Are you sure you want to delete ${client.name}?`
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/clients/${client.id}`, {
        method: "DELETE",
      });

      setClients((previous) =>
        previous.filter((item) => item.id !== client.id)
      );
    } catch (err) {
      alert(err.message || "Unable to delete client. Please try again.");
    }
  };

  const totalDue = clientRows.reduce(
    (sum, client) => sum + client.due,
    0
  );

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("finoraUser") || "{}");
  } catch {
    user = {};
  }

  const accountName =
    user.name || user.fullName || user.username || "Finora User";

  return (
    <div className="min-h-screen bg-[#F3F5F8] text-[#101A2B] flex">
      <aside className="hidden lg:flex w-[250px] shrink-0 bg-white border-r border-[#E5E9F0] flex-col">
        <div className="px-7 py-7">
          <Link to="/" className="text-[25px] font-bold tracking-tight">
            Finora<span className="text-[#24407A]">.</span>
          </Link>
          <p className="text-xs text-[#8993A5] mt-1">
            Financial workspace
          </p>
        </div>

        <div className="px-4">
          <p className="text-[10px] font-semibold tracking-[1.5px] text-[#9AA3B2] px-3 mb-3">
            WORKSPACE
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition ${
                      isActive
                        ? "bg-[#DFE6F3] text-[#24407A] font-semibold"
                        : "text-[#657187] hover:bg-[#F3F5F8]"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-5">
          <div className="rounded-xl bg-[#F3F5F8] p-4">
            <p className="text-sm font-semibold">Need help?</p>
            <p className="text-xs text-[#7C8799] mt-1 leading-5">
              Visit the AI Assistant for help managing your finances.
            </p>
            <Link
              to="/assistant"
              className="text-xs font-semibold text-[#24407A] mt-3 inline-flex items-center gap-1"
            >
              Open assistant <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-[76px] bg-white border-b border-[#E5E9F0] px-5 md:px-9 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8993A5]">Workspace /</p>
            <h1 className="text-lg font-semibold">Clients</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold">{accountName}</p>
              <p className="text-xs text-[#8993A5]">Workspace admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#DFE6F3] text-[#24407A] flex items-center justify-center font-semibold text-sm">
              {getInitials(accountName)}
            </div>
          </div>
        </header>

        <div className="p-5 md:p-9 max-w-[1450px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Your clients
              </h2>
              <p className="text-sm text-[#7C8799] mt-1">
                Manage your clients and keep track of their invoices.
              </p>
            </div>

            <button
              onClick={openAddModal}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-[#24407A] hover:bg-[#1B3261] disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-medium transition"
            >
              <Plus size={17} />
              Add client
            </button>
          </div>

          {pageError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {pageError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
            {[
              { label: "Total clients", value: allClients.length, icon: Users },
              { label: "Active clients", value: activeCount, icon: UserRound },
              { label: "Total outstanding", value: formatMoney(totalDue), icon: CreditCard },
              { label: "Saved clients", value: clients.length, icon: Building2 },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="bg-white border border-[#E5E9F0] rounded-2xl p-5"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-[#7C8799]">{stat.label}</p>
                    <div className="w-9 h-9 rounded-xl bg-[#DFE6F3] text-[#24407A] flex items-center justify-center">
                      <Icon size={17} />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold mt-4">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <section className="bg-white border border-[#E5E9F0] rounded-2xl overflow-hidden">
            <div className="p-5 md:p-6 border-b border-[#E5E9F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">All clients</h3>
                <p className="text-xs text-[#8993A5] mt-1">
                  {loading ? "Loading clients..." : `${filteredClients.length} clients found`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8993A5]"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="w-full sm:w-[230px] pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E9F0] bg-[#F8F9FB] text-sm outline-none focus:border-[#24407A]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-[#E5E9F0] bg-[#F8F9FB] text-sm outline-none"
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#F8F9FB]">
                  <tr className="text-[11px] uppercase tracking-wider text-[#8993A5]">
                    <th className="px-6 py-4 font-semibold">Client</th>
                    <th className="px-5 py-4 font-semibold">Invoices</th>
                    <th className="px-5 py-4 font-semibold">Total spent</th>
                    <th className="px-5 py-4 font-semibold">Outstanding</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EEF0F4]">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-[#FAFBFD] transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#DFE6F3] text-[#24407A] flex items-center justify-center text-xs font-semibold shrink-0">
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{client.name}</p>
                            <p className="text-xs text-[#8993A5] mt-1 flex items-center gap-1">
                              <Mail size={12} />
                              {client.email}
                            </p>
                            <p className="text-xs text-[#A0A8B5] mt-1">
                              {client.company}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm">{client.invoiceCount}</td>
                      <td className="px-5 py-4 text-sm font-medium">{formatMoney(client.spent)}</td>
                      <td className="px-5 py-4 text-sm font-medium">{formatMoney(client.due)}</td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            client.status === "Active"
                              ? "bg-[#E6F2EC] text-[#2E7D5B]"
                              : "bg-[#F1F2F5] text-[#7C8799]"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setActiveMenu(activeMenu === client.id ? null : client.id)
                            }
                            className="p-2 rounded-lg hover:bg-[#EEF1F6] text-[#7C8799]"
                            aria-label="Client actions"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {activeMenu === client.id && (
                            <div className="absolute right-0 top-10 z-20 w-36 bg-white border border-[#E5E9F0] shadow-lg rounded-xl p-1">
                              <button
                                onClick={() => openEditModal(client)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#344054] hover:bg-[#F3F5F8] rounded-lg"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(client)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredClients.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-14 text-sm text-[#8993A5]">
                        No clients found. Try another search or add a client.
                      </td>
                    </tr>
                  )}

                  {loading && (
                    <tr>
                      <td colSpan="6" className="text-center py-14 text-sm text-[#8993A5]">
                        Loading your clients...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-[#E5E9F0] text-xs text-[#8993A5]">
              Your clients are stored in your Finora account.
            </div>
          </section>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#101A2B]/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-[#E5E9F0]">
              <div>
                <h3 className="text-lg font-semibold">
                  {editingClient ? "Edit client" : "Add new client"}
                </h3>
                <p className="text-xs text-[#8993A5] mt-1">
                  Enter your client's details below.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-[#F3F5F8] text-[#7C8799]"
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Client name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={80}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E9F0] text-sm outline-none focus:border-[#24407A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={120}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E9F0] text-sm outline-none focus:border-[#24407A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  maxLength={100}
                  placeholder="Company name"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E9F0] text-sm outline-none focus:border-[#24407A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E9F0] text-sm outline-none focus:border-[#24407A]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#E5E9F0] text-sm font-medium hover:bg-[#F8F9FB] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#24407A] hover:bg-[#1B3261] disabled:opacity-50 text-white text-sm font-medium"
                >
                  {saving
                    ? "Saving..."
                    : editingClient
                      ? "Save changes"
                      : "Add client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
