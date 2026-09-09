// frontend/src/components/MessageBubble.jsx

export default function MessageBubble({ role, text, route = [], timestamp }) {
  const isUser = role === "user";

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
            : "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
        }`}
      >
        {isUser ? "You" : "RA"}
      </div>

      {/* Content column */}
      <div className={`flex max-w-[75%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        {/* Route pills */}
        {!isUser && route.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {route.map((agent) => (
              <span
                key={agent}
                className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200"
              >
                {agent}
              </span>
            ))}
          </div>
        )}

        {/* Bubble */}
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
            isUser
              ? "rounded-br-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              : "rounded-bl-sm border border-gray-100 bg-white text-gray-800"
          }`}
        >
          {text}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="mt-1 px-1 text-[10px] text-gray-400">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
