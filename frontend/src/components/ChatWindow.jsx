// frontend/src/components/ChatWindow.jsx

import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import LoadingIndicator from "./LoadingIndicator";

const EXAMPLE_PROMPTS = [
  {
    icon: "🌦️",
    badge: "Weather + Agriculture",
    badgeBg: "bg-[#E8F1F5] text-[#26526E] border-[#BFD4E2]",
    text: "What is the weather in Pune and is it safe to spray pesticides on wheat?",
  },
  {
    icon: "📜",
    badge: "Government Schemes",
    badgeBg: "bg-[#FAF3E3] text-[#945F16] border-[#EAD5AB]",
    text: "What are the eligibility criteria and benefits under PM-Kisan Samman Nidhi?",
  },
  {
    icon: "🩺",
    badge: "Healthcare Advisory",
    badgeBg: "bg-[#F8ECEC] text-[#8A3535] border-[#E4BFBF]",
    text: "I have joint pain and a persistent fever after working in waterlogged fields.",
  },
  {
    icon: "⚡",
    badge: "Action & Tasks",
    badgeBg: "bg-[#ECEEEB] text-[#2F3E33] border-[#CCD4CF]",
    text: "Remind me to inspect wheat crop for yellow rust tomorrow morning.",
  },
];

export default function ChatWindow({ messages, isLoading, onSelectPrompt }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isNearBottomRef = useRef(true);

  // Track whether user is near the bottom
  function handleScroll() {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceToBottom < 80;
    isNearBottomRef.current = nearBottom;
    setShowScrollBottom(!nearBottom && messages.length > 0);
  }

  // Auto-scroll only if user was already at or near bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBottom(false);
    isNearBottomRef.current = true;
  }

  const showEmpty = messages.length === 0 && !isLoading;

  return (
    <main
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto bg-[#F4F1EA] p-4 sm:p-6"
    >
      {showEmpty ? (
        /* ---------- Grounded Empty State ---------- */
        <div className="flex min-h-full flex-col items-center justify-center py-6 text-center">
          {/* Emblem */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C2D8CB] bg-[#255940] text-[#FCFBF8] shadow-md shadow-[#255940]/10">
            <svg
              className="h-9 w-9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22v-9" />
              <path d="M12 13a5 5 0 0 0 5-5c0-4-5-6-5-6s-5 2-5 6a5 5 0 0 0 5 5z" />
              <path d="M7 17a5 5 0 0 1-5-5c0-4 5-6 5-6s5 2 5 6a5 5 0 0 1-5 5z" />
            </svg>
          </div>

          <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-[#1C2620]">
            RuralAssist AI
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[#5E6861]">
            A dedicated multi-agent advisor for Indian agriculture, regional weather forecasts, central & state schemes, and rural healthcare.
          </p>

          {/* Quick Domain Strip */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-[#4A544D]">
            <span className="inline-flex items-center gap-1 rounded-md border border-[#BFD4E2] bg-[#E8F1F5] px-2 py-0.5 text-[#26526E]">
              🌦️ Weather
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[#C2D8CB] bg-[#E8F0EB] px-2 py-0.5 text-[#255940]">
              🌱 Agriculture
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[#EAD5AB] bg-[#FAF3E3] px-2 py-0.5 text-[#945F16]">
              📜 Schemes
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[#E4BFBF] bg-[#F8ECEC] px-2 py-0.5 text-[#8A3535]">
              🩺 Healthcare
            </span>
          </div>

          {/* Example Question Cards */}
          <div className="mt-6 w-full max-w-lg space-y-2.5 text-left">
            <p className="text-center text-xs font-semibold text-[#5E6861] uppercase tracking-wider">
              Try asking a question to see the agents in action
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {EXAMPLE_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectPrompt && onSelectPrompt(item.text)}
                  className="group flex flex-col justify-between rounded-xl border border-[#E2DDD3] bg-[#FCFBF8] p-3 text-left transition-all hover:border-[#255940] hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#255940] focus-visible:outline-none"
                >
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="text-sm">{item.icon}</span>
                    <span
                      className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${item.badgeBg}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[12.5px] leading-snug text-[#1C2620] group-hover:text-[#255940] transition-colors">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ---------- Message list ---------- */
        <div className="space-y-4 pb-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              text={msg.content}
              imageUrl={msg.imageUrl}
              file={msg.file}
              route={msg.route}
              actions={msg.actions}
              timestamp={msg.timestamp}
              error={msg.error}
            />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Floating "Scroll to bottom" pill */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="animate-settle absolute bottom-4 right-6 flex items-center gap-1.5 rounded-full border border-[#C2D8CB] bg-[#255940] px-3.5 py-1.5 text-xs font-medium text-[#FCFBF8] shadow-lg hover:bg-[#1D4632] transition-colors"
          aria-label="Scroll to newest message"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span>New messages</span>
        </button>
      )}
    </main>
  );
}

