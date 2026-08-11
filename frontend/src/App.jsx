import { useState } from "react";
import { sendMessage } from "./api";
import ChatInput from "./components/ChatInput";
import ChatWindow from "./components/ChatWindow";

let nextMessageId = 1;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend(text) {
    setMessages((current) => [
      ...current,
      { id: nextMessageId++, role: "user", content: text },
    ]);
    setIsLoading(true);

    try {
      const { response, route } = await sendMessage(text);
      setMessages((current) => [
        ...current,
        { id: nextMessageId++, role: "assistant", content: response, route },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId++,
          role: "assistant",
          content: error.message || "Unable to reach the backend.",
          route: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col bg-white shadow-sm">
      <header className="border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">RuralAssist AI</h1>
      </header>
      <ChatWindow messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
