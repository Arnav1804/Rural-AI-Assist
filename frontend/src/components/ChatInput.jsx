import { useState } from "react";

export default function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const message = text.trim();
    if (!message || isLoading) return;

    onSend(message);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-200 p-4">
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={isLoading}
        placeholder="Ask about schemes or healthcare..."
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        Send
      </button>
    </form>
  );
}
