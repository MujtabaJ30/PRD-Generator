"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { PrdOutput } from "@/lib/validator";
import type { ChatMessage, PrdVersion } from "@/lib/types";

type Status = "idle" | "loading" | "streaming" | "done" | "error" | "cancelled";

const DAILY_LIMIT = 20;
const ESTIMATED_DURATION_MS = 20000;
const MIN_INPUT_LENGTH = 10;
const MAX_INPUT_LENGTH = 2000;
const USAGE_STORAGE_KEY = "prd_generator_usage";

const EXAMPLE_PROMPTS = [
  {
    title: "University room booking",
    text: "Students at a large university struggle to find and book available study rooms across multiple campus buildings. They currently check whiteboards, walk around, or message group chats.",
    icon: "🏫",
  },
  {
    title: "Freelancer invoicing",
    text: "Freelancers waste hours chasing clients for invoices across Gmail, spreadsheets, and apps. Payments are late and it's hard to see who owes what.",
    icon: "💼",
  },
  {
    title: "Slack thread summaries",
    text: "Remote teams miss important Slack threads because channels move too fast. Decisions and action items get buried in long conversations.",
    icon: "💬",
  },
];

const SAMPLE_PRD: PrdOutput = {
  problem_statement:
    "Students at a large university waste 15–20 minutes per day searching for available study rooms across campus. Existing methods (whiteboards, walking around, group chats) are unreliable and create scheduling conflicts.",
  persona:
    "Priya, a 20-year-old junior studying computer science. She studies in groups 3–4 times per week and needs a quiet room with a whiteboard and power outlets for 1–2 hour sessions.",
  user_stories: [
    "As a student, I want to see real-time room availability so that I don't waste time walking between buildings.",
    "As a student, I want to book a room for my study group so that we have a guaranteed quiet space.",
    "As a student, I want to filter rooms by amenities (whiteboard, outlets, capacity) so that I find a room that fits my needs.",
    "As an admin, I want to set booking rules (max duration, advance notice) so that rooms are shared fairly.",
  ],
  acceptance_criteria: [
    "Given a student opens the app, when they select a building, then they see all rooms with current availability status within 2 seconds.",
    "Given a student selects a time slot, when they tap 'Book', then the room is reserved and a confirmation appears with a QR code.",
    "Given a student has an active booking, when the start time arrives, then they receive a push notification with room directions.",
    "Given a booking ends, when no one checks in within 10 minutes, then the room is released and marked available again.",
  ],
  success_metrics: [
    "Reduce average time to find a room from 15 minutes to under 2 minutes within 30 days of launch.",
    "Achieve 60% weekly active usage among students within the first semester.",
    "Reduce no-shows (booked but unused rooms) by 40% through automated check-in reminders.",
    "Maintain 99.5% uptime during peak exam periods.",
  ],
  edge_cases: [
    "What if a student books a room but the previous group overstays?",
    "What if the room's WiFi or power outlets are broken at booking time?",
    "What if two students book the same room at the exact same second?",
    "What if a student tries to book back-to-back slots to circumvent the max-duration rule?",
  ],
  open_questions: [
    "Should rooms require identity verification, or can anyone with a student email book?",
    "How should recurring weekly study-group bookings be handled?",
    "Do we need integration with the campus LMS or calendar system?",
  ],
};

function formatPrd(prd: PrdOutput): string {
  const lines = [
    "# Problem Statement",
    prd.problem_statement,
    "",
    "# Persona",
    prd.persona,
    "",
    "# User Stories",
    ...prd.user_stories.map((s) => `- ${s}`),
    "",
    "# Acceptance Criteria",
    ...prd.acceptance_criteria.map((c) => `- ${c}`),
    "",
    "# Success Metrics",
    ...prd.success_metrics.map((m) => `- ${m}`),
    "",
    "# Edge Cases",
    ...prd.edge_cases.map((e) => `- ${e}`),
    "",
    "# Open Questions",
    ...prd.open_questions.map((q) => `- ${q}`),
  ];
  return lines.join("\n");
}

