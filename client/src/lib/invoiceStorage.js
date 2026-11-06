
const STORAGE_KEY = "finora.invoices.v1";

function isValidInvoice(invoice) {
  return (
    invoice &&
    typeof invoice.id === "string" &&
    typeof invoice.client === "string" &&
    typeof invoice.email === "string" &&
    typeof invoice.issueDate === "string" &&
    typeof invoice.dueDate === "string" &&
    typeof invoice.currency === "string" &&
    typeof invoice.totalCents === "number" &&
    Number.isFinite(invoice.totalCents) &&
    invoice.totalCents >= 0 &&
    Array.isArray(invoice.items)
  );
}

export function getStoredInvoices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidInvoice);
  } catch {
    return [];
  }
}

export function saveInvoice(invoice) {
  if (!isValidInvoice(invoice)) {
    throw new Error("Invalid invoice data.");
  }

  const invoices = getStoredInvoices();

  if (invoices.some((item) => item.id === invoice.id)) {
    throw new Error("Invoice ID already exists. Please try again.");
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([invoice, ...invoices])
    );
  } catch {
    throw new Error("Unable to save invoice. Browser storage may be full or unavailable.");
  }
}

export function generateInvoiceId() {
  const year = new Date().getFullYear();
  const uniquePart =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Date.now().toString(36).toUpperCase();

  return `INV-${year}-${uniquePart}`;
}

export function formatMoney(cents, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatInvoiceDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}
