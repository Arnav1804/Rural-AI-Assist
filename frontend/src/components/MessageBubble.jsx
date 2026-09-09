// frontend/src/components/MessageBubble.jsx

import React from "react";

const AGENT_CONFIG = {
  agriculture: {
    label: "Agriculture",
    bg: "bg-[#E8F0EB]",
    text: "text-[#255940]",
    border: "border-[#C2D8CB]",
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 22v-9" />
        <path d="M12 13a5 5 0 0 0 5-5c0-4-5-6-5-6s-5 2-5 6a5 5 0 0 0 5 5z" />
      </svg>
    ),
  },
  weather: {
    label: "Weather",
    bg: "bg-[#E8F1F5]",
    text: "text-[#26526E]",
    border: "border-[#BFD4E2]",
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    ),
  },
  schemes: {
    label: "Schemes",
    bg: "bg-[#FAF3E3]",
    text: "text-[#945F16]",
    border: "border-[#EAD5AB]",
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </svg>
    ),
  },
  healthcare: {
    label: "Healthcare",
    bg: "bg-[#F8ECEC]",
    text: "text-[#8A3535]",
    border: "border-[#E4BFBF]",
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  action: {
    label: "Action",
    bg: "bg-[#ECEEEB]",
    text: "text-[#2F3E33]",
    border: "border-[#CCD4CF]",
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
};

/**
 * Parses bold, code, and markdown links safely into React nodes.
 */
function formatInline(str) {
  if (!str) return [];
  const nodes = [];
  let remaining = str;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)/s);
    const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)(.*)/s);

    let first = null;
    let type = null;

    if (boldMatch && (!first || boldMatch[1].length < first.index)) {
      first = { index: boldMatch[1].length, match: boldMatch };
      type = "bold";
    }
    if (codeMatch && (!first || codeMatch[1].length < first.index)) {
      first = { index: codeMatch[1].length, match: codeMatch };
      type = "code";
    }
    if (linkMatch && (!first || linkMatch[1].length < first.index)) {
      first = { index: linkMatch[1].length, match: linkMatch };
      type = "link";
    }

    if (!first) {
      nodes.push(remaining);
      break;
    }

    const before = first.match[1];
    if (before) nodes.push(before);

    if (type === "bold") {
      nodes.push(
        <strong key={key++} className="font-semibold text-[#1C2620]">
          {first.match[2]}
        </strong>
      );
      remaining = first.match[3];
    } else if (type === "code") {
      nodes.push(
        <code key={key++} className="rounded bg-[#EFECE5] px-1 py-0.5 font-mono text-[13px] text-[#2C3831]">
          {first.match[2]}
        </code>
      );
      remaining = first.match[3];
    } else if (type === "link") {
      nodes.push(
        <a
          key={key++}
          href={first.match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#26526E] underline decoration-[#94B2C4] underline-offset-2 hover:text-[#18394F]"
        >
          {first.match[2]}
        </a>
      );
      remaining = first.match[4];
    }
  }

  return nodes;
}

/**
 * Lightweight markdown block renderer: handles paragraphs and lists without external heavy dependencies.
 */
