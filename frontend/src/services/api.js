/**
 * Thin wrapper around the SYNTRA backend API.
 * All HTTP concerns (base URL, error normalisation) live here so
 * components/hooks never call fetch() directly.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Sends a message + short conversation history to the backend and
 * returns the assistant's reply text.
 *
 * @param {string} message
 * @param {{role: 'user'|'assistant', content: string}[]} conversation
 * @returns {Promise<string>}
 */
export async function sendChatMessage(message, conversation) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, conversation }),
    });
  } catch {
    throw new ApiError(
      "Can't reach the SYNTRA backend. Make sure it's running and try again.",
      0
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // response body wasn't JSON — fall through to generic error below
  }

  if (!response.ok) {
    const detail = extractDetail(data) || `Request failed with status ${response.status}.`;
    throw new ApiError(detail, response.status);
  }

  if (!data?.response) {
    throw new ApiError("Received an empty response from SYNTRA.", response.status);
  }

  return data.response;
}

async function taskRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError(
      "Can't reach the SYNTRA backend. Make sure it's running and try again.",
      0
    );
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    // response body wasn't JSON — fall through to generic error below
  }

  if (!response.ok) {
    const detail = extractDetail(data) || `Request failed with status ${response.status}.`;
    throw new ApiError(detail, response.status);
  }

  return data;
}

export function fetchTasks() {
  return taskRequest("/api/tasks");
}

export function createTask(task) {
  return taskRequest("/api/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export function updateTask(taskId, changes) {
  return taskRequest(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deleteTask(taskId) {
  return taskRequest(`/api/tasks/${taskId}`, { method: "DELETE" });
}

function extractDetail(data) {
  if (!data) return null;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    // FastAPI/pydantic validation error shape
    return data.detail.map((d) => d.msg).join(" ");
  }
  return null;
}