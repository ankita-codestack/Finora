const STORAGE_KEY = "finora.clients.v1";

function isValidClient(client) {
  return (
    client &&
    typeof client.id === "string" &&
    typeof client.name === "string" &&
    typeof client.email === "string" &&
    typeof client.company === "string" &&
    ["Active", "Inactive"].includes(client.status)
  );
}

export function getStoredClients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidClient);
  } catch {
    return [];
  }
}

export function saveClients(clients) {
  if (!Array.isArray(clients) || !clients.every(isValidClient)) {
    throw new Error("Invalid client data.");
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch {
    throw new Error("Unable to save clients. Browser storage may be unavailable.");
  }
}

export function generateClientId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}