function MarkdownContent({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const blocks = [];
  let currentList = null; // { type: 'ul' | 'ol', items: [] }

  function flushList() {
    if (!currentList) return;
    if (currentList.type === "ul") {
      blocks.push({
        type: "ul",
        items: [...currentList.items],
      });
    } else {
      blocks.push({
        type: "ol",
        items: [...currentList.items],
      });
    }
    currentList = null;
  }

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    // Bullet list (* or - or •)
    const bulletMatch = trimmed.match(/^[\*\-•]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      return;
    }

    // Numbered list (1. item)
    const numMatch = trimmed.match(/^\d+[\.\)]\s+(.*)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(numMatch[1]);
      return;
    }

    // Regular paragraph
    flushList();
    blocks.push({ type: "p", text: line });
  });

  flushList();

  return (
    <div className="space-y-2">
      {blocks.map((block, idx) => {
        if (block.type === "ul") {
          return (
            <ul key={idx} className="my-1.5 list-disc space-y-1 pl-5 text-[14px]">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  {formatInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={idx} className="my-1.5 list-decimal space-y-1 pl-5 text-[14px]">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  {formatInline(item)}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="leading-relaxed">
            {formatInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

export default function MessageBubble({
  role,
  text,
  imageUrl,
  file,
  route = [],
  actions = null,
  timestamp,
  error = null,
}) {
  const isUser = role === "user";

  // Determine attached media
  const resolvedImageUrl = imageUrl || (file && file.type?.startsWith("image/") ? file.previewUrl : null);
  const isPdf = file && (file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf"));

  return (
    <div
      className={`animate-settle flex items-end gap-2.5 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-sm select-none ${
          isUser
            ? "bg-[#26526E] text-white"
            : "border border-[#C2D8CB] bg-[#255940] text-[#FCFBF8]"
        }`}
        title={isUser ? "You" : "RuralAssist Advisor"}
      >
        {isUser ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 22v-9" />
            <path d="M12 13a5 5 0 0 0 5-5c0-4-5-6-5-6s-5 2-5 6a5 5 0 0 0 5 5z" />
          </svg>
        )}
      </div>

      {/* Bubble container */}
      <div className={`flex max-w-[85%] sm:max-w-[75%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        {/* Route tags on assistant message */}
        {!isUser && Array.isArray(route) && route.length > 0 && (
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5" aria-label="Answering agents">
            {route.map((agentKey) => {
              const cfg = AGENT_CONFIG[agentKey.toLowerCase()] || {
                label: agentKey,
                bg: "bg-stone-100",
                text: "text-stone-700",
                border: "border-stone-200",
                icon: null,
              };
              return (
                <span
                  key={agentKey}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Message bubble card */}
        <div
          className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm transition-all ${
            isUser
              ? "rounded-br-sm bg-[#26526E] text-white selection:bg-white selection:text-[#26526E]"
              : "rounded-bl-sm border border-[#E2DDD3] bg-[#FCFBF8] text-[#1C2620]"
          }`}
        >
          {/* Attached Image display */}
          {resolvedImageUrl && (
            <div className="mb-2.5 overflow-hidden rounded-xl border border-stone-200/50 bg-stone-900/5 shadow-inner">
              <img
                src={resolvedImageUrl}
                alt="Attached crop photograph"
                className="max-h-64 w-auto max-w-full rounded-xl object-contain hover:opacity-95"
              />
            </div>
          )}

          {/* Attached PDF document token */}
          {isPdf && (
            <div
              className={`mb-2.5 flex items-center gap-2.5 rounded-lg border p-2 text-xs ${
                isUser
                  ? "border-white/20 bg-white/10 text-stone-100"
                  : "border-stone-200 bg-stone-50 text-stone-800"
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-100 text-red-700 font-bold text-[10px]">
                PDF
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{file.name}</p>
                {file.size && (
                  <p className="text-[10px] opacity-75">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Text body */}
          {isUser ? (
            <div className="whitespace-pre-wrap">{text}</div>
          ) : (
            <MarkdownContent content={text} />
          )}

          {/* Distinct Action / Tool Confirmation Card */}
          {!isUser && actions && (
            <div className="mt-3 overflow-hidden rounded-lg border border-[#E8DEC7] bg-[#FAF5E8] p-2.5 text-[13px] text-[#4A3B18]">
              <div className="flex items-center gap-1.5 font-medium text-[#7D5A12]">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Action Executed</span>
              </div>
              <div className="mt-1 font-mono text-xs text-[#362B14] bg-white/60 p-1.5 rounded border border-[#ECE0C6] whitespace-pre-wrap">
                {typeof actions === "string" ? actions : JSON.stringify(actions, null, 2)}
              </div>
            </div>
          )}

          {/* Partial error notice */}
          {error && (
            <div className="mt-2.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
              <span className="font-semibold">Notice:</span> {error}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="mt-1 px-1.5 text-[11px] text-[#5E6861] select-none">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}

