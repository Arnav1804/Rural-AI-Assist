// frontend/src/components/ChatInput.jsx

import React, { useState, useRef, useEffect } from "react";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

export default function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea height to fit content up to 120px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setValidationError(null);

    // Validate MIME type
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = ["image/jpeg", "image/png", "image/jpg"].includes(file.type);

    if (!isImage && !isPdf) {
      setValidationError(
        `"${file.name}" is not supported. Please upload a JPG or PNG image, or a PDF document.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setValidationError(
        `File is ${sizeMb} MB. Maximum allowed upload size is 5 MB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    if (isImage) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e) {
    if (e) e.preventDefault();
    const msg = text.trim();
    if ((!msg && !selectedFile) || isLoading) return;

    // Send payload
    onSend(msg || (selectedFile?.type === "application/pdf" ? "Please analyze this document" : "What is this crop issue?"), selectedFile);

    setText("");
    handleRemoveFile();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const isPdf = selectedFile && (selectedFile.type === "application/pdf" || selectedFile.name?.toLowerCase().endsWith(".pdf"));

  return (
    <div className="border-t border-[#E2DDD3] bg-[#FCFBF8] px-4 py-3">
      {/* Inline validation alert */}
      {validationError && (
        <div className="mb-2.5 flex items-center justify-between rounded-lg border border-[#E8C4C4] bg-[#FDF2F2] px-3 py-2 text-xs text-[#8A3535]">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="ml-2 font-semibold hover:opacity-75"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>
      )}

      {/* Staged attachment preview chip */}
      {selectedFile && (
        <div className="mb-2.5 flex items-center justify-between rounded-xl border border-[#DCD6CA] bg-[#F4F1EA] px-3 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected preview"
                className="h-10 w-10 shrink-0 rounded-lg object-cover border border-[#C8C2B4] shadow-sm"
              />
            ) : isPdf ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold text-xs shadow-sm">
                PDF
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-200 text-stone-700 font-bold text-xs">
                FILE
              </div>
            )}
            <div className="min-w-0 text-xs">
              <p className="truncate font-medium text-[#1C2620]">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-[#5E6861]">
                {(selectedFile.size / 1024).toFixed(0)} KB &bull; {isPdf ? "Document" : "Photo"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="ml-3 flex h-6 w-6 items-center justify-center rounded-full text-stone-500 hover:bg-[#E2DDD3] hover:text-stone-800 transition-colors"
            title="Remove attachment"
            aria-label="Remove attachment"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="ruralassist-file-upload"
        />

        {/* Attachment button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2DDD3] text-[#5E6861] hover:border-[#255940] hover:bg-[#E8F0EB] hover:text-[#255940] transition-colors focus-visible:ring-2 focus-visible:ring-[#255940] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          title="Attach plant photo or PDF document (max 5MB)"
          aria-label="Attach photo or document"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        {/* Text area */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              selectedFile
                ? "Add a note or question about this attachment..."
                : "Ask about crops, weather, schemes, health, or set reminders..."
            }
            className="w-full resize-none rounded-xl border border-[#E2DDD3] bg-[#F4F1EA] px-3.5 py-2.5 text-[14px] text-[#1C2620] placeholder-[#5E6861]/70 transition-colors focus:border-[#255940] focus:bg-[#FCFBF8] focus-visible:ring-2 focus-visible:ring-[#255940]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={isLoading || (!text.trim() && !selectedFile)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#255940] text-[#FCFBF8] shadow-sm transition-all hover:bg-[#1D4632] hover:shadow active:scale-95 focus-visible:ring-2 focus-visible:ring-[#255940] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-[#255940] disabled:active:scale-100"
          aria-label="Send message"
          title="Send message (Enter)"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      {/* Subtle keyboard hint */}
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#5E6861]/80 select-none">
        <span>Enter to send &bull; Shift+Enter for newline</span>
        <span>Attachments up to 5MB</span>
      </div>
    </div>
  );
}

