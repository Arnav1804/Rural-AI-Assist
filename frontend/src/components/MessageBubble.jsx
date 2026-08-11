function formatRoute(route) {
  return route.map((agent) => agent.charAt(0).toUpperCase() + agent.slice(1));
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const route = message.route ?? [];

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        {!isUser && route.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-1">
            {formatRoute(route).map((agent) => (
              <span
                key={agent}
                className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
              >
                {agent}
              </span>
            ))}
          </div>
        )}
        <p
          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
            isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}
