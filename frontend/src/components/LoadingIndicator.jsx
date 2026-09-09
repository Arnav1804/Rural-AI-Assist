// frontend/src/components/LoadingIndicator.jsx

export default function LoadingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      {/* Avatar — matches assistant style */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-white shadow-sm">
        RA
      </div>

      {/* Bubble shell with bouncing dots */}
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-5 py-3 shadow-sm">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="inline-block h-2 w-2 animate-bounce rounded-full bg-emerald-400"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
