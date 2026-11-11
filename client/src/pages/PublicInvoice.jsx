
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { FileText, LoaderCircle, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PublicInvoice() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const captureStarted = useRef(false);

  const formatMoney = (amount, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(Number(amount || 0));

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/invoices/public/${encodeURIComponent(token)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load this invoice.");
        }

        setInvoice(data.invoice || data.data || data);
      } catch (err) {
        setError(err.message || "Unable to load invoice.");
      } finally {
        setLoading(false);
      }
    };

    if (token) loadInvoice();
  }, [token]);

  useEffect(() => {
    const capturePayment = async () => {
      const orderId = searchParams.get("token");

      if (
        !orderId ||
        searchParams.get("payment") === "cancelled" ||
        captureStarted.current
      ) {
        return;
      }

      captureStarted.current = true;
      setPaying(true);
      setMessage("Confirming your payment...");

      try {
        const response = await fetch(
          `${API_URL}/payments/public/${encodeURIComponent(token)}/capture-order/${encodeURIComponent(orderId)}`,
          { method: "POST", headers: { "Content-Type": "application/json" } }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Payment confirmation failed.");
        }

        setMessage("Payment completed successfully!");
        if (data.invoice) setInvoice(data.invoice);
      } catch (err) {
        setMessage(err.message || "Payment confirmation failed.");
        captureStarted.current = false;
      } finally {
        setPaying(false);
      }
    };

    capturePayment();
  }, [token, searchParams]);

  const handlePayment = async () => {
    try {
      setPaying(true);
      setError("");

      const response = await fetch(
        `${API_URL}/payments/public/${encodeURIComponent(token)}/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not start PayPal payment.");
      }

      if (!data.approvalUrl) {
        throw new Error("PayPal approval link was not returned by the server.");
      }

      window.location.assign(data.approvalUrl);
    } catch (err) {
      setError(err.message || "Payment could not be started.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#F3F5F8]">
        <div className="flex items-center gap-3 text-[#24407A]">
          <LoaderCircle className="animate-spin" />
          <span>Loading invoice...</span>
        </div>
      </main>
    );
  }

  if (error && !invoice) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#F3F5F8] p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={34} />
          <h1 className="text-xl font-semibold text-[#101A2B]">
            Invoice unavailable
          </h1>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
      </main>
    );
  }

  if (!invoice) return null;

  const currency = invoice.currency || "USD";
  const items = invoice.items || invoice.lineItems || [];
  const isPaid =
    String(invoice.status || "").toLowerCase() === "paid";

  const invoiceNumber =
    invoice.invoiceNumber || invoice.invoiceNo || invoice.number || "Invoice";

  const clientName =
    invoice.clientName || invoice.client?.name || invoice.client?.companyName || "Client";

  return (
    <main className="min-h-screen bg-[#F3F5F8] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-[#24407A] p-2.5 text-white">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#101A2B]">Finora</h1>
            <p className="text-sm text-gray-500">Invoice payment</p>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-[#E1E5EC] bg-white shadow-sm">
          <div className="border-b border-[#E8EBF0] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Invoice</p>
                <h2 className="mt-1 text-2xl font-bold text-[#101A2B]">
                  {invoiceNumber}
                </h2>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  isPaid
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {invoice.status || "Pending"}
              </span>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Bill to
                </p>
                <p className="mt-1 font-medium text-[#101A2B]">{clientName}</p>
                {invoice.clientEmail && (
                  <p className="text-sm text-gray-500">{invoice.clientEmail}</p>
                )}
              </div>

              <div className="sm:text-right">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Issue date
                </p>
                <p className="mt-1 text-sm text-[#101A2B]">
                  {invoice.issueDate
                    ? new Date(invoice.issueDate).toLocaleDateString()
                    : "—"}
                </p>
                <p className="mt-3 text-xs uppercase tracking-wide text-gray-400">
                  Due date
                </p>
                <p className="mt-1 text-sm text-[#101A2B]">
                  {invoice.dueDate
                    ? new Date(invoice.dueDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="mb-4 font-semibold text-[#101A2B]">Invoice items</h3>

            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E8EBF0] text-gray-500">
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 text-center font-medium">Qty</th>
                      <th className="pb-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const quantity = Number(item.quantity || 1);
                      const amount = Number(
                        item.amount ??
                        item.total ??
                        Number(item.price || item.unitPrice || 0) * quantity
                      );

                      return (
                        <tr key={item._id || index} className="border-b border-[#F0F2F5]">
                          <td className="py-4 text-[#101A2B]">
                            {item.description || item.name || "Item"}
                          </td>
                          <td className="py-4 text-center text-gray-600">
                            {quantity}
                          </td>
                          <td className="py-4 text-right text-[#101A2B]">
                            {formatMoney(amount, currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No item details are available for this invoice.
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-xs border-t border-[#E8EBF0] pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#101A2B]">Total</span>
                  <span className="text-2xl font-bold text-[#101A2B]">
                    {formatMoney(invoice.total ?? invoice.amount, currency)}
                  </span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-6 rounded-xl bg-[#F7F8FA] p-4">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Notes
                </p>
                <p className="mt-1 text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}

            {message && (
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle2 size={18} />
                {message}
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-8">
              {isPaid ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 p-4 font-semibold text-green-700">
                  <CheckCircle2 size={20} />
                  This invoice has been paid
                </div>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#24407A] px-5 py-4 font-semibold text-white transition hover:bg-[#1B3263] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paying ? (
                    <LoaderCircle className="animate-spin" size={19} />
                  ) : (
                    <CreditCard size={19} />
                  )}
                  {paying ? "Please wait..." : "Pay with PayPal"}
                </button>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              Secure payment powered by PayPal Sandbox.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
