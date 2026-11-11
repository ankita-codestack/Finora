
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wallet,
  ArrowLeft,
  Sparkles,
  UserRound,
  Mail,
  CalendarDays,
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  Info,
} from "lucide-react";

import { formatMoney } from "../lib/invoiceStorage";
import { apiRequest } from "../lib/api";

const today = new Date().toLocaleDateString("en-CA");

const initialItem = () => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: "1",
  unitPrice: "",
});

export default function CreateInvoice() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [clientLoadError, setClientLoadError] = useState("");

  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [currency, setCurrency] = useState("USD");
  const [items, setItems] = useState([initialItem()]);
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedClientData = clients.find(
    (item) => item._id === selectedClient
  );

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setClientLoadError("");

        const result = await apiRequest("/clients");

        const activeClients = (result.clients || []).filter(
          (item) =>
            item.isActive !== false &&
            item.status !== "Inactive"
        );

        setClients(activeClients);
      } catch (err) {
        setClientLoadError(
          err.message || "Unable to load clients."
        );
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  const calculations = useMemo(() => {
    const subtotalCents = items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPriceCents = Math.round(
        (Number(item.unitPrice) || 0) * 100
      );

      return total + Math.round(quantity * unitPriceCents);
    }, 0);

    const safeTaxRate = Math.min(
      100,
      Math.max(0, Number(taxRate) || 0)
    );

    const taxCents = Math.round(
      (subtotalCents * safeTaxRate) / 100
    );

    return {
      subtotalCents,
      taxCents,
      totalCents: subtotalCents + taxCents,
    };
  }, [items, taxRate]);

  const updateItem = (id, field, value) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((current) => [...current, initialItem()]);
  };

  const removeItem = (id) => {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((item) => item.id !== id)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedClientData) {
      setError("Please select a client.");
      return;
    }

    if (!issueDate || !dueDate || dueDate < issueDate) {
      setError("Due date cannot be earlier than the issue date.");
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      setError("Please add a description for every invoice item.");
      return;
    }

    if (
      items.some(
        (item) =>
          !Number.isFinite(Number(item.quantity)) ||
          Number(item.quantity) <= 0 ||
          !Number.isFinite(Number(item.unitPrice)) ||
          Number(item.unitPrice) < 0 ||
          item.quantity === "" ||
          item.unitPrice === ""
      )
    ) {
      setError("Enter a valid quantity and unit price for every item.");
      return;
    }

    const parsedTax = Number(taxRate);

    if (
      taxRate === "" ||
      !Number.isFinite(parsedTax) ||
      parsedTax < 0 ||
      parsedTax > 100
    ) {
      setError("Tax rate must be between 0 and 100.");
      return;
    }

    if (calculations.totalCents <= 0) {
      setError("Invoice total must be greater than zero.");
      return;
    }

    const invoiceNumber = `FIN-${Date.now()}`;

    const payload = {
      client: selectedClientData._id,
      invoiceNumber,
      title: items[0].description.trim(),
      items: items.map((item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);

        return {
          description: item.description.trim(),
          quantity,
          unitPrice,
          amount: Math.round(quantity * unitPrice * 100) / 100,
        };
      }),
      subtotal: calculations.subtotalCents / 100,
      tax: calculations.taxCents / 100,
      total: calculations.totalCents / 100,
      currency,
      issueDate,
      dueDate,
      notes: notes.trim(),
      paymentTerms: "",
      aiGenerated: false,
    };

    try {
      setIsSaving(true);

      const result = await apiRequest("/invoices", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      navigate("/invoices", {
        state: {
          message:
            result.message || "Invoice created successfully.",
        },
      });
    } catch (saveError) {
      setError(saveError.message || "Unable to save invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#DFE6F3] bg-white px-4 py-3 text-sm text-[#101A2B] outline-none transition placeholder:text-slate-400 focus:border-[#24407A] focus:ring-2 focus:ring-[#24407A]/10";

  const labelClass =
    "text-sm font-medium text-[#101A2B]";

  return (
    <div className="min-h-screen bg-[#F3F5F8] text-[#101A2B]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#E5EAF2] bg-white px-5 py-7 lg:flex">
        <Link to="/" className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101A2B] text-white">
            <Wallet size={21} />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            finora
          </span>
        </Link>

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {[
            { label: "Overview", path: "/dashboard" },
            { label: "Invoices", path: "/invoices", active: true },
            { label: "Payments", path: "/payments" },
            { label: "Clients", path: "/clients" },
            { label: "AI Assistant", path: "/assistant" },
            { label: "Insights", path: "/insights" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                item.active
                  ? "bg-[#DFE6F3] text-[#24407A]"
                  : "text-slate-500 hover:bg-[#F3F5F8] hover:text-[#101A2B]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-[#F3F5F8] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Sparkles size={16} className="text-[#24407A]" />
            Finora AI
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Create and manage invoices with a smarter workflow.
          </p>
          <Link
            to="/assistant"
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#24407A]"
          >
            Open assistant <ArrowRight size={14} />
          </Link>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="flex items-center justify-between border-b border-[#E5EAF2] bg-white px-5 py-5 sm:px-8">
          <div>
            <p className="text-xs text-slate-400">Invoices / New invoice</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              Create invoice
            </h1>
          </div>

          <Link
            to="/invoices"
            className="flex items-center gap-2 rounded-xl border border-[#DFE6F3] px-4 py-2.5 text-sm font-medium text-[#24407A] hover:bg-[#F3F5F8]"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to invoices</span>
          </Link>
        </header>

        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
          <div className="mb-7">
            <h2 className="text-2xl font-semibold tracking-tight">
              New invoice
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add client details and invoice items to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl border border-[#E5EAF2] bg-white p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFE6F3] text-[#24407A]">
                  <UserRound size={19} />
                </div>
                <div>
                  <h3 className="font-semibold">Client information</h3>
                  <p className="text-xs text-slate-500">
                    Who is this invoice for?
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Select client
                  <select
                    className={inputClass}
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    required
                    disabled={isLoadingClients || clients.length === 0}
                  >
                    <option value="">
                      {isLoadingClients
                        ? "Loading clients..."
                        : clients.length === 0
                          ? "No active clients available"
                          : "Choose a client"}
                    </option>

                    {clients.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} — {item.company || item.email}
                      </option>
                    ))}
                  </select>

                  {clientLoadError && (
                    <p className="mt-2 text-xs text-red-600">
                      {clientLoadError}
                    </p>
                  )}

                  {!isLoadingClients &&
                    !clientLoadError &&
                    clients.length === 0 && (
                      <p className="mt-2 text-xs text-slate-500">
                        Add an active client from the Clients page first.
                      </p>
                    )}
                </label>

                <label className={labelClass}>
                  Email address
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-[27px] text-slate-400"
                    />
                    <input
                      className={`${inputClass} pl-10`}
                      type="email"
                      value={selectedClientData?.email || ""}
                      placeholder="Client email"
                      readOnly
                    />
                  </div>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5EAF2] bg-white p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFE6F3] text-[#24407A]">
                  <CalendarDays size={19} />
                </div>
                <div>
                  <h3 className="font-semibold">Invoice details</h3>
                  <p className="text-xs text-slate-500">
                    Set dates and currency for this invoice.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <label className={labelClass}>
                  Issue date
                  <input
                    className={inputClass}
                    type="date"
                    value={issueDate}
                    onChange={(e) => {
                      setIssueDate(e.target.value);
                      if (dueDate < e.target.value) {
                        setDueDate(e.target.value);
                      }
                    }}
                    required
                  />
                </label>

                <label className={labelClass}>
                  Due date
                  <input
                    className={inputClass}
                    type="date"
                    min={issueDate}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </label>

                <label className={labelClass}>
                  Currency
                  <select
                    className={inputClass}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="INR">INR — Indian Rupee</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5EAF2] bg-white p-5 sm:p-7">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFE6F3] text-[#24407A]">
                    <FileText size={19} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Invoice items</h3>
                    <p className="text-xs text-slate-500">
                      Add the products or services.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 rounded-xl border border-[#DFE6F3] px-3 py-2.5 text-sm font-semibold text-[#24407A] hover:bg-[#F3F5F8]"
                >
                  <Plus size={16} />
                  Add item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#E5EAF2] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        Item {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        aria-label={`Remove item ${index + 1}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_110px_150px]">
                      <label className={labelClass}>
                        Description
                        <input
                          className={inputClass}
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          placeholder="e.g. Website design"
                          maxLength={150}
                          required
                        />
                      </label>

                      <label className={labelClass}>
                        Quantity
                        <input
                          className={inputClass}
                          type="number"
                          min="0.01"
                          max="100000"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, "quantity", e.target.value)
                          }
                          required
                        />
                      </label>

                      <label className={labelClass}>
                        Unit price
                        <input
                          className={inputClass}
                          type="number"
                          min="0"
                          max="100000000"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(item.id, "unitPrice", e.target.value)
                          }
                          placeholder="0.00"
                          required
                        />
                      </label>
                    </div>

                    <p className="mt-3 text-right text-xs text-slate-500">
                      Line total:{" "}
                      <span className="font-semibold text-[#101A2B]">
                        {formatMoney(
                          Math.round(
                            (Number(item.quantity) || 0) *
                              Math.round((Number(item.unitPrice) || 0) * 100)
                          ),
                          currency
                        )}
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Tax rate (%)
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="mt-6 ml-auto max-w-sm space-y-3 border-t border-[#E5EAF2] pt-5">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatMoney(calculations.subtotalCents, currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tax ({Number(taxRate) || 0}%)</span>
                  <span>{formatMoney(calculations.taxCents, currency)}</span>
                </div>
                <div className="flex justify-between border-t border-[#E5EAF2] pt-4 text-base font-semibold">
                  <span>Total amount</span>
                  <span className="text-[#24407A]">
                    {formatMoney(calculations.totalCents, currency)}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5EAF2] bg-white p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFE6F3] text-[#24407A]">
                  <FileText size={19} />
                </div>
                <div>
                  <h3 className="font-semibold">Additional notes</h3>
                  <p className="text-xs text-slate-500">
                    Add payment instructions or a message.
                  </p>
                </div>
              </div>

              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for your client..."
                maxLength={1000}
              />
              <p className="mt-2 text-right text-xs text-slate-400">
                {notes.length}/1000
              </p>
            </section>

            <div className="flex items-start gap-3 rounded-xl border border-[#DFE6F3] bg-[#DFE6F3]/50 p-4 text-sm text-[#24407A]">
              <Info size={18} className="mt-0.5 shrink-0" />
              <p>
                This invoice will be saved to your Finora account. Payment
                can be collected separately through PayPal.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <Link
                to="/invoices"
                className="rounded-xl border border-[#DFE6F3] bg-white px-6 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-[#F3F5F8]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSaving || isLoadingClients || clients.length === 0}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#24407A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1B3262] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Create invoice"}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
