// frontend/src/components/ChatInput.jsx

import { useState } from "react";

export default function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const msg = text.trim();
    if (!msg || isLoading) return;
    onSend(msg);
    setText("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 border-t border-gray-100 bg-white px-4 py-3"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
        placeholder="Ask about weather, crop prices, government schemes, or health guidance..."
        className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-md"
        aria-label="Send message"
      >
        {/* Arrow-up send icon (inline SVG) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M5 12l7-7 7 7" />
          <path d="M12 5v14" />
        </svg>
      </button>
    </form>
  );
}
