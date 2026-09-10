const CHAT_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/chat";

// In-memory session ID generator (React state handles active session; helper provided)
export function generateSessionId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "session-" + Math.random().toString(36).substring(2, 11);
}

let currentSessionId = generateSessionId();

export function getSessionId() {
  return currentSessionId;
}

export function resetSessionId() {
  currentSessionId = generateSessionId();
  return currentSessionId;
}

/**
 * Send a message via POST /chat using multipart/form-data.
 *
 * @param {string} text - User message string
 * @param {File|null} file - Optional image or PDF attachment
 * @param {string|null} sessionId - Optional explicit session ID from React state
 * @returns {Promise<{response: string, route: string[], actions: any, error: string|null, session_id: string}>}
 */
export async function sendMessage(text, file = null, sessionId = null) {
  const activeSession = sessionId || currentSessionId;

  const formData = new FormData();
  formData.append("message", text);
  formData.append("session_id", activeSession);

  if (file) {
    formData.append("file", file);
    // Include alias for backward-compatibility with image parameter
    formData.append("image", file);
  }

  let response;
  try {
    response = await fetch(CHAT_URL, {
      method: "POST",
      body: formData,
    });
  } catch (netErr) {
    throw new Error(
      "Unable to connect to RuralAssist AI server. Please verify the backend is running on http://localhost:8000."
    );
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || "";
    } catch {
      // Ignore json parse error on HTTP 5xx
    }

    if (response.status === 400) {
      throw new Error(errorDetail || "Invalid request. Please check your message or attachment.");
    } else if (response.status >= 500) {
      throw new Error(
        errorDetail || "The advisor service encountered an unexpected error. Please try again in a moment."
      );
    }
    throw new Error(errorDetail || `Request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data.session_id) {
    currentSessionId = data.session_id;
  }

  return {
    response: data.response || "",
    route: Array.isArray(data.route) ? data.route : [],
    actions: data.actions ?? null,
    error: data.error ?? null,
    session_id: data.session_id || activeSession,
  };
}
