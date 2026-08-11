const CHAT_URL = "http://localhost:8000/chat";

export async function sendMessage(text) {
  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed (${response.status})`);
  }

  return response.json();
}
