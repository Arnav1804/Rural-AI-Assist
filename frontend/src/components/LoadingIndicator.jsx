// frontend/src/components/LoadingIndicator.jsx

import React, { useState, useEffect } from "react";

const STATUS_MESSAGES = [
  "Thinking...",
  "Consulting agricultural records...",
  "Checking district weather data...",
  "Scanning government scheme eligibility...",
  "Synthesizing practical advice...",
];

export default function LoadingIndicator() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animate-settle flex items-end gap-2.5">
      {/* Assistant Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C2D8CB] bg-[#255940] text-[#FCFBF8] shadow-sm select-none"
        title="RuralAssist AI"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 22v-9" />
          <path d="M12 13a5 5 0 0 0 5-5c0-4-5-6-5-6s-5 2-5 6a5 5 0 0 0 5 5z" />
        </svg>
      </div>

      {/* Bubble with pulse and status label */}
      <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm border border-[#E2DDD3] bg-[#FCFBF8] px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-1.5" aria-label="Loading">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#255940]" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#317454]" style={{ animationDelay: "180ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#499971]" style={{ animationDelay: "360ms" }} />
        </div>
        <span className="text-[12.5px] font-medium text-[#5E6861] transition-opacity duration-300">
          {STATUS_MESSAGES[msgIndex]}
        </span>
      </div>
    </div>
  );
}

