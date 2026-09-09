// frontend/src/App.jsx

import React, { useState } from "react";
import { sendMessage, generateSessionId, resetSessionId } from "./api";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

let nextId = 1;

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [lastFailedMessage, setLastFailedMessage] = useState(null); // { text, file }

  function handleNewConversation() {
    const newId = resetSessionId();
    setSessionId(newId);
    setMessages([]);
    setLastFailedMessage(null);
  }

  async function handleSend(text, file = null) {
    const isImg = file && file.type?.startsWith("image/");
    const previewUrl = file ? URL.createObjectURL(file) : null;

    const userMsg = {
      id: nextId++,
      role: "user",
      content: text,
      imageUrl: isImg ? previewUrl : null,
      file: file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl,
          }
        : null,
      route: [],
      actions: null,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setLastFailedMessage(null);

    try {
      const data = await sendMessage(text, file, sessionId);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId++,
          role: "assistant",
          content: data.response || "No response received from the advisor.",
          route: data.route ?? [],
          actions: data.actions ?? null,
          error: data.error ?? null,
          timestamp: formatTime(),
        },
      ]);
    } catch (err) {
      setLastFailedMessage({ text, file });
      setMessages((prev) => [
        ...prev,
        {
          id: nextId++,
          role: "assistant",
          content:
            err.message ||
            "Unable to reach the advisor service. Please verify your connection and try again.",
          route: [],
          actions: null,
          timestamp: formatTime(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRetry() {
    if (!lastFailedMessage || isLoading) return;
    const { text, file } = lastFailedMessage;
    handleSend(text, file);
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F4F1EA] p-0 sm:p-4">
      {/* Centered chat ledger console */}
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-[#FCFBF8] sm:h-[calc(100vh-32px)] sm:rounded-2xl sm:border sm:border-[#E2DDD3] sm:shadow-lg sm:shadow-stone-900/5">
        {/* Header with earthy branding and domain cues */}
        <header className="flex items-center justify-between border-b border-[#E2DDD3] bg-[#FCFBF8] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Insignia */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C2D8CB] bg-[#255940] text-[#FCFBF8] shadow-sm select-none">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22v-9" />
                <path d="M12 13a5 5 0 0 0 5-5c0-4-5-6-5-6s-5 2-5 6a5 5 0 0 0 5 5z" />
              </svg>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-base font-bold tracking-tight text-[#1C2620]">
                  RuralAssist AI
                </h1>
                <span className="flex items-center gap-1 text-[11px] text-[#255940] font-medium">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#255940]" />
                  Active
                </span>
              </div>
              <p className="hidden text-[11px] text-[#5E6861] sm:block">
                Multi-Agent Advisor &bull; Agriculture, Weather, Schemes, Health
              </p>
            </div>
          </div>

          {/* Actions & Domain Indicator */}
          <div className="flex items-center gap-2">
            {/* New Conversation Button */}
            <button
              type="button"
              onClick={handleNewConversation}
              className="flex items-center gap-1.5 rounded-lg border border-[#E2DDD3] bg-[#F4F1EA] px-3 py-1.5 text-xs font-medium text-[#1C2620] hover:border-[#255940] hover:bg-[#E8F0EB] hover:text-[#255940] transition-colors focus-visible:ring-2 focus-visible:ring-[#255940] focus-visible:outline-none"
              title="Start a fresh conversation and reset memory"
              aria-label="Start new conversation"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              <span>New chat</span>
            </button>
          </div>
        </header>

        {/* Retry Banner on failure */}
        {lastFailedMessage && !isLoading && (
          <div className="flex items-center justify-between border-b border-[#E8C4C4] bg-[#FDF2F2] px-4 py-2 text-xs text-[#8A3535]">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Last message could not be sent.</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Messages list */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSelectPrompt={(promptText) => handleSend(promptText)}
        />

        {/* Input dock */}
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}

