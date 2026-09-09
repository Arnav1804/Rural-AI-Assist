// frontend/src/App.jsx

import { useState } from "react";
import { sendMessage } from "./api";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

let nextId = 1;

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend(text) {
    const userMsg = {
      id: nextId++,
      role: "user",
      content: text,
      route: [],
      timestamp: formatTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { response, route } = await sendMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId++,
          role: "assistant",
          content: response,
          route: route ?? [],
          timestamp: formatTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId++,
          role: "assistant",
          content:
            "Something went wrong reaching the server. Please try again.",
          route: [],
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-emerald-50">
      {/* Centered chat container */}
      <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden shadow-2xl shadow-gray-300/40 sm:my-6 sm:h-[calc(100vh-48px)] sm:rounded-2xl sm:border sm:border-gray-200">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-5 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-white shadow-sm">
            RA
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-gray-900">RuralAssist AI</h1>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online
            </span>
          </div>
        </header>

        {/* Messages */}
        <ChatWindow messages={messages} isLoading={isLoading} />

        {/* Input */}
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