function parseEditablePrd(text: string): PrdOutput | null {
  try {
    const sections: Record<string, string[]> = {};
    let currentKey = "";

    for (const raw of text.split("\n")) {
      const line = raw.trimEnd();
      if (line.startsWith("# ")) {
        currentKey = line.slice(2).toLowerCase().replace(/\s+/g, "_");
        sections[currentKey] = [];
      } else if (currentKey && line.trim().startsWith("- ")) {
        sections[currentKey].push(line.trim().slice(2));
      } else if (currentKey && line.trim()) {
        sections[currentKey].push(line.trim());
      }
    }

    const getText = (key: string): string => (sections[key] || []).join("\n");
    const getList = (key: string): string[] => sections[key] || [];

    const parsed: PrdOutput = {
      problem_statement: getText("problem_statement"),
      persona: getText("persona"),
      user_stories: getList("user_stories"),
      acceptance_criteria: getList("acceptance_criteria"),
      success_metrics: getList("success_metrics"),
      edge_cases: getList("edge_cases"),
      open_questions: getList("open_questions"),
    };

    if (!parsed.problem_statement || !parsed.persona) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getUsageToday(): number {
  try {
    const stored = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!stored) return 0;
    const { date, count } = JSON.parse(stored);
    const today = new Date().toDateString();
    return date === today ? count : 0;
  } catch {
    return 0;
  }
}

function incrementUsage(): number {
  try {
    const count = getUsageToday() + 1;
    localStorage.setItem(
      USAGE_STORAGE_KEY,
      JSON.stringify({ date: new Date().toDateString(), count })
    );
    return count;
  } catch {
    return 0;
  }
}

// Inline SVG icons — no external dependency
function SparklesIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M9 5H5" />
      <path d="M19 18v4" />
      <path d="M15 20h4" />
    </svg>
  );
}

function SendIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4 20-7z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function CopyIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function PrintIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect width="12" height="8" x="6" y="14" />
    </svg>
  );
}

function PlusIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function RefreshIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function StopIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="16" x="4" y="4" rx="2" />
    </svg>
  );
}

function LightbulbIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function ChatIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function FileTextIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function downloadAsTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [prd, setPrd] = useState<PrdOutput | null>(null);
  const [editablePrd, setEditablePrd] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [versions, setVersions] = useState<PrdVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<number>(0);
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [activePanel, setActivePanel] = useState<"chat" | "preview">("chat");
  const [lastPrompt, setLastPrompt] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const generatingRef = useRef(false);
  const requestIdRef = useRef(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLoading = status === "loading" || status === "streaming";

  useEffect(() => {
    setUsageCount(getUsageToday());
    inputRef.current?.focus();

    return () => {
      abortRef.current?.abort();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  const startProgress = useCallback(() => {
    setProgress(0);
    const startTime = Date.now();
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const target = 0.9;
      const pct = Math.min(
        target * 100,
        (elapsed / ESTIMATED_DURATION_MS) * target * 100
      );
      setProgress(pct);
    }, 100);
  }, []);

  const stopProgress = useCallback((complete: boolean) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(complete ? 100 : 0);
    if (complete) {
      setTimeout(() => setProgress(0), 500);
    }
  }, []);

  const addMessage = useCallback(
    (role: "user" | "assistant", content: string, prdData?: PrdOutput) => {
      setMessages((prev) => [
        ...prev,
        { id: generateMessageId(), role, content, prd: prdData },
      ]);
    },
    []
  );

  const addVersion = useCallback((newPrd: PrdOutput, prompt: string) => {
    setVersions((prev) => {
      const nextId = prev.length + 1;
      const version: PrdVersion = {
        id: nextId,
        prd: newPrd,
        prompt,
        timestamp: Date.now(),
      };
      setActiveVersionId(nextId);
      return [...prev, version];
    });
  }, []);

  const switchVersion = useCallback(
    (versionId: number) => {
      if (isLoading) return;
      const version = versions.find((v) => v.id === versionId);
      if (version) {
        setActiveVersionId(versionId);
        setPrd(version.prd);
        setEditablePrd(formatPrd(version.prd));
        setError("");
      }
    },
    [versions, isLoading]
  );

  const copyToClipboard = useCallback(async () => {
    if (!editablePrd) return;
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(editablePrd);
      setCopied(true);
    } catch {
      setError("Could not copy to clipboard.");
      setTimeout(() => setError(""), 3000);
    }
  }, [editablePrd]);

  const handleDownload = useCallback(() => {
    if (!editablePrd) return;
    const date = new Date().toISOString().split("T")[0];
    downloadAsTxt(`prd-${activeVersionId}-${date}.txt`, editablePrd);
  }, [editablePrd, activeVersionId]);

  const generate = useCallback(
    async (
      refineAction?: "add_metrics" | "expand_edge_cases" | "exec_ready",
      retryPrompt?: string,
      exampleText?: string
    ) => {
      if (generatingRef.current) return;
      if (!retryPrompt && !input.trim() && !refineAction && !exampleText) return;

      const promptText = retryPrompt
        ? retryPrompt
        : exampleText
          ? exampleText
          : refineAction
            ? `Refine: ${refineAction.replace(/_/g, " ")}`
            : input.trim();

      generatingRef.current = true;
      const requestId = ++requestIdRef.current;
      setLastPrompt(promptText);

      if (!retryPrompt) {
        addMessage("user", promptText);
        if (!exampleText) setInput("");
      }

      setStatus("loading");
      setError("");
      setDraftLabel(
        retryPrompt
          ? "Retrying..."
          : refineAction
            ? `Refining — ${refineAction.replace(/_/g, " ")}...`
            : "Generating PRD..."
      );

      if (!refineAction && !retryPrompt) {
        setPrd(null);
        setEditablePrd("");
      }

      startProgress();

      const controller = new AbortController();
      abortRef.current = controller;

      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

      // Use the edited PRD if we can parse it, otherwise fall back to the original JSON
      const currentPrdForRequest =
        (refineAction || retryPrompt) && prd
          ? (parseEditablePrd(editablePrd) ?? prd)
          : undefined;

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemStatement: promptText,
            currentPrd: currentPrdForRequest,
            refineAction: refineAction || null,
          }),
          signal: controller.signal,
        });

        if (requestId !== requestIdRef.current) return;

        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error || "Request failed");
        }

        reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let retrying = false;

        setStatus("streaming");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (requestId !== requestIdRef.current) return;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (!json) continue;

            try {
              const data = JSON.parse(json);

              if (data.type === "token") {
                // streamed silently; progress bar shows progress
              } else if (data.type === "retry") {
                retrying = true;
                setDraftLabel("Output incomplete, regenerating...");
              } else if (data.type === "done") {
                if (requestId !== requestIdRef.current) return;
                setPrd(data.prd);
                const formatted = formatPrd(data.prd);
                setEditablePrd(formatted);
                setStatus("done");
                addMessage("assistant", retrying ? "Regenerated" : "PRD ready", data.prd);
                addVersion(data.prd, promptText);
                setUsageCount(incrementUsage());
                setDraftLabel("");
                stopProgress(true);
                generatingRef.current = false;
                reader.releaseLock();
                return;
              } else if (data.type === "error") {
                if (requestId !== requestIdRef.current) return;
                setError(data.error);
                setStatus("error");
                addMessage("assistant", `Error: ${data.error}`);
                setDraftLabel("");
                stopProgress(false);
                generatingRef.current = false;
                reader.releaseLock();
                return;
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        if (err instanceof DOMException && err.name === "AbortError") {
          setStatus("cancelled");
          addMessage("assistant", "Generation cancelled");
        } else {
          const msg = err instanceof Error ? err.message : "Unknown error";
          setError(msg);
          setStatus("error");
          addMessage("assistant", `Error: ${msg}`);
        }
        setDraftLabel("");
        stopProgress(false);
      } finally {
        generatingRef.current = false;
        abortRef.current = null;
        if (reader) {
          try {
            reader.releaseLock();
          } catch {
            // ignore
          }
        }
      }
    },
    [input, editablePrd, addMessage, addVersion, startProgress, stopProgress]
  );

  const handleExampleClick = useCallback(
    (text: string) => {
      setInput(text);
      inputRef.current?.focus();
      setTimeout(() => generate(undefined, undefined, text), 80);
    },
    [generate]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        generate();
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (isLoading) {
          cancel();
        } else if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      }
    },
    [generate, cancel, isLoading]
  );

  const reset = useCallback(() => {
    cancel();
    setStatus("idle");
    setPrd(null);
    setEditablePrd("");
    setError("");
    setMessages([]);
    setVersions([]);
    setActiveVersionId(0);
    setInput("");
    setDraftLabel("");
    setLastPrompt("");
    setProgress(0);
    generatingRef.current = false;
    inputRef.current?.focus();
  }, [cancel]);

  const inputTooShort = input.trim().length > 0 && input.trim().length < MIN_INPUT_LENGTH;
  const inputTooLong = input.trim().length > MAX_INPUT_LENGTH;
  const canSend = !isLoading && input.trim().length >= MIN_INPUT_LENGTH && !inputTooLong;

  const headerStatus = useMemo(() => {
    if (isLoading) return draftLabel || "Generating...";
    if (error) return "Error";
    if (status === "cancelled") return "Cancelled";
    if (status === "done") return "PRD ready";
    return "Ready";
  }, [isLoading, draftLabel, error, status]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Accessibility live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {headerStatus}
      </div>

      {/* ── Left Panel — Chat & Input ── */}
      <div
        className={`${
          activePanel === "chat" ? "flex" : "hidden md:flex"
        } w-full md:w-2/5 border-r border-zinc-200 dark:border-zinc-800 flex-col min-w-0 pb-16 md:pb-0`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-sm">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                PRD Generator
              </h1>
              <p className="text-[10px] text-zinc-400">
                AI product requirements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {usageCount !== null && (
              <span
                aria-label={`${usageCount} of ${DAILY_LIMIT} requests used today. Stored only in this browser.`}
                title={`${usageCount} of ${DAILY_LIMIT} requests used today. Stored only in this browser — each visitor has their own count.`}
                className={`text-xs font-medium tabular-nums px-2.5 py-1 rounded-full cursor-help transition-colors ${
                  usageCount >= DAILY_LIMIT
                    ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                    : "bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400"
                }`}
              >
                {usageCount}/{DAILY_LIMIT}
              </span>
            )}
            {isLoading ? (
              <button
                type="button"
                onClick={cancel}
                className="text-xs px-3 py-1.5 rounded-md border border-red-200 dark:border-red-800 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950 text-red-700 dark:text-red-400 transition-colors flex items-center gap-1.5"
                title="Stop generation (ESC)"
              >
                <StopIcon className="w-3 h-3" />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="text-xs px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                title="Start a new PRD"
              >
                <PlusIcon className="w-3 h-3" />
                New
              </button>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.length === 0 && status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full px-4 animate-fade-in-up">
              <div className="text-center space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md mx-auto">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                  Turn a problem into a PRD
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Describe a product problem. Get a structured PRD with
                  personas, user stories, acceptance criteria, metrics, edge
                  cases, and open questions.
                </p>
              </div>

              <div className="mt-6 w-full max-w-sm space-y-2">
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider text-center">
                  Try an example
                </p>
                {EXAMPLE_PROMPTS.map((example) => (
                  <button
                    key={example.title}
                    type="button"
                    onClick={() => handleExampleClick(example.text)}
                    disabled={isLoading}
                    className="w-full text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{example.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                          {example.title}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {example.text}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="mt-5 text-[10px] text-zinc-400 flex items-center gap-1">
                <LightbulbIcon className="w-3 h-3" />
                Specific inputs get better PRDs
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id || msg.content} className="space-y-1 animate-fade-in-up">
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                {msg.role === "user" ? "You" : "AI"}
              </span>
              <div
                className={`text-sm leading-relaxed rounded-xl px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : msg.content.startsWith("Error")
                      ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs"
                      : msg.content.startsWith("Generation cancelled")
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs"
                        : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs"
                }`}
              >
                {msg.role === "user" ? msg.content : msg.content}
              </div>
            </div>
          ))}

          {status === "streaming" && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:300ms]" />
              </span>
              {draftLabel || "Generating..."}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0 space-y-2">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                messages.length
                  ? "Ask a follow-up or refine the PRD..."
                  : "Describe a product problem..."
              }
              className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 pr-16 text-sm leading-relaxed placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              rows={2}
              disabled={isLoading}
              maxLength={MAX_INPUT_LENGTH + 100}
            />
            <span className="absolute bottom-2 right-3 text-[10px] text-zinc-300 tabular-nums">
              {input.length}/{MAX_INPUT_LENGTH}
            </span>
          </div>

          {inputTooShort && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              Need at least {MIN_INPUT_LENGTH} characters
            </p>
          )}
          {inputTooLong && (
            <p className="text-[10px] text-red-600 dark:text-red-400">
              Too long — max {MAX_INPUT_LENGTH} characters
            </p>
          )}

          {!inputTooShort && !inputTooLong && input.trim().length === 0 && (
            <p className="text-[10px] text-zinc-400 flex items-center gap-1">
              <LightbulbIcon className="w-3 h-3" />
              Tip: mention users, context, and a specific goal for the best PRD.
            </p>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => generate()}
              disabled={!canSend}
              className="rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 text-white px-5 py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center gap-2 shadow-sm shadow-brand-500/20"
            >
              {status === "loading" ? (
                "Connecting..."
              ) : status === "streaming" ? (
                "Generating..."
              ) : (
                <>
                  <SendIcon className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
            <div className="flex gap-2 text-[10px] text-zinc-400">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" title="Send message">
                Ctrl + Enter
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" title="Cancel generation">
                ESC
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — PRD Preview ── */}
      <div
        className={`print-preview ${
          activePanel === "preview" ? "flex" : "hidden md:flex"
        } w-full md:w-3/5 flex-col min-w-0 bg-white dark:bg-zinc-900 pb-16 md:pb-0`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold tracking-tight">
              PRD Preview
            </h2>

            {status === "done" && !isLoading && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 animate-fade-in-up">
                <CheckIcon className="w-3 h-3" />
                Ready
              </span>
            )}

            {/* Version tabs */}
            {versions.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider mr-1">
                  Version
                </span>
                {versions.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => switchVersion(v.id)}
                    disabled={isLoading}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                      activeVersionId === v.id
                        ? "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-medium"
                        : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                    title={v.prompt}
                  >
                    v{v.id}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {editablePrd && (
              <>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  title="Copy PRD to clipboard"
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    copied
                      ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                      : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  title="Download PRD as text file"
                  className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  <DownloadIcon className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  title="Print PRD (saves as PDF)"
                  className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  <PrintIcon className="w-3.5 h-3.5" />
                  Print
                </button>
              </>
            )}

          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0 p-4 gap-4">
          {/* Loading / Streaming indicator */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-400 dark:text-zinc-500">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:300ms]" />
              </div>
              <p className="text-sm font-medium">{draftLabel || "Generating..."}</p>
              <div className="w-56 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-300 dark:text-zinc-600">
                This usually takes ~20 seconds
              </p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 animate-fade-in-up">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Error
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                {error}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => generate(undefined, lastPrompt)}
                  disabled={isLoading || !lastPrompt}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950 transition-colors disabled:opacity-40"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Start over
                </button>
              </div>
            </div>
          )}

          {/* Cancelled */}
          {status === "cancelled" && !isLoading && (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-zinc-400 animate-fade-in-up">
              <p className="text-sm">Generation cancelled</p>
              <button
                type="button"
                onClick={() => generate(undefined, lastPrompt)}
                disabled={!lastPrompt}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40"
              >
                Retry
              </button>
            </div>
          )}

          {/* Editable PRD */}
          {prd && (
            <div className="flex-1 flex flex-col min-h-0 gap-2 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                  Edit below
                </span>
                {isLoading && (
                  <span className="text-[10px] text-brand-600 dark:text-brand-400 animate-pulse">
                    Updating...
                  </span>
                )}
              </div>
              <textarea
                value={editablePrd}
                onChange={(e) => setEditablePrd(e.target.value)}
                onBlur={() => {
                  if (prd) {
                    const parsed = parseEditablePrd(editablePrd);
                    if (parsed) setPrd(parsed);
                  }
                }}
                className={`flex-1 resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 text-sm leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${
                  isLoading ? "opacity-60 pointer-events-none" : ""
                }`}
                spellCheck={false}
                readOnly={isLoading}
                aria-label="Editable PRD preview"
              />
            </div>
          )}

          {/* Smart Refine Buttons */}
          {status === "done" && prd && !isLoading && (
            <div className="space-y-3 shrink-0 animate-fade-in-up">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Quick Refine
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => generate("add_metrics")}
                  className="text-sm px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:border-brand-300 dark:hover:border-brand-700 transition-colors bg-white dark:bg-zinc-950 flex items-center gap-1.5"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Add Metrics
                </button>
                <button
                  type="button"
                  onClick={() => generate("expand_edge_cases")}
                  className="text-sm px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-amber-50 dark:hover:bg-amber-950 hover:border-amber-300 dark:hover:border-amber-700 transition-colors bg-white dark:bg-zinc-950 flex items-center gap-1.5"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Expand Edge Cases
                </button>
                <button
                  type="button"
                  onClick={() => generate("exec_ready")}
                  className="text-sm px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors bg-white dark:bg-zinc-950 flex items-center gap-1.5"
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Make Exec-Ready
                </button>
              </div>
              <p className="text-[10px] text-zinc-400">
                Edit the PRD above, then use Quick Refine or type a follow-up.
              </p>
            </div>
          )}

          {/* Idle — Sample PRD Preview */}
          {status === "idle" && !prd && (
            <div className="flex-1 flex flex-col min-h-0 animate-fade-in-up">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  Sample output
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-medium">
                  Sample
                </span>
              </div>
              <div className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-4 overflow-auto">
                <pre className="text-sm leading-relaxed font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {formatPrd(SAMPLE_PRD)}
                </pre>
              </div>
              <p className="mt-3 text-[10px] text-zinc-400 text-center">
                This is what your generated PRD will look like
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around px-4 py-2 z-50">
        <button
          type="button"
          onClick={() => setActivePanel("chat")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activePanel === "chat"
              ? "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300"
              : "text-zinc-500"
          }`}
        >
          <ChatIcon className="w-4 h-4" />
          Chat
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("preview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activePanel === "preview"
              ? "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300"
              : "text-zinc-500"
          }`}
        >
          <FileTextIcon className="w-4 h-4" />
          Preview
        </button>
      </div>

    </div>
  );
}
