// frontend/src/components/ChatWindow.jsx

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import LoadingIndicator from "./LoadingIndicator";

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const showEmpty = messages.length === 0 && !isLoading;

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      {showEmpty ? (
        /* ---------- Empty state ---------- */
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          {/* Logo circle */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200">
            {/* Leaf / plant SVG icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10"
            >
              <path d="M17 8c.7-1 1-2.2 1-3.5C18 3 16.5 2 16.5 2S14 3 14 4.5c0 .5.1 1 .3 1.4" />
              <path d="M12 22c-4-4-8-7.5-8-12C4 5.5 7.6 2 12 2s8 3.5 8 8c0 4.5-4 8-8 12z" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">RuralAssist AI</h2>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-gray-500">
              Your AI assistant for weather, crop prices, government schemes, and health guidance.
            </p>
          </div>

          {/* Suggestion chips */}
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {[
              "Tell me about PM-Kisan",
              "I have a fever",
              "Ayushman Bharat eligibility",
            ].map((hint) => (
              <span
                key={hint}
                className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs text-gray-500 shadow-sm"
              >
                {hint}
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* ---------- Message list ---------- */
        <div className="space-y-5 p-4 pb-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              text={msg.content}
              route={msg.route}
              timestamp={msg.timestamp}
            />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </main>
  );
}
