import { useEffect, useRef } from "react";
import LoadingIndicator from "./LoadingIndicator";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <main className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && <LoadingIndicator />}
      <div ref={bottomRef} />
    </main>
  );
}
